import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut, FiAlertTriangle, FiMapPin, FiActivity, FiBox } from "react-icons/fi";

const SEARCH_INDEX = [
  { label: "WGN-001", sub: "Wagon · Delhi → Mumbai · On Time",    path: "/wagons" },
  { label: "WGN-234", sub: "Wagon · Route Deviation Detected",    path: "/wagons" },
  { label: "WGN-555", sub: "Wagon · Speed Limit Exceeded",        path: "/wagons" },
  { label: "WGN-876", sub: "Wagon · Door Open Alert",             path: "/wagons" },
  { label: "New Delhi Junction", sub: "Station · Zone NR",        path: "/stations" },
  { label: "Mumbai CST",         sub: "Station · Zone CR",        path: "/stations" },
  { label: "Chennai Central",    sub: "Station · Zone SR",        path: "/stations" },
  { label: "Hyderabad Deccan",   sub: "Station · Zone SCR",       path: "/stations" },
  { label: "Delhi → Mumbai",     sub: "Route · 1384 km · Active", path: "/live-tracking" },
  { label: "Chennai → Kolkata",  sub: "Route · 1659 km · Active", path: "/live-tracking" },
  { label: "Bengaluru → Pune",   sub: "Route · 832 km · Delayed", path: "/live-tracking" },
];

const NOTIFS = [
  { Icon: FiAlertTriangle, color: "#ef4444", title: "GPS Signal Lost",   sub: "WGN-101 · 2 min ago",  badge: "Critical", badgeClass: "badge-critical" },
  { Icon: FiMapPin,        color: "#f97316", title: "Route Deviation",   sub: "WGN-234 · 5 min ago",  badge: "High",     badgeClass: "badge-high" },
  { Icon: FiActivity,      color: "#f59e0b", title: "Maintenance Due",   sub: "WGN-555 · 12 min ago", badge: "Medium",   badgeClass: "badge-medium" },
  { Icon: FiBox,           color: "#3b82f6", title: "Cargo Overweight",  sub: "WGN-789 · 18 min ago", badge: "Low",      badgeClass: "badge-low" },
];

function useOutside(ref, cb) {
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  });
}

