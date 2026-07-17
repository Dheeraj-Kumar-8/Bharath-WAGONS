import { useState, useMemo, useCallback, useEffect } from "react";
import { FiAlertTriangle, FiAlertOctagon, FiInfo, FiCheck, FiX, FiBell, FiSearch, FiFilter, FiRefreshCw, FiChevronRight } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import { api } from "../utils/api";

const PRIORITY_TABS = ["All", "Critical", "High", "Medium", "Low"];
const STATUS_TABS   = ["All", "Active", "Pending", "Resolved"];

const PRIORITY_BORDER = { Critical: "#dc2626", High: "#f97316", Medium: "#facc15", Low: "#3b82f6" };

const KPI_TILES = [
  { key: "Critical", label: "Critical", color: "#dc2626", bg: "rgba(220,38,38,.1)",  border: "rgba(220,38,38,.25)",  icon: FiAlertOctagon },
  { key: "High",     label: "High",     color: "#f97316", bg: "rgba(249,115,22,.1)", border: "rgba(249,115,22,.25)", icon: FiAlertTriangle },
  { key: "Medium",   label: "Medium",   color: "#facc15", bg: "rgba(250,204,21,.1)", border: "rgba(250,204,21,.25)", icon: FiBell },
  { key: "Low",      label: "Low",      color: "#3b82f6", bg: "rgba(59,130,246,.1)", border: "rgba(59,130,246,.25)", icon: FiInfo },
  { key: "Active",   label: "Active",   color: "#ef4444", bg: "rgba(239,68,68,.1)",  border: "rgba(239,68,68,.25)",  icon: FiAlertTriangle },
  { key: "Resolved", label: "Resolved", color: "#22c55e", bg: "rgba(34,197,94,.1)",  border: "rgba(34,197,94,.25)",  icon: FiCheck },
  { key: "Pending",  label: "Pending",  color: "#f59e0b", bg: "rgba(245,158,11,.1)", border: "rgba(245,158,11,.25)", icon: FiBell },
];

const PRIORITY_STYLE = {
  Critical: { background: "#dc2626", color: "#ffffff" },
  High:     { background: "#f97316", color: "#ffffff" },
  Medium:   { background: "#facc15", color: "#1f2937" },
  Low:      { background: "#3b82f6", color: "#ffffff" },
};
const priorityBadgeStyle = p => ({
  ...( PRIORITY_STYLE[p] || { background: "#3a5a7c", color: "#ffffff" } ),
  borderRadius: "9999px",
  padding: "4px 10px",
  fontSize: "12px",
  fontWeight: 600,
  display: "inline-block",
  textAlign: "center",
  minWidth: "70px",
});
const STATUS_STYLE = {
  Active:    { background: "#dc2626", color: "#ffffff" },
  Resolved:  { background: "#16a34a", color: "#ffffff" },
  Dismissed: { background: "#6b7280", color: "#ffffff" },
};
const statusBadgeStyle = s => ({
  ...( STATUS_STYLE[s] || { background: "#94a3b8", color: "#ffffff" } ),
  borderRadius: "9999px",
  padding: "4px 10px",
  fontSize: "12px",
  fontWeight: 600,
  display: "inline-block",
  textAlign: "center",
  minWidth: "80px",
});

