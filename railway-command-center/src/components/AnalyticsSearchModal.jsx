import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiX, FiArrowRight, FiTrendingUp, FiAlertTriangle,
  FiFileText, FiGrid, FiMapPin, FiBarChart2, FiClock, FiChevronDown,
} from "react-icons/fi";
import { useAnalyticsSearch } from "../context/AnalyticsSearchContext";

const TYPE_CFG = {
  Zone:   { icon: FiMapPin,        color: "#a855f7", bg: "rgba(168,85,247,.12)" },
  Alert:  { icon: FiAlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,.12)"  },
  Report: { icon: FiFileText,      color: "#f59e0b", bg: "rgba(245,158,11,.12)" },
  KPI:    { icon: FiTrendingUp,    color: "#22c55e", bg: "rgba(34,197,94,.12)"  },
  Page:   { icon: FiGrid,          color: "#3b82f6", bg: "rgba(59,130,246,.12)" },
};

const STATUS_COLOR = {
  Good: "#22c55e", Warning: "#f59e0b", Critical: "#ef4444",
  High: "#f97316", Medium: "#f59e0b", Low: "#22c55e",
  Active: "#22c55e", Ready: "#3b82f6",
};

const TYPES = ["All", "Zone", "KPI", "Alert", "Report", "Page"];
const SORT_OPTS = [
  { value: "relevance", label: "Relevance" },
  { value: "type",      label: "Type"      },
];
const PAGE_SIZE = 12;

function DetailPane({ item, onNavigate }) {
  const cfg = TYPE_CFG[item.type] || TYPE_CFG.KPI;
  const Icon = cfg.icon;
  const { raw, type } = item;

  const rows = [];
  if (type === "Zone") {
    rows.push(
      ["Zone Code", raw.zone], ["Railway", raw.name], ["On-Time Rate", raw.onTime],
      ["Total Wagons", raw.wagons], ["Delayed", raw.delayed], ["Active Alerts", raw.alerts],
    );
  } else if (type === "Alert") {
    rows.push(
      ["Alert ID", raw.id], ["Type", raw.type], ["Zone", raw.zone],
      ["Severity", raw.severity], ["Time", raw.time], ["Detail", raw.detail],
      ...(raw.count ? [["Affected Wagons", raw.count]] : []),
    );
  } else if (type === "Report") {
    rows.push(
      ["Report ID", raw.id], ["Title", raw.title], ["Period", raw.period],
      ["Type", raw.type], ["Zone", raw.zone], ["File Size", raw.size],
    );
  } else if (type === "KPI") {
    rows.push(
      ["Metric", raw.metric], ["Current Value", raw.value],
      ["Trend", raw.trend], ["Category", raw.category], ["Status", raw.status],
    );
  } else if (type === "Page") {
    rows.push(["Page", raw.title], ["Description", raw.sub], ["Path", raw.path]);
  }

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
        {rows.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "9px 13px", borderBottom: i < rows.length - 1 ? "1px solid rgba(26,51,86,.5)" : "none" }}>
            <span style={{ color: "#64748b", fontSize: 11, flexShrink: 0 }}>{k}</span>
            <span style={{ color: STATUS_COLOR[v] || "#f1f5f9", fontWeight: 600, fontSize: 11, textAlign: "right", wordBreak: "break-word" }}>{String(v)}</span>
          </div>
        ))}
      </div>
      <button onClick={() => onNavigate(item)} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 12, flexShrink: 0 }}>
        Open {item.type} <FiArrowRight size={13} />
      </button>
    </div>
  );
}

