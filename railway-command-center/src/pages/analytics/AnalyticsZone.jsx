import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { FiMap, FiTruck, FiActivity, FiTrendingUp } from "react-icons/fi";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";

const zoneBar = [
  { zone: "North Railway", wagons: 312, onTime: 300, delayed: 7, maint: 5 },
  { zone: "South Railway", wagons: 198, onTime: 188, delayed: 6, maint: 4 },
  { zone: "East Railway",  wagons: 224, onTime: 212, delayed: 8, maint: 4 },
  { zone: "West Railway",  wagons: 178, onTime: 166, delayed: 8, maint: 4 },
];

const zoneShort = [
  { zone: "NR", wagons: 312, onTime: 300, delayed: 7, maint: 5, perf: 96 },
  { zone: "SR", wagons: 198, onTime: 188, delayed: 6, maint: 4, perf: 95 },
  { zone: "ER", wagons: 224, onTime: 212, delayed: 8, maint: 4, perf: 95 },
  { zone: "WR", wagons: 178, onTime: 166, delayed: 8, maint: 4, perf: 93 },
];

const radar = [
  { metric: "On-Time",      NR: 96, SR: 95, ER: 95, WR: 93 },
  { metric: "Speed",        NR: 88, SR: 82, ER: 85, WR: 80 },
  { metric: "GPS Coverage", NR: 94, SR: 91, ER: 89, WR: 87 },
  { metric: "Cargo Eff.",   NR: 90, SR: 86, ER: 84, WR: 82 },
  { metric: "Safety",       NR: 97, SR: 95, ER: 94, WR: 93 },
];

const TT = { contentStyle: { background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" } };
const ZONE_COLORS = { NR: "#3b82f6", SR: "#22c55e", ER: "#f59e0b", WR: "#a855f7" };

const AnalyticsZone = () => (
  <AnalyticsLayout title="Zone Analytics" sub="Comparative performance across North, South, East and West Railway zones">

    <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
      {zoneShort.map(z => (
        <StatCard key={z.zone} title={`${z.zone} — Wagons`} value={z.wagons} color={ZONE_COLORS[z.zone]} icon={FiTruck}
          trend={`${z.perf}% on-time`} trendUp={z.perf >= 95} />
      ))}
    </div>

    {/* Zone Bar Chart — main */}
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FiMap size={16} color="#a855f7" /> Zone Wagon Distribution — Bar Chart
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={zoneBar} barCategoryGap="25%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
          <XAxis dataKey="zone" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
          <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
          <Tooltip {...TT} />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
          <Bar dataKey="wagons"  fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total Wagons" />
          <Bar dataKey="onTime"  fill="#22c55e" radius={[4, 4, 0, 0]} name="On-Time" />
          <Bar dataKey="delayed" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Delayed" />
          <Bar dataKey="maint"   fill="#ef4444" radius={[4, 4, 0, 0]} name="Maintenance" />
        </BarChart>
      </ResponsiveContainer>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 20 }}>
      {/* Zone performance table */}
      <div className="card">
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiActivity size={16} color="#3b82f6" /> Zone Performance Report
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Zone</th><th>Total</th><th>On-Time</th><th>Delayed</th><th>Maintenance</th><th>Performance</th></tr>
            </thead>
            <tbody>
              {zoneShort.map(z => (
                <tr key={z.zone}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: ZONE_COLORS[z.zone], display: "inline-block" }} />
                      <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{z.zone}</span>
                    </div>
                  </td>
                  <td style={{ color: "#3b82f6", fontWeight: 600 }}>{z.wagons}</td>
                  <td style={{ color: "#22c55e" }}>{z.onTime}</td>
                  <td style={{ color: "#f59e0b" }}>{z.delayed}</td>
                  <td style={{ color: "#ef4444" }}>{z.maint}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bg" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${z.perf}%`, background: z.perf >= 95 ? "#22c55e" : "#f59e0b" }} />
                      </div>
                      <span style={{ color: z.perf >= 95 ? "#22c55e" : "#f59e0b", fontSize: 11, fontWeight: 700, width: 36 }}>{z.perf}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Radar chart */}
      <div className="card">
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiTrendingUp size={16} color="#22c55e" /> Zone Comparison Radar
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={radar}>
            <PolarGrid stroke="#1a3356" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#4a6fa5", fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[75, 100]} tick={{ fill: "#4a6fa5", fontSize: 9 }} />
            <Radar name="NR" dataKey="NR" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
            <Radar name="SR" dataKey="SR" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
            <Radar name="ER" dataKey="ER" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
            <Radar name="WR" dataKey="WR" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            <Tooltip {...TT} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Zone detail cards */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      {[
        { zone: "North Railway", code: "NR", color: "#3b82f6", wagons: 312, routes: 28, stations: 142, speed: "79 km/h" },
        { zone: "South Railway", code: "SR", color: "#22c55e", wagons: 198, routes: 19, stations: 98,  speed: "74 km/h" },
        { zone: "East Railway",  code: "ER", color: "#f59e0b", wagons: 224, routes: 22, stations: 112, speed: "76 km/h" },
        { zone: "West Railway",  code: "WR", color: "#a855f7", wagons: 178, routes: 17, stations: 86,  speed: "72 km/h" },
      ].map(z => (
        <div key={z.code} className="card" style={{ borderTop: `3px solid ${z.color}`, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14 }}>{z.zone}</span>
            <span className="badge badge-info" style={{ fontSize: 10 }}>{z.code}</span>
          </div>
          {[
            { label: "Wagons",   val: z.wagons, color: z.color },
            { label: "Routes",   val: z.routes, color: "#94a3b8" },
            { label: "Stations", val: z.stations, color: "#94a3b8" },
            { label: "Avg Speed",val: z.speed,  color: "#22c55e" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ color: "#64748b", fontSize: 12 }}>{s.label}</span>
              <span style={{ color: s.color, fontWeight: 600, fontSize: 12 }}>{s.val}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  </AnalyticsLayout>
);

export default AnalyticsZone;
