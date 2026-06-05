import { createContext, useContext, useState, useCallback, useMemo } from "react";

// Try to use live context — gracefully falls back if not inside OperatorDataProvider
let _useOperatorData = null;
try {
  // Dynamic import to avoid circular dep at module load time
  _useOperatorData = require("../context/OperatorDataContext").useOperatorData;
} catch { /* outside operator shell */ }

const SearchContext = createContext(null);

const MAX_HISTORY = 10;
const HISTORY_KEY = "op_search_history";

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}
function saveHistory(h) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
}

// Build search index entry from raw data
function buildIndex(wagons, cargo, alerts, maintenance) {
  const items = [];

  wagons.forEach(w => items.push({
    type: "Wagon", id: w.id, title: w.id,
    sub:  `${w.location} → ${w.route.split("→")[1]?.trim() || ""}`,
    meta: `${w.type} · ${w.speed} km/h · Load ${w.load}% · ${w.gps} GPS`,
    status: w.status,
    keywords: `${w.id} ${w.route} ${w.location} ${w.type} ${w.status} ${w.zone || ""}`.toLowerCase(),
    path: "/operator/wagons", raw: w,
  }));

  cargo.forEach(c => {
    const pct = Math.round(c.weight / c.capacity * 100) || 0;
    items.push({
      type: "Cargo", id: c.id, title: `${c.id} — ${c.type}`,
      sub:  `${c.origin} → ${c.destination} · ${c.wagon}`,
      meta: `${c.weight}T / ${c.capacity}T (${pct}%) · ${c.temp}°C · Seal: ${c.seal} · ${c.status}`,
      status: c.status,
      keywords: `${c.id} ${c.wagon} ${c.type} ${c.origin} ${c.destination} ${c.status} ${c.seal}`.toLowerCase(),
      path: "/operator/cargo", raw: c,
    });
  });

  alerts.forEach(a => items.push({
    type: "Alert", id: a.id, title: `${a.id} — ${a.type}`,
    sub:  `${a.wagon} · ${a.time}`,
    meta: `${a.severity} · ${a.detail}`,
    status: a.severity,
    keywords: `${a.id} ${a.wagon} ${a.type} ${a.severity} ${a.detail}`.toLowerCase(),
    path: "/operator/alerts", raw: a,
  }));

  maintenance.forEach(m => items.push({
    type: "Maintenance", id: m.id, title: `${m.id} — ${m.type}`,
    sub:  `${m.wagon} · ${m.tech}`,
    meta: `${m.priority} · ${m.status} · ${m.scheduledDate || ""}`,
    status: m.status,
    keywords: `${m.id} ${m.wagon} ${m.type} ${m.priority} ${m.status} ${m.tech} ${m.notes}`.toLowerCase(),
    path: "/operator/maintenance", raw: m,
  }));

  return items;
}

export function SearchProvider({ children }) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [history, setHistory] = useState(loadHistory);

  // Safely consume live operator data if available
  let liveData = null;
  try {
    if (_useOperatorData) liveData = _useOperatorData();
  } catch { /* not in provider */ }

  const liveIndex = useMemo(() => {
    if (!liveData) return null;
    return buildIndex(liveData.wagons, liveData.cargo, liveData.alerts, liveData.maintenance);
  }, [liveData?.wagons, liveData?.cargo, liveData?.alerts, liveData?.maintenance]); // eslint-disable-line

  // Fallback to static index if live data unavailable
  const getIndex = useCallback(() => {
    if (liveIndex) return liveIndex;
    try { return require("../data/operatorSearchData").OPERATOR_INDEX; }
    catch { return []; }
  }, [liveIndex]);

  const openSearch  = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => { setOpen(false); setQuery(""); }, []);

  const pushHistory = useCallback((term) => {
    if (!term.trim()) return;
    setHistory(prev => {
      const next = [term, ...prev.filter(h => h !== term)].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => { setHistory([]); saveHistory([]); }, []);

  const removeHistory = useCallback((term) => {
    setHistory(prev => {
      const next = prev.filter(h => h !== term);
      saveHistory(next);
      return next;
    });
  }, []);

  const search = useCallback((q, { type = "All", sort = "relevance" } = {}) => {
    const raw = q.trim().toLowerCase();
    if (!raw) return [];
    const index = getIndex();
    const tokens = raw.split(/\s+/);

    let results = index.map(item => {
      if (type !== "All" && item.type !== type) return null;
      let score = 0;
      if (item.id.toLowerCase() === raw) score += 100;
      if (item.title.toLowerCase().includes(raw)) score += 50;
      const allTokens  = tokens.every(t => item.keywords.includes(t));
      const someTokens = tokens.some(t  => item.keywords.includes(t));
      if (allTokens)  score += 30;
      if (someTokens) score += 10;
      if (item.keywords.startsWith(raw)) score += 20;
      return score > 0 ? { ...item, score } : null;
    }).filter(Boolean);

    if (sort === "relevance") results.sort((a, b) => b.score - a.score);
    else if (sort === "type")   results.sort((a, b) => a.type.localeCompare(b.type));
    else if (sort === "status") results.sort((a, b) => a.status.localeCompare(b.status));
    return results;
  }, [getIndex]);

  const suggest = useCallback((q) => {
    const raw = q.trim().toLowerCase();
    if (raw.length < 2) return [];
    return getIndex()
      .filter(item => item.keywords.includes(raw))
      .slice(0, 6)
      .map(item => item.title);
  }, [getIndex]);

  const indexSize = liveIndex ? liveIndex.length : (() => {
    try { return require("../data/operatorSearchData").OPERATOR_INDEX.length; } catch { return 0; }
  })();

  return (
    <SearchContext.Provider value={{
      open, openSearch, closeSearch,
      query, setQuery,
      history, pushHistory, clearHistory, removeHistory,
      search, suggest,
      indexSize,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => useContext(SearchContext);
