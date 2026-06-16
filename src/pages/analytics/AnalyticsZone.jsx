import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { FiMap, FiTruck, FiActivity, FiTrendingUp } from "react-icons/fi";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";

const ALL_ZONES = [
  { zone: "NR",  name: "North Railway",         wagons: 312, onTime: 300, delayed: 7,  maint: 5, perf: 96, speed: "79 km/h", routes: 28, stations: 142, color: "#3b82f6" },
  { zone: "SR",  name: "South Railway",          wagons: 198, onTime: 188, delayed: 6,  maint: 4, perf: 95, speed: "74 km/h", routes: 19, stations: 98,  color: "#22c55e" },
  { zone: "ER",  name: "East Railway",           wagons: 224, onTime: 212, delayed: 8,  maint: 4, perf: 95, speed: "76 km/h", routes: 22, stations: 112, color: "#f59e0b" },
  { zone: "WR",  name: "West Railway",           wagons: 178, onTime: 166, delayed: 8,  maint: 4, perf: 93, speed: "77 km/h", routes: 17, stations: 86,  color: "#a855f7" },
  { zone: "NER", name: "North East Railway",     wagons: 156, onTime: 149, delayed: 5,  maint: 2, perf: 96, speed: "72 km/h", routes: 14, stations: 74,  color: "#06b6d4" },
  { zone: "NWR", name: "North Western Railway",  wagons: 143, onTime: 136, delayed: 4,  maint: 3, perf: 95, speed: "71 km/h", routes: 12, stations: 68,  color: "#f97316" },
  { zone: "SER", name: "South Eastern Railway",  wagons: 127, onTime: 122, delayed: 4,  maint: 1, perf: 96, speed: "75 km/h", routes: 11, stations: 62,  color: "#10b981" },
  { zone: "SWR", name: "South Western Railway",  wagons: 100, onTime:  97, delayed: 2,  maint: 1, perf: 97, speed: "81 km/h", routes: 9,  stations: 52,  color: "#ec4899" },
];

const radarData = [
  { metric: "On-Time",      NR: 96, SR: 95, ER: 95, WR: 93, NER: 96, NWR: 95, SER: 96, SWR: 97 },
  { metric: "Speed",        NR: 88, SR: 82, ER: 85, WR: 80, NER: 78, NWR: 77, SER: 83, SWR: 90 },
  { metric: "GPS Coverage", NR: 94, SR: 91, ER: 89, WR: 87, NER: 85, NWR: 84, SER: 88, SWR: 92 },
  { metric: "Cargo Eff.",   NR: 90, SR: 86, ER: 84, WR: 82, NER: 80, NWR: 79, SER: 83, SWR: 88 },
  { metric: "Safety",       NR: 97, SR: 95, ER: 94, WR: 93, NER: 94, NWR: 93, SER: 95, SWR: 98 },
];

const TT = { contentStyle: { background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" } };

const AnalyticsZone = () => (
  <AnalyticsLayout title="Zone Analytics" sub="Comparative performance across all 8 Indian Railway zones">

    {/* KPI stat cards — 4 per row */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
      {ALL_ZONES.map(z => (
        <StatCard key={z.zone} title={`${z.zone} — Wagons`} value={z.wagons}
          color={z.color} icon={FiTruck}
          trend={`${z.perf}% on-time`} trendUp={z.perf >= 95} />
      ))}
    </div>

    {/* Bar chart — all 8 zones */}
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FiMap size={16} color="#a855f7" /> Zone Wagon Distribution — All Zones
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={ALL_ZONES.map(z => ({ zone: z.zone, wagons: z.wagons, onTime: z.onTime, delayed: z.delayed, maint: z.maint }))} barCategoryGap="20%">
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

    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20, marginBottom: 20 }}>
      {/* Performance table — all 8 zones */}
      <div className="card">
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiActivity size={16} color="#3b82f6" /> Zone Performance Report — All Zones
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Zone</th><th>Region</th><th>Total</th><th>On-Time</th><th>Delayed</th><th>Maint.</th><th>Performance</th></tr>
            </thead>
            <tbody>
              {ALL_ZONES.map(z => (
                <tr key={z.zone}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: z.color, display: "inline-block" }} />
                      <span style={{ color: "#f1f5f9", fontWeight: 600 }}>{z.zone}</span>
                    </div>
                  </td>
                  <td style={{ color: "#94a3b8", fontSize: 12 }}>{z.name}</td>
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

      {/* Radar chart — 4 primary zones for clarity */}
      <div className="card">
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiTrendingUp size={16} color="#22c55e" /> Zone Comparison Radar (NR/SR/ER/WR)
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#1a3356" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: "#4a6fa5", fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[75, 100]} tick={{ fill: "#4a6fa5", fontSize: 9 }} />
            <Radar name="NR" dataKey="NR" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
            <Radar name="SR" dataKey="SR" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1}  />
            <Radar name="ER" dataKey="ER" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1}  />
            <Radar name="WR" dataKey="WR" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1}  />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
            <Tooltip {...TT} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Zone detail cards — all 8 */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      {ALL_ZONES.map(z => (
        <div key={z.zone} className="card" style={{ borderTop: `3px solid ${z.color}`, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13 }}>{z.name}</span>
            <span className="badge badge-info" style={{ fontSize: 10 }}>{z.zone}</span>
          </div>
          {[
            { label: "Wagons",    val: z.wagons,   color: z.color    },
            { label: "Routes",    val: z.routes,   color: "#94a3b8"  },
            { label: "Stations",  val: z.stations, color: "#94a3b8"  },
            { label: "Avg Speed", val: z.speed,    color: "#22c55e"  },
            { label: "On-Time",   val: `${z.perf}%`, color: z.perf >= 95 ? "#22c55e" : "#f59e0b" },
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
