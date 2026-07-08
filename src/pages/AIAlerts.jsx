import { useState, useMemo, useCallback, useEffect } from "react";
import { FiAlertTriangle, FiAlertOctagon, FiInfo, FiCheck, FiX, FiBell, FiSearch, FiFilter, FiRefreshCw } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const PRIORITY_TABS = ["All", "Critical", "High", "Medium", "Low"];
const STATUS_TABS   = ["All", "Active", "Pending", "Resolved"];

const priorityClass = p => ({ Critical: "badge-critical", High: "badge-high", Medium: "badge-medium", Low: "badge-low" }[p] || "badge-info");
const statusClass   = s => ({ Active: "badge-critical", Resolved: "badge-low", Pending: "badge-medium" }[s] || "badge-info");

const AIAlerts = () => {
  const { admin, analyst } = useAuth();
  const zone = admin?.zone || analyst?.zone || null;

  const [alerts,  setAlerts]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [detail,  setDetail]  = useState(null);

  // Filters
  const [priorityTab, setPriorityTab] = useState("All");
  const [statusTab,   setStatusTab]   = useState("All");
  const [wagonFilter, setWagonFilter] = useState("All");
  const [search,      setSearch]      = useState("");
  const [sortDesc,    setSortDesc]    = useState(true);

  // ── Fetch alerts from backend ─────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params = zone ? { zone } : {};
      const res = await api.getAlerts(params);
      setAlerts(res.data || []);
    } catch (err) {
      console.error("[AIAlerts] fetch failed:", err.message);
    } finally {
      setLoading(false);
    }
  }, [zone]);

  // ── Generate alerts from wagons then re-fetch ─────────────────────────────
  const generateAndFetch = useCallback(async () => {
    setSyncing(true);
    try {
      const params = zone ? { zone } : {};
      await api.generateAlerts(params);
      await fetchAlerts();
    } catch (err) {
      console.error("[AIAlerts] generate failed:", err.message);
      await fetchAlerts();
    } finally {
      setSyncing(false);
    }
  }, [zone, fetchAlerts]);

  // On mount: generate fresh alerts from current wagon data, then display
  useEffect(() => { generateAndFetch(); }, [generateAndFetch]);

  // ── Resolve persisted to MongoDB ──────────────────────────────────────────
  const resolve = useCallback(async (alert) => {
    try {
      const res = await api.resolveAlert(alert._id);
      setAlerts(prev => prev.map(a => a._id === alert._id ? res.data : a));
      if (detail?._id === alert._id) setDetail(res.data);
    } catch (err) {
      console.error("[AIAlerts] resolve failed:", err.message);
    }
  }, [detail]);

  // ── Dismiss persisted to MongoDB ──────────────────────────────────────────
  const dismiss = useCallback(async (alert) => {
    try {
      await api.dismissAlert(alert._id);
      setAlerts(prev => prev.filter(a => a._id !== alert._id));
      if (detail?._id === alert._id) setDetail(null);
    } catch (err) {
      console.error("[AIAlerts] dismiss failed:", err.message);
    }
  }, [detail]);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = alerts;
    if (priorityTab !== "All") list = list.filter(a => a.priority === priorityTab);
    if (statusTab   !== "All") list = list.filter(a => a.status   === statusTab);
    if (wagonFilter !== "All") list = list.filter(a => a.wagonId  === wagonFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(a =>
        a.alertId?.toLowerCase().includes(q) ||
        a.wagonId?.toLowerCase().includes(q) ||
        a.type?.toLowerCase().includes(q) ||
        a.zone?.toLowerCase().includes(q)
      );
    }
    return sortDesc
      ? [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      : [...list].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [alerts, priorityTab, statusTab, wagonFilter, search, sortDesc]);

  // ── Counts from zone alerts only ──────────────────────────────────────────
  const counts = useMemo(() => ({
    Critical: alerts.filter(a => a.priority === "Critical").length,
    High:     alerts.filter(a => a.priority === "High").length,
    Medium:   alerts.filter(a => a.priority === "Medium").length,
    Low:      alerts.filter(a => a.priority === "Low").length,
    Active:   alerts.filter(a => a.status   === "Active").length,
    Resolved: alerts.filter(a => a.status   === "Resolved").length,
    Pending:  alerts.filter(a => a.status   === "Pending").length,
  }), [alerts]);

  const wagonIds = useMemo(() => ["All", ...Array.from(new Set(alerts.map(a => a.wagonId))).sort()], [alerts]);
  const zoneLabel = zone ? `Zone ${zone}` : "All Zones";

  const formatTime = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

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

      {/* Priority + Status Tabs */}
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

      {/* Search + Filters */}
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
          <button className="btn btn-ghost btn-sm" onClick={() => setSortDesc(p => !p)}>
            {sortDesc ? "↓ Newest" : "↑ Oldest"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={generateAndFetch} disabled={syncing} title="Re-sync alerts from wagon data">
            <FiRefreshCw size={13} style={{ marginRight: 4, animation: syncing ? "spin 1s linear infinite" : "none" }} />
            {syncing ? "Syncing…" : "Sync"}
          </button>
        </div>
      </div>

      {/* Alert Log Table */}
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
              {loading && (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "#4a6fa5", padding: "30px" }}>Loading alerts…</td></tr>
              )}
              {!loading && filtered.map(a => (
                <tr key={a._id}>
                  <td style={{ color: "#4a6fa5", fontWeight: 600 }}>{a.alertId}</td>
                  <td style={{ color: "#60a5fa", fontWeight: 600, cursor: "pointer" }} onClick={() => setDetail(a)}>{a.wagonId}</td>
                  <td style={{ color: "#f1f5f9" }}>{a.type}</td>
                  <td><span className={`badge ${priorityClass(a.priority)}`}>{a.priority}</span></td>
                  <td><span className="badge badge-info">{a.zone}</span></td>
                  <td style={{ color: "#4a6fa5" }}>{formatTime(a.createdAt)}</td>
                  <td><span className={`badge ${statusClass(a.status)}`}>{a.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {a.status !== "Resolved" && (
                        <button className="btn btn-sm" style={{ background: "rgba(34,197,94,.12)", color: "#22c55e" }} onClick={() => resolve(a)}>
                          <FiCheck size={11} /> Resolve
                        </button>
                      )}
                      <button className="btn btn-sm" style={{ background: "rgba(239,68,68,.12)", color: "#ef4444" }} onClick={() => dismiss(a)}>
                        <FiX size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", color: "#4a6fa5", padding: "30px" }}>
                  {alerts.length === 0 ? `No alerts found for ${zoneLabel}` : "No alerts match the current filters"}
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
              { label: "Alert ID",   val: detail.alertId },
              { label: "Wagon",      val: detail.wagonId },
              { label: "Alert Type", val: detail.type },
              { label: "Reason",     val: detail.reason },
              { label: "Time",       val: formatTime(detail.createdAt) },
              { label: "Resolved At", val: detail.resolvedAt ? formatTime(detail.resolvedAt) : "—" },
              { label: "Resolved By", val: detail.resolvedBy || "—" },
            ].map(r => (
              <div key={r.label} style={{ display: "flex", gap: "12px", marginBottom: "10px" }}>
                <span style={{ color: "#4a6fa5", fontSize: "13px", width: "100px", flexShrink: 0 }}>{r.label}</span>
                <span style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 600 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ background: "#071628", border: "1px solid #1a3356", borderRadius: "10px", padding: "14px", marginTop: "12px" }}>
              <div style={{ color: "#4a6fa5", fontSize: "12px", marginBottom: "6px" }}>Description</div>
              <div style={{ color: "#cbd5e1", fontSize: "13px" }}>{detail.desc}</div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {detail.status !== "Resolved" && (
                <button className="btn btn-success" style={{ flex: 1, justifyContent: "center" }} onClick={() => resolve(detail)}>
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
