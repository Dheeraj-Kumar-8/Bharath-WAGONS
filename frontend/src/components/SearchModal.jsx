import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiX, FiTruck, FiMapPin, FiAlertTriangle,
  FiActivity, FiBox, FiArrowRight, FiUsers,
  FiUser, FiFileText, FiChevronDown, FiClock, FiBarChart2,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import {
  ALL_WAGONS, ZONE_ALERTS, ZONE_STATS, ZONE_CITIES,
} from "../data/zoneData";
import { ANALYTICS_CREDENTIALS } from "../context/AuthContext";

// ── Type config ───────────────────────────────────────────────────────────────
const TYPE_CFG = {
  Wagon:    { icon: FiTruck,         color: "#3b82f6", bg: "rgba(59,130,246,.12)"  },
  Alert:    { icon: FiAlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,.12)"   },
  Hub:      { icon: FiMapPin,        color: "#8b5cf6", bg: "rgba(139,92,246,.12)"  },
  Stats:    { icon: FiActivity,      color: "#22c55e", bg: "rgba(34,197,94,.12)"   },
  Operator: { icon: FiUser,          color: "#f97316", bg: "rgba(249,115,22,.12)"  },
  Analyst:  { icon: FiBarChart2,     color: "#a855f7", bg: "rgba(168,85,247,.12)"  },
  Report:   { icon: FiFileText,      color: "#f59e0b", bg: "rgba(245,158,11,.12)"  },
  Zone:     { icon: FiUsers,         color: "#06b6d4", bg: "rgba(6,182,212,.12)"   },
  Page:     { icon: FiBox,           color: "#64748b", bg: "rgba(100,116,139,.12)" },
};

const STATUS_COLOR = {
  "On Time": "#22c55e", Delayed: "#f59e0b", Maintenance: "#ef4444",
  Active: "#22c55e", Inactive: "#ef4444", Pending: "#f59e0b",
  Resolved: "#22c55e", Critical: "#ef4444", High: "#f97316",
  Medium: "#f59e0b", Low: "#22c55e", Ready: "#3b82f6",
};

const SORT_OPTS = [
  { value: "relevance", label: "Relevance" },
  { value: "type",      label: "Type"      },
  { value: "status",    label: "Status"    },
];

const TYPES = ["All", "Wagon", "Alert", "Hub", "Operator", "Analyst", "Report", "Zone", "Page"];
const PAGE_SIZE = 15;
const HISTORY_KEY = "adm_search_history";
const MAX_HISTORY = 10;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
}

