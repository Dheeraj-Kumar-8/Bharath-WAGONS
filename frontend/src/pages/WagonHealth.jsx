import { useEffect, useState } from "react";
import { FiThermometer, FiActivity, FiAlertTriangle, FiBattery, FiTruck, FiMapPin, FiShield } from "react-icons/fi";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const healthColor = (s) => ({ Healthy: "#22c55e", Warning: "#f59e0b", Critical: "#ef4444" }[s] || "#64748b");
const condColor   = (c) => ({ Good: "#22c55e", Fair: "#f59e0b", Worn: "#f97316", Critical: "#ef4444" }[c] || "#64748b");
const battColor   = (v) => v >= 70 ? "#22c55e" : v >= 40 ? "#f59e0b" : "#ef4444";
const tempColor   = (v) => v < 75 ? "#22c55e" : v < 85 ? "#f59e0b" : "#ef4444";

const TOOLTIP_STYLE = { backgroundColor: "#0f2744", border: "1px solid #1e3a5f", borderRadius: 8, color: "#e2e8f0", fontSize: 12 };

const WagonHealth = () => {
  const { admin, operator, analyst } = useAuth();
  const currentUser = admin || operator || analyst;
  const userZone = currentUser?.zone || "All";

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");
  const [zoneFilter, setZoneFilter] = useState("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    api.getWagonHealth()
      .then((res) => setData(res.data))
      .catch((e)  => setError(e.message))
      .finally(()  => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout title="Wagon Health" sub="Real-time health diagnostics for the entire wagon fleet">
      <div style={{ color: "#64748b", padding: "40px", textAlign: "center" }}>Loading health data…</div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout title="Wagon Health" sub="Real-time health diagnostics for the entire wagon fleet">
      <div style={{ color: "#ef4444", padding: "40px", textAlign: "center" }}>Error: {error}</div>
    </DashboardLayout>
  );

  const { total, healthy, warning, critical, avgHealth, avgTemp, avgBattery, metrics, zones, wagons } = data;

  const radialData = [{ name: "Health", value: avgHealth, fill: "#3b82f6" }];

  const zoneBarData = zones.map((z) => ({
    name:     z.zone,
    Healthy:  z.healthy,
    Warning:  z.warning,
    Critical: z.critical,
    "Avg Health": z.avgHealth,
  }));

  const zoneHealthData = zones.map((z) => ({
    name:       z.zone,
    "Avg Health":   z.avgHealth,
    "Avg Battery":  z.avgBattery,
    "Avg Temp (°C)": z.avgTemp,
  }));

  const uniqueZones = ["All", ...zones.map((z) => z.zone)];

  const filteredWagons = wagons.filter((w) => {
    const matchZone   = zoneFilter === "All" || w.zone === zoneFilter;
    const matchSearch = w.id.toLowerCase().includes(search.toLowerCase());
    return matchZone && matchSearch;
  });

  const totalPages = Math.ceil(filteredWagons.length / PAGE_SIZE);
  const pagedWagons = filteredWagons.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <DashboardLayout title="Wagon Health" sub="Real-time health diagnostics for the entire wagon fleet">

      {/* ── Zone Banner ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", padding: "10px 16px", background: "rgba(37,99,235,.08)", border: "1px solid rgba(59,130,246,.2)", borderRadius: "12px" }}>
        <FiShield size={14} color="#3b82f6" />
        <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>
          Zone {userZone} — Health Dashboard
        </span>
        <span style={{ color: "#4a6fa5", fontSize: 12, marginLeft: 4 }}>
          Showing data for {userZone === "All" ? "all zones" : `Zone ${userZone}`} · {total} wagons
        </span>
        <span className="badge badge-active" style={{ marginLeft: "auto" }}>● Live</span>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard title="Fleet Health Score" value={`${avgHealth}%`}  color="#22c55e" icon={FiActivity}     trend="+1.4%" trendUp />
        <StatCard title="Healthy Wagons"     value={healthy}          color="#22c55e" icon={FiTruck} />
        <StatCard title="Warnings"           value={warning}          color="#f59e0b" icon={FiAlertTriangle} />
        <StatCard title="Critical"           value={critical}         color="#ef4444" icon={FiAlertTriangle} />
        <StatCard title="Avg Temperature"    value={`${avgTemp}°C`}   color="#f97316" icon={FiThermometer} />
        <StatCard title="Avg Battery"        value={`${avgBattery}%`} color="#3b82f6" icon={FiBattery} />
      </div>

      {/* ── Radial + System Metrics ── */}
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "20px", marginBottom: "20px" }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="section-title" style={{ textAlign: "center" }}>Fleet Health</div>
          <div style={{ position: "relative", width: 180, height: 180 }}>
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={radialData} startAngle={180} endAngle={0}>
                <RadialBar background={{ fill: "#1a3356" }} dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "30px" }}>
              <div style={{ color: "#3b82f6", fontSize: "28px", fontWeight: 800 }}>{avgHealth}%</div>
              <div style={{ color: "#64748b", fontSize: "11px" }}>Avg Health</div>
            </div>
          </div>
          {[["Healthy", healthy, "#22c55e"], ["Warning", warning, "#f59e0b"], ["Critical", critical, "#ef4444"]].map(([l, v, c]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>{l}</span>
              </div>
              <span style={{ color: c, fontWeight: 700, fontSize: "13px" }}>{v}</span>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">System-wide Health Metrics</div>
          {[
            { label: "Wheel Condition",    good: metrics.wheelGood, color: "#22c55e" },
            { label: "Brake Condition",    good: metrics.brakeGood, color: "#3b82f6" },
            { label: "GPS Signal",         good: metrics.gpsActive, color: "#06b6d4" },
            { label: "Battery ≥70%",       good: metrics.battGood,  color: "#8b5cf6" },
            { label: "Temperature < 75°C", good: metrics.tempGood,  color: "#f59e0b" },
          ].map((m) => (
            <div key={m.label} style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#94a3b8", fontSize: "13px" }}>{m.label}</span>
                <span style={{ color: m.color, fontSize: "13px", fontWeight: 700 }}>{m.good}/{metrics.total}</span>
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width: `${(m.good / metrics.total) * 100}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Zone Analysis ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

        {/* Zone Status Distribution */}
        <div className="card">
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiMapPin size={14} color="#3b82f6" /> Zone Status Distribution
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={zoneBarData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Bar dataKey="Healthy"  fill="#22c55e" radius={[3,3,0,0]} />
              <Bar dataKey="Warning"  fill="#f59e0b" radius={[3,3,0,0]} />
              <Bar dataKey="Critical" fill="#ef4444" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Zone Avg Health & Battery */}
        <div className="card">
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiActivity size={14} color="#3b82f6" /> Zone Avg Health & Battery (%)
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={zoneHealthData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Bar dataKey="Avg Health"  fill="#3b82f6" radius={[3,3,0,0]} />
              <Bar dataKey="Avg Battery" fill="#8b5cf6" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Zone Summary Cards ── */}
      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiMapPin size={14} color="#3b82f6" /> Zone-wise Summary
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", marginTop: "12px" }}>
          {zones.map((z) => (
            <div key={z.zone} style={{ background: "#0f2744", borderRadius: "10px", padding: "14px", border: "1px solid #1e3a5f" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: "14px" }}>{z.zone}</span>
                <span style={{ color: "#64748b", fontSize: "11px" }}>{z.zoneName}</span>
              </div>
              <div style={{ color: "#e2e8f0", fontSize: "12px", marginBottom: "6px" }}>
                {z.total} wagons · Avg Health: <span style={{ color: "#3b82f6", fontWeight: 700 }}>{z.avgHealth}%</span>
              </div>
              <div style={{ display: "flex", gap: "8px", fontSize: "11px" }}>
                <span style={{ color: "#22c55e" }}>✓ {z.healthy}</span>
                <span style={{ color: "#f59e0b" }}>⚠ {z.warning}</span>
                <span style={{ color: "#ef4444" }}>✕ {z.critical}</span>
              </div>
              <div className="progress-bg" style={{ marginTop: "8px" }}>
                <div className="progress-fill" style={{ width: `${z.avgHealth}%`, background: z.avgHealth >= 80 ? "#22c55e" : z.avgHealth >= 60 ? "#f59e0b" : "#ef4444" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Wagon Details Table ── */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div className="section-title" style={{ margin: 0 }}>Wagon Health Details</div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input
              placeholder="Search Wagon ID…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ background: "#0f2744", border: "1px solid #1e3a5f", borderRadius: "8px", color: "#e2e8f0", padding: "6px 12px", fontSize: "13px", outline: "none" }}
            />
            <select
              value={zoneFilter}
              onChange={(e) => { setZoneFilter(e.target.value); setPage(1); }}
              style={{ background: "#0f2744", border: "1px solid #1e3a5f", borderRadius: "8px", color: "#e2e8f0", padding: "6px 12px", fontSize: "13px", outline: "none" }}
            >
              {uniqueZones.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Wagon ID</th><th>Zone</th><th>Type</th><th>Temperature</th>
                <th>Wheel</th><th>Brakes</th><th>Battery</th><th>GPS</th>
                <th>Health Score</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pagedWagons.map((w) => (
                <tr key={w.id}>
                  <td style={{ color: "#60a5fa", fontWeight: 700 }}>{w.id}</td>
                  <td><span style={{ color: "#94a3b8", fontSize: 12 }}>{w.zone}</span></td>
                  <td style={{ color: "#cbd5e1", fontSize: 12 }}>{w.wagonType}</td>
                  <td style={{ color: tempColor(w.temp), fontWeight: 600 }}>{w.temp}°C</td>
                  <td><span style={{ color: condColor(w.wheel), fontWeight: 600, fontSize: 13 }}>{w.wheel}</span></td>
                  <td><span style={{ color: condColor(w.brake), fontWeight: 600, fontSize: 13 }}>{w.brake}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="progress-bg" style={{ width: 60 }}>
                        <div className="progress-fill" style={{ width: `${w.battery}%`, background: battColor(w.battery) }} />
                      </div>
                      <span style={{ color: battColor(w.battery), fontSize: "12px", fontWeight: 600 }}>{w.battery}%</span>
                    </div>
                  </td>
                  <td style={{ color: w.gps === "Active" ? "#22c55e" : w.gps === "Weak" ? "#f59e0b" : "#ef4444", fontWeight: 600 }}>{w.gps}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="progress-bg" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${w.health}%`, background: healthColor(w.status) }} />
                      </div>
                      <span style={{ color: healthColor(w.status), fontSize: "12px", fontWeight: 700, width: "30px" }}>{w.health}%</span>
                    </div>
                  </td>
                  <td><span className={`badge ${w.status === "Healthy" ? "badge-active" : w.status === "Warning" ? "badge-medium" : "badge-critical"}`}>{w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", flexWrap: "wrap", gap: "8px" }}>
          <span style={{ color: "#64748b", fontSize: "12px" }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredWagons.length)} of {filteredWagons.length} wagons
          </span>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ background: page === 1 ? "#1e3a5f" : "#1e3a5f", border: "1px solid #2d4f7c", borderRadius: "6px", color: page === 1 ? "#4a6fa5" : "#e2e8f0", padding: "4px 10px", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: "13px" }}
            >‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{ background: p === page ? "#3b82f6" : "#1e3a5f", border: `1px solid ${p === page ? "#3b82f6" : "#2d4f7c"}`, borderRadius: "6px", color: p === page ? "#fff" : "#94a3b8", padding: "4px 10px", cursor: "pointer", fontSize: "13px", fontWeight: p === page ? 700 : 400 }}
              >{p}</button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ background: "#1e3a5f", border: "1px solid #2d4f7c", borderRadius: "6px", color: page === totalPages ? "#4a6fa5" : "#e2e8f0", padding: "4px 10px", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: "13px" }}
            >›</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WagonHealth;
