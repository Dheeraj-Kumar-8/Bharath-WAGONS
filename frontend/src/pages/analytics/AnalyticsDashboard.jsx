import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  FiTruck, FiActivity, FiClock, FiTool,
  FiTrendingUp, FiBarChart2, FiAlertTriangle,
} from "react-icons/fi";
import { useState, useMemo } from "react";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";
import { useAuth } from "../../context/AuthContext";
import useZoneWagons from "../../hooks/useZoneWagons";
import {
  AnalyticsToolbar, ChartCard, DrillDownAnalytics,
  TrendComparison, PredictiveAnalytics, AIInsights, ReportGenerationPanel,
} from "../../components/AnalyticsEnhancements";
import {
  buildWagonSummary, buildStatusTrendRows, buildMonthlyTrendRows,
} from "../../utils/wagonUtils";

const PIE_C = ["#ef4444", "#f59e0b", "#22c55e"];
const TT = { contentStyle: { background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:10, color:"#f1f5f9" } };

const AnalyticsDashboard = () => {
  const { analyst } = useAuth();
  const { wagons, zone: analystZone } = useZoneWagons();

  const [filters,   setFilters]   = useState({ status:"All", severity:"All", period:"All" });
  const [dateRange, setDateRange] = useState({ from:"", to:"" });

  const handleFiltersChange = (next) => setFilters(next);

  // Apply status filter on top of already zone-filtered wagons
  const filteredWagons = useMemo(() => {
    if (filters.status === "All") return wagons;
    const map = { Active: ["Running","Loading","Unloading"], Delayed: ["Delayed"], Maintenance: ["Maintenance"] };
    const allowed = map[filters.status] || [];
    return wagons.filter(w => allowed.includes(w.status));
  }, [wagons, filters.status]);

  // ── Derived KPI values from real data ─────────────────────────────────────
  const kpi = useMemo(() => {
    const summary = buildWagonSummary(filteredWagons);
    return {
      total:     summary.total,
      active:    summary.active,
      delayed:   summary.delayed,
      maint:     summary.maintenance,
      onTimePct: summary.onTimeRate,
      gps:       summary.gpsCoverage,
      fleet:     summary.total ? Math.round((summary.active / summary.total) * 100) : 0,
      cargo:     summary.totalCapacity ? Math.round((summary.totalLoad / summary.totalCapacity) * 100) : 0,
      maintR:    summary.total ? ((summary.maintenance / summary.total) * 100).toFixed(1) : 0,
      avgSpeed:  summary.avgSpeed,
      alerts:    summary.alerts,
    };
  }, [filteredWagons]);

  // ── Movement chart data from real data ────────────────────────────────────
  const movementData = useMemo(() =>
    buildStatusTrendRows(filteredWagons).map(d => ({ day: d.day, active: d.active, delayed: d.delayed })),
  [filteredWagons]);

  // ── Monthly chart data from real data ─────────────────────────────────────
  const monthlyData = useMemo(() =>
    buildMonthlyTrendRows(filteredWagons).map(d => ({ month: d.month, wagons: d.wagons, cargo: d.cargo, alerts: d.alerts })),
  [filteredWagons]);

  // ── Alert pie data from real data ─────────────────────────────────────────
  const alertPie = useMemo(() => {
    const summary = buildWagonSummary(filteredWagons);
    const critical = summary.critical;
    const warning  = summary.warning;
    const healthy  = summary.healthy;
    if (filters.severity === "Critical") return [{ name:"Critical", value:critical }, { name:"Warning", value:0 }, { name:"Resolved", value:0 }];
    if (filters.severity === "Warning")  return [{ name:"Critical", value:0 }, { name:"Warning", value:warning }, { name:"Resolved", value:0 }];
    return [{ name:"Critical", value:critical }, { name:"Warning", value:warning }, { name:"Resolved", value:healthy }];
  }, [filteredWagons, filters.severity]);

  // ── Zone on-time performance — analyst's zone only ────────────────────────
  const zonePerf = useMemo(() => {
    const s = buildWagonSummary(wagons);
    const pct = s.onTimeRate;
    return [{ label: analystZone || "Zone", val: `${pct}%`, pct: `${pct}%`, c: pct < 95 ? "#f59e0b" : undefined }];
  }, [wagons, analystZone]);

  return (
    <AnalyticsLayout title="Analytics Overview" sub="Real-time KPIs, performance trends and operational insights">

      {/* ── Toolbar ── */}
      <AnalyticsToolbar
        filters={filters} onFiltersChange={handleFiltersChange}
        dateRange={dateRange} onDateRangeChange={setDateRange}
      />

      {/* Active filter chips — zone is always locked, not shown as a chip */}
      {(dateRange?.from || ["status","severity","period"].some(k => filters[k] !== "All")) && (
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
          {filters.status !== "All" && (
            <span style={{ background:"rgba(59,130,246,.15)", border:"1px solid rgba(59,130,246,.4)", color:"#60a5fa", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>
              Status: {filters.status}
            </span>
          )}
          {filters.severity !== "All" && (
            <span style={{ background:"rgba(245,158,11,.15)", border:"1px solid rgba(245,158,11,.4)", color:"#f59e0b", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>
              Severity: {filters.severity}
            </span>
          )}
          {filters.period !== "All" && (
            <span style={{ background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.3)", color:"#22c55e", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>
              Period: {filters.period}
            </span>
          )}
          {dateRange?.from && (
            <span style={{ background:"rgba(59,130,246,.12)", border:"1px solid rgba(59,130,246,.3)", color:"#60a5fa", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>
              {dateRange.from} → {dateRange.to || "…"}
            </span>
          )}
          <button onClick={() => { handleFiltersChange({ status:"All", severity:"All", period:"All" }); setDateRange({ from:"", to:"" }); }}
            style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", color:"#ef4444", borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            ✕ Clear all
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard title="Total Wagons"   value={kpi.total.toLocaleString()}   color="#3b82f6" icon={FiTruck}    trend="+3.2%"  trendUp />
        <StatCard title="Active Wagons"  value={kpi.active.toLocaleString()}  color="#22c55e" icon={FiActivity} trend="+1.8%"  trendUp />
        <StatCard title="Delayed Wagons" value={kpi.delayed.toLocaleString()} color="#f59e0b" icon={FiClock}    trend="-8.2%"  trendUp={false} />
        <StatCard title="Maintenance"    value={kpi.maint.toLocaleString()}   color="#ef4444" icon={FiTool}     trend="-4.1%"  trendUp={false} />
      </div>

      {/* On-Time Performance Banner */}
      <div className="glass" style={{ marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16, padding:"18px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:"rgba(34,197,94,.15)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <FiTrendingUp color="#22c55e" size={22}/>
          </div>
          <div>
            <div style={{ color:"#64748b", fontSize:12, marginBottom:3 }}>On-Time Performance</div>
            <div style={{ color:"#22c55e", fontSize:32, fontWeight:800, lineHeight:1 }}>{kpi.onTimePct}%</div>
          </div>
        </div>
        {zonePerf.map(z => (
          <div key={z.label} style={{ textAlign:"center" }}>
            <div style={{ color:"#64748b", fontSize:11, marginBottom:4 }}>{z.label}</div>
            <div style={{ color:z.c || "#22c55e", fontWeight:700, fontSize:18 }}>{z.val}</div>
            <div className="progress-bg" style={{ width:80, marginTop:5 }}>
              <div className="progress-fill" style={{ width:z.pct, background:z.c || "#22c55e" }}/>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <ChartCard title="Wagon Movement Trend" icon={FiActivity} iconColor="#a855f7" exportData={movementData} exportName="wagon_movement" height={220}>
          <AreaChart data={movementData}>
            <defs>
              <linearGradient id="gAct" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3356"/>
            <XAxis dataKey="day" stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }}/>
            <YAxis stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }}/>
            <Tooltip {...TT}/>
            <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }}/>
            <Area type="monotone" dataKey="active"  stroke="#a855f7" fill="url(#gAct)" strokeWidth={2} name="Active"/>
            <Area type="monotone" dataKey="delayed" stroke="#f59e0b" fill="none"       strokeWidth={2} name="Delayed"/>
          </AreaChart>
        </ChartCard>

        <ChartCard title="Monthly Performance Trend" icon={FiBarChart2} iconColor="#3b82f6" exportData={monthlyData} exportName="monthly_performance" height={220}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3356"/>
            <XAxis dataKey="month" stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }}/>
            <YAxis yAxisId="left"  stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }}/>
            <YAxis yAxisId="right" orientation="right" stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:10 }} tickFormatter={v => `${(v/1000).toFixed(1)}k`}/>
            <Tooltip {...TT}/>
            <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }}/>
            <Line yAxisId="left"  type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2}   dot={{ r:3 }} name="Alerts"/>
            <Line yAxisId="right" type="monotone" dataKey="cargo"  stroke="#22c55e" strokeWidth={2.5} dot={{ r:3 }} name="Cargo (tonnes)"/>
            <Line yAxisId="left"  type="monotone" dataKey="wagons" stroke="#3b82f6" strokeWidth={2.5} dot={{ r:3 }} name="Wagons Deployed"/>
          </LineChart>
        </ChartCard>
      </div>

      {/* Alert Summary + Health */}
      <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", gap:20 }}>
        <div className="card">
          <div className="section-title" style={{ display:"flex", alignItems:"center", gap:8 }}>
            <FiAlertTriangle size={16} color="#ef4444"/> Alert Summary
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={alertPie} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4}>
                {alertPie.map((_,i) => <Cell key={i} fill={PIE_C[i]}/>)}
              </Pie>
              <Tooltip {...TT}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexDirection:"column", gap:7, marginTop:8 }}>
            {alertPie.map((d,i) => (
              <div key={d.name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:"50%", background:PIE_C[i], display:"inline-block" }}/>
                  <span style={{ color:"#94a3b8", fontSize:12 }}>{d.name}</span>
                </div>
                <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:12 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">System Health Indicators</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
            {[
              { label:"GPS Coverage",      val:`${kpi.gps}%`,         color:"#22c55e", w:`${kpi.gps}%`  },
              { label:"Fleet Utilisation", val:`${kpi.fleet}%`,       color:"#3b82f6", w:`${kpi.fleet}%`},
              { label:"Cargo Efficiency",  val:`${kpi.cargo}%`,       color:"#a855f7", w:`${kpi.cargo}%`},
              { label:"Maintenance Rate",  val:`${kpi.maintR}%`,      color:"#f59e0b", w:`${kpi.maintR}%`},
            ].map(s => (
              <div key={s.label}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ color:"#64748b", fontSize:12 }}>{s.label}</span>
                  <span style={{ color:s.color, fontWeight:700, fontSize:12 }}>{s.val}</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width:s.w, background:s.color }}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { label:"Total Wagons",  val: kpi.total.toLocaleString(),          color:"#3b82f6" },
              { label:"Avg Speed",     val: `${kpi.avgSpeed} km/h`,              color:"#22c55e" },
              { label:"Alert Rate",    val: `${((kpi.alerts / (kpi.total || 1))).toFixed(1)}`,  color:"#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ textAlign:"center", background:"rgba(255,255,255,.03)", borderRadius:10, padding:"12px 8px", border:"1px solid #1a3356" }}>
                <div style={{ color:s.color, fontWeight:800, fontSize:20 }}>{s.val}</div>
                <div style={{ color:"#64748b", fontSize:11, marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Drill-Down, Trend Comparison, Predictive, AI Insights, Report Gen */}
      <div style={{ marginTop:20 }}>
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
