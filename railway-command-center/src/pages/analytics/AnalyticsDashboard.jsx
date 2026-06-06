import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  FiTruck, FiActivity, FiClock, FiTool,
  FiTrendingUp, FiBarChart2, FiAlertTriangle,
} from "react-icons/fi";
import { useState } from "react";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";
import {
  AnalyticsToolbar, ChartCard, DrillDownAnalytics,
  TrendComparison, PredictiveAnalytics, AIInsights, ReportGenerationPanel,
} from "../../components/AnalyticsEnhancements";

const movement = [
  { day: "Mon", active: 820, delayed: 38 },
  { day: "Tue", active: 940, delayed: 55 },
  { day: "Wed", active: 870, delayed: 42 },
  { day: "Thu", active: 1020, delayed: 60 },
  { day: "Fri", active: 980, delayed: 47 },
  { day: "Sat", active: 1089, delayed: 47 },
  { day: "Sun", active: 950, delayed: 39 },
];

const monthly = [
  { month: "Feb", wagons: 3450, onTime: 3190 },
  { month: "Mar", wagons: 3700, onTime: 3440 },
  { month: "Apr", wagons: 3550, onTime: 3290 },
  { month: "May", wagons: 3900, onTime: 3640 },
  { month: "Jun", wagons: 4100, onTime: 3820 },
  { month: "Jul", wagons: 4300, onTime: 4020 },
];

const alertPie = [
  { name: "Critical", value: 23 },
  { name: "Warning",  value: 54 },
  { name: "Resolved", value: 156 },
];
const PIE_C = ["#ef4444", "#f59e0b", "#22c55e"];
const TT = { contentStyle: { background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, color: "#f1f5f9" } };

const AnalyticsDashboard = () => {
  const [filters,   setFilters]   = useState({ zone: "All", status: "All", severity: "All", period: "All" });
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  return (
    <AnalyticsLayout title="Analytics Overview" sub="Real-time KPIs, performance trends and operational insights">

      {/* ── Toolbar: Filters + Date Range ── */}
      <AnalyticsToolbar
        filters={filters} onFiltersChange={setFilters}
        dateRange={dateRange} onDateRangeChange={setDateRange}
      />

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard title="Total Wagons"   value="1,247" color="#3b82f6" icon={FiTruck}    trend="+3.2%" trendUp />
        <StatCard title="Active Wagons"  value="1,089" color="#22c55e" icon={FiActivity} trend="+1.8%" trendUp />
        <StatCard title="Delayed Wagons" value="47"    color="#f59e0b" icon={FiClock}    trend="-8.2%" trendUp={false} />
        <StatCard title="Maintenance"    value="28"    color="#ef4444" icon={FiTool}     trend="-4.1%" trendUp={false} />
      </div>

      {/* On-Time Performance Banner */}
      <div className="glass" style={{ marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(34,197,94,.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FiTrendingUp color="#22c55e" size={22} />
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 12, marginBottom: 3 }}>On-Time Performance</div>
            <div style={{ color: "#22c55e", fontSize: 32, fontWeight: 800, lineHeight: 1 }}>95.7%</div>
          </div>
        </div>
        {[
          { label: "NR",  val: "96.1%", pct: "96%" },
          { label: "SR",  val: "95.2%", pct: "95%" },
          { label: "ER",  val: "94.8%", pct: "95%", c: "#f59e0b" },
          { label: "WR",  val: "93.4%", pct: "93%", c: "#f59e0b" },
          { label: "NER", val: "95.5%", pct: "96%" },
          { label: "NWR", val: "95.1%", pct: "95%" },
          { label: "SER", val: "96.1%", pct: "96%" },
          { label: "SWR", val: "97.0%", pct: "97%" },
        ].map(z => (
          <div key={z.label} style={{ textAlign: "center" }}>
            <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>{z.label}</div>
            <div style={{ color: z.c || "#22c55e", fontWeight: 700, fontSize: 18 }}>{z.val}</div>
            <div className="progress-bg" style={{ width: 80, marginTop: 5 }}>
              <div className="progress-fill" style={{ width: z.pct, background: z.c || "#22c55e" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <ChartCard title="Wagon Movement Trend" icon={FiActivity} iconColor="#a855f7" exportData={movement} exportName="wagon_movement" height={220}>
          <AreaChart data={movement}>
            <defs>
              <linearGradient id="gAct" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
            <XAxis dataKey="day" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
            <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
            <Tooltip {...TT} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Area type="monotone" dataKey="active"  stroke="#a855f7" fill="url(#gAct)" strokeWidth={2} name="Active" />
            <Area type="monotone" dataKey="delayed" stroke="#f59e0b" fill="none"       strokeWidth={2} name="Delayed" />
          </AreaChart>
        </ChartCard>

        <ChartCard title="Monthly Performance" icon={FiBarChart2} iconColor="#3b82f6" exportData={monthly} exportName="monthly_performance" height={220}>
          <LineChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
            <XAxis dataKey="month" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
            <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
            <Tooltip {...TT} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Line type="monotone" dataKey="wagons" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Deployed" />
            <Line type="monotone" dataKey="onTime" stroke="#22c55e" strokeWidth={2.5} dot={false} name="On-Time" />
          </LineChart>
        </ChartCard>
      </div>

      {/* Alert Summary + Health */}
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>
        <div className="card">
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FiAlertTriangle size={16} color="#ef4444" /> Alert Summary
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={alertPie} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4}>
                {alertPie.map((_, i) => <Cell key={i} fill={PIE_C[i]} />)}
              </Pie>
              <Tooltip {...TT} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 8 }}>
            {alertPie.map((d, i) => (
              <div key={d.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_C[i], display: "inline-block" }} />
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>{d.name}</span>
                </div>
                <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 12 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">System Health Indicators</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
            {[
              { label: "GPS Coverage",      val: "89%",   color: "#22c55e", w: "89%" },
              { label: "Fleet Utilisation", val: "87.3%", color: "#3b82f6", w: "87%" },
              { label: "Cargo Efficiency",  val: "80%",   color: "#a855f7", w: "80%" },
              { label: "Maintenance Rate",  val: "97.2%", color: "#f59e0b", w: "97%" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ color: "#64748b", fontSize: 12 }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight: 700, fontSize: 12 }}>{s.val}</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: s.w, background: s.color }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[
              { label: "Total Movements", val: "28,432", color: "#3b82f6" },
              { label: "Avg Speed",       val: "76 km/h", color: "#22c55e" },
              { label: "Alert Rate",      val: "2.1%",    color: "#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ textAlign: "center", background: "rgba(255,255,255,.03)", borderRadius: 10, padding: "12px 8px", border: "1px solid #1a3356" }}>
                <div style={{ color: s.color, fontWeight: 800, fontSize: 20 }}>{s.val}</div>
                <div style={{ color: "#64748b", fontSize: 11, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Drill-Down, Trend Comparison, Predictive, AI Insights, Report Gen ── */}
      <div style={{ marginTop: 20 }}>
        <DrillDownAnalytics />
        <TrendComparison />
        <PredictiveAnalytics />
        <AIInsights />
        <ReportGenerationPanel />
      </div>

    </AnalyticsLayout>
  );
};

export default AnalyticsDashboard;