// ── Index builder ─────────────────────────────────────────────────────────────
function buildAdminIndex(zone, operators) {
  const items = [];

  // Wagons
  ALL_WAGONS.filter(w => w.zone === zone).forEach(w => {
    items.push({
      type: "Wagon", id: w.id, title: w.id,
      sub: `${w.location} → ${w.dest}`,
      meta: `${w.type} · ${w.speed} km/h · ${w.status}`,
      status: w.status,
      keywords: `${w.id} ${w.location} ${w.dest} ${w.type} ${w.status} ${w.zone} wagon`.toLowerCase(),
      path: "/wagons",
      detail: { "Wagon ID": w.id, Type: w.type, Location: w.location, Destination: w.dest, Speed: `${w.speed} km/h`, Status: w.status, Capacity: w.capacity, Zone: w.zone },
    });
  });

  // Alerts
  (ZONE_ALERTS[zone] || []).forEach(a => {
    items.push({
      type: "Alert", id: `${a.wagon}-${a.type}`, title: a.type,
      sub: `${a.wagon} · ${a.time}`,
      meta: `${a.priority} · ${a.status}`,
      status: a.priority,
      keywords: `${a.type} ${a.wagon} ${a.priority} ${a.status} alert zone ${zone}`.toLowerCase(),
      path: "/ai-alerts",
      detail: { "Alert Type": a.type, Wagon: a.wagon, Priority: a.priority, Time: a.time, Status: a.status, Zone: zone },
    });
  });

  // Hubs
  (ZONE_CITIES[zone] || []).forEach(c => {
    items.push({
      type: "Hub", id: c.name, title: c.name,
      sub: `Zone ${zone} · Hub Station`,
      meta: `${c.active} active · ${c.moving} moving · ${c.delayed} delayed`,
      status: "Active",
      keywords: `${c.name} zone ${zone} hub station city active moving delayed`.toLowerCase(),
      path: "/live-tracking",
      detail: { City: c.name, Zone: zone, "Active Routes": c.active, "Moving Wagons": c.moving, "Delayed Routes": c.delayed, "Offline GPS": c.offline },
    });
  });

  // Zone stats — ALL zones visible to admin
  Object.entries(ZONE_STATS).forEach(([z, s]) => {
    items.push({
      type: "Zone", id: `zone-${z}`, title: `Zone ${z} Overview`,
      sub: `${s.total} total wagons · ${s.stations} stations`,
      meta: `${s.active} active · ${s.delayed} delayed · ${s.maint} maintenance`,
      status: "Active",
      keywords: `zone ${z} stats overview wagons stations alerts cargo`.toLowerCase(),
      path: "/admin",
      detail: { Zone: z, "Total Wagons": s.total, Active: s.active, Delayed: s.delayed, Maintenance: s.maint, Stations: s.stations, "GPS Active": s.gps, "AI Alerts": s.alerts, "Cargo Loads": s.cargo },
    });
  });

  // Operators
  (operators || []).forEach(op => {
    items.push({
      type: "Operator", id: op.id, title: op.name,
      sub: `${op.id} · Zone ${op.zone} · ${op.designation || "Operator"}`,
      meta: `${op.status} · ${op.shift || ""}`,
      status: op.status,
      keywords: `${op.name} ${op.id} ${op.email} ${op.zone} ${op.department} ${op.designation} operator`.toLowerCase(),
      path: "/users-roles",
      detail: { "Operator ID": op.id, Name: op.name, Email: op.email, Zone: op.zone, Region: op.region, Department: op.department, Designation: op.designation, Shift: op.shift, Status: op.status, "Last Login": op.lastLogin },
    });
  });

  // Analysts
  ANALYTICS_CREDENTIALS.forEach(an => {
    items.push({
      type: "Analyst", id: an.id, title: an.name,
      sub: `${an.id} · Zone ${an.zone} · ${an.region}`,
      meta: `Analyst · Zone ${an.zone}`,
      status: "Active",
      keywords: `${an.name} ${an.id} ${an.email} ${an.zone} ${an.region} analyst analytics`.toLowerCase(),
      path: "/users-roles",
      detail: { "Analyst ID": an.id, Name: an.name, Email: an.email, Zone: an.zone, Region: an.region, Role: "Analyst", Status: "Active" },
    });
  });

  // Reports (static set matching admin reports page)
  [
    { id: "RPT-NR-W", title: "NR Weekly Operations",   period: "Week 26 · 2025", type: "Weekly",  zone: "NR",  size: "4.8 MB" },
    { id: "RPT-SR-W", title: "SR Weekly Operations",   period: "Week 26 · 2025", type: "Weekly",  zone: "SR",  size: "3.9 MB" },
    { id: "RPT-M-ALL", title: "Monthly Fleet Report",  period: "Jun 2025",       type: "Monthly", zone: "All", size: "18.2 MB" },
    { id: "RPT-AI-01", title: "AI Alert Analysis",     period: "Jun 2025",       type: "Monthly", zone: "All", size: "6.5 MB" },
    { id: "RPT-Q2",   title: "Q2 Performance Summary", period: "Q2 2025",        type: "Quarterly",zone:"All", size: "22.1 MB" },
    { id: "RPT-MNT",  title: "Maintenance Overview",   period: "Jun 2025",       type: "Monthly", zone: "All", size: "8.2 MB" },
  ].forEach(r => {
    items.push({
      type: "Report", id: r.id, title: `${r.id} — ${r.title}`,
      sub: `${r.period} · ${r.type}`,
      meta: `Zone ${r.zone} · ${r.size}`,
      status: "Ready",
      keywords: `${r.id} ${r.title} ${r.period} ${r.type} ${r.zone} report`.toLowerCase(),
      path: "/reports",
      detail: { "Report ID": r.id, Title: r.title, Period: r.period, Type: r.type, Zone: r.zone, "File Size": r.size, Status: "Ready" },
    });
  });

  // Pages
  [
    { title: "Dashboard",          sub: "Zone overview & KPIs",             path: "/admin"               },
    { title: "Live Tracking",      sub: "Real-time GPS wagon tracking",      path: "/live-tracking"       },
    { title: "Wagons",             sub: "Manage & monitor fleet",            path: "/wagons"              },
    { title: "AI Alerts",          sub: "Active alerts & incidents",         path: "/ai-alerts"           },
    { title: "Cargo Monitoring",   sub: "Track cargo loads",                 path: "/cargo-monitoring"    },
    { title: "Maintenance",        sub: "Schedule & track maintenance",      path: "/maintenance"         },
    { title: "Analytics",          sub: "Charts & performance data",         path: "/analytics"           },
    { title: "Reports",            sub: "Generate & export reports",         path: "/reports"             },
    { title: "Users & Roles",      sub: "Manage operators & access",         path: "/users-roles"         },
    { title: "Settings",           sub: "System preferences & security",     path: "/settings"            },
    { title: "Predictive Insights",sub: "AI-powered forecasts",              path: "/predictive-insights" },
    { title: "Wagon Health",       sub: "Fleet health monitoring",           path: "/wagon-health"        },
    { title: "Stations",           sub: "Station overview & management",     path: "/stations"            },
  ].forEach(p => {
    items.push({
      type: "Page", id: p.path, title: p.title,
      sub: p.sub, meta: "Admin Page", status: "Active",
      keywords: `${p.title} ${p.sub} admin page`.toLowerCase(),
      path: p.path, detail: { Page: p.title, Description: p.sub, Path: p.path },
    });
  });

  return items;
}

