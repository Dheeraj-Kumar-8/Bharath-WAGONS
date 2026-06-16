import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import { FiBarChart2, FiTrendingUp, FiActivity, FiAlertTriangle } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const weekly = [
  { day:"Mon", active:820, delayed:38, onTime:782 },
  { day:"Tue", active:940, delayed:55, onTime:885 },
  { day:"Wed", active:870, delayed:42, onTime:828 },
  { day:"Thu", active:1020,delayed:60, onTime:960 },
  { day:"Fri", active:980, delayed:47, onTime:933 },
  { day:"Sat", active:1089,delayed:47, onTime:1042},
  { day:"Sun", active:950, delayed:39, onTime:911 },
];

const monthly = [
  { month:"Jan",wagons:3200,cargo:8400,alerts:142},
  { month:"Feb",wagons:3450,cargo:8900,alerts:128},
  { month:"Mar",wagons:3700,cargo:9200,alerts:156},
  { month:"Apr",wagons:3550,cargo:8700,alerts:134},
  { month:"May",wagons:3900,cargo:9800,alerts:119},
  { month:"Jun",wagons:4100,cargo:10200,alerts:108},
];

const stationBar = [
  { station:"Delhi",   arrivals:142, departures:138 },
  { station:"Mumbai",  arrivals:128, departures:131 },
  { station:"Chennai", arrivals:96,  departures:99  },
  { station:"Kolkata", arrivals:112, departures:108 },
  { station:"Hyd",     arrivals:87,  departures:90  },
  { station:"Blr",     arrivals:78,  departures:74  },
];

const alertPie = [
  { name:"GPS Alert",   value:34 },
  { name:"Route Dev.",  value:27 },
  { name:"Maintenance", value:22 },
  { name:"Cargo Alert", value:17 },
];
const PIE = ["#ef4444","#f59e0b","#3b82f6","#22c55e"];

const ZONES = [
  { zone:"NR",  wagons:312, onTime:289, delayed:18, maint:5,  perf:93 },
  { zone:"CR",  wagons:248, onTime:228, delayed:14, maint:6,  perf:92 },
  { zone:"SR",  wagons:196, onTime:179, delayed:11, maint:6,  perf:91 },
  { zone:"ER",  wagons:224, onTime:206, delayed:13, maint:5,  perf:92 },
  { zone:"WR",  wagons:178, onTime:162, delayed:10, maint:6,  perf:91 },
  { zone:"SCR", wagons:156, onTime:142, delayed:9,  maint:5,  perf:91 },
];

const TT = { contentStyle:{ background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:10, color:"#f1f5f9" } };

const Analytics = () => (
  <DashboardLayout title="Analytics" sub="Performance metrics, trends, and operational insights">
    <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
      <StatCard title="Total Movements"  value="28,432"  color="#3b82f6" icon={FiActivity}      trend="+8.4%"  trendUp />
      <StatCard title="Avg On-Time Rate" value="92.4%"   color="#22c55e" icon={FiTrendingUp}     trend="+1.2%"  trendUp />
      <StatCard title="Monthly Cargo"    value="1,02,400T" color="#8b5cf6" icon={FiBarChart2}    trend="+6.8%"  trendUp />
      <StatCard title="Alert Reduction"  value="24%"     color="#f59e0b" icon={FiAlertTriangle}  trend="-24%"   trendUp />
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
            {ZONES.map(z => (
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

export default Analytics;
