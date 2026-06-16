import { createContext, useContext, useState, useCallback, useMemo } from "react";

const AnalyticsSearchContext = createContext(null);

const HISTORY_KEY = "anl_search_history";
const MAX_HISTORY = 10;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
}

// ── Analytics search index ────────────────────────────────────────────────────
const ANALYTICS_ZONES = [
  { zone: "NR",  name: "North Railway",         onTime: "96.1%", wagons: 1247, delayed: 38, alerts: 23, color: "#22c55e" },
  { zone: "SR",  name: "South Railway",          onTime: "95.2%", wagons: 980,  delayed: 29, alerts: 18, color: "#22c55e" },
  { zone: "ER",  name: "East Railway",           onTime: "94.8%", wagons: 840,  delayed: 42, alerts: 31, color: "#f59e0b" },
  { zone: "WR",  name: "West Railway",           onTime: "93.4%", wagons: 710,  delayed: 47, alerts: 27, color: "#f59e0b" },
  { zone: "NER", name: "North East Railway",     onTime: "91.2%", wagons: 320,  delayed: 28, alerts: 15, color: "#f59e0b" },
  { zone: "NWR", name: "North Western Railway",  onTime: "94.0%", wagons: 480,  delayed: 19, alerts: 12, color: "#22c55e" },
  { zone: "SER", name: "South Eastern Railway",  onTime: "95.5%", wagons: 560,  delayed: 25, alerts: 20, color: "#22c55e" },
  { zone: "SWR", name: "South Western Railway",  onTime: "92.8%", wagons: 410,  delayed: 33, alerts: 16, color: "#f59e0b" },
];

const ANALYTICS_ALERTS = [
  { id: "ANLT-001", zone: "NR",  type: "Delay Spike",         severity: "Critical", time: "10:14 AM", detail: "18 wagons delayed in NR zone — 3 min ago",            count: 18  },
  { id: "ANLT-002", zone: "ER",  type: "On-Time Rate Drop",   severity: "High",     time: "09:30 AM", detail: "East Railway on-time rate fell to 94.8% this week",    count: 42  },
  { id: "ANLT-003", zone: "WR",  type: "Fleet Utilisation Low",severity: "Medium",  time: "08:45 AM", detail: "West Railway fleet utilisation at 81.2% — below 85% threshold", count: 0 },
  { id: "ANLT-004", zone: "SR",  type: "Alert Rate Surge",    severity: "High",     time: "11:00 AM", detail: "Alert rate in SR zone spiked to 3.2% this morning",    count: 27  },
  { id: "ANLT-005", zone: "NER", type: "GPS Coverage Low",    severity: "Critical", time: "07:58 AM", detail: "NER GPS coverage dropped to 78% — below 80% SLA",      count: 0   },
  { id: "ANLT-006", zone: "SWR", type: "Delay Trend Up",      severity: "Medium",   time: "09:15 AM", detail: "SWR delayed wagons increased 12% week-over-week",      count: 33  },
];

const ANALYTICS_REPORTS = [
  { id: "ARPT-001", title: "Monthly Performance Report",      period: "Jun 2025",       type: "Monthly",   zone: "All",  size: "12.4 MB" },
  { id: "ARPT-002", title: "Zone Performance Comparison",     period: "Jun 2025",       type: "Monthly",   zone: "All",  size: "8.2 MB"  },
  { id: "ARPT-003", title: "Weekly On-Time Rate Analysis",    period: "Week 26 · 2025", type: "Weekly",    zone: "All",  size: "4.8 MB"  },
  { id: "ARPT-004", title: "Alert Trend Analysis",            period: "Jun 2025",       type: "Monthly",   zone: "All",  size: "6.5 MB"  },
  { id: "ARPT-005", title: "Fleet Utilisation Report",        period: "Q2 2025",        type: "Quarterly", zone: "All",  size: "15.1 MB" },
  { id: "ARPT-006", title: "NR Zone Detailed Analytics",      period: "Jun 2025",       type: "Monthly",   zone: "NR",   size: "5.3 MB"  },
  { id: "ARPT-007", title: "SR Zone Detailed Analytics",      period: "Jun 2025",       type: "Monthly",   zone: "SR",   size: "4.7 MB"  },
  { id: "ARPT-008", title: "Speed & Movement Analytics",      period: "Jul 2025",       type: "Daily",     zone: "All",  size: "2.1 MB"  },
  { id: "ARPT-009", title: "Cargo Efficiency Summary",        period: "Jun 2025",       type: "Monthly",   zone: "All",  size: "7.8 MB"  },
  { id: "ARPT-010", title: "Predictive Delay Forecast",       period: "Jul 2025",       type: "Daily",     zone: "All",  size: "1.9 MB"  },
];

