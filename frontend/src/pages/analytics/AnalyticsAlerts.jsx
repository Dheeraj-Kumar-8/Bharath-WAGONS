import { useState, useMemo } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { FiAlertTriangle, FiCheckCircle, FiAlertOctagon, FiActivity } from "react-icons/fi";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";
import { useWagonData } from "../../context/WagonDataContext";
import { buildWagonSummary, buildStatusTrendRows } from "../../utils/wagonUtils";

const PIE_C = ["#ef4444", "#f59e0b", "#22c55e"];
const TT = { contentStyle: { background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" } };
const sevColor = s => s === "Critical" ? "#ef4444" : s === "Warning" ? "#f59e0b" : "#22c55e";

const AnalyticsAlerts = () => {
  const { wagons } = useWagonData();
  const [filter,     setFilter]     = useState("All");
  const [zoneFilter, setZoneFilter] = useState("All");

  const summary = useMemo(() => buildWagonSummary(wagons), [wagons]);

  const alertPie = useMemo(() => [
    { name: "Critical Alerts", value: summary.critical },
    { name: "Warning Alerts",  value: summary.warning  },
    { name: "Resolved Alerts", value: summary.healthy  },
  ], [summary]);

  // Alert bar by reason type from real wagon data
  const alertBar = useMemo(() => {
    const reasonMap = {};
    wagons.forEach(w => {
      w.alertReasons.forEach(r => {
        if (!reasonMap[r]) reasonMap[r] = { critical: 0, warning: 0, resolved: 0 };
        if (w.wagonHealth === "Critical") reasonMap[r].critical += 1;
        else if (w.wagonHealth === "Warning") reasonMap[r].warning += 1;
        else reasonMap[r].resolved += 1;
      });
    });
    return Object.entries(reasonMap).map(([type, v]) => ({ type, ...v }));
  }, [wagons]);

  // Weekly trend from real data
  const trendData = useMemo(() =>
    buildStatusTrendRows(wagons).map(d => ({
      day: d.day,
      critical: wagons.filter(w => w.wagonHealth === "Critical" && w.delayStatus !== "On Time").length > 0
        ? Math.round(d.delayed * 0.4) : 0,
      warning:  Math.round(d.delayed * 0.6),
      resolved: d.onTime,
    })),
  [wagons]);

  // Recent alerts from real wagon data
  const RECENT = useMemo(() =>
    wagons
      .filter(w => w.alertReasons.length > 0)
      .slice(0, 20)
      .map((w, i) => ({
        id: `ALT-${1000 + i}`,
        type: w.alertReasons[0] + " Alert",
        zone: w.zone,
        severity: w.wagonHealth === "Critical" ? "Critical" : "Warning",
        time: w.lastUpdated ? new Date(w.lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "N/A",
        status: w.status === "Maintenance" ? "Resolved" : "Active",
      })),
  [wagons]);

  const resolveRate = summary.total
    ? Math.round((summary.healthy / summary.total) * 100)
    : 0;

  const filtered = RECENT.filter(a => {
    const statusMatch = filter === "All" || a.status === filter;
    const zoneMatch   = zoneFilter === "All" || a.zone === zoneFilter;
    return statusMatch && zoneMatch;
  });

  return (
    <AnalyticsLayout title="Alert Analytics" sub="Critical, warning and resolved alert distribution and trends">

      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard title="Critical Alerts" value={summary.critical}  color="#ef4444" icon={FiAlertOctagon}  trend="" trendUp={false} />
        <StatCard title="Warning Alerts"  value={summary.warning}   color="#f59e0b" icon={FiAlertTriangle} trend="" trendUp={false} />
        <StatCard title="Healthy Wagons"  value={summary.healthy}   color="#22c55e" icon={FiCheckCircle}   trend="" trendUp />
        <StatCard title="Resolve Rate"    value={`${resolveRate}%`} color="#3b82f6" icon={FiActivity}      trend="" trendUp />
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
