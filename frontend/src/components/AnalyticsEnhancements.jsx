import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import useZoneWagons from "../hooks/useZoneWagons";
import { buildReportData, exportReportPDF, exportReportExcel, exportReportCSV, REPORT_DEFINITIONS } from "../utils/reportExportService";
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  ReferenceLine,
} from "recharts";
import {
  FiMaximize2, FiMinimize2, FiDownload, FiZoomIn, FiZoomOut,
  FiFilter, FiCalendar, FiTrendingUp, FiCpu, FiAlertTriangle,
  FiFileText, FiRefreshCw, FiChevronDown, FiChevronRight, FiX,
} from "react-icons/fi";

const TT = { contentStyle: { background: "var(--dropdown-bg,#0d1f3c)", border: "1px solid var(--border-color,#1a3356)", borderRadius: 10, color: "var(--text-strong,#f1f5f9)", fontSize: 12 } };

// ── Fullscreen wrapper ────────────────────────────────────────────────────────
export function ChartCard({ title, icon: Icon, iconColor = "#a855f7", children, height = 220, exportData, exportName = "chart" }) {
  const [full, setFull]   = useState(false);
  const [zoom, setZoom]   = useState(1);

  const exportCSV = useCallback(() => {
    if (!exportData || !exportData.length) return;
    const keys = Object.keys(exportData[0]);
    const rows = [keys.join(","), ...exportData.map(r => keys.map(k => r[k]).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${exportName}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }, [exportData, exportName]);

  const h = full ? Math.min(window.innerHeight * 0.72, 560) : height;

  return (
    <>
      {full && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.72)", zIndex: 8000 }} onClick={() => setFull(false)} />}
      <div className="card" style={full ? {
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        zIndex: 8001, width: "min(92vw,960px)", maxHeight: "90vh", overflowY: "auto",
      } : {}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
            {Icon && <Icon size={16} color={iconColor} />} {title}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {zoom > 1 && <button title="Zoom out" onClick={() => setZoom(z => Math.max(1, z - 0.25))} style={btnStyle}><FiZoomOut size={12} /></button>}
            <button title="Zoom in" onClick={() => setZoom(z => Math.min(2.5, z + 0.25))} style={btnStyle}><FiZoomIn size={12} /></button>
            {exportData && <button title="Export CSV" onClick={exportCSV} style={btnStyle}><FiDownload size={12} /></button>}
            <button title={full ? "Exit fullscreen" : "Fullscreen"} onClick={() => setFull(f => !f)} style={btnStyle}>
              {full ? <FiMinimize2 size={12} /> : <FiMaximize2 size={12} />}
            </button>
          </div>
        </div>
        <div style={{ transform: `scaleY(${zoom})`, transformOrigin: "top center", transition: "transform .2s" }}>
          <ResponsiveContainer width="100%" height={h}>
            {children}
          </ResponsiveContainer>
        </div>
        {zoom > 1 && <div style={{ textAlign: "center", color: "var(--text-muted,#64748b)", fontSize: 11, marginTop: 6 }}>Zoom {zoom.toFixed(2)}× — scroll chart area</div>}
      </div>
    </>
  );
}

const btnStyle = {
  background: "rgba(255,255,255,.06)", border: "1px solid var(--border-color,#1a3356)",
  borderRadius: 6, padding: "4px 7px", cursor: "pointer", color: "var(--text-muted,#64748b)",
  display: "flex", alignItems: "center",
};

// ── Advanced Filters ──────────────────────────────────────────────────────────
export function AdvancedFilters({ filters, onChange }) {
  const { analyst } = useAuth();
  const analystZone = analyst?.zone;
  const [open, setOpen] = useState(false);

  // Only count non-zone filters as "active" (zone is locked)
  const active = ["status", "severity", "period"].filter(k => filters[k] && filters[k] !== "All").length;

  const FILTER_FIELDS = [
    { key: "status",   label: "Status",   options: ["All", "Active", "Delayed", "Maintenance"] },
    { key: "severity", label: "Severity", options: ["All", "Critical", "Warning", "Low"] },
    { key: "period",   label: "Period",   options: ["All", "Today", "This Week", "This Month"] },
  ];

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 7,
        background: active ? "rgba(168,85,247,.15)" : "rgba(255,255,255,.05)",
        border: `1px solid ${active ? "#a855f7" : "var(--border-color,#1a3356)"}`,
        borderRadius: 8, padding: "7px 12px", cursor: "pointer",
        color: active ? "#a855f7" : "var(--text-muted,#94a3b8)", fontSize: 13, fontWeight: 600,
      }}>
        <FiFilter size={13} />
        Filters {active > 0 && <span style={{ background: "#a855f7", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{active}</span>}
        <FiChevronDown size={12} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 400,
          background: "var(--dropdown-bg,#0d1f3c)", border: "1px solid var(--border-color,#1a3356)",
          borderRadius: 14, padding: 16, minWidth: 300, boxShadow: "0 16px 40px rgba(0,0,0,.4)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ color: "var(--text-strong,#f1f5f9)", fontWeight: 700, fontSize: 13 }}>Filters</span>
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}><FiX size={14} /></button>
          </div>

          {/* Zone locked badge */}
          {analystZone && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "7px 10px", background: "rgba(168,85,247,.08)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 8 }}>
              <FiFilter size={11} color="#a855f7" />
              <span style={{ color: "#a855f7", fontSize: 12, fontWeight: 600 }}>Zone {analystZone} — your assigned zone</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {FILTER_FIELDS.map(({ key, label, options }) => (
              <div key={key}>
                <div style={{ color: "var(--text-muted,#64748b)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5 }}>{label}</div>
                <select value={filters[key] || "All"} onChange={e => onChange({ ...filters, [key]: e.target.value })}
                  className="form-select" style={{ fontSize: 12, padding: "6px 10px" }}>
                  {options.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
            <button onClick={() => { onChange({ zone: analystZone || "All", status: "All", severity: "All", period: "All" }); setOpen(false); }}
              style={{ ...btnStyle, fontSize: 12 }}>Reset</button>
            <button onClick={() => setOpen(false)}
              style={{ ...btnStyle, background: "rgba(168,85,247,.2)", color: "#a855f7", border: "1px solid #a855f7", fontSize: 12 }}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Date Range Picker ─────────────────────────────────────────────────────────
export function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(value || { from: "", to: "" });

  const PRESETS = [
    { label: "Today",      days: 0  },
    { label: "Last 7 days",days: 7  },
    { label: "Last 30 days",days: 30 },
    { label: "Last 90 days",days: 90 },
  ];

  const applyPreset = (days) => {
    const to   = new Date();
    const from = new Date(); from.setDate(from.getDate() - days);
    const fmt  = d => d.toISOString().slice(0, 10);
    const v    = days === 0 ? { from: fmt(to), to: fmt(to) } : { from: fmt(from), to: fmt(to) };
    setLocal(v); onChange(v); setOpen(false);
  };

  const apply = () => { onChange(local); setOpen(false); };
  const label = value?.from ? `${value.from} → ${value.to || "…"}` : "Date Range";

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 7,
        background: value?.from ? "rgba(59,130,246,.12)" : "rgba(255,255,255,.05)",
        border: `1px solid ${value?.from ? "#3b82f6" : "var(--border-color,#1a3356)"}`,
        borderRadius: 8, padding: "7px 12px", cursor: "pointer",
        color: value?.from ? "#60a5fa" : "var(--text-muted,#94a3b8)", fontSize: 13, fontWeight: 600,
        whiteSpace: "nowrap",
      }}>
        <FiCalendar size={13} /> {label} <FiChevronDown size={12} />
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 400,
          background: "var(--dropdown-bg,#0d1f3c)", border: "1px solid var(--border-color,#1a3356)",
          borderRadius: 14, padding: 16, minWidth: 280, boxShadow: "0 16px 40px rgba(0,0,0,.4)",
        }}>
          <div style={{ color: "var(--text-strong,#f1f5f9)", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Select Date Range</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
            {PRESETS.map(p => (
              <button key={p.label} onClick={() => applyPreset(p.days)} style={{
                ...btnStyle, fontSize: 11, padding: "4px 10px",
              }}>{p.label}</button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            {["from", "to"].map(k => (
              <div key={k}>
                <div style={{ color: "var(--text-muted)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 5 }}>{k === "from" ? "From" : "To"}</div>
                <input type="date" value={local[k]} onChange={e => setLocal(l => ({ ...l, [k]: e.target.value }))}
                  className="form-input" style={{ fontSize: 12, padding: "6px 10px" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button onClick={() => { setLocal({ from: "", to: "" }); onChange({ from: "", to: "" }); setOpen(false); }} style={{ ...btnStyle, fontSize: 12 }}>Clear</button>
            <button onClick={apply} style={{ ...btnStyle, background: "rgba(59,130,246,.2)", color: "#60a5fa", border: "1px solid #3b82f6", fontSize: 12 }}>Apply</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Drill-Down Analytics ──────────────────────────────────────────────────────
const DRILL_DATA = {
  NR:  { wagons: 312, onTime: 300, delayed: 7,  maint: 5, routes: ["DEL–LKO", "DEL–AMB", "LKO–BSB"],    topAlert: "GPS Signal Lost"  },
  SR:  { wagons: 198, onTime: 188, delayed: 6,  maint: 4, routes: ["MAS–BLR", "MAS–HYD", "BLR–CBE"],    topAlert: "Route Deviation"  },
  ER:  { wagons: 224, onTime: 212, delayed: 8,  maint: 4, routes: ["HWH–BBS", "HWH–RNC", "BBS–VSKP"],   topAlert: "Brake Warning"     },
  WR:  { wagons: 178, onTime: 166, delayed: 8,  maint: 4, routes: ["MMCT–ADI", "ADI–RJT", "MMCT–BRC"],  topAlert: "Cargo Alert"       },
  NER: { wagons: 156, onTime: 149, delayed: 5,  maint: 2, routes: ["GHY–DBRG", "GHY–KYQ", "DBRG–SCL"], topAlert: "GPS Signal Lost"  },
  NWR: { wagons: 143, onTime: 136, delayed: 4,  maint: 3, routes: ["JP–AII", "JP–BKN", "AII–ADI"],      topAlert: "Speed Exceeded"   },
  SER: { wagons: 127, onTime: 122, delayed: 4,  maint: 1, routes: ["KGP–VSKP", "KGP–BBS", "VSKP–BBS"], topAlert: "Route Deviation"  },
  SWR: { wagons: 100, onTime:  97, delayed: 2,  maint: 1, routes: ["SBC–MYS", "SBC–UBL", "MYS–UBL"],   topAlert: "Cargo Alert"       },
};

export function DrillDownAnalytics() {
  const { analyst } = useAuth();
  const analystZone = analyst?.zone;
  const [selected] = useState(analystZone || null);
  const d = selected ? DRILL_DATA[selected] : null;

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
          <FiChevronRight size={16} color="#a855f7" /> Drill-Down Analytics
        </div>
      </div>

      {/* Zone is locked — just show the assigned zone as a static badge */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <span style={{
          padding: "8px 18px", borderRadius: 10,
          border: "2px solid #a855f7", background: "rgba(168,85,247,.15)",
          color: "#a855f7", fontWeight: 700, fontSize: 13,
        }}>Zone {analystZone}</span>
      </div>

      {!selected && (
        <div style={{ color: "var(--text-muted,#64748b)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
          No zone data available
        </div>
      )}

      {d && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr) 1fr", gap: 14, animation: "fadeIn .2s ease" }}>
          {/* Stats */}
          <div style={{ gridColumn: "1 / 3", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[
              { label: "Total Wagons", val: d.wagons,  color: "#3b82f6" },
              { label: "On-Time",      val: d.onTime,  color: "#22c55e" },
              { label: "Delayed",      val: d.delayed, color: "#f59e0b" },
              { label: "Maintenance",  val: d.maint,   color: "#ef4444" },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--surface-alt,#071628)", border: "1px solid var(--border-color,#1a3356)", borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
                <div style={{ color: s.color, fontWeight: 800, fontSize: 22 }}>{s.val}</div>
                <div style={{ color: "var(--text-muted,#64748b)", fontSize: 11, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Routes */}
          <div style={{ background: "var(--surface-alt,#071628)", border: "1px solid var(--border-color,#1a3356)", borderRadius: 10, padding: 14 }}>
            <div style={{ color: "var(--text-strong,#f1f5f9)", fontWeight: 700, fontSize: 12, marginBottom: 10 }}>Top Routes</div>
            {d.routes.map(r => (
              <div key={r} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                <span style={{ color: "var(--text,#cbd5e1)", fontSize: 12 }}>{r}</span>
              </div>
            ))}
          </div>
          {/* Top alert */}
          <div style={{ background: "rgba(239,68,68,.07)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 10, padding: 14 }}>
            <div style={{ color: "#ef4444", fontWeight: 700, fontSize: 12, marginBottom: 8 }}><FiAlertTriangle size={12} style={{ marginRight: 4 }} />Top Alert Type</div>
            <div style={{ color: "var(--text-strong,#f1f5f9)", fontSize: 14, fontWeight: 700 }}>{d.topAlert}</div>
            <div style={{ color: "var(--text-muted,#64748b)", fontSize: 11, marginTop: 4 }}>Zone {selected} — last 24 hours</div>
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

// ── Trend Comparison ──────────────────────────────────────────────────────────
const cmpData = {
  "This Week":  [
    { day: "Mon", cur: 820,  prev: 760  }, { day: "Tue", cur: 940,  prev: 810  },
    { day: "Wed", cur: 870,  prev: 840  }, { day: "Thu", cur: 1020, prev: 890  },
    { day: "Fri", cur: 980,  prev: 920  }, { day: "Sat", cur: 1089, prev: 970  },
    { day: "Sun", cur: 950,  prev: 900  },
  ],
  "This Month": [
    { day: "W1",  cur: 5820, prev: 5200 }, { day: "W2",  cur: 6400, prev: 5800 },
    { day: "W3",  cur: 6100, prev: 5900 }, { day: "W4",  cur: 7250, prev: 6400 },
  ],
};

export function TrendComparison() {
  const [period, setPeriod] = useState("This Week");
  const data = cmpData[period];

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
          <FiTrendingUp size={16} color="#3b82f6" /> Trend Comparison
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {Object.keys(cmpData).map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              ...btnStyle, fontSize: 12,
              background: period === p ? "rgba(59,130,246,.18)" : undefined,
              color: period === p ? "#60a5fa" : undefined,
              border: period === p ? "1px solid #3b82f6" : undefined,
            }}>{p}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color,#1a3356)" />
          <XAxis dataKey="day" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
          <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
          <Tooltip {...TT} />
          <Legend wrapperStyle={{ color: "var(--text-muted,#94a3b8)", fontSize: 12 }} />
          <Line type="monotone" dataKey="cur"  stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Current Period" />
          <Line type="monotone" dataKey="prev" stroke="#64748b" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Previous Period" />
          <ReferenceLine y={0} stroke="var(--border-color,#1a3356)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Predictive Analytics ──────────────────────────────────────────────────────
const predictData = [
  { month: "Aug", actual: null, forecast: 4520, upper: 4680, lower: 4360 },
  { month: "Sep", actual: null, forecast: 4710, upper: 4900, lower: 4520 },
  { month: "Oct", actual: null, forecast: 4890, upper: 5100, lower: 4680 },
  { month: "Nov", actual: null, forecast: 5020, upper: 5250, lower: 4790 },
  { month: "Dec", actual: null, forecast: 5200, upper: 5460, lower: 4940 },
];
const historicData = [
  { month: "Feb", actual: 3450, forecast: null, upper: null, lower: null },
  { month: "Mar", actual: 3700, forecast: null, upper: null, lower: null },
  { month: "Apr", actual: 3550, forecast: null, upper: null, lower: null },
  { month: "May", actual: 3900, forecast: null, upper: null, lower: null },
  { month: "Jun", actual: 4100, forecast: null, upper: null, lower: null },
  { month: "Jul", actual: 4300, forecast: null, upper: null, lower: null },
  ...predictData,
];

export function PredictiveAnalytics() {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
          <FiCpu size={16} color="#22c55e" /> Predictive Analytics — Wagon Deployment Forecast
        </div>
        <span style={{ background: "rgba(34,197,94,.12)", color: "#22c55e", border: "1px solid rgba(34,197,94,.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>AI Model</span>
      </div>
      <div style={{ color: "var(--text-muted,#64748b)", fontSize: 12, marginBottom: 14 }}>
        Forecasted wagon deployments for Aug–Dec 2025 based on historical trends. Shaded area = confidence band.
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={historicData}>
          <defs>
            <linearGradient id="gForecast" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color,#1a3356)" />
          <XAxis dataKey="month" stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} />
          <YAxis stroke="#4a6fa5" tick={{ fill: "#4a6fa5", fontSize: 11 }} domain={[3000, 5600]} />
          <Tooltip {...TT} />
          <Legend wrapperStyle={{ color: "var(--text-muted,#94a3b8)", fontSize: 12 }} />
          <Area type="monotone" dataKey="actual"   stroke="#3b82f6" fill="none"              strokeWidth={2.5} name="Actual" connectNulls={false} />
          <Area type="monotone" dataKey="forecast" stroke="#22c55e" fill="url(#gForecast)"   strokeWidth={2}   strokeDasharray="6 3" name="Forecast" connectNulls={false} />
          <Area type="monotone" dataKey="upper"    stroke="#22c55e" fill="none"              strokeWidth={0}   strokeDasharray="3 3" name="Upper CI" dot={false} />
          <Area type="monotone" dataKey="lower"    stroke="#22c55e" fill="none"              strokeWidth={0}   strokeDasharray="3 3" name="Lower CI" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 14 }}>
        {[
          { label: "Projected Aug Deployments", val: "4,520", color: "#22c55e", sub: "+5.1% vs Jul" },
          { label: "Forecast Accuracy",         val: "94.2%", color: "#3b82f6", sub: "Based on 6-month training" },
          { label: "Predicted Dec Peak",        val: "5,200", color: "#a855f7", sub: "Seasonal high" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface-alt,#071628)", border: "1px solid var(--border-color,#1a3356)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 20, marginBottom: 3 }}>{s.val}</div>
            <div style={{ color: "var(--text-strong,#f1f5f9)", fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{s.label}</div>
            <div style={{ color: "var(--text-muted,#64748b)", fontSize: 11 }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Insights ───────────────────────────────────────────────────────────────
const AI_INSIGHTS = [
  { icon: "🔴", title: "Critical Pattern Detected",    desc: "NR Zone GPS failures spiked 40% on Thursday afternoons over 4 weeks. Likely cellular tower maintenance window.", action: "Investigate NR Tower Schedule",  priority: "critical" },
  { icon: "🟡", title: "Delay Correlation Found",      desc: "Wagons on DEL–LKO route delayed 18 min more on Fridays. Cross-reference with freight priority scheduling.", action: "Review Route Priority",          priority: "warning"  },
  { icon: "🟢", title: "Efficiency Opportunity",       desc: "SR Zone fleet utilisation improved 6.2% after shift time adjustment. Recommend applying to WR Zone.", action: "Apply to WR Zone",              priority: "info"     },
  { icon: "🟣", title: "Maintenance Prediction",       desc: "12 wagons in ER Zone show bearing degradation patterns. Preventive maintenance recommended before Sept 1.", action: "Schedule ER Maintenance",      priority: "predict"  },
];

const priorityStyle = {
  critical: { border: "rgba(239,68,68,.25)",  bg: "rgba(239,68,68,.07)",  btn: "rgba(239,68,68,.15)",  btnC: "#ef4444" },
  warning:  { border: "rgba(245,158,11,.25)", bg: "rgba(245,158,11,.07)", btn: "rgba(245,158,11,.15)", btnC: "#f59e0b" },
  info:     { border: "rgba(34,197,94,.25)",  bg: "rgba(34,197,94,.07)",  btn: "rgba(34,197,94,.15)",  btnC: "#22c55e" },
  predict:  { border: "rgba(168,85,247,.25)", bg: "rgba(168,85,247,.07)", btn: "rgba(168,85,247,.15)", btnC: "#a855f7" },
};

export function AIInsights() {
  const [dismissed, setDismissed] = useState(new Set());
  const [refresh, setRefresh] = useState(false);

  const visible = AI_INSIGHTS.filter((_,i) => !dismissed.has(i));

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
          🤖 AI Insights
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted,#64748b)", fontSize: 11 }}>{visible.length} active insight{visible.length !== 1 ? "s" : ""}</span>
          <button onClick={() => { setRefresh(true); setTimeout(() => { setDismissed(new Set()); setRefresh(false); }, 800); }}
            style={{ ...btnStyle, fontSize: 12 }}>
            <FiRefreshCw size={11} style={refresh ? { animation: "spin .7s linear infinite" } : {}} /> Refresh
          </button>
        </div>
      </div>
      {visible.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted,#64748b)", padding: "20px 0", fontSize: 13 }}>✓ All insights reviewed</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {AI_INSIGHTS.map((ins, i) => {
          if (dismissed.has(i)) return null;
          const s = priorityStyle[ins.priority];
          return (
            <div key={i} style={{ border: `1px solid ${s.border}`, background: s.bg, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{ins.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: "var(--text-strong,#f1f5f9)", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{ins.title}</div>
                <div style={{ color: "var(--text,#cbd5e1)", fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>{ins.desc}</div>
                <button style={{ background: s.btn, border: `1px solid ${s.btnC}40`, color: s.btnC, borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                  {ins.action}
                </button>
              </div>
              <button onClick={() => setDismissed(p => new Set([...p, i]))}
                style={{ background: "none", border: "none", color: "var(--text-muted,#64748b)", cursor: "pointer", flexShrink: 0, padding: 2 }}>
                <FiX size={13} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Report Generation Panel ───────────────────────────────────────────────────
const RPT_TYPES = [
  { key: "performance", label: "Performance Summary", icon: "📊", desc: "KPIs, on-time rates, delay analysis",     defKey: "monthly_performance" },
  { key: "zone",        label: "Zone Comparison",     icon: "🗺️", desc: "Cross-zone metrics and rankings",         defKey: "zone_performance"   },
  { key: "alerts",      label: "Alert Analysis",      icon: "⚠️", desc: "Alert distribution and resolution stats", defKey: "alert_summary"      },
  { key: "predictive",  label: "Predictive Report",   icon: "🔮", desc: "AI forecast and trend projections",       defKey: "movement_trends"    },
];

export function ReportGenerationPanel() {
  const [type,   setType]   = useState("performance");
  const [format, setFormat] = useState("PDF");
  const [period, setPeriod] = useState("This Week");
  const [gen,    setGen]    = useState(false);
  const [done,   setDone]   = useState(false);
  const [err,    setErr]    = useState("");

  const generate = () => {
    setGen(true); setDone(false); setErr("");
    setTimeout(() => {
      try {
        const selected = RPT_TYPES.find(r => r.key === type);
        const def = REPORT_DEFINITIONS.find(d => d.key === selected?.defKey);
        if (!def) { setErr("Report definition not found."); setGen(false); return; }
        if (format === "PDF")   exportReportPDF(def, "", "");
        if (format === "Excel") exportReportExcel(def, "", "");
        if (format === "CSV")   exportReportCSV(def, "", "");
        setDone(true);
        setTimeout(() => setDone(false), 3000);
      } catch(e) {
        setErr("Export failed. Please try again.");
      }
      setGen(false);
    }, 800);
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <FiFileText size={16} color="#3b82f6" /> Report Generation Panel
      </div>

      {done && (
        <div style={{ background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.3)", borderRadius:10, padding:"10px 14px", marginBottom:14, color:"#22c55e", fontSize:13, fontWeight:600 }}>
          ✓ Report generated and downloaded
        </div>
      )}
      {err && (
        <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, padding:"10px 14px", marginBottom:14, color:"#ef4444", fontSize:13 }}>
          {err}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 16 }}>
        {/* Report type */}
        <div>
          <div style={{ color: "var(--text-muted,#64748b)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Report Type</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {RPT_TYPES.map(r => (
              <button key={r.key} onClick={() => setType(r.key)} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left",
                border: `1px solid ${type === r.key ? "var(--accent,#3b82f6)" : "var(--border-color,#1a3356)"}`,
                background: type === r.key ? "rgba(59,130,246,.12)" : "transparent",
                transition: "all .12s",
              }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{r.icon}</span>
                <div>
                  <div style={{ color: type === r.key ? "var(--accent,#60a5fa)" : "var(--text-strong,#f1f5f9)", fontWeight: 600, fontSize: 13 }}>{r.label}</div>
                  <div style={{ color: "var(--text-muted,#64748b)", fontSize: 11 }}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ color: "var(--text-muted,#64748b)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Period</div>
            <select value={period} onChange={e => setPeriod(e.target.value)} className="form-select">
              {["Today", "This Week", "This Month", "Last Quarter", "Custom"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <div style={{ color: "var(--text-muted,#64748b)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Zone</div>
            <ReportZonePicker />
          </div>
          <div>
            <div style={{ color: "var(--text-muted,#64748b)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 8 }}>Format</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["PDF", "Excel", "CSV"].map(f => (
                <button key={f} onClick={() => setFormat(f)} style={{
                  padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  border: `1px solid ${format === f ? "var(--accent,#3b82f6)" : "var(--border-color,#1a3356)"}`,
                  background: format === f ? "rgba(59,130,246,.15)" : "transparent",
                  color: format === f ? "var(--accent,#60a5fa)" : "var(--text-muted,#94a3b8)",
                }}>{f}</button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={gen} style={{
            marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            padding: "12px 20px", borderRadius: 10, border: "none",
            background: gen ? "rgba(59,130,246,.3)" : "linear-gradient(135deg,#2563eb,#3b82f6)",
            color: "#fff", fontSize: 14, fontWeight: 700, cursor: gen ? "not-allowed" : "pointer",
          }}>
            {gen
              ? <><span style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> Generating…</>
              : <><FiDownload size={14} /> Generate & Download</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Report zone picker — locked to analyst's zone ─────────────────────────────
function ReportZonePicker() {
  const { analyst } = useAuth();
  const analystZone = analyst?.zone;
  // Analyst can only select their own zone
  return (
    <span style={{
      padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      border: "1px solid #a855f7", background: "rgba(168,85,247,.15)", color: "#a855f7",
    }}>Zone {analystZone}</span>
  );
}

// ── Toolbar: filters + date range together ────────────────────────────────────
export function AnalyticsToolbar({ filters, onFiltersChange, dateRange, onDateRangeChange }) {
  const { analyst } = useAuth();
  const analystZone = analyst?.zone;

  // Always lock the zone filter to the analyst's zone
  const handleFiltersChange = (next) => {
    onFiltersChange({ ...next, zone: analystZone || "All" });
  };

  return (
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
      {/* Zone locked badge */}
      {analystZone && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.35)",
          borderRadius: 8, padding: "7px 12px",
        }}>
          <span style={{ color: "#a855f7", fontSize: 12, fontWeight: 700 }}>📍 Zone {analystZone}</span>
        </div>
      )}
      <AdvancedFilters filters={filters} onChange={handleFiltersChange} />
      <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
    </div>
  );
}
