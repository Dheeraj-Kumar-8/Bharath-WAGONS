import { useState } from "react";
import { FiUser, FiSettings, FiBell, FiSun, FiSave, FiCheck, FiLock, FiShield } from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";
import { useTheme, ACCENT_MAP, SCHEME_MAP } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const TAB_ICONS = { Profile:FiUser, Notifications:FiBell, Theme:FiSun, Security:FiShield };

export default function OperatorSettings() {
  const { theme: savedTheme, saveTheme } = useTheme();
  const { operator } = useAuth();

  const [tab,   setTab]   = useState("Profile");
  const [saved, setSaved] = useState(false);

  const [profile] = useState({
    name:        operator?.name        || "Operator",
    email:       operator?.email       || "",
    employeeId:  operator?.employeeId  || "—",
    department:  operator?.department  || "—",
    designation: operator?.designation || "—",
    zone:        operator?.zone        || "—",
    shift:       operator?.shift       || "—",
    region:      operator?.region      || "—",
  });

  const [notifs, setNotifs] = useState({
    gpsAlerts:     true,
    cargoAlerts:   true,
    maintenanceAlerts: true,
    emailNotifs:   true,
    smsNotifs:     false,
  });

  const [theme, setTheme] = useState(savedTheme);

  const handleSave = () => {
    saveTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ val, onChange }) => (
    <div onClick={() => onChange(!val)}
      style={{ width:44, height:24, borderRadius:12, background: val ? "var(--accent,#2563eb)" : "#1a3356", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left: val ? 23 : 3, width:18, height:18, borderRadius:"50%", background:"white", transition:"left .2s" }}/>
    </div>
  );

  const Field = ({ label, children }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );

  return (
    <OperatorLayout title="Settings" sub="Manage your profile, notifications, and display preferences">
      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:20 }}>

        {/* Tab sidebar */}
        <div className="card" style={{ padding:12, height:"fit-content" }}>
          {Object.entries(TAB_ICONS).map(([t, Icon]) => (
            <button key={t} onClick={() => setTab(t)}
              style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"11px 14px", marginBottom:4, borderRadius:10, border:"none", cursor:"pointer", textAlign:"left", fontSize:13,
                fontWeight: tab===t ? 700 : 400,
                background: tab===t ? "rgba(37,99,235,.18)" : "transparent",
                color:      tab===t ? "var(--accent,#60a5fa)" : "#64748b",
                transition:"all .15s",
              }}>
              <Icon size={15}/>{t}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="card">

          {/* ── Profile ── */}
          {tab === "Profile" && (
            <>
              <div className="section-title">Profile Information</div>

              {/* Avatar row */}
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, padding:16, background:"#071628", borderRadius:12, border:"1px solid #1a3356" }}>
                <div style={{ width:56, height:56, borderRadius:14, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:22, fontWeight:800, flexShrink:0 }}>
                  {profile.name?.[0] || "O"}
                </div>
                <div>
                  <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:16 }}>{profile.name}</div>
                  <div style={{ color:"#4a6fa5", fontSize:13 }}>{profile.email}</div>
                  <div style={{ display:"flex", gap:6, marginTop:6 }}>
                    <span className="badge badge-info"   style={{ fontSize:10 }}>Zone {profile.zone}</span>
                    <span className="badge badge-active" style={{ fontSize:10 }}>Operator</span>
                    {profile.shift && <span className="badge badge-medium" style={{ fontSize:10 }}>{profile.shift}</span>}
                  </div>
                </div>
              </div>

              {/* Read-only identity fields */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                {[
                  ["Full Name",    profile.name],
                  ["Email",        profile.email],
                  ["Employee ID",  profile.employeeId],
                  ["Designation",  profile.designation],
                  ["Department",   profile.department],
                  ["Zone",         profile.zone],
                  ["Shift",        profile.shift],
                  ["Region",       profile.region],
                ].map(([label, value]) => (
                  <div key={label} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 14px" }}>
                    <div style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 }}>{label}</div>
                    <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{value || "—"}</div>
                  </div>
                ))}
              </div>

              <div style={{ background:"rgba(59,130,246,.07)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-start" }}>
                <FiLock size={13} color="#3b82f6" style={{ flexShrink:0, marginTop:2 }}/>
                <span style={{ color:"#60a5fa", fontSize:12, lineHeight:1.6 }}>
                  Profile details are managed by your Zone Admin. To update your name, email, or shift, contact your Zone Admin. To change your password, use the Security tab or click "Forgot password" on the Login page.
                </span>
              </div>
            </>
          )}

          {/* ── Notifications ── */}
          {tab === "Notifications" && (
            <>
              <div className="section-title">Notification Preferences</div>
              {[
                { label:"GPS Alerts",          key:"gpsAlerts",          desc:"Get notified when wagon GPS signal is lost"    },
                { label:"Cargo Alerts",        key:"cargoAlerts",        desc:"Alerts for cargo temperature or seal issues"   },
                { label:"Maintenance Alerts",  key:"maintenanceAlerts",  desc:"Upcoming or overdue maintenance tasks"         },
                { label:"Email Notifications", key:"emailNotifs",        desc:"Receive alert summaries via email"             },
                { label:"SMS Notifications",   key:"smsNotifs",          desc:"Receive critical alerts via SMS"               },
              ].map(({ label, key, desc }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a3356" }}>
                  <div>
                    <div style={{ color:"#f1f5f9", fontSize:14, fontWeight:600 }}>{label}</div>
                    <div style={{ color:"#64748b", fontSize:12 }}>{desc}</div>
                  </div>
                  <Toggle val={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]:v }))}/>
                </div>
              ))}
            </>
          )}

          {/* ── Theme ── */}
          {tab === "Theme" && (
            <>
              <div className="section-title">Display &amp; Theme</div>

              <Field label="Color Scheme">
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {Object.keys(SCHEME_MAP).map(s => (
                    <div key={s} onClick={() => setTheme(p => ({ ...p, colorScheme:s }))}
                      style={{ padding:"10px 18px", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600, transition:"all .15s",
                        border:`2px solid ${theme.colorScheme===s ? "var(--accent,#3b82f6)" : "#1a3356"}`,
                        background: theme.colorScheme===s ? "rgba(37,99,235,.15)" : "#071628",
                        color:      theme.colorScheme===s ? "var(--accent,#60a5fa)" : "#94a3b8",
                      }}>
                      {s}
                    </div>
                  ))}
                </div>
              </Field>

              <Field label="Accent Color">
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {Object.entries(ACCENT_MAP).map(([name, val]) => (
                    <div key={name} onClick={() => setTheme(p => ({ ...p, accentColor:name }))}
                      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer" }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:val.primary, border: theme.accentColor===name ? "3px solid white" : "3px solid transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {theme.accentColor===name && <FiCheck color="white" size={16}/>}
                      </div>
                      <span style={{ color: theme.accentColor===name ? val.primary : "#64748b", fontSize:11, fontWeight:600 }}>{name}</span>
                    </div>
                  ))}
                </div>
              </Field>

              <Field label="Font Size">
                <select className="form-select" value={theme.fontSize} onChange={e => setTheme(p => ({ ...p, fontSize:e.target.value }))}>
                  {["Small","Medium","Large"].map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>

              {[
                { label:"Compact Mode",      key:"compactMode",       desc:"Reduce spacing for more content density" },
                { label:"Enable Animations", key:"animationsEnabled", desc:"Smooth UI transitions and effects"       },
              ].map(({ label, key, desc }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a3356" }}>
                  <div>
                    <div style={{ color:"#f1f5f9", fontSize:14, fontWeight:600 }}>{label}</div>
                    <div style={{ color:"#64748b", fontSize:12 }}>{desc}</div>
                  </div>
                  <Toggle val={theme[key]} onChange={v => setTheme(p => ({ ...p, [key]:v }))}/>
                </div>
              ))}
            </>
          )}

          {/* ── Security ── */}
          {tab === "Security" && (
            <>
              <div className="section-title">Security</div>

              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {/* Password reset info */}
                <div style={{ background:"rgba(59,130,246,.07)", border:"1px solid rgba(59,130,246,.2)", borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <FiLock size={14} color="#3b82f6"/>
                    <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>Change Password</span>
                  </div>
                  <p style={{ color:"#94a3b8", fontSize:13, lineHeight:1.7, margin:0 }}>
                    To change your password, use the <strong style={{ color:"#60a5fa" }}>"Forgot password?"</strong> link on the Login page.
                    A secure one-time reset link will be sent to your registered email — no plain-text password is ever sent.
                  </p>
                </div>

                {/* RBAC info */}
                <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)", borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <FiShield size={14} color="#22c55e"/>
                    <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>Role-Based Access Control</span>
                  </div>
                  <p style={{ color:"#94a3b8", fontSize:13, lineHeight:1.7, margin:"0 0 10px" }}>
                    Your module access is controlled by your Zone Admin. Currently active permissions:
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {(operator?.permissions || []).map(p => (
                      <span key={p} className="badge badge-active" style={{ fontSize:11 }}>{p}</span>
                    ))}
                    {(!operator?.permissions || operator.permissions.length === 0) && (
                      <span style={{ color:"#64748b", fontSize:12 }}>No modules assigned</span>
                    )}
                  </div>
                </div>

                {/* Session info */}
                <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <FiSettings size={14} color="#4a6fa5"/>
                    <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>Session Information</span>
                  </div>
                  {[
                    ["Operator ID",  operator?.id        || "—"],
                    ["Zone",         operator?.zone       || "—"],
                    ["Region",       operator?.region     || "—"],
                    ["Shift",        operator?.shift      || "—"],
                    ["Auth Method",  "Secure session token"],
                    ["Password",     "Hashed (never stored as plain text)"],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(26,51,86,.5)" }}>
                      <span style={{ color:"#64748b", fontSize:12 }}>{k}</span>
                      <span style={{ color:"#f1f5f9", fontSize:12, fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Save button — only for Theme and Notifications tabs */}
          {(tab === "Theme" || tab === "Notifications") && (
            <div style={{ marginTop:24, display:"flex", justifyContent:"flex-end" }}>
              <button className="btn btn-primary btn-lg" onClick={handleSave}>
                {saved ? <><FiCheck size={16}/> Saved!</> : <><FiSave size={16}/> Save Changes</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </OperatorLayout>
  );
}