const ANALYTICS_KPIS = [
  { id: "KPI-001", metric: "On-Time Rate",       value: "95.7%",   trend: "+1.2%",  status: "Good",     category: "Performance" },
  { id: "KPI-002", metric: "Total Wagons",        value: "1,247",   trend: "+3.2%",  status: "Good",     category: "Fleet"       },
  { id: "KPI-003", metric: "Active Wagons",       value: "1,089",   trend: "+1.8%",  status: "Good",     category: "Fleet"       },
  { id: "KPI-004", metric: "Delayed Wagons",      value: "47",      trend: "-8.2%",  status: "Warning",  category: "Performance" },
  { id: "KPI-005", metric: "GPS Coverage",        value: "89%",     trend: "+0.5%",  status: "Good",     category: "System"      },
  { id: "KPI-006", metric: "Fleet Utilisation",   value: "87.3%",   trend: "+2.1%",  status: "Good",     category: "Fleet"       },
  { id: "KPI-007", metric: "Alert Rate",          value: "2.1%",    trend: "-0.4%",  status: "Good",     category: "Alerts"      },
  { id: "KPI-008", metric: "Avg Speed",           value: "76 km/h", trend: "+2.1%",  status: "Good",     category: "Performance" },
  { id: "KPI-009", metric: "Avg Delay",           value: "48 min",  trend: "-11%",   status: "Good",     category: "Performance" },
  { id: "KPI-010", metric: "Cargo Efficiency",    value: "80%",     trend: "+1.5%",  status: "Warning",  category: "Cargo"       },
  { id: "KPI-011", metric: "Maintenance Rate",    value: "97.2%",   trend: "+0.3%",  status: "Good",     category: "Maintenance" },
  { id: "KPI-012", metric: "Total Movements",     value: "28,432",  trend: "+8.4%",  status: "Good",     category: "Performance" },
];

const ANALYTICS_PAGES = [
  { id: "pg-dash",  title: "Dashboard Overview",     sub: "Real-time KPIs and operational insights", path: "/analytics-dashboard"              },
  { id: "pg-perf",  title: "Performance Analytics",   sub: "Wagon movement, speed, monthly KPIs",    path: "/analytics-dashboard/performance"  },
  { id: "pg-zone",  title: "Zone Analytics",          sub: "Per-zone on-time rates and heatmaps",    path: "/analytics-dashboard/zone"         },
  { id: "pg-alert", title: "Alert Analytics",         sub: "Alert trends, types, severity breakdown",path: "/analytics-dashboard/alerts"       },
  { id: "pg-rep",   title: "Reports",                 sub: "Generate and export analytics reports",  path: "/analytics-dashboard/reports"      },
];

