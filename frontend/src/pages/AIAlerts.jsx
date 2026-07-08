import { useState, useMemo, useCallback } from "react";
import { FiAlertTriangle, FiAlertOctagon, FiInfo, FiCheck, FiX, FiBell, FiSearch, FiFilter } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { useZoneWagons } from "../hooks/useZoneWagons";

// ── Derive priority from wagon health + alert reason ─────────────────────────
function derivePriority(wagon, reason) {
  if (wagon.wagonHealth === "Critical") return "Critical";
  if (reason === "GPS" && wagon.gpsStatus === "Inactive") return "High";
  if (reason === "Temperature" && wagon.temperature >= 60) return "Critical";
  if (reason === "Overload" && wagon.loadPercentage >= 95) return "High";
  if (reason === "Maintenance" && wagon.maintenanceStatus === "Pending") return "Medium";
  if (wagon.wagonHealth === "Warning") return "High";
  return "Medium";
}

const REASON_LABEL = {
  GPS:         "GPS Signal Lost",
  Delay:       "Route Delay Detected",
  Temperature: "Temperature Alert",
  Overload:    "Cargo Overload",
  Maintenance: "Maintenance Required",
  Health:      "Wagon Health Critical",
};

function deriveDesc(wagon, reason) {
  switch (reason) {
    case "GPS":
      return `GPS ${wagon.gpsStatus} on wagon ${wagon.wagonId} at ${wagon.station}. Last known speed: ${wagon.speed} km/h.`;
    case "Delay":
      return `Wagon ${wagon.wagonId} is delayed on route to ${wagon.destination}. Current speed: ${wagon.speed} km/h.`;
    case "Temperature":
      return `Temperature ${wagon.temperature}°C exceeds safe threshold on wagon ${wagon.wagonId} at ${wagon.station}.`;
    case "Overload":
      return `Cargo load at ${wagon.loadPercentage}% of capacity on wagon ${wagon.wagonId}. Inspection recommended.`;
    case "Maintenance":
      return `Maintenance status: ${wagon.maintenanceStatus} for wagon ${wagon.wagonId} at ${wagon.station}.`;
    case "Health":
      return `Health score ${wagon.healthScore}/100 — wagon ${wagon.wagonId} requires immediate attention at ${wagon.station}.`;
    default:
      return `Alert on wagon ${wagon.wagonId} at ${wagon.station}.`;
  }
}

