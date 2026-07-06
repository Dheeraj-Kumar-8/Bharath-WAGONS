import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { FiBarChart2, FiTrendingUp, FiActivity, FiAlertTriangle } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { useWagonData } from "../context/WagonDataContext";
import {
  buildWagonSummary, buildStatusTrendRows, buildMonthlyTrendRows,
  buildAlertDistribution, buildStationActivityRows, buildZonePerformanceRow,
} from "../utils/wagonUtils";

const PIE = ["#ef4444","#f59e0b","#3b82f6","#22c55e"];
const TT = { contentStyle:{ background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:10, color:"#f1f5f9" } };
const ZONE_KEYS = ["NR","SR","ER","WR","NER","NWR","SER","SWR"];

const Analytics = () => {
  const { wagons } = useWagonData();

  const summary  = useMemo(() => buildWagonSummary(wagons), [wagons]);
  const weekly   = useMemo(() => buildStatusTrendRows(wagons), [wagons]);
  const monthly  = useMemo(() => buildMonthlyTrendRows(wagons), [wagons]);
  const stationBar = useMemo(() => buildStationActivityRows(wagons), [wagons]);
  const alertPie = useMemo(() => {
    const dist = buildAlertDistribution(wagons);
    return dist.length ? dist : [
      { name: "GPS Alert", value: 0 }, { name: "Maintenance", value: 0 },
    ];
  }, [wagons]);
  const ZONES = useMemo(() =>
    ZONE_KEYS.map(z => buildZonePerformanceRow(z, wagons.filter(w => w.zone === z)))
      .filter(z => z.wagons > 0),
  [wagons]);

  return (
  <DashboardLayout title="Analytics" sub="Performance metrics, trends, and operational insights">
    <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
      <StatCard title="Total Wagons"     value={summary.total.toLocaleString()} color="#3b82f6" icon={FiActivity}     trend="" trendUp />
      <StatCard title="Avg On-Time Rate" value={`${summary.onTimeRate}%`}       color="#22c55e" icon={FiTrendingUp}   trend="" trendUp />
      <StatCard title="Total Cargo (T)"  value={summary.totalLoad.toLocaleString()} color="#8b5cf6" icon={FiBarChart2} trend="" trendUp />
      <StatCard title="Active Alerts"    value={summary.alerts.toLocaleString()} color="#f59e0b" icon={FiAlertTriangle} trend="" trendUp={false} />
    </div>

    {/* Row 1 */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"20px" }}>
      <div className="card">
        <div className="section-title">Weekly Wagon Movement</div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={weekly}>
            <defs>
              <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
            <XAxis dataKey="day"    stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }} />
            <YAxis                  stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }} />
            <Tooltip {...TT} />
            <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }} />
            <Area type="monotone" dataKey="active"  stroke="#3b82f6" fill="url(#ga)" strokeWidth={2} name="Active" />
            <Area type="monotone" dataKey="delayed" stroke="#f59e0b" fill="none"      strokeWidth={2} name="Delayed" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <div className="section-title">Station Activity</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stationBar} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
            <XAxis dataKey="station" stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }} />
            <YAxis                   stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }} />
            <Tooltip {...TT} />
            <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }} />
            <Bar dataKey="arrivals"   fill="#3b82f6" radius={[4,4,0,0]} name="Arrivals" />
            <Bar dataKey="departures" fill="#22c55e" radius={[4,4,0,0]} name="Departures" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* Row 2 */}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:"20px", marginBottom:"20px" }}>
      <div className="card">
        <div className="section-title">Monthly Performance Trend</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
            <XAxis dataKey="month" stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }} />
            <YAxis stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }} />
            <Tooltip {...TT} />
            <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }} />
            <Line type="monotone" dataKey="wagons" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Wagons Deployed" />
            <Line type="monotone" dataKey="cargo"  stroke="#22c55e" strokeWidth={2.5} dot={false} name="Cargo (tonnes)" />
            <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2}   dot={false} name="Alerts" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="card">
        <div className="section-title">Alert Distribution</div>
        <ResponsiveContainer width="100%" height={170}>
          <PieChart>
            <Pie data={alertPie} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4}>
              {alertPie.map((_, i) => <Cell key={i} fill={PIE[i]} />)}
            </Pie>
            <Tooltip {...TT} />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
          {alertPie.map((d, i) => (
            <div key={d.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:PIE[i], display:"inline-block" }} />
                <span style={{ color:"#94a3b8", fontSize:"12px" }}>{d.name}</span>
              </div>
              <span style={{ color:"#f1f5f9", fontSize:"12px", fontWeight:700 }}>{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Zone Performance */}
    <div className="card">
      <div className="section-title">Zone Performance Report</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Zone</th><th>Total Wagons</th><th>On Time</th><th>Delayed</th><th>Maintenance</th><th>Performance</th></tr>
          </thead>
          <tbody>
            {ZONES.length === 0 ? (
              <tr><td colSpan={6} style={{ color:"#64748b", textAlign:"center" }}>No zone data available</td></tr>
            ) : ZONES.map(z => (
              <tr key={z.zone}>
                <td><span className="badge badge-info" style={{ fontSize:13, padding:"4px 14px" }}>{z.zone}</span></td>
                <td style={{ color:"#f1f5f9", fontWeight:600 }}>{z.wagons}</td>
                <td style={{ color:"#22c55e", fontWeight:600 }}>{z.onTime}</td>
                <td style={{ color:"#f59e0b" }}>{z.delayed}</td>
                <td style={{ color:"#ef4444" }}>{z.maint}</td>
                <td>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <div className="progress-bg" style={{ flex:1 }}>
                      <div className="progress-fill" style={{ width:`${z.perf}%`, background:"#22c55e" }} />
                    </div>
                    <span style={{ color:"#22c55e", fontSize:"12px", fontWeight:700, width:"36px" }}>{z.perf}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

};

export default Analytics;