// Normalise API response shape → internal shape used by the UI
function normalise(a) {
  return {
    _id:       a._id,
    id:        a.alertId,
    wagon:     a.wagonId,
    type:      a.type,
    priority:  a.priority,
    zone:      a.zone,
    createdAt: a.createdAt || null,
    time:      a.createdAt
      ? new Date(a.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      : "N/A",
    status:    a.status,
    desc:      a.desc,
    currentStation: a.currentStation,
    destination:    a.destination,
  };
}

const AIAlerts = () => {
  const [baseAlerts,   setBaseAlerts]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [countdown,    setCountdown]    = useState(30);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getAlerts();
      setBaseAlerts((res.data || []).map(normalise));
      setLastUpdated(new Date());
      setCountdown(30);
    } catch (err) {
      setError(err.message || "Failed to fetch alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAndFetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await api.generateAlerts();
    } catch (err) {
      console.error("[AIAlerts] generate failed:", err.message);
      setError(err.message || "Failed to generate alerts");
      setLoading(false);
      return;
    }
    await fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => { generateAndFetch(); }, [generateAndFetch]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const id = setInterval(fetchAlerts, 30000);
    return () => clearInterval(id);
  }, [fetchAlerts]);

  // Countdown timer — ticks every second, reset to 30 on every successful fetch
  useEffect(() => {
    const tick = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000);
    return () => clearInterval(tick);
  }, []);

  const alerts = useMemo(() => baseAlerts, [baseAlerts]);

  // Expand/collapse state for grouped wagon rows
  const [expandedWagons, setExpandedWagons] = useState(new Set());
  const [hoveredWagon,   setHoveredWagon]   = useState(null);
  const toggleWagon = useCallback(wagonId => {
    setExpandedWagons(prev => {
      const next = new Set(prev);
      next.has(wagonId) ? next.delete(wagonId) : next.add(wagonId);
      return next;
    });
  }, []);

  // Filters
  const [priorityTab, setPriorityTab] = useState("All");
  const [statusTab,   setStatusTab]   = useState("All");
  const [wagonFilter, setWagonFilter] = useState("All");
  const [search,      setSearch]      = useState("");
  const [detail,      setDetail]      = useState(null);
  const [sortDesc,    setSortDesc]    = useState(true);

  const wagonIds = useMemo(() => ["All", ...Array.from(new Set(alerts.map(a => a.wagon))).sort()], [alerts]);

  const PRIORITY_RANK = { Critical: 4, High: 3, Medium: 2, Low: 1 };

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

  // Group filtered alerts by wagonId — one summary row per wagon
  const groupedWagons = useMemo(() => {
    const map = {};
    filtered.forEach(a => {
      if (!map[a.wagon]) map[a.wagon] = [];
      map[a.wagon].push(a);
    });
    return Object.entries(map).map(([wagonId, rows]) => {
      const activeCount = rows.filter(r => r.status === "Active" || r.status === "Pending").length;
      const topPriority = rows.reduce((best, r) =>
        (PRIORITY_RANK[r.priority] || 0) > (PRIORITY_RANK[best] || 0) ? r.priority : best
      , "Low");
      // latest time — computed from max createdAt, independent of sort order
      const maxCreatedAt = rows.reduce((best, r) =>
        r.createdAt && (!best || r.createdAt > best) ? r.createdAt : best
      , null);
      const latestTime = maxCreatedAt
        ? new Date(maxCreatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
        : rows[0].time;
      // dominant status: if any Active → Active, else if any Pending → Pending, else Resolved
      const dominantStatus = rows.some(r => r.status === "Active")
        ? "Active"
        : rows.some(r => r.status === "Pending")
          ? "Pending"
          : "Resolved";
      return { wagonId, rows, activeCount, topPriority, latestTime, dominantStatus };
    });
  }, [filtered]);

  const counts = useMemo(() => ({
    Critical: alerts.filter(a => a.priority === "Critical").length,
    High:     alerts.filter(a => a.priority === "High").length,
    Medium:   alerts.filter(a => a.priority === "Medium").length,
    Low:      alerts.filter(a => a.priority === "Low").length,
    Active:   alerts.filter(a => a.status   === "Active").length,
    Resolved: alerts.filter(a => a.status   === "Resolved").length,
    Pending:  alerts.filter(a => a.status   === "Pending").length,
  }), [alerts]);

  const handleManualRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchAlerts();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchAlerts]);

  const resolve = useCallback(async (id, _id) => {
    try {
      const res = await api.resolveAlert(_id);
      const updated = normalise(res.data);
      setBaseAlerts(prev => prev.map(a => a._id === _id ? updated : a));
      if (detail?._id === _id) setDetail(updated);
    } catch (err) {
      console.error("[AIAlerts] resolve failed:", err.message);
    }
  }, [detail]);

  const dismiss = useCallback(async (id, _id) => {
    try {
      await api.dismissAlert(_id);
      setBaseAlerts(prev => prev.filter(a => a._id !== _id));
      if (detail?._id === _id) setDetail(null);
    } catch (err) {
      console.error("[AIAlerts] dismiss failed:", err.message);
    }
  }, [detail]);

  return (
    <DashboardLayout
      title="AI Alerts"
      sub="Real-time AI-powered monitoring alerts"
    >
      {/* ── KPI Row ─────────────────────────────────────────────── */}
      <div className="kpi-row-7" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "10px", marginBottom: "14px" }}>
        {KPI_TILES.map(({ key, label, color, bg, border, icon: Icon }) => (
          <div key={key} className="tile-hover" style={{
            background: bg,
            border: `1px solid ${border}`,
            borderRadius: "12px",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "default",
          }}>
            <Icon size={18} color={color} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ color, fontSize: "20px", fontWeight: 800, lineHeight: 1, fontFamily: "'Manrope',sans-serif", letterSpacing: "-0.5px" }}>{counts[key] ?? 0}</div>
              <div style={{ color: "#4a6fa5", fontSize: "10px", fontWeight: 600, marginTop: "3px", textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Unified Toolbar ─────────────────────────────────────── */}
      <div className="card" style={{ padding: "14px 18px", marginBottom: "14px", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
        {/* Search */}
        <div className="search-box" style={{ flex: "1 1 200px", minWidth: "180px" }}>
          <FiSearch color="#3a5a7c" size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Alert ID, Wagon, Type…"
          />
        </div>

        {/* Priority filter */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {PRIORITY_TABS.map(t => (
            <button key={t} onClick={() => setPriorityTab(t)} className={`btn btn-sm ${priorityTab === t ? "btn-primary" : "btn-outline"}`}>
              {t}{t !== "All" && <span style={{ marginLeft: "4px", background: "rgba(255,255,255,.2)", borderRadius: "8px", padding: "1px 5px", fontSize: "10px" }}>{counts[t] || 0}</span>}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "24px", background: "rgba(30,58,100,.7)", flexShrink: 0 }} />

        {/* Status filter */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {STATUS_TABS.map(t => (
            <button key={t} onClick={() => setStatusTab(t)} className={`btn btn-sm ${statusTab === t ? "btn-primary" : "btn-ghost"}`}>
              {t}{t !== "All" && counts[t] !== undefined && <span style={{ marginLeft: "4px", background: "rgba(255,255,255,.15)", borderRadius: "8px", padding: "1px 5px", fontSize: "10px" }}>{counts[t]}</span>}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: "1px", height: "24px", background: "rgba(30,58,100,.7)", flexShrink: 0 }} />

        {/* Wagon select */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FiFilter color="#3a5a7c" size={13} />
          <select className="form-select" value={wagonFilter} onChange={e => setWagonFilter(e.target.value)} style={{ width: "auto", padding: "6px 10px", fontSize: "12px" }}>
            {wagonIds.map(w => <option key={w}>{w}</option>)}
          </select>
        </div>

        {/* Sort + Refresh */}
        <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setSortDesc(p => !p)}>
            {sortDesc ? "↓ Newest" : "↑ Oldest"}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleManualRefresh} disabled={isRefreshing}>
            <FiRefreshCw size={12} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
            {isRefreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: "14px", alignItems: "center", borderLeft: "1px solid rgba(30,58,100,.7)", paddingLeft: "12px" }}>
          <span style={{ color: "#4a6fa5", fontSize: "11px", whiteSpace: "nowrap" }}>
            Updated&nbsp;<span style={{ color: "#94a3b8", fontWeight: 600 }}>
              {lastUpdated ? lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "--"}
            </span>
          </span>
          <span style={{ color: countdown <= 5 ? "#f97316" : "#4a6fa5", fontSize: "11px", whiteSpace: "nowrap", fontWeight: 600 }}>
            {countdown}s
          </span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div className="section-title" style={{ margin: 0 }}>
            Alert Log
            <span style={{ color: "#4a6fa5", fontWeight: 400, fontSize: "13px", marginLeft: "8px" }}>
              {groupedWagons.length} wagon{groupedWagons.length !== 1 ? "s" : ""} · {filtered.length} alert{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          {(priorityTab !== "All" || statusTab !== "All" || wagonFilter !== "All" || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setPriorityTab("All"); setStatusTab("All"); setWagonFilter("All"); setSearch(""); }}>
              ✕ Clear filters
            </button>
          )}
        </div>

        {error && (
          <div style={{ color: "#ef4444", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: "8px", padding: "10px 14px", marginBottom: "12px", fontSize: "13px" }}>
            {error}
          </div>
        )}

        <div className="table-wrap">
          {groupedWagons.length === 0 && !loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "220px", border: "1.5px dashed #1a3356", borderRadius: "12px", background: "rgba(10,20,40,0.4)", padding: "40px 20px" }}>
              <FiBell size={36} color="#1a3356" style={{ marginBottom: "14px" }} />
              <div style={{ color: "#f1f5f9", fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>No Alerts Found</div>
              <div style={{ color: "#4a6fa5", fontSize: "13px" }}>Try changing the filters or search criteria.</div>
            </div>
          ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Wagon ID</th>
                <th>Active Alerts</th>
                <th>Highest Priority</th>
                <th>Latest Alert Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#4a6fa5", padding: "30px" }}>Loading alerts…</td></tr>
              )}
              {!loading && groupedWagons.map(group => {
                const isExpanded = expandedWagons.has(group.wagonId);
                const isHovered  = hoveredWagon === group.wagonId;
                const borderColor = PRIORITY_BORDER[group.topPriority] || "#3b82f6";
                return (
                  <>
                    {/* Wagon summary row */}
                    <tr
                      key={group.wagonId}
                      style={{
                        borderLeft: `3px solid ${borderColor}`,
                        background: isExpanded
                          ? `rgba(59,130,246,.07)`
                          : isHovered
                            ? `rgba(59,130,246,.04)`
                            : "transparent",
                        cursor: "pointer",
                        transition: "background .15s ease",
                      }}
                      onClick={() => toggleWagon(group.wagonId)}
                      onMouseEnter={() => setHoveredWagon(group.wagonId)}
                      onMouseLeave={() => setHoveredWagon(null)}
                    >
                      <td style={{ textAlign: "center", color: "#4a6fa5", paddingLeft: "10px" }}>
                        <FiChevronRight size={14} style={{ transition: "transform .2s ease", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }} />
                      </td>
                      <td style={{ color: "#60a5fa", fontWeight: 700 }}>{group.wagonId}</td>
                      <td>
                        <span style={{ background: "rgba(220,38,38,.15)", color: "#f87171", borderRadius: "9999px", padding: "3px 10px", fontSize: "12px", fontWeight: 700 }}>
                          {group.activeCount}
                        </span>
                      </td>
                      <td><span style={priorityBadgeStyle(group.topPriority)}>{group.topPriority}</span></td>
                      <td style={{ color: "#4a6fa5" }}>{group.latestTime}</td>
                      <td><span style={statusBadgeStyle(group.dominantStatus)}>{group.dominantStatus}</span></td>
                    </tr>

                    {/* Expanded child rows */}
                    {isExpanded && group.rows.map(a => (
                      <tr key={a._id} style={{
                        background: "rgba(4,10,22,0.85)",
                        borderLeft: `3px solid ${(PRIORITY_BORDER[a.priority] || "#3b82f6")}44`,
                      }}>
                        <td></td>
                        <td colSpan={1} style={{ paddingLeft: "28px", color: "#4a6fa5", fontSize: "11px", fontFamily: "monospace" }}>{a.id}</td>
                        <td style={{ color: "#f1f5f9", fontSize: "12px" }}>{a.type}</td>
                        <td><span style={{ ...priorityBadgeStyle(a.priority), fontSize: "11px", padding: "3px 8px" }}>{a.priority}</span></td>
                        <td style={{ color: "#4a6fa5", fontSize: "12px" }}>{a.time}</td>
                        <td>
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            <span style={{ ...statusBadgeStyle(a.status), fontSize: "11px", padding: "3px 8px" }}>{a.status}</span>
                            {a.status !== "Resolved" && (
                              <button className="btn btn-sm" style={{ background: "rgba(34,197,94,.12)", color: "#22c55e", padding: "3px 8px", fontSize: "11px" }}
                                onClick={e => { e.stopPropagation(); resolve(a.id, a._id); }}>
                                <FiCheck size={10} /> Resolve
                              </button>
                            )}
                            <button className="btn btn-sm" style={{ background: "rgba(239,68,68,.12)", color: "#ef4444", padding: "3px 8px", fontSize: "11px" }}
                              onClick={e => { e.stopPropagation(); dismiss(a.id, a._id); }}>
                              <FiX size={10} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
          )}
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
              <span style={priorityBadgeStyle(detail.priority)}>{detail.priority}</span>
              <span style={statusBadgeStyle(detail.status)}>{detail.status}</span>
              <span className="badge badge-info">{detail.zone}</span>
            </div>
            {[
              { label: "Alert ID",   val: detail.id              },
              { label: "Wagon",      val: detail.wagon           },
              { label: "Alert Type", val: detail.type            },
              { label: "Time",       val: detail.time            },
              { label: "Station",    val: detail.currentStation  || "N/A" },
              { label: "Destination",val: detail.destination     || "N/A" },
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
            {detail.recommendedAction && (
              <div style={{ background: "#071628", border: "1px solid #1a3356", borderRadius: "10px", padding: "14px", marginTop: "10px" }}>
                <div style={{ color: "#4a6fa5", fontSize: "12px", marginBottom: "6px" }}>Recommended Action</div>
                <div style={{ color: "#cbd5e1", fontSize: "13px" }}>{detail.recommendedAction}</div>
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              {detail.status !== "Resolved" && (
                <button className="btn btn-success" style={{ flex: 1, justifyContent: "center" }} onClick={() => resolve(detail.id, detail._id)}>
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