const Navbar = () => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const searchRef  = useRef(null);
  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useOutside(searchRef,  () => setShowSearch(false));
  useOutside(notifRef,   () => setShowNotif(false));
  useOutside(profileRef, () => setShowProfile(false));

  const results = query.length > 1
    ? SEARCH_INDEX.filter(d => `${d.label} ${d.sub}`.toLowerCase().includes(query.toLowerCase()))
    : [];

  const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = time.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const menuItem = (label, Icon, path, danger = false) => (
    <div key={label} onClick={() => { navigate(path); setShowProfile(false); }}
      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "11px 16px", cursor: "pointer", color: danger ? "#ef4444" : "#94a3b8", fontSize: "13px", transition: "background .15s" }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? "rgba(239,68,68,.08)" : "rgba(37,99,235,.1)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <Icon size={14} /> {label}
    </div>
  );

  return (
    <div style={{
      height: "64px", background: "#060e1e", borderBottom: "1px solid #0f2040",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 22px", flexShrink: 0, zIndex: 100, gap: "16px",
    }}>
      {/* Left: Title */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "16px", lineHeight: 1.2 }}>Indian Railways Command Center</div>
        <div style={{ color: "#3b82f6", fontSize: "11px", fontWeight: 500 }}>Real-Time Wagon Tracking &amp; AI Monitoring</div>
      </div>

      {/* Center: Search */}
      <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#0a1628", border: "1px solid #1a3356", borderRadius: "10px", padding: "8px 14px" }}>
          <FiSearch color="#3a5a7c" size={14} />
          <input value={query} onChange={e => { setQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)} placeholder="Search wagons, stations, routes…"
            style={{ background: "transparent", border: "none", outline: "none", color: "#f1f5f9", fontSize: "13px", width: "100%" }} />
          {query && <span onClick={() => { setQuery(""); setShowSearch(false); }} style={{ color: "#3a5a7c", cursor: "pointer", fontSize: "16px" }}>✕</span>}
        </div>
        {showSearch && results.length > 0 && (
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: "12px", overflow: "hidden", zIndex: 500, boxShadow: "0 12px 40px rgba(0,0,0,.5)" }}>
            {results.map((r, i) => (
              <div key={i} onClick={() => { navigate(r.path); setQuery(""); setShowSearch(false); }}
                style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #1a3356", transition: "background .15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,.12)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 600 }}>{r.label}</div>
                <div style={{ color: "#4a6fa5", fontSize: "11px" }}>{r.sub}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
        {/* Clock */}
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{timeStr}</div>
          <div style={{ color: "#4a6fa5", fontSize: "11px" }}>{dateStr}</div>
        </div>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button onClick={() => { setShowNotif(p => !p); setShowProfile(false); }}
            style={{ background: "rgba(37,99,235,.1)", border: "1px solid #1a3356", borderRadius: "10px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
            <FiBell color="#94a3b8" size={15} />
            <span style={{ position: "absolute", top: "7px", right: "7px", width: "7px", height: "7px", borderRadius: "50%", background: "#ef4444", border: "2px solid #060e1e" }} />
          </button>
          {showNotif && (
            <div style={{ position: "absolute", right: 0, top: "calc(100%+8px)", marginTop: "8px", width: "310px", background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: "14px", overflow: "hidden", zIndex: 500, boxShadow: "0 16px 48px rgba(0,0,0,.5)" }}>
              <div style={{ padding: "13px 16px", borderBottom: "1px solid #1a3356", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "14px" }}>Notifications</span>
                <span className="badge badge-critical">{NOTIFS.length} New</span>
              </div>
              {NOTIFS.map((n, i) => (
                <div key={i} style={{ padding: "12px 16px", borderBottom: "1px solid rgba(26,51,86,.4)", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,.07)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: `${n.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <n.Icon color={n.color} size={14} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: "#f1f5f9", fontSize: "13px", fontWeight: 600 }}>{n.title}</div>
                    <div style={{ color: "#4a6fa5", fontSize: "11px" }}>{n.sub}</div>
                  </div>
                  <span className={`badge ${n.badgeClass}`}>{n.badge}</span>
                </div>
              ))}
              <div style={{ padding: "10px 16px" }}>
                <button className="btn btn-ghost btn-sm w-full" style={{ width: "100%", justifyContent: "center" }} onClick={() => { navigate("/ai-alerts"); setShowNotif(false); }}>View All Alerts</button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <button onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
            style={{ display: "flex", alignItems: "center", gap: "9px", background: "rgba(37,99,235,.1)", border: "1px solid #1a3356", borderRadius: "10px", padding: "6px 11px 6px 7px", cursor: "pointer" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700 }}>A</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ color: "#f1f5f9", fontSize: "12px", fontWeight: 600 }}>Admin</div>
              <div style={{ color: "#4a6fa5", fontSize: "10px" }}>Super Admin</div>
            </div>
            <FiChevronDown color="#4a6fa5" size={12} />
          </button>
          {showProfile && (
            <div style={{ position: "absolute", right: 0, marginTop: "8px", width: "190px", background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: "14px", overflow: "hidden", zIndex: 500, boxShadow: "0 16px 48px rgba(0,0,0,.5)" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1a3356" }}>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "13px" }}>Admin User</div>
                <div style={{ color: "#4a6fa5", fontSize: "11px" }}>admin@railways.gov.in</div>
              </div>
              {menuItem("Profile",  FiUser,     "/settings")}
              {menuItem("Settings", FiSettings, "/settings")}
              <div style={{ borderTop: "1px solid #1a3356" }}>
                {menuItem("Logout", FiLogOut, "/login", true)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
