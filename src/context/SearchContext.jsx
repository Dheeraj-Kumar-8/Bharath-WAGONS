import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useOperatorData } from "./OperatorDataContext";
import { OPERATOR_INDEX } from "../data/operatorSearchData";

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

// Inner provider that safely consumes OperatorDataContext
function SearchProviderInner({ children }) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [history, setHistory] = useState(loadHistory);

  const { wagons, cargo, alerts, maintenance } = useOperatorData();

  const liveIndex = useMemo(
    () => buildIndex(wagons, cargo, alerts, maintenance),
    [wagons, cargo, alerts, maintenance]
  );

  const getIndex = useCallback(() => liveIndex, [liveIndex]);

  // Per-type counts from the full index (no query needed)
  const indexCounts = useMemo(() => {
    const counts = {};
    liveIndex.forEach(item => { counts[item.type] = (counts[item.type] || 0) + 1; });
    return counts;
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

  return (
    <SearchContext.Provider value={{
      open, openSearch, closeSearch,
      query, setQuery,
      history, pushHistory, clearHistory, removeHistory,
      search, suggest,
      indexSize: liveIndex.length,
      indexCounts,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

// Fallback provider for contexts outside OperatorDataProvider (e.g. admin pages)
function SearchProviderFallback({ children }) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [history, setHistory] = useState(loadHistory);

  const getIndex = useCallback(() => OPERATOR_INDEX, []);
  const openSearch  = useCallback(() => setOpen(true), []);
  const closeSearch = useCallback(() => { setOpen(false); setQuery(""); }, []);

  const fallbackCounts = useMemo(() => {
    const counts = {};
    OPERATOR_INDEX.forEach(item => { counts[item.type] = (counts[item.type] || 0) + 1; });
    return counts;
  }, []);

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
    setHistory(prev => { const next = prev.filter(h => h !== term); saveHistory(next); return next; });
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
    return getIndex().filter(item => item.keywords.includes(raw)).slice(0, 6).map(item => item.title);
  }, [getIndex]);

  return (
    <SearchContext.Provider value={{
      open, openSearch, closeSearch,
      query, setQuery,
      history, pushHistory, clearHistory, removeHistory,
      search, suggest,
      indexSize: OPERATOR_INDEX.length,
      indexCounts: fallbackCounts,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

// Safe wrapper: try live provider first, fall back gracefully
function SearchProviderSafe({ children }) {
  // OperatorDataContext throws if not inside its provider —
  // we catch that at mount time by attempting to use it conditionally.
  // Since hooks can't be conditional, we gate this at the component tree level
  // via the OperatorShell in AppRoutes which wraps OperatorDataProvider first.
  return <SearchProviderInner>{children}</SearchProviderInner>;
}

export function SearchProvider({ children }) {
  return <SearchProviderSafe>{children}</SearchProviderSafe>;
}

// Standalone fallback for use outside operator shell
export function SearchProviderStandalone({ children }) {
  return <SearchProviderFallback>{children}</SearchProviderFallback>;
}

export const useSearch = () => useContext(SearchContext);