// ── Build alert list from zone-filtered wagon records only ───────────────────
function buildAlertsFromWagons(wagons) {
  const alerts = [];
  let seq = 1;
  wagons.forEach(wagon => {
    wagon.alertReasons.forEach(reason => {
      alerts.push({
        id:       `ALT-${String(seq++).padStart(3, "0")}`,
        wagon:    wagon.wagonId,
        wagonRef: wagon,
        type:     REASON_LABEL[reason] || `${reason} Alert`,
        priority: derivePriority(wagon, reason),
        zone:     wagon.zone,
        time:     wagon.lastUpdated
          ? new Date(wagon.lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
          : "N/A",
        status:   wagon.status === "Maintenance" ? "Pending" : "Active",
        desc:     deriveDesc(wagon, reason),
        reason,
      });
    });
  });
  return alerts;
}

const PRIORITY_TABS = ["All", "Critical", "High", "Medium", "Low"];
const STATUS_TABS   = ["All", "Active", "Pending", "Resolved"];

const priorityClass = p => ({ Critical: "badge-critical", High: "badge-high", Medium: "badge-medium", Low: "badge-low" }[p] || "badge-info");
const statusClass   = s => ({ Active: "badge-critical", Resolved: "badge-low", Pending: "badge-medium" }[s] || "badge-info");

const AIAlerts = () => {
  // useZoneWagons filters wagons to the logged-in user's zone automatically
  const { wagons: zoneWagons, zone, loading } = useZoneWagons();

  // Build base alerts exclusively from zone wagons
  const baseAlerts = useMemo(() => buildAlertsFromWagons(zoneWagons), [zoneWagons]);

  // Local resolved/dismissed overrides
  const [resolvedIds,  setResolvedIds]  = useState(new Set());
  const [dismissedIds, setDismissedIds] = useState(new Set());

  const alerts = useMemo(() =>
    baseAlerts
      .filter(a => !dismissedIds.has(a.id))
      .map(a => resolvedIds.has(a.id) ? { ...a, status: "Resolved" } : a),
  [baseAlerts, resolvedIds, dismissedIds]);

  // Filters
  const [priorityTab, setPriorityTab] = useState("All");
  const [statusTab,   setStatusTab]   = useState("All");
  const [wagonFilter, setWagonFilter] = useState("All");
  const [search,      setSearch]      = useState("");
  const [detail,      setDetail]      = useState(null);
  const [sortDesc,    setSortDesc]    = useState(true);

  // Wagon IDs derived from zone alerts only
  const wagonIds = useMemo(() => ["All", ...Array.from(new Set(alerts.map(a => a.wagon))).sort()], [alerts]);

  const filtered = useMemo(() => {
    let list = alerts;
    if (priorityTab !== "All") list = list.filter(a => a.priority === priorityTab);
    if (statusTab   !== "All") list = list.filter(a => a.status   === statusTab);
    if (wagonFilter !== "All") list = list.filter(a => a.wagon    === wagonFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.id.toLowerCase().includes(q) ||
        a.wagon.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.zone.toLowerCase().includes(q)
      );
    }
    return sortDesc
      ? [...list].sort((a, b) => b.time.localeCompare(a.time))
      : [...list].sort((a, b) => a.time.localeCompare(b.time));
  }, [alerts, priorityTab, statusTab, wagonFilter, search, sortDesc]);

  const counts = useMemo(() => ({
    Critical: alerts.filter(a => a.priority === "Critical").length,
    High:     alerts.filter(a => a.priority === "High").length,
    Medium:   alerts.filter(a => a.priority === "Medium").length,
    Low:      alerts.filter(a => a.priority === "Low").length,
    Active:   alerts.filter(a => a.status   === "Active").length,
    Resolved: alerts.filter(a => a.status   === "Resolved").length,
    Pending:  alerts.filter(a => a.status   === "Pending").length,
  }), [alerts]);

  const resolve = useCallback(id => {
    setResolvedIds(prev => new Set([...prev, id]));
    if (detail?.id === id) setDetail(d => d ? { ...d, status: "Resolved" } : null);
  }, [detail]);

  const dismiss = useCallback(id => {
    setDismissedIds(prev => new Set([...prev, id]));
    if (detail?.id === id) setDetail(null);
  }, [detail]);

  const zoneLabel = zone ? `Zone ${zone}` : "All Zones";

  return (
    <DashboardLayout
      title="AI Alerts"
      sub={`Real-time AI-powered monitoring alerts — ${zoneLabel}`}
    >
      {/* KPI Cards */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard title="Critical" value={counts.Critical} color="#ef4444" icon={FiAlertOctagon} />
        <StatCard title="High"     value={counts.High}     color="#f97316" icon={FiAlertTriangle} />
        <StatCard title="Medium"   value={counts.Medium}   color="#f59e0b" icon={FiBell} />
        <StatCard title="Low"      value={counts.Low}      color="#22c55e" icon={FiInfo} />
        <StatCard title="Active"   value={counts.Active}   color="#ef4444" icon={FiAlertTriangle} />
        <StatCard title="Resolved" value={counts.Resolved} color="#22c55e" icon={FiCheck} />
      </div>

      {/* Priority Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
        {PRIORITY_TABS.map(t => (
          <button key={t} onClick={() => setPriorityTab(t)} className={`btn btn-sm ${priorityTab === t ? "btn-primary" : "btn-outline"}`}>
            {t} {t !== "All" && <span style={{ marginLeft: "4px", background: "rgba(255,255,255,.2)", borderRadius: "10px", padding: "1px 6px", fontSize: "10px" }}>{counts[t] || 0}</span>}
          </button>
        ))}
        <span style={{ margin: "0 4px", color: "#1a3356" }}>|</span>
        {STATUS_TABS.map(t => (
          <button key={t} onClick={() => setStatusTab(t)} className={`btn btn-sm ${statusTab === t ? "btn-primary" : "btn-ghost"}`}>
            {t} {t !== "All" && counts[t] !== undefined && <span style={{ marginLeft: "4px", background: "rgba(255,255,255,.15)", borderRadius: "10px", padding: "1px 6px", fontSize: "10px" }}>{counts[t]}</span>}
          </button>
        ))}
      </div>

      {/* Search + Wagon Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#060e1e", border: "1px solid #1a3356", borderRadius: "10px", padding: "8px 14px", flex: 1, minWidth: "200px" }}>
          <FiSearch color="#3a5a7c" size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Alert ID, Wagon, Type…"
            style={{ background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: "13px", width: "100%" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FiFilter color="#3a5a7c" size={14} />
          <select className="form-select" value={wagonFilter} onChange={e => setWagonFilter(e.target.value)} style={{ width: "auto", padding: "8px 12px" }}>
            {wagonIds.map(w => <option key={w}>{w}</option>)}
          </select>
          <button className="btn btn-ghost btn-sm" onClick={() => setSortDesc(p => !p)} title="Toggle sort order">
            {sortDesc ? "↓ Newest" : "↑ Oldest"}
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div className="section-title" style={{ margin: 0 }}>Alert Log — {zoneLabel} ({filtered.length})</div>
          {(priorityTab !== "All" || statusTab !== "All" || wagonFilter !== "All" || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setPriorityTab("All"); setStatusTab("All"); setWagonFilter("All"); setSearch(""); }}>
              ✕ Clear filters
            </button>
          )}
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Alert ID</th><th>Wagon</th><th>Alert Type</th><th>Priority</th><th>Zone</th><th>Time</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td style={{ color: "#4a6fa5", fontWeight: 600 }}>{a.id}</td>
                  <td style={{ color: "#60a5fa", fontWeight: 600, cursor: "pointer" }} onClick={() => setDetail(a)}>{a.wagon}</td>
                  <td style={{ color: "#f1f5f9" }}>{a.type}</td>
                  <td><span className={`badge ${priorityClass(a.priority)}`}>{a.priority}</span></td>
                  <td><span className="badge badge-info">{a.zone}</span></td>
                  <td style={{ color: "#4a6fa5" }}>{a.time}</td>
                  <td><span className={`badge ${statusClass(a.status)}`}>{a.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {a.status !== "Resolved" && (
                        <button className="btn btn-sm" style={{ background: "rgba(34,197,94,.12)", color: "#22c55e" }} onClick={() => resolve(a.id)}>
                          <FiCheck size={11} /> Resolve
                        </button>
                      )}
                      <button className="btn btn-sm" style={{ background: "rgba(239,68,68,.12)", color: "#ef4444" }} onClick={() => dismiss(a.id)}>
                        <FiX size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "#4a6fa5", padding: "30px" }}>
                  {loading ? "Loading wagon data…" : `No alerts match the current filters for ${zoneLabel}`}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal-box">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div className="modal-title" style={{ margin: 0 }}>Alert Details</div>
              <button onClick={() => setDetail(null)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><FiX size={18} /></button>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
              <span className={`badge ${priorityClass(detail.priority)}`}>{detail.priority}</span>
              <span className={`badge ${statusClass(detail.status)}`}>{detail.status}</span>
              <span className="badge badge-info">{detail.zone}</span>
            </div>
            {[
              { label: "Alert ID",   val: detail.id     },
              { label: "Wagon",      val: detail.wagon  },
              { label: "Alert Type", val: detail.type   },
              { label: "Time",       val: detail.time   },
              { label: "Station",    val: detail.wagonRef?.station || "N/A" },
              { label: "Speed",      val: `${detail.wagonRef?.speed ?? "N/A"} km/h` },
              { label: "Health",     val: `${detail.wagonRef?.healthScore ?? "N/A"}/100` },
              { label: "GPS",        val: detail.wagonRef?.gpsStatus || "N/A" },
              { label: "Cargo",      val: detail.wagonRef?.cargoType || "N/A" },
              { label: "Temp",       val: `${detail.wagonRef?.temperature ?? "N/A"}°C` },
              { label: "Load",       val: `${detail.wagonRef?.loadPercentage ?? "N/A"}%` },
              { label: "Route",      val: detail.wagonRef?.route || "N/A" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                <span style={{ color: "#4a6fa5", fontSize: "13px", width: "90px", flexShrink: 0 }}>{r.label}</span>
                <span style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ background: "#071628", border: "1px solid #1a3356", borderRadius: "10px", padding: "14px", marginTop: "12px" }}>
              <div style={{ color: "#4a6fa5", fontSize: "12px", marginBottom: "6px" }}>Description</div>
              <div style={{ color: "#cbd5e1", fontSize: "13px" }}>{detail.desc}</div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {detail.status !== "Resolved" && (
                <button className="btn btn-success" style={{ flex: 1, justifyContent: "center" }} onClick={() => { resolve(detail.id); setDetail(d => d ? { ...d, status: "Resolved" } : null); }}>
                  <FiCheck size={14} /> Mark Resolved
                </button>
              )}
              <button className="btn btn-outline" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AIAlerts;
