import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  FiTruck, FiActivity, FiAlertTriangle, FiBox, FiMapPin,
  FiWifi, FiFileText, FiTool, FiBell, FiX,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { useWagonData } from "../context/WagonDataContext";
import {
  buildWagonSummary, buildStatusTrendRows, buildStationActivityRows,
} from "../utils/wagonUtils";
import { api } from "../utils/api";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#22c55e"];

const statusBadge = s => {
  const m = { "Running": "badge-active", "On Time": "badge-ontime", "Delayed": "badge-delayed", "Maintenance": "badge-maint", "Loading": "badge-info", "Unloading": "badge-info", "Idle": "badge-low" };
  return <span className={`badge ${m[s] || "badge-info"}`}>{s}</span>;
};
const priorityBadge = p => {
  const m = { Critical: "badge-critical", High: "badge-high", Medium: "badge-medium", Low: "badge-low" };
  return <span className={`badge ${m[p] || "badge-info"}`}>{p}</span>;
};

const MODALS = {
  addWagon: {
    title: "Add New Wagon",
    fields: [
      { label: "Wagon ID",    name: "id",   type: "text",   ph: "e.g. WGN-N06"   },
      { label: "Type",        name: "type", type: "select", opts: ["Freight", "Tank", "Flatbed"] },
      { label: "Origin",      name: "org",  type: "text",   ph: "e.g. New Delhi"  },
      { label: "Destination", name: "dest", type: "text",   ph: "e.g. Mumbai"     },
    ],
  },
  scheduleMaint: {
    title: "Schedule Maintenance",
    fields: [
      { label: "Wagon ID",   name: "wid",  type: "text",   ph: "e.g. WGN-N04"       },
      { label: "Date",       name: "date", type: "date",   ph: ""                    },
      { label: "Type",       name: "type", type: "select", opts: ["Routine", "Wheel Check", "Brake Inspection", "Full Overhaul"] },
      { label: "Technician", name: "tech", type: "text",   ph: "e.g. Ramesh Kumar"   },
    ],
  },
};

