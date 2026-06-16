import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { FiTrendingUp, FiActivity, FiBarChart2, FiClock } from "react-icons/fi";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";
import { ChartCard } from "../../components/AnalyticsEnhancements";

const weekly = [
  { day: "Mon", active: 820, onTime: 782, delayed: 38 },
  { day: "Tue", active: 940, onTime: 885, delayed: 55 },
  { day: "Wed", active: 870, onTime: 828, delayed: 42 },
  { day: "Thu", active: 1020, onTime: 960, delayed: 60 },
  { day: "Fri", active: 980, onTime: 933, delayed: 47 },
  { day: "Sat", active: 1089, onTime: 1042, delayed: 47 },
  { day: "Sun", active: 950, onTime: 911, delayed: 39 },
];

const monthly = [
  { month: "Jan", wagons: 3200, cargo: 8400, alerts: 142 },
  { month: "Feb", wagons: 3450, cargo: 8900, alerts: 128 },
  { month: "Mar", wagons: 3700, cargo: 9200, alerts: 156 },
  { month: "Apr", wagons: 3550, cargo: 8700, alerts: 134 },
  { month: "May", wagons: 3900, cargo: 9800, alerts: 119 },
  { month: "Jun", wagons: 4100, cargo: 10200, alerts: 108 },
  { month: "Jul", wagons: 4300, cargo: 10800, alerts: 97 },
];

const speed = [
  { hour: "06:00", avg: 68 }, { hour: "08:00", avg: 72 }, { hour: "10:00", avg: 79 },
  { hour: "12:00", avg: 76 }, { hour: "14:00", avg: 81 }, { hour: "16:00", avg: 74 },
  { hour: "18:00", avg: 69 }, { hour: "20:00", avg: 77 }, { hour: "22:00", avg: 82 },
];

const TT = { contentStyle: { background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" } };

const AnalyticsPerformance = () => (
  <AnalyticsLayout title="Performance Analytics" sub="Detailed wagon movement trends, speed and monthly KPIs">

    <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
      <StatCard title="Avg On-Time Rate"  value="95.7%"   color="#22c55e" icon={FiTrendingUp} trend="+1.2%" trendUp />
      <StatCard title="Total Movements"   value="28,432"  color="#3b82f6" icon={FiActivity}   trend="+8.4%" trendUp />
      <StatCard title="Avg Speed"         value="76 km/h" color="#a855f7" icon={FiBarChart2}  trend="+2.1%" trendUp />
      <StatCard title="Avg Delay"         value="48 min"  color="#f59e0b" icon={FiClock}      trend="-11%"  trendUp={false} />
    </div>

    {/* Weekly movement area chart */}
    <div style={{ marginBottom: 20 }}>
      <ChartCard title="Weekly Wagon Movement Trend" icon={FiActivity} iconColor="#a855f7" exportData={weekly} exportName="weekly_movement" height={240}>
        <AreaChart data={weekly}>
          <defs>
            <linearGradient id="gPerf" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
          <XAxis dataKey="day" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
          <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
          <Tooltip {...TT} />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
          <Area type="monotone" dataKey="active"  stroke="#3b82f6" fill="url(#gPerf)" strokeWidth={2} name="Active Wagons" />
          <Area type="monotone" dataKey="onTime"  stroke="#22c55e" fill="none"        strokeWidth={2} name="On-Time" />
          <Area type="monotone" dataKey="delayed" stroke="#f59e0b" fill="none"        strokeWidth={2} name="Delayed" />
        </AreaChart>
      </ChartCard>
    </div>

    {/* Monthly Performance line chart */}
    <div style={{ marginBottom: 20 }}>
      <ChartCard title="Monthly Performance Chart" icon={FiBarChart2} iconColor="#3b82f6" exportData={monthly} exportName="monthly_performance" height={230}>
        <LineChart data={monthly}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
          <XAxis dataKey="month" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
          <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
          <Tooltip {...TT} />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
          <Line type="monotone" dataKey="wagons" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} name="Wagons" />
          <Line type="monotone" dataKey="cargo"  stroke="#22c55e" strokeWidth={2.5} dot={{ r: 3 }} name="Cargo (T)" />
          <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2}   dot={{ r: 3 }} name="Alerts" />
        </LineChart>
      </ChartCard>
    </div>

    {/* Avg Speed bar chart */}
    <div style={{ marginBottom: 20 }}>
      <ChartCard title="Avg Speed by Hour (Today)" icon={FiTrendingUp} iconColor="#22c55e" exportData={speed} exportName="speed_by_hour" height={230}>
        <BarChart data={speed} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
          <XAxis dataKey="hour" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 10 }} />
          <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} unit=" km/h" />
          <Tooltip {...TT} />
          <Bar dataKey="avg" fill="#a855f7" radius={[4, 4, 0, 0]} name="Avg Speed (km/h)" />
        </BarChart>
      </ChartCard>
    </div>

    {/* On-Time % table */}
    <div className="card">
      <div className="section-title">On-Time Performance — Daily Breakdown</div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Day</th><th>Active Wagons</th><th>On-Time</th>
              <th>Delayed</th><th>On-Time %</th><th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {weekly.map(r => {
              const pct = ((r.onTime / r.active) * 100).toFixed(1);
              const color = pct >= 95 ? "#22c55e" : "#f59e0b";
              return (
                <tr key={r.day}>
                  <td style={{ color: "#f1f5f9", fontWeight: 600 }}>{r.day}</td>
                  <td style={{ color: "#3b82f6", fontWeight: 600 }}>{r.active.toLocaleString()}</td>
                  <td style={{ color: "#22c55e" }}>{r.onTime.toLocaleString()}</td>
                  <td style={{ color: "#f59e0b" }}>{r.delayed}</td>
                  <td style={{ color }}>{pct}%</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div className="progress-bg" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span style={{ color, fontSize: 11, fontWeight: 700, width: 40 }}>{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

  </AnalyticsLayout>
);

export default AnalyticsPerformance;