const AnalyticsSearchModal = () => {
  const navigate  = useNavigate();
  const ctx       = useAnalyticsSearch();

  // ── All hooks unconditionally ─────────────────────────────────────────────
  const [filter,      setFilter]      = useState("All");
  const [sort,        setSort]        = useState("relevance");
  const [selected,    setSelected]    = useState(null);
  const [showSort,    setShowSort]    = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSug,     setShowSug]     = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const [page,        setPage]        = useState(1);

  const inputRef   = useRef(null);
  const sortRef    = useRef(null);
  const resultsRef = useRef(null);

  const open        = ctx?.open        ?? false;
  const closeSearch = useMemo(() => ctx?.closeSearch ?? (() => {}), [ctx]);
  const query       = ctx?.query       ?? "";
  const setQuery    = useMemo(() => ctx?.setQuery    ?? (() => {}), [ctx]);
  const history     = ctx?.history     ?? [];
  const pushHistory = useMemo(() => ctx?.pushHistory ?? (() => {}), [ctx]);
  const clearHistory   = useMemo(() => ctx?.clearHistory   ?? (() => {}), [ctx]);
  const removeHistory  = useMemo(() => ctx?.removeHistory  ?? (() => {}), [ctx]);
  const search      = useMemo(() => ctx?.search      ?? (() => []), [ctx]);
  const suggest     = useMemo(() => ctx?.suggest     ?? (() => []), [ctx]);
  const indexSize   = ctx?.indexSize   ?? 0;
  const indexCounts = useMemo(() => ctx?.indexCounts ?? {}, [ctx]);

  useEffect(() => {
    if (!open) return;
    setFilter("All"); setSort("relevance"); setSelected(null);
    setShowSug(false); setActiveIdx(-1); setPage(1);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = e => { if (e.key === "Escape") closeSearch(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, closeSearch]);

  useEffect(() => {
    const h = e => { if (sortRef.current && !sortRef.current.contains(e.target)) setShowSort(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const allResults = useMemo(
    () => query.trim() ? search(query, { type: filter, sort }) : [],
    [query, filter, sort, search]
  );
  const totalPages = Math.ceil(allResults.length / PAGE_SIZE);
  const results    = allResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); setSelected(null); }, [query, filter, sort]);

  useEffect(() => {
    setSuggestions(query.length >= 2 ? suggest(query) : []);
  }, [query, suggest]);

  const handleNavigate = useCallback((item) => {
    pushHistory(query.trim() || item.title);
    navigate(item.path);
    closeSearch();
  }, [pushHistory, query, navigate, closeSearch]);

  const handleKeyDown = useCallback(e => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, results.length - 1));
      setShowSug(false);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      setShowSug(false);
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
    const all = query.trim() ? search(query, { type: "All" }) : [];
    return TYPES.reduce((acc, t) => {
      acc[t] = t === "All"
        ? (query.trim() ? all.length : indexSize)
        : (query.trim() ? all.filter(r => r.type === t).length : (indexCounts[t] || 0));
      return acc;
    }, {});
  }, [query, search, indexSize, indexCounts]);

  // ── Guard after all hooks ─────────────────────────────────────────────────
  if (!ctx || !open) return null;

  return (
    <div
      onClick={e => e.target === e.currentTarget && closeSearch()}
      style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,.72)", backdropFilter: "blur(6px)", display: "flex", justifyContent: "center", paddingTop: "72px", alignItems: "flex-start" }}
    >
      <div onClick={e => e.stopPropagation()} style={{ width: "92vw", maxWidth: 900, background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 20, overflow: "hidden", boxShadow: "0 28px 90px rgba(0,0,0,.75)", display: "flex", flexDirection: "column", maxHeight: "80vh" }}>

        {/* Search bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderBottom: "1px solid #1a3356", position: "relative", flexShrink: 0 }}>
          <FiSearch color="#a855f7" size={17} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); setActiveIdx(-1); setShowSug(true); }}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setShowSug(true)}
            placeholder="Search zones, KPIs, alerts, reports, analytics pages…"
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: 15 }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setSelected(null); setSuggestions([]); inputRef.current?.focus(); }}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex", padding: 3 }}>
              <FiX size={15} />
            </button>
          )}
          <div ref={sortRef} style={{ position: "relative" }}>
            <button onClick={() => setShowSort(p => !p)}
              style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(168,85,247,.1)", border: "1px solid #1a3356", borderRadius: 8, padding: "5px 10px", color: "#94a3b8", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
              {SORT_OPTS.find(o => o.value === sort)?.label} <FiChevronDown size={11} />
            </button>
            {showSort && (
              <div style={{ position: "absolute", right: 0, top: "110%", background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, overflow: "hidden", zIndex: 100, minWidth: 120, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
                {SORT_OPTS.map(o => (
                  <div key={o.value} onClick={() => { setSort(o.value); setShowSort(false); }}
                    style={{ padding: "9px 14px", color: sort === o.value ? "#a855f7" : "#94a3b8", fontSize: 12, fontWeight: sort === o.value ? 700 : 400, cursor: "pointer", background: sort === o.value ? "rgba(168,85,247,.1)" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(168,85,247,.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = sort === o.value ? "rgba(168,85,247,.1)" : "transparent"}>
                    {o.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={closeSearch} style={{ background: "rgba(255,255,255,.06)", border: "1px solid #1a3356", borderRadius: 7, padding: "4px 9px", color: "#64748b", fontSize: 11, cursor: "pointer", fontWeight: 700 }}>ESC</button>

          {showSug && suggestions.length > 0 && (
            <div style={{ position: "absolute", left: 44, right: 44, top: "110%", background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 10, overflow: "hidden", zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
              {suggestions.map((s, i) => (
                <div key={i} onClick={() => { setQuery(s); setShowSug(false); setSuggestions([]); inputRef.current?.focus(); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", cursor: "pointer", color: "#94a3b8", fontSize: 13 }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(168,85,247,.1)"}
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
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 11px", borderRadius: 20, fontSize: 11, fontWeight: 700, border: `1px solid ${active ? (cfg?.color || "#a855f7") : "#1a3356"}`, background: active ? `${cfg?.color || "#a855f7"}18` : "transparent", color: active ? (cfg?.color || "#a855f7") : "#64748b", cursor: "pointer" }}>
                {t}
                <span style={{ background: active ? `${cfg?.color || "#a855f7"}25` : "#1a3356", color: active ? (cfg?.color || "#a855f7") : "#2a4a6e", borderRadius: 10, padding: "0 5px", fontSize: 10 }}>{count}</span>
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
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(168,85,247,.07)"}
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
                    <FiBarChart2 size={28} style={{ marginBottom: 10, opacity: .3 }} />
                    <div style={{ fontSize: 13 }}>Start typing to search analytics data</div>
                    <div style={{ fontSize: 11, marginTop: 6, color: "#2a4a6e" }}>Zones · KPIs · Alerts · Reports · Pages</div>
                  </div>
                )}
                <div style={{ marginTop: 18 }}>
                  <div style={{ color: "#4a6fa5", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Quick Access</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {Object.entries(TYPE_CFG).map(([type, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button key={type} onClick={() => { setFilter(type); setQuery(""); inputRef.current?.focus(); }}
                          style={{ background: cfg.bg, border: `1px solid ${cfg.color}28`, borderRadius: 10, padding: "10px 8px", cursor: "pointer", textAlign: "center" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color}
                          onMouseLeave={e => e.currentTarget.style.borderColor = `${cfg.color}28`}>
                          <Icon color={cfg.color} size={16} style={{ marginBottom: 4 }} />
                          <div style={{ color: "#f1f5f9", fontSize: 11, fontWeight: 700 }}>{type}</div>
                          <div style={{ color: "#64748b", fontSize: 10 }}>{indexCounts[type] || 0}</div>
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
                <div style={{ fontSize: 12, marginTop: 6, color: "#2a4a6e" }}>Try a zone code, KPI name, alert type, or report title</div>
              </div>
            ) : (
              <>
                <div ref={resultsRef}>
                  {results.map((item, i) => {
                    const cfg = TYPE_CFG[item.type] || TYPE_CFG.KPI;
                    const Icon = cfg.icon;
                    const isActive   = i === activeIdx;
                    const isSelected = selected?.id === item.id && selected?.type === item.type;
                    return (
                      <div key={`${item.type}-${item.id}-${i}`}
                        onClick={() => setSelected(isSelected ? null : item)}
                        onDoubleClick={() => handleNavigate(item)}
                        style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 18px", cursor: "pointer", borderBottom: "1px solid rgba(26,51,86,.35)", background: isSelected ? "rgba(168,85,247,.14)" : isActive ? "rgba(168,85,247,.07)" : "transparent", borderLeft: isSelected ? "3px solid #a855f7" : "3px solid transparent", transition: "background .1s" }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(168,85,247,.07)"; }}
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

                {totalPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, padding: "10px 18px", borderTop: "1px solid #1a3356" }}>
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      style={{ background: page === 1 ? "#0a1628" : "rgba(168,85,247,.1)", border: "1px solid #1a3356", borderRadius: 7, padding: "4px 10px", color: page === 1 ? "#2a4a6e" : "#a855f7", fontSize: 11, cursor: page === 1 ? "not-allowed" : "pointer", fontWeight: 600 }}>← Prev</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        style={{ background: p === page ? "rgba(168,85,247,.18)" : "transparent", border: `1px solid ${p === page ? "#a855f7" : "#1a3356"}`, borderRadius: 7, padding: "4px 9px", color: p === page ? "#a855f7" : "#64748b", fontSize: 11, cursor: "pointer", fontWeight: p === page ? 700 : 400 }}>{p}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                      style={{ background: page === totalPages ? "#0a1628" : "rgba(168,85,247,.1)", border: "1px solid #1a3356", borderRadius: 7, padding: "4px 10px", color: page === totalPages ? "#2a4a6e" : "#a855f7", fontSize: 11, cursor: page === totalPages ? "not-allowed" : "pointer", fontWeight: 600 }}>Next →</button>
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
          <span style={{ marginLeft: "auto", color: "#1e3a5f", fontSize: 10 }}>Analytics Search · {indexSize} records indexed</span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSearchModal;