function QuickModal({ type, onClose }) {
  const cfg = MODALS[type];
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  if (!cfg) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div className="modal-title" style={{ margin: 0 }}>{cfg.title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><FiX size={18} /></button>
        </div>
        {cfg.fields.map(f => (
          <div className="form-group" key={f.name}>
            <label className="form-label">{f.label}</label>
            {f.type === "select"
              ? <select className="form-select" value={form[f.name] || ""} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}>
                  <option value="">Select…</option>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              : <input className="form-input" type={f.type} placeholder={f.ph} value={form[f.name] || ""} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
            }
          </div>
        ))}
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}
            onClick={() => { setSaved(true); setTimeout(onClose, 1200); }}>
            {saved ? "✓ Saved!" : "Save"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin } = useAuth();
  const { wagons, loading } = useWagonData();
  const [modal, setModal] = useState(null);

  const zone = admin?.zone || "All";

  // Filter wagons by admin's zone (or all if no zone)
  const zoneWagons = useMemo(() =>
    zone === "All" ? wagons : wagons.filter(w => w.zone === zone),
  [wagons, zone]);

  // Compute all KPIs from real data
  const summary = useMemo(() => buildWagonSummary(zoneWagons), [zoneWagons]);

  // Recent wagon activity table (top 8)
  const recentWagons = useMemo(() => zoneWagons.slice(0, 8), [zoneWagons]);

  // Weekly movement trend from real data
  const lineData = useMemo(() => buildStatusTrendRows(zoneWagons), [zoneWagons]);

  // Station activity bar chart from real data
  const barData = useMemo(() => buildStationActivityRows(zoneWagons), [zoneWagons]);

  // Alert pie from real wagon health data
  const pieData = useMemo(() => {
    const gps     = zoneWagons.filter(w => w.alertReasons.includes("GPS")).length;
    const delay   = zoneWagons.filter(w => w.alertReasons.includes("Delay")).length;
    const maint   = summary.maintenance;
    const cargo   = zoneWagons.filter(w => w.alertReasons.includes("Overload")).length;
    return [
      { name: "GPS Alert",   value: gps   || 0 },
      { name: "Delay Alert", value: delay || 0 },
      { name: "Maintenance", value: maint || 0 },
      { name: "Cargo Alert", value: cargo || 0 },
    ].filter(d => d.value > 0);
  }, [zoneWagons, summary]);

  // System health indicators from real data
  const health = useMemo(() => {
    const gpsPct   = summary.total ? Math.round((summary.gpsActive  / summary.total) * 100) : 0;
    const offPct   = summary.total ? Math.round(((summary.gpsWeak + summary.gpsInactive) / summary.total) * 100) : 0;
    const fleetPct = summary.total ? Math.round((summary.active     / summary.total) * 100) : 0;
    const healthPct = summary.avgHealthScore || 0;
    return [
      { label: "GPS Active",      val: `${summary.gpsActive}`,  color: "#22c55e", pct: gpsPct   },
      { label: "GPS Offline",     val: `${summary.gpsWeak + summary.gpsInactive}`, color: "#ef4444", pct: offPct },
      { label: "Fleet Utilisation", val: `${fleetPct}%`,        color: "#3b82f6", pct: fleetPct },
      { label: "Avg Health Score",  val: `${healthPct}%`,       color: healthPct >= 80 ? "#22c55e" : "#f59e0b", pct: healthPct },
      { label: "AI Engine",       val: "Active",                color: "#8b5cf6", pct: 100      },
    ];
  }, [summary]);

  // Top hub cities from real station data
  const cities = useMemo(() => {
    const stationMap = {};
    zoneWagons.forEach(w => {
      const s = w.station || "Unknown";
      if (!stationMap[s]) stationMap[s] = { name: s, active: 0, moving: 0, delayed: 0, offline: 0 };
      stationMap[s].active += 1;
      if (w.status === "Running") stationMap[s].moving += 1;
      if (w.status === "Delayed") stationMap[s].delayed += 1;
      if (w.gpsStatus !== "Active") stationMap[s].offline += 1;
    });
    return Object.values(stationMap)
      .sort((a, b) => b.active - a.active)
      .slice(0, 4);
  }, [zoneWagons]);

  // AI alerts from MongoDB Alert collection via API
  const [alerts, setAlerts] = useState([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setAlertsLoading(true);
    try {
      const res = await api.getAlerts();
      const raw = res.data || [];
      const preview = raw.slice(0, 5).map(a => ({
        wagon:    a.wagonId,
        type:     a.type,
        priority: a.priority,
        time:     a.createdAt
          ? new Date(a.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
          : "N/A",
        status:   a.status,
      }));
      setAlerts(preview);
    } catch (err) {
      console.error("[AdminDashboard] alerts fetch failed:", err.message);
      setAlerts([]);
    } finally {
      setAlertsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // System logs from real wagon events
  const logs = useMemo(() => {
    const entries = [];
    zoneWagons.filter(w => w.alertReasons.length > 0).slice(0, 6).forEach(w => {
      const time = w.lastUpdated ? new Date(w.lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "N/A";
      const reason = w.alertReasons[0];
      const color = w.wagonHealth === "Critical" ? "#ef4444" : w.wagonHealth === "Warning" ? "#f59e0b" : "#22c55e";
      entries.push({ time, msg: `${w.wagonId}: ${reason} alert — ${w.station}`, color });
    });
    return entries;
  }, [zoneWagons]);

  // Predictive insights from real data
  const predictions = useMemo(() => {
    const delayPct   = summary.total ? Math.round((summary.delayed     / summary.total) * 100) : 0;
    const maintPct   = summary.total ? Math.round((summary.maintenance / summary.total) * 100) : 0;
    const fuelEff    = summary.loadEfficiency || 0;
    const onTimePct  = summary.onTimeRate || 0;
    return [
      { label: "Delay Risk",          value: delayPct,  color: "#f59e0b", detail: `${summary.delayed} wagons currently delayed` },
      { label: "Maintenance Needed",  value: maintPct,  color: "#ef4444", detail: `${summary.maintenance} wagons in maintenance` },
      { label: "Cargo Efficiency",    value: fuelEff,   color: "#22c55e", detail: `${fuelEff}% load utilisation` },
      { label: "On-Time Performance", value: onTimePct, color: "#3b82f6", detail: `${onTimePct}% wagons on time` },
    ];
  }, [summary]);

  const stationCount = useMemo(() => new Set(zoneWagons.map(w => w.station).filter(Boolean)).size, [zoneWagons]);

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ color: "#64748b", textAlign: "center", padding: 60 }}>Loading dashboard data…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Zone banner */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, padding: "12px 18px", background: "rgba(37,99,235,.08)", border: "1px solid rgba(59,130,246,.2)", borderRadius: 12 }}>
        <div>
          <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>
            {zone === "All" ? "All Zones" : `Zone ${zone}`} — {admin?.region || "Railway Command Center"}
          </span>
          <span style={{ color: "#4a6fa5", fontSize: 12, marginLeft: 12 }}>Logged in as {admin?.name}</span>
        </div>
        <span className="badge badge-active">● Live</span>
      </div>

      {/* KPI Cards — all from real data */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard title="Total Wagons"     value={summary.total}                color="#3b82f6" icon={FiTruck}         trend="" trendUp />
        <StatCard title="Active Wagons"    value={summary.active}               color="#22c55e" icon={FiActivity}      trend="" trendUp />
        <StatCard title="Delayed Wagons"   value={summary.delayed}              color="#f59e0b" icon={FiAlertTriangle}  trend="" trendUp={false} />
        <StatCard title="Maintenance Req." value={summary.maintenance}          color="#ef4444" icon={FiTool}           trend="" trendUp={false} />
        <StatCard title="Stations"         value={stationCount}                 color="#8b5cf6" icon={FiMapPin}       trend="" trendUp />
        <StatCard title="GPS Active"       value={summary.gpsActive}            color="#06b6d4" icon={FiWifi}           trend="" trendUp />
        <StatCard title="AI Alerts"        value={summary.alerts}               color="#f97316" icon={FiBell}           trend="" trendUp={false} />
        <StatCard title="Total Cargo (T)"  value={summary.totalLoad.toLocaleString()} color="#10b981" icon={FiBox}     trend="" trendUp />
      </div>

      {/* Wagon Activity Table */}
      <div className="card mb-20">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="section-title" style={{ margin: 0 }}>
            Recent Wagon Activity — {zone === "All" ? "All Zones" : `Zone ${zone}`}
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/wagons")}>View All</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Wagon ID</th><th>Current Station</th><th>Destination</th><th>Speed</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentWagons.length === 0 ? (
                <tr><td colSpan={5} style={{ color: "#64748b", textAlign: "center" }}>No wagon data available</td></tr>
              ) : recentWagons.map(w => (
                <tr key={w._id || w.wagonId}>
                  <td style={{ color: "#60a5fa", fontWeight: 600 }}>{w.wagonId}</td>
                  <td>{w.station}</td>
                  <td>{w.destination}</td>
                  <td style={{ color: "#94a3b8" }}>{w.speed} km/h</td>
                  <td>{statusBadge(w.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Line Chart + System Health */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", marginBottom: "20px" }}>
        <div className="card">
          <div className="section-title">
            Wagon Movement — {zone === "All" ? "All Zones" : `Zone ${zone}`} (Last 7 Days)
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
              <XAxis dataKey="day" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 12 }} />
              <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 12 }} />
              <Tooltip contentStyle={{ background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" }} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Line type="monotone" dataKey="active"  stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Active Wagons" />
              <Line type="monotone" dataKey="delayed" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Delayed Wagons" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title">System Health — {zone === "All" ? "All Zones" : `Zone ${zone}`}</div>
          {health.map(h => (
            <div key={h.label} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>{h.label}</span>
                <span style={{ color: h.color, fontSize: "12px", fontWeight: 700 }}>{h.val}</span>
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width: `${h.pct}%`, background: h.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bar Chart + Pie Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px", marginBottom: "20px" }}>
        <div className="card">
          <div className="section-title">Station Activity — {zone === "All" ? "All Zones" : `Zone ${zone}`}</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
              <XAxis dataKey="station" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
              <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" }} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Bar dataKey="arrivals"   fill="#3b82f6" radius={[4, 4, 0, 0]} name="Arrivals" />
              <Bar dataKey="departures" fill="#22c55e" radius={[4, 4, 0, 0]} name="Departures" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title">Alert Distribution</div>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], display: "inline-block" }} />
                    <span style={{ color: "#64748b", fontSize: "11px" }}>{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ color: "#22c55e", textAlign: "center", padding: "40px 0", fontSize: 13 }}>✓ No active alerts</div>
          )}
        </div>
      </div>

      {/* Live Tracking Overview */}
      <div className="card mb-20">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="section-title" style={{ margin: 0 }}>
            Live Tracking — Top Station Hubs
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/live-tracking")}>Open Map</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "12px" }}>
          {cities.length === 0 ? (
            <div style={{ color: "#64748b", gridColumn: "1/-1", textAlign: "center", padding: 20 }}>No station data available</div>
          ) : cities.map(c => (
            <div key={c.name} style={{ background: "#071628", border: "1px solid #1a3356", borderRadius: "12px", padding: "16px" }}>
              <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "14px", marginBottom: "10px" }}>📍 {c.name}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Total Wagons</div>  <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>{c.active}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Running</div>       <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: 700 }}>{c.moving}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Delayed</div>       <div style={{ fontSize: "12px", color: "#f59e0b", fontWeight: 700 }}>{c.delayed}</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>GPS Offline</div>   <div style={{ fontSize: "12px", color: "#ef4444", fontWeight: 700 }}>{c.offline}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Alerts */}
      <div className="card mb-20">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="section-title" style={{ margin: 0 }}>AI Alerts — {zone === "All" ? "All Zones" : `Zone ${zone}`}</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/ai-alerts")}>View All</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Wagon ID</th><th>Alert Type</th><th>Priority</th><th>Time</th><th>Status</th></tr></thead>
            <tbody>
              {alertsLoading ? (
                <tr><td colSpan={5} style={{ color: "#4a6fa5", textAlign: "center" }}>Loading alerts…</td></tr>
              ) : alerts.length === 0 ? (
                <tr><td colSpan={5} style={{ color: "#64748b", textAlign: "center" }}>No alerts available</td></tr>
              ) : alerts.map((a, i) => (
                <tr key={i}>
                  <td style={{ color: "#60a5fa", fontWeight: 600 }}>{a.wagon}</td>
                  <td>{a.type}</td>
                  <td>{priorityBadge(a.priority)}</td>
                  <td style={{ color: "#4a6fa5" }}>{a.time}</td>
                  <td>{statusBadge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="card mb-20">
        <div className="section-title">Predictive Insights — {zone === "All" ? "All Zones" : `Zone ${zone}`}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px" }}>
          {predictions.map(p => (
            <div key={p.label} style={{ background: "#071628", border: "1px solid #1a3356", borderRadius: "12px", padding: "16px" }}>
              <div style={{ color: "#94a3b8", fontSize: "12px", marginBottom: "8px" }}>{p.label}</div>
              <div style={{ color: p.color, fontSize: "26px", fontWeight: 800, marginBottom: "8px" }}>{p.value}%</div>
              <div className="progress-bg" style={{ marginBottom: "8px" }}>
                <div className="progress-fill" style={{ width: `${p.value}%`, background: p.color }} />
              </div>
              <div style={{ color: "#4a6fa5", fontSize: "11px" }}>{p.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs + Quick Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px" }}>
        <div className="card">
          <div className="section-title">Recent System Logs — {zone === "All" ? "All Zones" : `Zone ${zone}`}</div>
          <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
            {logs.length === 0 ? (
              <div style={{ color: "#64748b", textAlign: "center", padding: 20 }}>No recent events</div>
            ) : logs.map((l, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "8px 10px", background: "#071628", borderRadius: "8px", borderLeft: `3px solid ${l.color}` }}>
                <span style={{ color: "#4a6fa5", fontSize: "11px", flexShrink: 0, marginTop: "1px" }}>{l.time}</span>
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-title">Quick Actions</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { label: "Add Wagon",           icon: FiTruck,    action: () => setModal("addWagon"),      cls: "btn-primary" },
              { label: "Generate Report",      icon: FiFileText, action: () => navigate("/reports"),      cls: "btn-ghost"   },
              { label: "View Alerts",          icon: FiBell,     action: () => navigate("/ai-alerts"),    cls: "btn-ghost"   },
              { label: "Schedule Maintenance", icon: FiTool,     action: () => setModal("scheduleMaint"), cls: "btn-warning" },
            ].map(btn => (
              <button key={btn.label} className={`btn ${btn.cls}`} style={{ width: "100%", justifyContent: "flex-start" }} onClick={btn.action}>
                <btn.icon size={14} /> {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {modal && <QuickModal type={modal} onClose={() => setModal(null)} />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
