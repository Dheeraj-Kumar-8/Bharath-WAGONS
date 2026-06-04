import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiX, FiTruck, FiMapPin, FiAlertTriangle,
  FiActivity, FiTool, FiBox, FiArrowRight,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { ALL_WAGONS, ZONE_ALERTS, ZONE_STATS, ZONE_CITIES } from "../data/zoneData";

// ── Build full search index from real data ─────────────────────────────────
function buildIndex(zone) {
  const items = [];

  // Wagons — all wagons in this zone
  ALL_WAGONS.filter(w => w.zone === zone).forEach(w => {
    items.push({
      type: "Wagon",
      icon: FiTruck,
      color: "#3b82f6",
      id: w.id,
      title: w.id,
      sub: `${w.location} → ${w.dest}`,
      meta: `${w.type} · ${w.speed} km/h · ${w.status}`,
      status: w.status,
      badge: w.status === "On Time" ? "badge-ontime" : w.status === "Delayed" ? "badge-delayed" : "badge-maint",
      detail: {
        "Wagon ID": w.id, "Type": w.type, "Location": w.location,
        "Destination": w.dest, "Speed": `${w.speed} km/h`,
        "Status": w.status, "Capacity": w.capacity, "Zone": w.zone,
      },
      path: "/wagons",
    });
  });

  // Alerts for this zone
  (ZONE_ALERTS[zone] || []).forEach(a => {
    items.push({
      type: "Alert",
      icon: FiAlertTriangle,
      color: a.priority === "Critical" ? "#ef4444" : a.priority === "High" ? "#f97316" : "#f59e0b",
      id: a.wagon,
      title: a.type,
      sub: `${a.wagon} · ${a.time}`,
      meta: `${a.priority} · ${a.status}`,
      status: a.status,
      badge: a.priority === "Critical" ? "badge-critical" : a.priority === "High" ? "badge-high" : "badge-medium",
      detail: {
        "Alert Type": a.type, "Wagon": a.wagon, "Priority": a.priority,
        "Time": a.time, "Status": a.status, "Zone": zone,
      },
      path: "/ai-alerts",
    });
  });

  // City hubs for this zone
  (ZONE_CITIES[zone] || []).forEach(c => {
    items.push({
      type: "Hub",
      icon: FiMapPin,
      color: "#8b5cf6",
      id: c.name,
      title: c.name,
      sub: `Zone ${zone} · Hub Station`,
      meta: `${c.active} active · ${c.moving} moving · ${c.delayed} delayed`,
      status: "Active",
      badge: "badge-active",
      detail: {
        "City": c.name, "Zone": zone, "Active Routes": c.active,
        "Moving Wagons": c.moving, "Delayed Routes": c.delayed,
        "Offline GPS": c.offline,
      },
      path: "/live-tracking",
    });
  });

  // Zone stats summary
  const s = ZONE_STATS[zone];
  if (s) {
    items.push({
      type: "Stats",
      icon: FiActivity,
      color: "#22c55e",
      id: `zone-${zone}`,
      title: `Zone ${zone} Overview`,
      sub: `${s.total} total wagons · ${s.stations} stations`,
      meta: `${s.active} active · ${s.delayed} delayed · ${s.maint} maintenance`,
      status: "Active",
      badge: "badge-active",
      detail: {
        "Zone": zone, "Total Wagons": s.total, "Active": s.active,
        "Delayed": s.delayed, "Maintenance": s.maint,
        "Stations": s.stations, "GPS Active": s.gps,
        "AI Alerts": s.alerts, "Cargo Loads": s.cargo,
      },
      path: "/admin",
    });
  }

  // Static pages
  [
    { title:"Dashboard",          sub:"Zone overview & KPIs",         path:"/admin",               icon:FiActivity, color:"#3b82f6" },
    { title:"Live Tracking",       sub:"Real-time GPS wagon tracking",  path:"/live-tracking",       icon:FiMapPin,   color:"#22c55e" },
    { title:"Wagons",              sub:"Manage & monitor fleet",        path:"/wagons",              icon:FiTruck,    color:"#3b82f6" },
    { title:"AI Alerts",           sub:"Active alerts & incidents",     path:"/ai-alerts",           icon:FiAlertTriangle, color:"#ef4444" },
    { title:"Cargo Monitoring",    sub:"Track cargo loads",             path:"/cargo-monitoring",    icon:FiBox,      color:"#10b981" },
    { title:"Maintenance",         sub:"Schedule & track maintenance",  path:"/maintenance",         icon:FiTool,     color:"#f97316" },
    { title:"Analytics",           sub:"Charts & performance data",     path:"/analytics",           icon:FiActivity, color:"#8b5cf6" },
    { title:"Reports",             sub:"Generate & export reports",     path:"/reports",             icon:FiActivity, color:"#f59e0b" },
    { title:"Settings",            sub:"System preferences",            path:"/settings",            icon:FiActivity, color:"#64748b" },
  ].forEach(p => {
    items.push({
      type: "Page",
      icon: p.icon,
      color: p.color,
      id: p.path,
      title: p.title,
      sub: p.sub,
      meta: "Page",
      status: "",
      badge: "badge-info",
      detail: null,
      path: p.path,
    });
  });

  return items;
}

