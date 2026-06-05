import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch, FiBell, FiChevronDown, FiUser, FiSettings,
  FiLogOut, FiAlertTriangle, FiMapPin, FiActivity, FiBox,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { useOperatorData } from "../context/OperatorDataContext";

const SEV_META = {
  Critical: { color:"#ef4444", Icon: FiAlertTriangle, badgeClass:"badge-critical" },
  High:     { color:"#f97316", Icon: FiMapPin,         badgeClass:"badge-high"     },
  Medium:   { color:"#f59e0b", Icon: FiActivity,        badgeClass:"badge-medium"   },
  Low:      { color:"#3b82f6", Icon: FiBox,             badgeClass:"badge-low"      },
};

function useOutside(ref, cb) {
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  });
}

const OperatorNavbar = () => {
  const navigate = useNavigate();
  const { operator, logoutOperator } = useAuth();
  const searchCtx = useSearch();
  const openSearch = searchCtx?.openSearch;
  const { alerts: liveAlerts } = useOperatorData();

  const [time,        setTime]        = useState(new Date());
  const [showNotif,   setShowNotif]   = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [readIds,     setReadIds]     = useState(new Set());
  const [dismissed,   setDismissed]   = useState(new Set());

  const notifs = liveAlerts
    .filter(a => !dismissed.has(a.id))
    .slice(0, 8)
    .map(a => ({ ...a, ...(SEV_META[a.severity] || SEV_META.Low), badge: a.severity, title: a.type, sub: `${a.wagon} · ${a.time}` }));

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = e => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); openSearch?.(); } };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [openSearch]);

  useOutside(notifRef,   () => setShowNotif(false));
  useOutside(profileRef, () => setShowProfile(false));

  const unreadCount = notifs.filter(n => !readIds.has(n.id)).length;
  const markRead    = id => setReadIds(p => new Set([...p, id]));
  const markAllRead = () => setReadIds(new Set(notifs.map(n => n.id)));
  const dismiss     = id => setDismissed(p => new Set([...p, id]));

  const timeStr = time.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
  const dateStr = time.toLocaleDateString("en-IN",  { weekday:"short", day:"numeric", month:"short", year:"numeric" });

  const handleLogout = () => { logoutOperator(); navigate("/login"); };

  const name = operator?.name || "Operator";
  const zone = operator?.zone || "—";

  return (
    <>
      <div style={{
        height:"64px", background:"#060e1e", borderBottom:"1px solid #0f2040",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 22px", flexShrink:0, zIndex:100, gap:"16px",
      }}>

        {/* Left: Title */}
        <div style={{ flexShrink:0 }}>
          <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:"16px", lineHeight:1.2 }}>
            Indian Railways Operator Portal
          </div>
          <div style={{ color:"var(--accent,#3b82f6)", fontSize:"11px", fontWeight:500 }}>
            Zone {zone} &mdash; {operator?.region || "Operations Center"}
          </div>
        </div>

        {/* Center: Search trigger */}
        <div
          onClick={() => openSearch?.()}
          style={{
            display:"flex", alignItems:"center", gap:10, flex:1, maxWidth:420,
            background:"#0a1628", border:"1px solid #1a3356", borderRadius:10,
            padding:"8px 14px", cursor:"pointer",
            transition:"border-color .15s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor="#2563eb"}
          onMouseLeave={e => e.currentTarget.style.borderColor="#1a3356"}
        >
          <FiSearch color="#3a5a7c" size={14} />
          <span style={{ color:"#3a5a7c", fontSize:"13px", flex:1 }}>
            Search wagons, alerts, cargo…
          </span>
          <span style={{ background:"#1a3356", color:"#4a6fa5", padding:"2px 7px", borderRadius:6, fontSize:10, fontWeight:700 }}>
            Ctrl K
          </span>
        </div>

        {/* Right */}
        <div style={{ display:"flex", alignItems:"center", gap:14, flexShrink:0 }}>

          {/* Clock */}
          <div style={{ textAlign:"right" }}>
            <div style={{ color:"#f1f5f9", fontSize:"13px", fontWeight:700, fontVariantNumeric:"tabular-nums" }}>{timeStr}</div>
            <div style={{ color:"#4a6fa5", fontSize:"11px" }}>{dateStr}</div>
          </div>

          {/* Notifications */}
          <div ref={notifRef} style={{ position:"relative" }}>
            <button
              onClick={() => { setShowNotif(p => !p); setShowProfile(false); }}
              style={{ background:"rgba(37,99,235,.1)", border:"1px solid #1a3356", borderRadius:10, width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", position:"relative" }}
            >
              <FiBell color="#94a3b8" size={15} />
              {unreadCount > 0 && (
                <span style={{ position:"absolute", top:"-4px", right:"-4px", minWidth:16, height:16, borderRadius:8, background:"#ef4444", border:"2px solid #060e1e", color:"#fff", fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotif && (
              <div style={{ position:"absolute", right:0, marginTop:8, width:320, background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:14, overflow:"hidden", zIndex:500, boxShadow:"0 16px 48px rgba(0,0,0,.5)" }}>
                <div style={{ padding:"13px 16px", borderBottom:"1px solid #1a3356", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>Notifications</span>
                    {unreadCount > 0 && <span className="badge badge-critical">{unreadCount} New</span>}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ background:"none", border:"none", color:"#3b82f6", fontSize:11, fontWeight:600, cursor:"pointer", padding:0 }}>
                      Mark all read
                    </button>
                  )}
                </div>

                {notifs.length === 0 ? (
                  <div style={{ padding:"24px 16px", textAlign:"center", color:"#4a6fa5", fontSize:13 }}>✓ All caught up!</div>
                ) : (
                  notifs.map(n => {
                    const isRead = readIds.has(n.id);
                    return (
                      <div key={n.id}
                        style={{ padding:"11px 16px", borderBottom:"1px solid rgba(26,51,86,.4)", display:"flex", alignItems:"center", gap:10, background: isRead ? "transparent" : "rgba(37,99,235,.05)" }}
                        onMouseEnter={e => e.currentTarget.style.background="rgba(37,99,235,.1)"}
                        onMouseLeave={e => e.currentTarget.style.background= isRead ? "transparent" : "rgba(37,99,235,.05)"}
                      >
                        <div style={{ width:6, height:6, borderRadius:"50%", background: isRead ? "transparent" : n.color, flexShrink:0 }} />
                        <div style={{ width:30, height:30, borderRadius:8, background:`${n.color}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, opacity: isRead ? 0.45 : 1 }}>
                          <n.Icon color={n.color} size={13} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ color: isRead ? "#64748b" : "#f1f5f9", fontSize:12, fontWeight: isRead ? 400 : 600 }}>{n.title}</div>
                          <div style={{ color:"#4a6fa5", fontSize:11 }}>{n.sub}</div>
                        </div>
                        {!isRead && <span className={`badge ${n.badgeClass}`} style={{ fontSize:10 }}>{n.badge}</span>}
                        <div style={{ display:"flex", flexDirection:"column", gap:3, flexShrink:0 }}>
                          {!isRead && (
                            <button onClick={e => { e.stopPropagation(); markRead(n.id); }}
                              style={{ background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.25)", borderRadius:5, padding:"2px 6px", color:"#22c55e", fontSize:10, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                              ✓ Read
                            </button>
                          )}
                          <button onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                            style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.2)", borderRadius:5, padding:"2px 6px", color:"#ef4444", fontSize:10, fontWeight:700, cursor:"pointer" }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}

                <div style={{ padding:"10px 16px", display:"flex", gap:8 }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex:1, justifyContent:"center" }}
                    onClick={() => { navigate("/operator/alerts"); setShowNotif(false); }}>
                    View All Alerts
                  </button>
                  {notifs.length > 0 && readIds.size === notifs.length && (
                    <button className="btn btn-ghost btn-sm" style={{ color:"#64748b" }}
                      onClick={() => { setDismissed(new Set(notifs.map(n=>n.id))); setReadIds(new Set()); }}>
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div ref={profileRef} style={{ position:"relative" }}>
            <button
              onClick={() => { setShowProfile(p => !p); setShowNotif(false); }}
              style={{ display:"flex", alignItems:"center", gap:9, background:"rgba(37,99,235,.1)", border:"1px solid #1a3356", borderRadius:10, padding:"6px 11px 6px 7px", cursor:"pointer" }}
            >
              <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700 }}>
                {name?.[0] || "O"}
              </div>
              <div style={{ textAlign:"left" }}>
                <div style={{ color:"#f1f5f9", fontSize:12, fontWeight:600 }}>{name}</div>
                <div style={{ color:"#4a6fa5", fontSize:10 }}>Zone {zone} &middot; Operator</div>
              </div>
              <FiChevronDown color="#4a6fa5" size={12} />
            </button>

            {showProfile && (
              <div style={{ position:"absolute", right:0, marginTop:8, width:220, background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:14, overflow:"hidden", zIndex:500, boxShadow:"0 16px 48px rgba(0,0,0,.5)" }}>
                <div style={{ padding:"12px 16px", borderBottom:"1px solid #1a3356" }}>
                  <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>{name}</div>
                  <div style={{ color:"#4a6fa5", fontSize:11, marginTop:2 }}>{operator?.email}</div>
                  <div style={{ marginTop:6 }}>
                    <span className="badge badge-info" style={{ fontSize:10 }}>Zone {zone}</span>
                    <span style={{ color:"#22c55e", fontSize:11, marginLeft:6, fontWeight:600 }}>{operator?.region || "Operations"}</span>
                  </div>
                </div>
                {[
                  { label:"My Dashboard", Icon:FiUser,     path:"/operator" },
                  { label:"Settings",     Icon:FiSettings, path:"/operator/settings" },
                ].map(({ label, Icon, path }) => (
                  <div key={label} onClick={() => { navigate(path); setShowProfile(false); }}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 16px", cursor:"pointer", color:"#94a3b8", fontSize:13 }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(37,99,235,.1)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <Icon size={14} /> {label}
                  </div>
                ))}
                <div style={{ borderTop:"1px solid #1a3356" }}>
                  <div onClick={() => setShowConfirm(true)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 16px", cursor:"pointer", color:"#ef4444", fontSize:13 }}
                    onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,.08)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <FiLogOut size={14} /> Logout
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" style={{ maxWidth:"360px", textAlign:"center" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:"36px", marginBottom:"12px" }}>🚪</div>
            <div className="modal-title" style={{ marginBottom:"8px" }}>Confirm Logout</div>
            <p style={{ color:"#64748b", fontSize:"13px", marginBottom:"24px" }}>
              You will be signed out of the Operator Portal and redirected to the Login page.
            </p>
            <div style={{ display:"flex", gap:"10px", justifyContent:"center" }}>
              <button className="btn btn-danger" onClick={handleLogout} style={{ flex:1, justifyContent:"center" }}>
                <FiLogOut size={13} /> Logout
              </button>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)} style={{ flex:1, justifyContent:"center" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OperatorNavbar;
