import { useState } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { FiAlertTriangle, FiCheckCircle, FiAlertOctagon, FiActivity } from "react-icons/fi";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";

const alertPie = [
  { name: "Critical Alerts",  value: 23 },
  { name: "Warning Alerts",   value: 54 },
  { name: "Resolved Alerts",  value: 156 },
];
const PIE_C = ["#ef4444", "#f59e0b", "#22c55e"];

const alertBar = [
  { type: "GPS Signal",    critical: 8,  warning: 6,  resolved: 18 },
  { type: "Route Dev.",    critical: 4,  warning: 10, resolved: 22 },
  { type: "Brake Warning", critical: 5,  warning: 7,  resolved: 17 },
  { type: "Cargo Alert",   critical: 1,  warning: 4,  resolved: 12 },
  { type: "Engine",        critical: 3,  warning: 4,  resolved: 9  },
  { type: "Speed Excess",  critical: 0,  warning: 5,  resolved: 31 },
  { type: "Door Open",     critical: 2,  warning: 18, resolved: 47 },
];

const trendData = [
  { day: "Mon", critical: 5, warning: 12, resolved: 18 },
  { day: "Tue", critical: 8, warning: 14, resolved: 22 },
  { day: "Wed", critical: 3, warning: 9,  resolved: 20 },
  { day: "Thu", critical: 6, warning: 11, resolved: 25 },
  { day: "Fri", critical: 4, warning: 8,  resolved: 19 },
  { day: "Sat", critical: 2, warning: 7,  resolved: 21 },
  { day: "Sun", critical: 3, warning: 10, resolved: 23 },
];

const RECENT = [
  { id: "ALT-1091", type: "GPS Signal Lost",    zone: "NR",  severity: "Critical", time: "2 min ago",  status: "Active" },
  { id: "ALT-1088", type: "Route Deviation",    zone: "SR",  severity: "Warning",  time: "7 min ago",  status: "Active" },
  { id: "ALT-1085", type: "Brake Warning",      zone: "ER",  severity: "Critical", time: "12 min ago", status: "Active" },
  { id: "ALT-1080", type: "Cargo Overweight",   zone: "WR",  severity: "Warning",  time: "18 min ago", status: "Resolved" },
  { id: "ALT-1074", type: "Speed Exceeded",     zone: "NER", severity: "Warning",  time: "25 min ago", status: "Resolved" },
  { id: "ALT-1070", type: "Engine Anomaly",     zone: "NWR", severity: "Critical", time: "31 min ago", status: "Resolved" },
  { id: "ALT-1065", type: "Door Sensor Alert",  zone: "SER", severity: "Warning",  time: "42 min ago", status: "Resolved" },
  { id: "ALT-1060", type: "GPS Signal Lost",    zone: "SWR", severity: "Critical", time: "58 min ago", status: "Resolved" },
];

const TT = { contentStyle: { background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" } };
const sevColor = s => s === "Critical" ? "#ef4444" : s === "Warning" ? "#f59e0b" : "#22c55e";

const AnalyticsAlerts = () => {
  const [filter,     setFilter]     = useState("All");
  const [zoneFilter, setZoneFilter] = useState("All");

  const filtered = RECENT.filter(a => {
    const statusMatch = filter === "All" || a.status === filter;
    const zoneMatch   = zoneFilter === "All" || a.zone === zoneFilter;
    return statusMatch && zoneMatch;
  });

  return (
    <AnalyticsLayout title="Alert Analytics" sub="Critical, warning and resolved alert distribution and trends">

      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard title="Critical Alerts" value="23"  color="#ef4444" icon={FiAlertOctagon}  trend="-12%" trendUp={false} />
        <StatCard title="Warning Alerts"  value="54"  color="#f59e0b" icon={FiAlertTriangle} trend="-8%"  trendUp={false} />
        <StatCard title="Resolved Alerts" value="156" color="#22c55e" icon={FiCheckCircle}   trend="+18%" trendUp />
        <StatCard title="Resolve Rate"    value="73%" color="#3b82f6" icon={FiActivity}      trend="+5%"  trendUp />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, marginBottom: 20 }}>
        {/* Pie Chart */}
        <div className="card">
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FiAlertTriangle size={16} color="#ef4444" /> Alert Distribution
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={alertPie} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4}>
                {alertPie.map((_, i) => <Cell key={i} fill={PIE_C[i]} />)}
              </Pie>
              <Tooltip {...TT} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            {alertPie.map((d, i) => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: PIE_C[i], display: "inline-block" }} />
                  <span style={{ color: "#94a3b8", fontSize: 13 }}>{d.name}</span>
                </div>
                <span style={{ color: PIE_C[i], fontWeight: 700, fontSize: 14 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert type bar chart */}
        <div className="card">
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FiAlertOctagon size={16} color="#f59e0b" /> Alerts by Type
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={alertBar} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
              <XAxis dataKey="type" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 10 }} />
              <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
              <Tooltip {...TT} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Bar dataKey="critical" fill="#ef4444" radius={[3, 3, 0, 0]} name="Critical" />
              <Bar dataKey="warning"  fill="#f59e0b" radius={[3, 3, 0, 0]} name="Warning" />
              <Bar dataKey="resolved" fill="#22c55e" radius={[3, 3, 0, 0]} name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily trend bar chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiActivity size={16} color="#3b82f6" /> Weekly Alert Trend
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trendData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
            <XAxis dataKey="day" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
            <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
            <Tooltip {...TT} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
            <Bar dataKey="warning"  stackId="a" fill="#f59e0b" name="Warning" />
            <Bar dataKey="resolved" stackId="a" fill="#22c55e" name="Resolved" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent alerts table */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Recent Alerts</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {["All", "Active", "Resolved"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
                style={filter === f ? { background: "rgba(168,85,247,.2)", color: "#a855f7", border: "1px solid #a855f7" } : {}}>
                {f}
              </button>
            ))}
            <span style={{ color: "#1a3356", margin: "0 4px" }}>|</span>
            {["All", "NR", "SR", "ER", "WR", "NER", "NWR", "SER", "SWR"].map(z => (
              <button key={z} onClick={() => setZoneFilter(z)} style={{
                padding: "5px 9px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700,
                border: `1px solid ${zoneFilter === z ? "#a855f7" : "#1a3356"}`,
                background: zoneFilter === z ? "rgba(168,85,247,.15)" : "transparent",
                color: zoneFilter === z ? "#a855f7" : "#64748b",
              }}>{z}</button>
            ))}
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Alert ID</th><th>Type</th><th>Zone</th><th>Severity</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td style={{ color: "#60a5fa", fontWeight: 700 }}>{a.id}</td>
                  <td style={{ color: "#f1f5f9" }}>{a.type}</td>
                  <td><span className="badge badge-info" style={{ fontSize: 10 }}>{a.zone}</span></td>
                  <td><span style={{ color: sevColor(a.severity), fontWeight: 600, fontSize: 12 }}>{a.severity}</span></td>
                  <td style={{ color: "#64748b", fontSize: 12 }}>{a.time}</td>
                  <td>
                    <span style={{
                      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: a.status === "Active" ? "rgba(239,68,68,.15)" : "rgba(34,197,94,.15)",
                      color: a.status === "Active" ? "#ef4444" : "#22c55e",
                      border: `1px solid ${a.status === "Active" ? "rgba(239,68,68,.3)" : "rgba(34,197,94,.3)"}`,
                    }}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AnalyticsLayout>
  );
};

export default AnalyticsAlerts;