const TYPE_COLORS = {
  Wagon: "#3b82f6", Alert: "#ef4444", Hub: "#8b5cf6",
  Stats: "#22c55e", Page: "#64748b",
};

// ── SearchModal ────────────────────────────────────────────────────────────────
const SearchModal = ({ onClose }) => {
  const navigate  = useNavigate();
  const { admin } = useAuth();
  const zone      = admin?.zone || "NR";
  const INDEX     = buildIndex(zone);

  const [query,    setQuery]    = useState("");
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("All");
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const types = ["All", "Wagon", "Alert", "Hub", "Page"];

  const results = INDEX.filter(item => {
    const matchType  = filter === "All" || item.type === filter;
    const matchQuery = query.length < 1 || `${item.title} ${item.sub} ${item.meta} ${item.id}`
      .toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  }).slice(0, 30);

  const go = (item) => {
    navigate(item.path);
    onClose();
  };

  const statusColor = s => ({
    "On Time":"#22c55e", Delayed:"#f59e0b", Maintenance:"#ef4444",
    Active:"#22c55e", Resolved:"#22c55e", Pending:"#f59e0b",
  }[s] || "#64748b");

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,.65)", backdropFilter: "blur(6px)",
        display: "flex", justifyContent: "center", paddingTop: "80px",
        alignItems: "flex-start",
      }}
    >
      <div style={{
        width: "92vw", maxWidth: "860px",
        background: "#0d1f3c", border: "1px solid #1a3356",
        borderRadius: "20px", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,0,0,.7)",
        display: "flex", flexDirection: "column", maxHeight: "78vh",
      }}>

        {/* Search bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid #1a3356" }}>
          <FiSearch color="#3b82f6" size={18} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            placeholder={`Search wagons, alerts, hubs, pages in Zone ${zone}…`}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: "15px" }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setSelected(null); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", display: "flex" }}>
              <FiX size={16} />
            </button>
          )}
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.06)", border: "1px solid #1a3356", borderRadius: 8, padding: "4px 10px", color: "#64748b", fontSize: 11, cursor: "pointer" }}>
            ESC
          </button>
        </div>

        {/* Type filters */}
        <div style={{ display: "flex", gap: 6, padding: "10px 20px", borderBottom: "1px solid #1a3356", flexWrap: "wrap" }}>
          {types.map(t => (
            <button key={t} onClick={() => { setFilter(t); setSelected(null); }}
              style={{
                padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                border: `1px solid ${filter === t ? "#3b82f6" : "#1a3356"}`,
                background: filter === t ? "rgba(59,130,246,.18)" : "transparent",
                color: filter === t ? "#60a5fa" : "#64748b", cursor: "pointer",
              }}>
              {t}
              {t !== "All" && (
                <span style={{ marginLeft: 5, color: filter === t ? "#60a5fa" : "#2a4a6e" }}>
                  {INDEX.filter(i => i.type === t).length}
                </span>
              )}
            </button>
          ))}
          <span style={{ marginLeft: "auto", color: "#2a4a6e", fontSize: 11, alignSelf: "center" }}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Results + Detail pane */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Results list */}
          <div style={{ width: selected ? "52%" : "100%", overflowY: "auto", borderRight: selected ? "1px solid #1a3356" : "none" }}>
            {results.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#4a6fa5" }}>
                <FiSearch size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                <div style={{ fontSize: 14 }}>No results found for "{query}"</div>
                <div style={{ fontSize: 12, marginTop: 6, color: "#2a4a6e" }}>Try searching by wagon ID, city, or alert type</div>
              </div>
            ) : (
              results.map((item, i) => (
                <div key={i}
                  onClick={() => setSelected(item)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 20px", cursor: "pointer",
                    borderBottom: "1px solid rgba(26,51,86,.4)",
                    background: selected?.id === item.id ? "rgba(37,99,235,.12)" : "transparent",
                    borderLeft: selected?.id === item.id ? "3px solid #3b82f6" : "3px solid transparent",
                    transition: "background .12s",
                  }}
                  onMouseEnter={e => { if (selected?.id !== item.id) e.currentTarget.style.background = "rgba(37,99,235,.07)"; }}
                  onMouseLeave={e => { if (selected?.id !== item.id) e.currentTarget.style.background = "transparent"; }}
                >
                  {/* Icon */}
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <item.icon color={item.color} size={15} />
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                      <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>{item.title}</span>
                      <span style={{ fontSize: 10, color: TYPE_COLORS[item.type], background: `${TYPE_COLORS[item.type]}18`, padding: "1px 7px", borderRadius: 20, fontWeight: 700 }}>{item.type}</span>
                      {item.status && (
                        <span style={{ fontSize: 10, color: statusColor(item.status), fontWeight: 600 }}>{item.status}</span>
                      )}
                    </div>
                    <div style={{ color: "#4a6fa5", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.sub}</div>
                  </div>

                  <FiArrowRight color="#2a4a6e" size={13} />
                </div>
              ))
            )}
          </div>

          {/* Detail pane */}
          {selected && (
            <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${selected.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <selected.icon color={selected.color} size={20} />
                </div>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 15 }}>{selected.title}</div>
                  <div style={{ color: "#4a6fa5", fontSize: 12 }}>{selected.sub}</div>
                </div>
              </div>

              {/* Detail rows */}
              {selected.detail ? (
                <div style={{ background: "#071628", borderRadius: 12, border: "1px solid #1a3356", overflow: "hidden", marginBottom: 16 }}>
                  {Object.entries(selected.detail).map(([k, v], i) => (
                    <div key={k} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "10px 14px", borderBottom: i < Object.keys(selected.detail).length - 1 ? "1px solid rgba(26,51,86,.5)" : "none",
                    }}>
                      <span style={{ color: "#64748b", fontSize: 12 }}>{k}</span>
                      <span style={{ color: k === "Status" ? statusColor(v) : "#f1f5f9", fontWeight: 600, fontSize: 12 }}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#4a6fa5", fontSize: 13, marginBottom: 16 }}>{selected.meta}</div>
              )}

              {/* Navigate button */}
              <button
                onClick={() => go(selected)}
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center", gap: 8 }}
              >
                Go to {selected.title} <FiArrowRight size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div style={{ padding: "8px 20px", borderTop: "1px solid #1a3356", display: "flex", gap: 16 }}>
          {[["↵", "Select & navigate"], ["ESC", "Close"], ["Click row", "View details"]].map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ background: "#1a3356", color: "#64748b", padding: "1px 6px", borderRadius: 5, fontSize: 10, fontWeight: 700 }}>{key}</span>
              <span style={{ color: "#2a4a6e", fontSize: 11 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