function scoreItem(item, raw, tokens) {
  let score = 0;
  if (item.id.toLowerCase() === raw)           score += 100;
  if (item.title.toLowerCase().includes(raw))  score += 50;
  if (tokens.every(t => item.keywords.includes(t))) score += 30;
  if (tokens.some(t  => item.keywords.includes(t))) score += 10;
  if (item.keywords.startsWith(raw))           score += 20;
  return score;
}

// ── Detail panel ──────────────────────────────────────────────────────────────
function DetailPane({ item, onNavigate }) {
  const cfg = TYPE_CFG[item.type] || TYPE_CFG.Page;
  const Icon = cfg.icon;
  return (
    <div style={{ padding: "18px 18px 14px", display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14, flexShrink: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon color={cfg.color} size={18} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
          <div style={{ color: "#4a6fa5", fontSize: 11, marginTop: 1 }}>{item.sub}</div>
        </div>
        <span style={{ marginLeft: "auto", flexShrink: 0, padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, background: cfg.bg, color: cfg.color }}>{item.type}</span>
      </div>
      <div style={{ flex: 1, overflowY: "auto", background: "#071628", borderRadius: 10, border: "1px solid #1a3356" }}>
        {item.detail ? Object.entries(item.detail).map(([k, v], i, arr) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "9px 13px", borderBottom: i < arr.length - 1 ? "1px solid rgba(26,51,86,.5)" : "none" }}>
            <span style={{ color: "#64748b", fontSize: 11, flexShrink: 0 }}>{k}</span>
            <span style={{ color: STATUS_COLOR[v] || "#f1f5f9", fontWeight: 600, fontSize: 11, textAlign: "right", wordBreak: "break-word" }}>{v}</span>
          </div>
        )) : <div style={{ padding: 14, color: "#4a6fa5", fontSize: 12 }}>{item.meta}</div>}
      </div>
      <button onClick={() => onNavigate(item)} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 12, flexShrink: 0 }}>
        Open {item.type} <FiArrowRight size={13} />
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const SearchModal = ({ onClose }) => {
  const navigate      = useNavigate();
  const { admin, operators } = useAuth();
  const zone          = admin?.zone || "NR";

  const index = useMemo(() => buildAdminIndex(zone, operators), [zone, operators]);

  const [query,       setQuery]       = useState("");
  const [filter,      setFilter]      = useState("All");
  const [sort,        setSort]        = useState("relevance");
  const [selected,    setSelected]    = useState(null);
  const [showSort,    setShowSort]    = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSug,     setShowSug]     = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const [page,        setPage]        = useState(1);
  const [history,     setHistory]     = useState(loadHistory);

  const inputRef  = useRef(null);
  const sortRef   = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 20); }, []);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    const h = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const allResults = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return [];
    const tokens = raw.split(/\s+/);
    let res = index.map(item => {
      if (filter !== "All" && item.type !== filter) return null;
      const sc = scoreItem(item, raw, tokens);
      return sc > 0 ? { ...item, score: sc } : null;
    }).filter(Boolean);
    if (sort === "relevance") res.sort((a, b) => b.score - a.score);
    else if (sort === "type") res.sort((a, b) => a.type.localeCompare(b.type));
    else if (sort === "status") res.sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    return res;
  }, [query, filter, sort, index]);

  const totalPages = Math.ceil(allResults.length / PAGE_SIZE);
  const results = allResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); setSelected(null); }, [query, filter, sort]);

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    const raw = query.toLowerCase();
    const sugs = index.filter(i => i.keywords.includes(raw)).slice(0, 6).map(i => i.title);
    setSuggestions(sugs);
  }, [query, index]);

  const pushHistory = useCallback((term) => {
    if (!term.trim()) return;
    setHistory(prev => {
      const next = [term, ...prev.filter(h => h !== term)].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);
  const clearHistory = () => { setHistory([]); saveHistory([]); };
  const removeHistory = (term) => {
    setHistory(prev => { const next = prev.filter(h => h !== term); saveHistory(next); return next; });
  };

  const handleNavigate = useCallback((item) => {
    pushHistory(query.trim() || item.title);
    navigate(item.path);
    onClose();
  }, [pushHistory, query, navigate, onClose]);

  const handleKeyDown = useCallback(e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); setShowSug(false); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, -1)); }
    else if (e.key === "Enter") {
      e.preventDefault(); setShowSug(false);
      if (activeIdx >= 0 && results[activeIdx]) handleNavigate(results[activeIdx]);
      else if (results.length === 1) handleNavigate(results[0]);
    }
  }, [results, activeIdx, handleNavigate]);

  useEffect(() => {
    if (activeIdx >= 0 && resultsRef.current) {
      resultsRef.current.children[activeIdx]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  const typeCounts = useMemo(() => {
    const all = query.trim() ? (() => {
      const raw = query.toLowerCase(); const tokens = raw.split(/\s+/);
      return index.map(item => { const sc = scoreItem(item, raw, tokens); return sc > 0 ? item : null; }).filter(Boolean);
    })() : [];
    return TYPES.reduce((acc, t) => {
      acc[t] = t === "All"
        ? (query.trim() ? all.length : index.length)
        : (query.trim() ? all.filter(r => r.type === t).length : index.filter(i => i.type === t).length);
      return acc;
    }, {});
  }, [query, index]);

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.72)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", paddingTop: "72px", alignItems: "flex-start" }}>
      <div onClick={e => e.stopPropagation()}
        style={{ width: "92vw", maxWidth: 920, background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 20, overflow: "hidden", boxShadow: "0 28px 90px rgba(0,0,0,.75)", display: "flex", flexDirection: "column", maxHeight: "80vh" }}>

        {/* Search bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid #1a3356", position: "relative", flexShrink: 0 }}>
          <FiSearch color="#3b82f6" size={17} />
          <input ref={inputRef} value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); setActiveIdx(-1); setShowSug(true); }}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowSug(true)}
            placeholder={`Search wagons, alerts, operators, analysts, reports, zones in Zone ${zone}…`}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: 15 }} />
          {query && (
            <button onClick={() => { setQuery(""); setSelected(null); setSuggestions([]); inputRef.current?.focus(); }}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", padding: 3 }}><FiX size={15} /></button>
          )}
          <div ref={sortRef} style={{ position: "relative" }}>
            <button onClick={() => setShowSort(p => !p)}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(37,99,235,.1)", border: "1px solid #1a3356", borderRadius: 8, padding: "5px 10px", color: "#94a3b8", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
              {SORT_OPTS.find(o => o.value === sort)?.label} <FiChevronDown size={11} />
            </button>
            {showSort && (
              <div style={{ position: "absolute", right: 0, top: "110%", background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, overflow: "hidden", zIndex: 100, minWidth: 120, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
                {SORT_OPTS.map(o => (
                  <div key={o.value} onClick={() => { setSort(o.value); setShowSort(false); }}
                    style={{ padding: "9px 14px", color: sort === o.value ? "#3b82f6" : "#94a3b8", fontSize: 12, fontWeight: sort === o.value ? 700 : 400, cursor: "pointer", background: sort === o.value ? "rgba(37,99,235,.1)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = sort === o.value ? "rgba(37,99,235,.1)" : "transparent"}>
                    {o.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "1px solid #1a3356", borderRadius: 7, padding: "4px 9px", color: "#64748b", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>ESC</button>

          {/* Autocomplete */}
          {showSug && suggestions.length > 0 && (
            <div style={{ position: "absolute", left: 44, right: 44, top: "110%", background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, overflow: "hidden", zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
              {suggestions.map((s, i) => (
                <div key={i} onClick={() => { setQuery(s); setShowSug(false); setSuggestions([]); inputRef.current?.focus(); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", color: "#94a3b8", fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <FiSearch size={12} color="#4a6fa5" /> {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type filter pills */}
        <div style={{ display: "flex", gap: 5, padding: "9px 18px", borderBottom: "1px solid #1a3356", flexWrap: "wrap", flexShrink: 0 }}>
          {TYPES.map(t => {
            const cfg = TYPE_CFG[t];
            const count = typeCounts[t] || 0;
            const active = filter === t;
            return (
              <button key={t} onClick={() => { setFilter(t); setSelected(null); }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${active ? (cfg?.color || "#3b82f6") : "#1a3356"}`, background: active ? `${cfg?.color || "#3b82f6"}18` : "transparent", color: active ? (cfg?.color || "#3b82f6") : "#64748b", cursor: "pointer" }}>
                {t}
                <span style={{ background: active ? `${cfg?.color || "#3b82f6"}25` : "#1a3356", color: active ? (cfg?.color || "#3b82f6") : "#2a4a6e", borderRadius: 10, padding: "0 5px", fontSize: 10 }}>{count}</span>
              </button>
            );
          })}
          {query.trim() && <span style={{ marginLeft: "auto", color: "#2a4a6e", fontSize: 11, alignSelf: "center" }}>{allResults.length} result{allResults.length !== 1 ? "s" : ""}</span>}
        </div>

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <div style={{ width: selected ? "50%" : "100%", overflowY: "auto", borderRight: selected ? "1px solid #1a3356" : "none", transition: "width .2s" }}>
            {!query.trim() ? (
              <div style={{ padding: "16px 18px" }}>
                {history.length > 0 && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ color: "#4a6fa5", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Recent Searches</span>
                      <button onClick={clearHistory} style={{ background: "none", border: "none", color: "#ef4444", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Clear all</button>
                    </div>
                    {history.map((h, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2 }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,.07)"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <FiClock size={13} color="#4a6fa5" />
                        <span onClick={() => { setQuery(h); setShowSug(false); }} style={{ flex: 1, color: "#94a3b8", fontSize: 13 }}>{h}</span>
                        <button onClick={() => removeHistory(h)} style={{ background: "none", border: "none", color: "#2a4a6e", cursor: "pointer", display: "flex", padding: 2 }}><FiX size={12} /></button>
                      </div>
                    ))}
                  </>
                )}
                {history.length === 0 && (
                  <div style={{ padding: "32px 0", textAlign: "center", color: "#4a6fa5" }}>
                    <FiSearch size={28} style={{ marginBottom: 10, opacity: .3 }} />
                    <div style={{ fontSize: 13 }}>Start typing to search all admin data</div>
                    <div style={{ fontSize: 11, marginTop: 6, color: "#2a4a6e" }}>Wagons · Alerts · Operators · Analysts · Reports · Zones · Pages</div>
                  </div>
                )}
                <div style={{ marginTop: 18 }}>
                  <div style={{ color: "#4a6fa5", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Quick Access</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {Object.entries(TYPE_CFG).filter(([t]) => t !== "Stats").map(([type, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button key={type} onClick={() => { setFilter(type); setQuery(""); inputRef.current?.focus(); }}
                          style={{ background: cfg.bg, border: `1px solid ${cfg.color}28`, borderRadius: 10, padding: "10px 8px", cursor: "pointer", textAlign: "center" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color}
                          onMouseLeave={e => e.currentTarget.style.borderColor = `${cfg.color}28`}>
                          <Icon color={cfg.color} size={16} style={{ marginBottom: 4 }} />
                          <div style={{ color: "#f1f5f9", fontSize: 11, fontWeight: 700 }}>{type}</div>
                          <div style={{ color: "#64748b", fontSize: 10 }}>{index.filter(i => i.type === type).length}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div style={{ padding: "48px 20px", textAlign: "center", color: "#4a6fa5" }}>
                <FiSearch size={30} style={{ marginBottom: 12, opacity: .3 }} />
                <div style={{ fontSize: 14 }}>No results for "{query}"</div>
                <div style={{ fontSize: 12, marginTop: 6, color: "#2a4a6e" }}>Try a wagon ID, operator name, zone code, alert type, or report ID</div>
              </div>
            ) : (
              <>
                <div ref={resultsRef}>
                  {results.map((item, i) => {
                    const cfg = TYPE_CFG[item.type] || TYPE_CFG.Page;
                    const Icon = cfg.icon;
                    const isActive = i === activeIdx;
                    const isSelected = selected?.id === item.id && selected?.type === item.type;
                    return (
                      <div key={`${item.type}-${item.id}-${i}`}
                        onClick={() => setSelected(isSelected ? null : item)}
                        onDoubleClick={() => handleNavigate(item)}
                        style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 18px", cursor: "pointer", borderBottom: "1px solid rgba(26,51,86,.35)", background: isSelected ? "rgba(37,99,235,.14)" : isActive ? "rgba(37,99,235,.07)" : "transparent", borderLeft: isSelected ? "3px solid #3b82f6" : "3px solid transparent", transition: "background .1s" }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(37,99,235,.07)"; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon color={cfg.color} size={14} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 12.5 }}>{item.title}</span>
                            <span style={{ fontSize: 9, color: cfg.color, background: cfg.bg, padding: "1px 6px", borderRadius: 12, fontWeight: 700, flexShrink: 0 }}>{item.type}</span>
                            {item.status && <span style={{ fontSize: 10, color: STATUS_COLOR[item.status] || "#64748b", fontWeight: 600, flexShrink: 0 }}>{item.status}</span>}
                          </div>
                          <div style={{ color: "#4a6fa5", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.sub}</div>
                        </div>
                        <FiArrowRight color="#1e3a5f" size={12} style={{ flexShrink: 0 }} />
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "10px 18px", borderTop: "1px solid #1a3356" }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ background: page === 1 ? "#0a1628" : "rgba(37,99,235,.1)", border: "1px solid #1a3356", borderRadius: 7, padding: "4px 10px", color: page === 1 ? "#2a4a6e" : "#3b82f6", fontSize: 11, cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 600 }}>← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        style={{ background: p === page ? "rgba(37,99,235,.18)" : "transparent", border: `1px solid ${p === page ? "#3b82f6" : "#1a3356"}`, borderRadius: 7, padding: "4px 9px", color: p === page ? "#3b82f6" : "#64748b", fontSize: 11, cursor: "pointer", fontWeight: p === page ? 700 : 400 }}>{p}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      style={{ background: page === totalPages ? "#0a1628" : "rgba(37,99,235,.1)", border: "1px solid #1a3356", borderRadius: 7, padding: "4px 10px", color: page === totalPages ? "#2a4a6e" : "#3b82f6", fontSize: 11, cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 600 }}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>

          {selected && (
            <div style={{ width: "50%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <DetailPane item={selected} onNavigate={handleNavigate} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "7px 18px", borderTop: "1px solid #1a3356", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
          {[["↵ Enter", "Navigate"], ["↑↓", "Move"], ["Click", "Details"], ["Dbl-click", "Open"], ["ESC", "Close"]].map(([k, l]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ background: "#0a1628", border: "1px solid #1a3356", color: "#64748b", padding: "1px 6px", borderRadius: 5, fontSize: 10, fontWeight: 700 }}>{k}</span>
              <span style={{ color: "#2a4a6e", fontSize: 10 }}>{l}</span>
            </div>
          ))}
          <span style={{ marginLeft: "auto", color: "#1e3a5f", fontSize: 10 }}>Admin Search · {index.length} records indexed</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
