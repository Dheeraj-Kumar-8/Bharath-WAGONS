import { useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { FiMap, FiTruck, FiActivity, FiTrendingUp } from "react-icons/fi";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";
import { useWagonData } from "../../context/WagonDataContext";
import { buildWagonSummary, buildZonePerformanceRow, getZoneName } from "../../utils/wagonUtils";

const ZONE_COLORS = {
  NR: "#3b82f6", SR: "#22c55e", ER: "#f59e0b", WR: "#a855f7",
  NER: "#06b6d4", NWR: "#f97316", SER: "#10b981", SWR: "#ec4899",
};
const ZONE_KEYS = ["NR","SR","ER","WR","NER","NWR","SER","SWR"];
const RADAR_METRICS = ["On-Time","GPS Coverage","Fleet Util.","Cargo Eff.","Health"];

const TT = { contentStyle: { background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" } };

const AnalyticsZone = () => {
  const { wagons } = useWagonData();

  const ALL_ZONES = useMemo(() =>
    ZONE_KEYS.map(zk => {
      const zWagons = wagons.filter(w => w.zone === zk);
      const row = buildZonePerformanceRow(zk, zWagons);
      const s = buildWagonSummary(zWagons);
      return {
        zone: zk,
        name: getZoneName(zk),
        wagons: row.wagons,
        onTime: row.onTime,
        delayed: row.delayed,
        maint: row.maint,
        perf: row.perf,
        speed: `${s.avgSpeed} km/h`,
        color: ZONE_COLORS[zk] || "#3b82f6",
        gpsCoverage: s.gpsCoverage,
        fleetUtil: s.total ? Math.round((s.active / s.total) * 100) : 0,
        cargoEff: s.totalCapacity ? Math.round((s.totalLoad / s.totalCapacity) * 100) : 0,
        avgHealth: s.avgHealthScore,
      };
    }).filter(z => z.wagons > 0),
  [wagons]);

  const radarData = useMemo(() =>
    RADAR_METRICS.map(metric => {
      const entry = { metric };
      ALL_ZONES.slice(0, 4).forEach(z => {
        if (metric === "On-Time")     entry[z.zone] = z.perf;
        if (metric === "GPS Coverage") entry[z.zone] = z.gpsCoverage;
        if (metric === "Fleet Util.")  entry[z.zone] = z.fleetUtil;
        if (metric === "Cargo Eff.")   entry[z.zone] = z.cargoEff;
        if (metric === "Health")       entry[z.zone] = z.avgHealth;
      });
      return entry;
    }),
  [ALL_ZONES]);

  const primaryZones = ALL_ZONES.slice(0, 4);
  const primaryColors = ["#3b82f6","#22c55e","#f59e0b","#a855f7"];

  return (
    <AnalyticsLayout title="Zone Analytics" sub="Comparative performance across all Indian Railway zones">

      {/* KPI stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {ALL_ZONES.map(z => (
          <StatCard key={z.zone} title={`${z.zone} — Wagons`} value={z.wagons}
            color={z.color} icon={FiTruck}
            trend={`${z.perf}% on-time`} trendUp={z.perf >= 95} />
        ))}
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiMap size={16} color="#a855f7" /> Zone Wagon Distribution
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
        {/* Performance table */}
        <div className="card">
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FiActivity size={16} color="#3b82f6" /> Zone Performance Report
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

        {/* Radar chart */}
        <div className="card">
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FiTrendingUp size={16} color="#22c55e" /> Zone Comparison Radar (Top 4)
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1a3356" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#4a6fa5", fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#4a6fa5", fontSize: 9 }} />
              {primaryZones.map((z, i) => (
                <Radar key={z.zone} name={z.zone} dataKey={z.zone} stroke={primaryColors[i]} fill={primaryColors[i]} fillOpacity={0.12} />
              ))}
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 11 }} />
              <Tooltip {...TT} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Zone detail cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {ALL_ZONES.map(z => (
          <div key={z.zone} className="card" style={{ borderTop: `3px solid ${z.color}`, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13 }}>{z.name}</span>
              <span className="badge badge-info" style={{ fontSize: 10 }}>{z.zone}</span>
            </div>
            {[
              { label: "Wagons",    val: z.wagons,   color: z.color    },
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
};

export default AnalyticsZone;
