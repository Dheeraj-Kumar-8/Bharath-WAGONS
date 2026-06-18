import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiGrid, FiTrendingUp, FiMap, FiAlertTriangle,
  FiFileText, FiSearch, FiBell, FiChevronDown,
  FiUser, FiLogOut, FiSettings,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import AnalystChatBot from "./AnalystChatBot";
import { AnalyticsSearchProvider, useAnalyticsSearch } from "../context/AnalyticsSearchContext";
import AnalyticsSearchModal from "./AnalyticsSearchModal";
import "../styles/global.css";

const SpiderWebBg = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width  = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const smokes = Array.from({ length: 18 }, () => ({
      x: Math.random() * W, y: H + Math.random() * 120,
      r: 60 + Math.random() * 100, vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.15 + Math.random() * 0.25), alpha: 0.03 + Math.random() * 0.055,
    }));
    const nodes = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
      r: 1.2 + Math.random() * 1.6,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      smokes.forEach(s => {
        const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
        g.addColorStop(0,   `rgba(120,140,180,${s.alpha})`);
        g.addColorStop(0.5, `rgba(80,100,140,${s.alpha * 0.5})`);
        g.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        s.x += s.vx; s.y += s.vy; s.r += 0.12; s.alpha -= 0.00018;
        if (s.y + s.r < 0 || s.alpha <= 0) {
          s.x = Math.random() * W; s.y = H + Math.random() * 60;
          s.r = 60 + Math.random() * 100; s.alpha = 0.03 + Math.random() * 0.055;
          s.vx = (Math.random() - 0.5) * 0.3; s.vy = -(0.15 + Math.random() * 0.25);
        }
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 160) {
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(148,180,255,${(1 - dist/160)*0.35})`;
            ctx.lineWidth = 0.6; ctx.stroke();
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180,210,255,0.75)";
        ctx.shadowColor = "rgba(100,160,255,0.8)"; ctx.shadowBlur = 6;
        ctx.fill(); ctx.shadowBlur = 0;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", zIndex:0, opacity:0.72 }} />;
};

const NAV = [
  { icon: FiGrid,          label: "Dashboard",            to: "/analytics-dashboard" },
  { icon: FiTrendingUp,    label: "Performance Analytics", to: "/analytics-dashboard/performance" },
  { icon: FiMap,           label: "Zone Analytics",        to: "/analytics-dashboard/zone" },
  { icon: FiAlertTriangle, label: "Alert Analytics",       to: "/analytics-dashboard/alerts" },
  { icon: FiFileText,      label: "Reports",               to: "/analytics-dashboard/reports" },
];

const INIT_NOTIFS = [
  { id: 1, color: "#ef4444", title: "Critical: NR Zone Delay Spike",  sub: "18 wagons delayed · 3 min ago",  badge: "Critical", badgeClass: "badge-critical" },
  { id: 2, color: "#f59e0b", title: "Monthly Report Ready",            sub: "June 2025 analytics ready",       badge: "Info",     badgeClass: "badge-medium"   },
  { id: 3, color: "#3b82f6", title: "On-Time Rate Improved",           sub: "SR Zone +2.1% this week",         badge: "Good",     badgeClass: "badge-active"   },
];

function useOutside(ref, cb) {
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  });
}

const AnalyticsLayoutInner = ({ children, title, sub }) => {
  const navigate = useNavigate();
  const { analyst, logoutAnalyst } = useAuth();
  const searchCtx = useAnalyticsSearch();

  const [time,        setTime]        = useState(new Date());
  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notifs,      setNotifs]      = useState(INIT_NOTIFS);
  const [readIds,     setReadIds]     = useState(new Set());

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); searchCtx?.openSearch(); }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [searchCtx]);

  useOutside(notifRef,   () => setShowNotif(false));
  useOutside(profileRef, () => setShowProfile(false));

  const unread    = notifs.filter(n => !readIds.has(n.id)).length;
  const markRead  = id => setReadIds(p => new Set([...p, id]));
  const markAll   = () => setReadIds(new Set(notifs.map(n => n.id)));
  const dismiss   = id => setNotifs(p => p.filter(n => n.id !== id));
  const handleLogout = () => { logoutAnalyst(); navigate("/login"); };

  const timeStr = time.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = time.toLocaleDateString("en-IN",  { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  const name = analyst?.name || "Analytics User";
  const zone = analyst?.zone || "—";

  return (
    <div className="page-wrapper" style={{ flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

      {/* ── Sidebar — identical structure to Admin/Operator ── */}
      <div style={{
        width: "256px", minWidth: "256px", height: "100vh",
        background: "var(--bg)", borderRight: "1px solid var(--border-color)",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 18px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "20px", flexShrink: 0, boxShadow: "0 0 16px rgba(168,85,247,.4)",
          }}>📊</div>
          <div>
            <div style={{ color: "var(--text-strong,#f1f5f9)", fontWeight: 700, fontSize: "14px", lineHeight: 1.3 }}>Indian Railways</div>
            <div style={{ color: "#a855f7", fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>Analytics Center</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
          <div style={{ color: "var(--nav-label,#1e3a5f)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px", paddingLeft: "8px" }}>NAVIGATION</div>
          {NAV.map(({ icon: Icon, label, to }) => (
            <NavLink key={to} to={to} end={to === "/analytics-dashboard"}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "11px",
                padding: "10px 12px", marginBottom: "2px", borderRadius: "10px",
                textDecoration: "none", cursor: "pointer", transition: "all var(--transition,.18s)",
                background: isActive ? "rgba(168,85,247,.18)" : "transparent",
                color: isActive ? "#a855f7" : "var(--nav-item,#5a7a9e)",
                borderLeft: isActive ? "3px solid #a855f7" : "3px solid transparent",
                fontWeight: isActive ? 600 : 400, fontSize: "13px",
              })}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border-color)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="dot dot-green" />
            <span style={{ color: "#22c55e", fontSize: "12px", fontWeight: 600 }}>Analytics Active</span>
          </div>
          <div style={{ color: "var(--nav-footer-sub,#2a4a6e)", fontSize: "11px", marginBottom: "3px" }}>v2.4.1 · Real-Time Data</div>
          <div style={{ color: "var(--nav-footer-dim,#1a3356)", fontSize: "11px" }}>{analyst?.region || "Ministry of Railways"}</div>
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="main-area">

        {/* Navbar — identical structure to Admin/Operator */}
        <div style={{
          height: "64px", background: "var(--navbar-bg,#060e1e)", borderBottom: "1px solid var(--navbar-border,#0f2040)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 22px", flexShrink: 0, zIndex: 100, gap: "16px",
        }}>
          {/* Left */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ color: "var(--text-strong,#f1f5f9)", fontWeight: 700, fontSize: "16px", lineHeight: 1.2 }}>
              Analytics Dashboard
            </div>
            <div style={{ color: "#a855f7", fontSize: "11px", fontWeight: 500 }}>
              {analyst?.region || "Analytics Center"} &mdash; Zone {zone}
            </div>
          </div>

          {/* Center: Search */}
          <div
            onClick={() => searchCtx?.openSearch()}
            style={{
              display: "flex", alignItems: "center", gap: 10, flex: 1, maxWidth: 420,
              background: "var(--search-bg,#0a1628)", border: "1px solid var(--border-color,#1a3356)", borderRadius: 10,
              padding: "8px 14px", cursor: "pointer", transition: "border-color .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#a855f7"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-color,#1a3356)"; }}
          >
            <FiSearch color="var(--search-text,#3a5a7c)" size={14} />
            <span style={{ color: "var(--search-text,#3a5a7c)", fontSize: "13px", flex: 1 }}>Search zones, KPIs, reports, alerts…</span>
            <span style={{ background: "var(--kbd-bg,#1a3356)", color: "var(--kbd-text,#4a6fa5)", padding: "2px 7px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>Ctrl K</span>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>

            {/* Clock */}
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "var(--text-strong,#f1f5f9)", fontSize: "13px", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{timeStr}</div>
              <div style={{ color: "var(--text-muted,#4a6fa5)", fontSize: "11px" }}>{dateStr}</div>
            </div>

            {/* Notifications */}
            <div ref={notifRef} style={{ position: "relative" }}>
              <button onClick={() => { setShowNotif(p => !p); setShowProfile(false); }}
                style={{ background: "rgba(168,85,247,.1)", border: "1px solid var(--border-color,#1a3356)", borderRadius: 10, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative" }}>
                <FiBell color="#94a3b8" size={15} />
                {unread > 0 && (
                  <span style={{ position: "absolute", top: "-4px", right: "-4px", minWidth: 16, height: 16, borderRadius: 8, background: "#ef4444", border: "2px solid #060e1e", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>{unread}</span>
                )}
              </button>

              {showNotif && (
                <div style={{ position: "absolute", right: 0, marginTop: 8, width: 320, background: "var(--dropdown-bg,#0d1f3c)", border: "1px solid var(--border-color,#1a3356)", borderRadius: 14, overflow: "hidden", zIndex: 500, boxShadow: "0 16px 48px rgba(0,0,0,.3)" }}>
                  <div style={{ padding: "13px 16px", borderBottom: "1px solid var(--border-color,#1a3356)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: "var(--text-strong,#f1f5f9)", fontWeight: 700, fontSize: 14 }}>Notifications</span>
                      {unread > 0 && <span className="badge badge-critical">{unread} New</span>}
                    </div>
                    {unread > 0 && <button onClick={markAll} style={{ background: "none", border: "none", color: "#a855f7", fontSize: 11, fontWeight: 600, cursor: "pointer", padding: 0 }}>Mark all read</button>}
                  </div>
                  {notifs.length === 0
                    ? <div style={{ padding: "24px 16px", textAlign: "center", color: "#4a6fa5", fontSize: 13 }}>✓ All caught up!</div>
                    : notifs.map(n => {
                      const isRead = readIds.has(n.id);
                      return (
                        <div key={n.id} style={{ padding: "11px 16px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 10, background: isRead ? "transparent" : "rgba(168,85,247,.05)" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = isRead ? "transparent" : "rgba(168,85,247,.05)"; }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: isRead ? "transparent" : n.color, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: isRead ? "var(--text-muted)" : "var(--text-strong)", fontSize: 12, fontWeight: isRead ? 400 : 600 }}>{n.title}</div>
                            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>{n.sub}</div>
                          </div>
                          {!isRead && <span className={`badge ${n.badgeClass}`} style={{ fontSize: 10 }}>{n.badge}</span>}
                          <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
                            {!isRead && (
                              <button onClick={e => { e.stopPropagation(); markRead(n.id); }}
                                style={{ background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.25)", borderRadius: 5, padding: "2px 6px", color: "#22c55e", fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                                ✓ Read
                              </button>
                            )}
                            <button onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                              style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 5, padding: "2px 6px", color: "#ef4444", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })
                  }
                  <div style={{ padding: "10px 16px", display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }}
                      onClick={() => { navigate("/analytics-dashboard/alerts"); setShowNotif(false); }}>
                      View All Alerts
                    </button>
                    {notifs.length > 0 && readIds.size === notifs.length && (
                      <button className="btn btn-ghost btn-sm" style={{ color: "#64748b" }}
                        onClick={() => { setNotifs([]); setReadIds(new Set()); }}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <button onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
                style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(168,85,247,.1)", border: "1px solid var(--border-color,#1a3356)", borderRadius: 10, padding: "6px 11px 6px 7px", cursor: "pointer" }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#7c3aed,#a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
                  {name[0] || "A"}
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ color: "var(--text-strong,#f1f5f9)", fontSize: 12, fontWeight: 600 }}>{name}</div>
                  <div style={{ color: "var(--text-muted,#4a6fa5)", fontSize: 10 }}>Zone {zone} &middot; Analytics</div>
                </div>
                <FiChevronDown color="#4a6fa5" size={12} />
              </button>

              {showProfile && (
                <div style={{ position: "absolute", right: 0, marginTop: 8, width: 220, background: "var(--dropdown-bg,#0d1f3c)", border: "1px solid var(--border-color,#1a3356)", borderRadius: 14, overflow: "hidden", zIndex: 500, boxShadow: "0 16px 48px rgba(0,0,0,.3)" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color,#1a3356)" }}>
                    <div style={{ color: "var(--text-strong,#f1f5f9)", fontWeight: 700, fontSize: 13 }}>{name}</div>
                    <div style={{ color: "var(--text-muted,#4a6fa5)", fontSize: 11, marginTop: 2 }}>{analyst?.email}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className="badge badge-info" style={{ fontSize: 10 }}>Zone {zone}</span>
                      <span style={{ background: "rgba(168,85,247,.2)", color: "#a855f7", border: "1px solid rgba(168,85,247,.4)", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 700 }}>Analyst</span>
                    </div>
                  </div>
                  {[
                    { label: "Profile",  Icon: FiUser,     path: "/analytics-dashboard/settings?tab=Profile" },
                    { label: "Settings", Icon: FiSettings, path: "/analytics-dashboard/settings?tab=Theme"   },
                  ].map(({ label, Icon, path }) => (
                    <div key={label} onClick={() => { navigate(path); setShowProfile(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", color: "var(--text,#94a3b8)", fontSize: 13 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(168,85,247,.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      <Icon size={14} /> {label}
                    </div>
                  ))}
                  <div style={{ borderTop: "1px solid var(--border-color,#1a3356)" }}>
                    <div onClick={() => { setShowProfile(false); setShowConfirm(true); }}
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", cursor: "pointer", color: "#ef4444", fontSize: 13 }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,.08)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                      <FiLogOut size={14} /> Logout
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="content-area" style={{ position: "relative" }}>
          <SpiderWebBg />
          <div style={{ position: "relative", zIndex: 1 }}>
            {(title || sub) && (
              <div className="mb-20">
                {title && <div className="page-title">{title}</div>}
                {sub   && <div className="page-sub">{sub}</div>}
              </div>
            )}
            {children}
          </div>
        </div>
      </div>{/* end main-area */}

      </div>{/* end flex row */}

      <AnalystChatBot />
      <AnalyticsSearchModal />

      {/* Logout confirmation modal — matches Operator pattern */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" style={{ maxWidth: "360px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚪</div>
            <div className="modal-title" style={{ marginBottom: "8px" }}>Confirm Logout</div>
            <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>
              You will be signed out of the Analytics Dashboard and redirected to the Login page.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="btn btn-danger" onClick={handleLogout} style={{ flex: 1, justifyContent: "center" }}>
                <FiLogOut size={13} /> Logout
              </button>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)} style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AnalyticsLayout = ({ children, title, sub }) => (
  <AnalyticsSearchProvider>
    <AnalyticsLayoutInner title={title} sub={sub}>{children}</AnalyticsLayoutInner>
  </AnalyticsSearchProvider>
);

export default AnalyticsLayout;