function buildAnalyticsIndex(analystZone) {
  const items = [];

  ANALYTICS_ZONES.filter(z => !analystZone || z.zone === analystZone || analystZone === "All").forEach(z => {
    items.push({
      type: "Zone", id: z.zone,
      title: `${z.zone} — ${z.name}`,
      sub: `On-Time: ${z.onTime} · ${z.wagons} wagons`,
      meta: `${z.delayed} delayed · ${z.alerts} alerts`,
      status: parseFloat(z.onTime) >= 95 ? "Good" : "Warning",
      keywords: `${z.zone} ${z.name} zone railway analytics performance ${z.onTime}`.toLowerCase(),
      path: "/analytics-dashboard/zone", raw: z,
    });
  });

  ANALYTICS_ALERTS.filter(a => !analystZone || a.zone === analystZone || analystZone === "All").forEach(a => {
    items.push({
      type: "Alert", id: a.id,
      title: `${a.id} — ${a.type}`,
      sub: `Zone ${a.zone} · ${a.time}`,
      meta: `${a.severity} · ${a.detail}`,
      status: a.severity,
      keywords: `${a.id} ${a.type} ${a.zone} ${a.severity} ${a.detail}`.toLowerCase(),
      path: "/analytics-dashboard/alerts", raw: a,
    });
  });

  ANALYTICS_REPORTS.filter(r => !analystZone || r.zone === analystZone || r.zone === "All").forEach(r => {
    items.push({
      type: "Report", id: r.id,
      title: `${r.id} — ${r.title}`,
      sub: `${r.period} · ${r.type}`,
      meta: `Zone ${r.zone} · ${r.size}`,
      status: "Ready",
      keywords: `${r.id} ${r.title} ${r.period} ${r.type} ${r.zone} report analytics`.toLowerCase(),
      path: "/analytics-dashboard/reports", raw: r,
    });
  });

  ANALYTICS_KPIS.forEach(k => {
    items.push({
      type: "KPI", id: k.id,
      title: k.metric,
      sub: `${k.value} · Trend: ${k.trend}`,
      meta: `${k.category} · ${k.status}`,
      status: k.status,
      keywords: `${k.metric} ${k.value} ${k.category} kpi analytics metric ${k.status}`.toLowerCase(),
      path: "/analytics-dashboard", raw: k,
    });
  });

  ANALYTICS_PAGES.forEach(p => {
    items.push({
      type: "Page", id: p.id,
      title: p.title,
      sub: p.sub,
      meta: "Analytics Page",
      status: "Active",
      keywords: `${p.title} ${p.sub} analytics page dashboard`.toLowerCase(),
      path: p.path, raw: p,
    });
  });

  return items;
}

export function AnalyticsSearchProvider({ children }) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [history, setHistory] = useState(loadHistory);

  const index = useMemo(() => buildAnalyticsIndex(null), []);

  const openSearch  = useCallback(() => setOpen(true),  []);
  const closeSearch = useCallback(() => { setOpen(false); setQuery(""); }, []);

  const pushHistory = useCallback((term) => {
    if (!term.trim()) return;
    setHistory(prev => {
      const next = [term, ...prev.filter(h => h !== term)].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);
  const clearHistory  = useCallback(() => { setHistory([]); saveHistory([]); }, []);
  const removeHistory = useCallback((term) => {
    setHistory(prev => { const next = prev.filter(h => h !== term); saveHistory(next); return next; });
  }, []);

  const search = useCallback((q, { type = "All", sort = "relevance" } = {}) => {
    const raw = q.trim().toLowerCase();
    if (!raw) return [];
    const tokens = raw.split(/\s+/);
    let results = index.map(item => {
      if (type !== "All" && item.type !== type) return null;
      let score = 0;
      if (item.id.toLowerCase() === raw)           score += 100;
      if (item.title.toLowerCase().includes(raw))  score += 50;
      if (tokens.every(t => item.keywords.includes(t))) score += 30;
      if (tokens.some(t  => item.keywords.includes(t))) score += 10;
      if (item.keywords.startsWith(raw))           score += 20;
      return score > 0 ? { ...item, score } : null;
    }).filter(Boolean);
    if (sort === "relevance") results.sort((a, b) => b.score - a.score);
    else if (sort === "type") results.sort((a, b) => a.type.localeCompare(b.type));
    return results;
  }, [index]);

  const suggest = useCallback((q) => {
    const raw = q.trim().toLowerCase();
    if (raw.length < 2) return [];
    return index.filter(item => item.keywords.includes(raw)).slice(0, 6).map(item => item.title);
  }, [index]);

  const indexCounts = useMemo(() => {
    const c = {};
    index.forEach(item => { c[item.type] = (c[item.type] || 0) + 1; });
    return c;
  }, [index]);

  return (
    <AnalyticsSearchContext.Provider value={{
      open, openSearch, closeSearch,
      query, setQuery,
      history, pushHistory, clearHistory, removeHistory,
      search, suggest,
      indexSize: index.length,
      indexCounts,
    }}>
      {children}
    </AnalyticsSearchContext.Provider>
  );
}

export const useAnalyticsSearch = () => useContext(AnalyticsSearchContext);
