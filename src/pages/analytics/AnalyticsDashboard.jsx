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
import {
  AnalyticsToolbar, ChartCard, DrillDownAnalytics,
  TrendComparison, PredictiveAnalytics, AIInsights, ReportGenerationPanel,
} from "../../components/AnalyticsEnhancements";

// ── Raw data per zone ─────────────────────────────────────────────────────────
const ZONE_DATA = {
  NR:  { total:312, active:300, delayed:7,  maint:5,  onTimePct:96.1, gps:94, fleet:91, cargo:88, maintRate:98 },
  SR:  { total:198, active:188, delayed:6,  maint:4,  onTimePct:95.2, gps:91, fleet:87, cargo:83, maintRate:97 },
  ER:  { total:224, active:212, delayed:8,  maint:4,  onTimePct:94.8, gps:89, fleet:85, cargo:80, maintRate:96 },
  WR:  { total:178, active:166, delayed:8,  maint:4,  onTimePct:93.4, gps:87, fleet:82, cargo:79, maintRate:95 },
  NER: { total:156, active:149, delayed:5,  maint:2,  onTimePct:95.5, gps:85, fleet:80, cargo:76, maintRate:97 },
  NWR: { total:143, active:136, delayed:4,  maint:3,  onTimePct:95.1, gps:84, fleet:79, cargo:75, maintRate:96 },
  SER: { total:127, active:122, delayed:4,  maint:1,  onTimePct:96.1, gps:88, fleet:83, cargo:80, maintRate:98 },
  SWR: { total:100, active: 97, delayed:2,  maint:1,  onTimePct:97.0, gps:92, fleet:88, cargo:85, maintRate:99 },
};

// Movement data per period
const MOVEMENT = {
  Today: [
    { day:"06:00", active:210, delayed:9 }, { day:"09:00", active:580, delayed:22 },
    { day:"12:00", active:820, delayed:38 }, { day:"15:00", active:940, delayed:41 },
    { day:"18:00", active:870, delayed:35 }, { day:"21:00", active:650, delayed:24 },
  ],
  "This Week": [
    { day:"Mon", active:820, delayed:38 }, { day:"Tue", active:940, delayed:55 },
    { day:"Wed", active:870, delayed:42 }, { day:"Thu", active:1020, delayed:60 },
    { day:"Fri", active:980, delayed:47 }, { day:"Sat", active:1089, delayed:47 },
    { day:"Sun", active:950, delayed:39 },
  ],
  "This Month": [
    { day:"W1", active:5820, delayed:240 }, { day:"W2", active:6100, delayed:270 },
    { day:"W3", active:5980, delayed:255 }, { day:"W4", active:6400, delayed:290 },
  ],
};

const MONTHLY = {
  All: [
    { month:"Feb", wagons:3450, onTime:3190 }, { month:"Mar", wagons:3700, onTime:3440 },
    { month:"Apr", wagons:3550, onTime:3290 }, { month:"May", wagons:3900, onTime:3640 },
    { month:"Jun", wagons:4100, onTime:3820 }, { month:"Jul", wagons:4300, onTime:4020 },
  ],
  Active: [
    { month:"Feb", wagons:3190, onTime:3100 }, { month:"Mar", wagons:3440, onTime:3320 },
    { month:"Apr", wagons:3290, onTime:3180 }, { month:"May", wagons:3640, onTime:3500 },
    { month:"Jun", wagons:3820, onTime:3700 }, { month:"Jul", wagons:4020, onTime:3890 },
  ],
  Delayed: [
    { month:"Feb", wagons:260, onTime:0 }, { month:"Mar", wagons:260, onTime:0 },
    { month:"Apr", wagons:260, onTime:0 }, { month:"May", wagons:260, onTime:0 },
    { month:"Jun", wagons:280, onTime:0 }, { month:"Jul", wagons:280, onTime:0 },
  ],
  Maintenance: [
    { month:"Feb", wagons:28, onTime:0 }, { month:"Mar", wagons:30, onTime:0 },
    { month:"Apr", wagons:27, onTime:0 }, { month:"May", wagons:25, onTime:0 },
    { month:"Jun", wagons:24, onTime:0 }, { month:"Jul", wagons:22, onTime:0 },
  ],
};

const ALERT_DATA = {
  All:         [{ name:"Critical", value:23 }, { name:"Warning", value:54 }, { name:"Resolved", value:156 }],
  Critical:    [{ name:"Critical", value:23 }, { name:"Warning", value:0  }, { name:"Resolved", value:0   }],
  Warning:     [{ name:"Critical", value:0  }, { name:"Warning", value:54 }, { name:"Resolved", value:0   }],
};

const PIE_C = ["#ef4444", "#f59e0b", "#22c55e"];
const TT = { contentStyle: { background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:10, color:"#f1f5f9" } };

const AnalyticsDashboard = () => {
  const { analyst } = useAuth();
  const analystZone = analyst?.zone || "All";

  const [filters,   setFilters]   = useState({ zone: analystZone, status:"All", severity:"All", period:"All" });
  const [dateRange, setDateRange] = useState({ from:"", to:"" });

  // Always keep zone locked to analyst's zone
  const handleFiltersChange = (next) => setFilters({ ...next, zone: analystZone });

  // ── Derived KPI values ────────────────────────────────────────────────────
  const kpi = useMemo(() => {
    const zones = filters.zone === "All" ? Object.values(ZONE_DATA) : [ZONE_DATA[filters.zone]].filter(Boolean);
    const total   = zones.reduce((s,z) => s + z.total,   0);
    const active  = zones.reduce((s,z) => s + z.active,  0);
    const delayed = zones.reduce((s,z) => s + z.delayed, 0);
    const maint   = zones.reduce((s,z) => s + z.maint,   0);
    const onTimePct = zones.length ? (zones.reduce((s,z) => s + z.onTimePct, 0) / zones.length).toFixed(1) : "—";
    const gps     = zones.length ? Math.round(zones.reduce((s,z) => s + z.gps,     0) / zones.length) : 0;
    const fleet   = zones.length ? Math.round(zones.reduce((s,z) => s + z.fleet,   0) / zones.length) : 0;
    const cargo   = zones.length ? Math.round(zones.reduce((s,z) => s + z.cargo,   0) / zones.length) : 0;
    const maintR  = zones.length ? (zones.reduce((s,z) => s + z.maintRate, 0) / zones.length).toFixed(1) : 0;

    // Apply status filter to active/delayed/maint
    let dispActive  = active;
    let dispDelayed = delayed;
    let dispMaint   = maint;
    if (filters.status === "Active")      { dispDelayed = 0; dispMaint = 0; }
    if (filters.status === "Delayed")     { dispActive  = 0; dispMaint = 0; }
    if (filters.status === "Maintenance") { dispActive  = 0; dispDelayed = 0; }

    return { total, active:dispActive, delayed:dispDelayed, maint:dispMaint, onTimePct, gps, fleet, cargo, maintR };
  }, [filters]);

  // ── Movement chart data ───────────────────────────────────────────────────
  const movementData = useMemo(() => {
    const period = filters.period !== "All" ? filters.period : "This Week";
    const base = MOVEMENT[period] || MOVEMENT["This Week"];
    if (filters.zone === "All") return base;
    const z = ZONE_DATA[filters.zone];
    if (!z) return base;
    const scale = z.total / 1247;
    return base.map(d => ({ ...d, active: Math.round(d.active * scale), delayed: Math.round(d.delayed * scale) }));
  }, [filters]);

  // ── Monthly chart data ────────────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const base = MONTHLY[filters.status] || MONTHLY.All;
    if (filters.zone === "All") return base;
    const z = ZONE_DATA[filters.zone];
    if (!z) return base;
    const scale = z.total / 1247;
    return base.map(d => ({ ...d, wagons: Math.round(d.wagons * scale), onTime: Math.round(d.onTime * scale) }));
  }, [filters]);

  // ── Alert pie data ────────────────────────────────────────────────────────
  const alertPie = useMemo(() => {
    const base = ALERT_DATA[filters.severity] || ALERT_DATA.All;
    if (filters.zone === "All") return base;
    const z = ZONE_DATA[filters.zone];
    if (!z) return base;
    const scale = z.total / 1247;
    return base.map(d => ({ ...d, value: Math.round(d.value * scale) }));
  }, [filters]);

  // ── Zone on-time performance bars ─────────────────────────────────────────
  const zonePerf = useMemo(() => {
    const all = [
      { label:"NR",  val:"96.1%", pct:"96%", c: undefined },
      { label:"SR",  val:"95.2%", pct:"95%", c: undefined },
      { label:"ER",  val:"94.8%", pct:"95%", c:"#f59e0b"  },
      { label:"WR",  val:"93.4%", pct:"93%", c:"#f59e0b"  },
      { label:"NER", val:"95.5%", pct:"96%", c: undefined },
      { label:"NWR", val:"95.1%", pct:"95%", c: undefined },
      { label:"SER", val:"96.1%", pct:"96%", c: undefined },
      { label:"SWR", val:"97.0%", pct:"97%", c: undefined },
    ];
    return filters.zone === "All" ? all : all.filter(z => z.label === filters.zone);
  }, [filters.zone]);

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
          <button onClick={() => { handleFiltersChange({ zone:analystZone, status:"All", severity:"All", period:"All" }); setDateRange({ from:"", to:"" }); }}
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

        <ChartCard title="Monthly Performance" icon={FiBarChart2} iconColor="#3b82f6" exportData={monthlyData} exportName="monthly_performance" height={220}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a3356"/>
            <XAxis dataKey="month" stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }}/>
            <YAxis stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }}/>
            <Tooltip {...TT}/>
            <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }}/>
            <Line type="monotone" dataKey="wagons" stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Deployed"/>
            <Line type="monotone" dataKey="onTime" stroke="#22c55e" strokeWidth={2.5} dot={false} name="On-Time"/>
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
              { label:"Total Movements", val:"28,432", color:"#3b82f6" },
              { label:"Avg Speed",       val:"76 km/h", color:"#22c55e" },
              { label:"Alert Rate",      val:`${((kpi.delayed / (kpi.total || 1)) * 100).toFixed(1)}%`, color:"#f59e0b" },
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
