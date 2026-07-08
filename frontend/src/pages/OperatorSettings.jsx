import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiUser, FiBell, FiSun, FiSave, FiCheck, FiLock, FiShield,
  FiGlobe, FiSliders, FiFileText, FiCamera, FiSettings,
} from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";
import { useTheme, ACCENT_MAP, PRESET_THEMES, FONT_FAMILY_MAP, BORDER_RADIUS_MAP, CARD_STYLE_MAP, FULL_SCHEME_MAP } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { key:"Profile",      Icon:FiUser,     label:"Profile"               },
  { key:"Security",     Icon:FiShield,   label:"Security"              },
  { key:"Notifications",Icon:FiBell,     label:"Notifications"         },
  { key:"Theme",        Icon:FiSun,      label:"Theme"                 },
  { key:"Language",     Icon:FiGlobe,    label:"Language"              },
  { key:"Dashboard",    Icon:FiSliders,  label:"Dashboard Preferences" },
  { key:"Reports",      Icon:FiFileText, label:"Report Preferences"    },
];

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

const InfoBox = ({ label, value }) => (
  <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 14px" }}>
    <div style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 }}>{label}</div>
    <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{value || "—"}</div>
  </div>
);

export default function OperatorSettings() {
  const { theme: savedTheme, saveTheme } = useTheme();
  const { operator } = useAuth();
  const [searchParams] = useSearchParams();
  const fileRef = useRef(null);

  const [tab,    setTab]    = useState(searchParams.get("tab") || "Profile");
  const [saved,  setSaved]  = useState(false);
  const [avatar, setAvatar] = useState(null);

  const profile = {
    name:        operator?.name        || "Operator",
    email:       operator?.email       || "",
    employeeId:  operator?.employeeId  || "—",
    department:  operator?.department  || "—",
    designation: operator?.designation || "—",
    zone:        operator?.zone        || "—",
    shift:       operator?.shift       || "—",
    region:      operator?.region      || "—",
    phone:       "+91 98765 43210",
  };

  const [notifs,  setNotifs]  = useState({ gpsAlerts:true, cargoAlerts:true, maintenanceAlerts:true, emailNotifs:true, smsNotifs:false });
  const [theme,   setTheme]   = useState(savedTheme);
  const [lang,    setLang]    = useState({ language:"English", timezone:"IST (UTC+5:30)", dateFormat:"DD/MM/YYYY" });
  const [dash,    setDash]    = useState({ defaultZone:operator?.zone||"NR", autoRefresh:true, refreshInterval:"30", showAlertFeed:true, showKPICards:true });
  const [rptPref, setRptPref] = useState({ defaultFormat:"PDF", autoSchedule:false, scheduleTime:"07:00", includeCharts:true });

  const handleSave = () => {
    saveTheme(theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Live-preview theme changes instantly
  const handleThemeChange = (next) => {
    const merged = { ...theme, ...next };
    setTheme(merged);
    saveTheme(merged);
  };

  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveBtn = (
    <div style={{ marginTop:24, display:"flex", justifyContent:"flex-end" }}>
      <button className="btn btn-primary btn-lg" onClick={handleSave}>
        {saved ? <><FiCheck size={16}/> Saved!</> : <><FiSave size={16}/> Save Changes</>}
      </button>
    </div>
  );

  return (
    <OperatorLayout title="Settings" sub="Manage your profile, notifications, and display preferences">
      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:20 }}>

        {/* Tab sidebar */}
        <div className="card" style={{ padding:12, height:"fit-content" }}>
          {TABS.map(({ key, Icon, label }) => (
            <button key={key} onClick={() => setTab(key)} style={{
              display:"flex", alignItems:"center", gap:10, width:"100%",
              padding:"11px 14px", marginBottom:4, borderRadius:10, border:"none",
              cursor:"pointer", textAlign:"left", fontSize:13, transition:"all .15s",
              fontWeight: tab===key ? 700 : 400,
              background: tab===key ? "rgba(37,99,235,.18)" : "transparent",
              color:      tab===key ? "var(--accent,#60a5fa)" : "#64748b",
            }}>
              <Icon size={14}/>{label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="card">

          {/* ── Profile ── */}
          {tab === "Profile" && (
            <>
              <div className="section-title">Profile Information</div>

              {/* Avatar card */}
              <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, padding:16, background:"#071628", borderRadius:12, border:"1px solid #1a3356" }}>
                <div style={{ position:"relative", flexShrink:0 }}>
                  <div style={{ width:64, height:64, borderRadius:14, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:24, fontWeight:800, overflow:"hidden" }}>
                    {avatar
                      ? <img src={avatar} alt="avatar" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                      : (profile.name?.[0] || "O")}
                  </div>
                  <button onClick={() => fileRef.current?.click()}
                    title="Upload profile picture"
                    style={{ position:"absolute", bottom:-4, right:-4, width:24, height:24, borderRadius:"50%", background:"#2563eb", border:"2px solid #071628", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                    <FiCamera size={11} color="white"/>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange}/>
                </div>
                <div>
                  <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:16 }}>{profile.name}</div>
                  <div style={{ color:"#4a6fa5", fontSize:13 }}>{profile.email}</div>
                  <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                    <span className="badge badge-info"   style={{ fontSize:10 }}>Zone {profile.zone}</span>
                    <span className="badge badge-active" style={{ fontSize:10 }}>Operator</span>
                    {profile.shift && <span className="badge badge-medium" style={{ fontSize:10 }}>{profile.shift}</span>}
                  </div>
                </div>
              </div>

              {/* Identity info grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <InfoBox label="Full Name"   value={profile.name}/>
                <InfoBox label="Email"       value={profile.email}/>
                <InfoBox label="Role"        value="Operator"/>
                <InfoBox label="Employee ID" value={profile.employeeId}/>
                <InfoBox label="Department"  value={profile.department}/>
                <InfoBox label="Designation" value={profile.designation}/>
                <InfoBox label="Assigned Zone" value={profile.zone}/>
                <InfoBox label="Shift"       value={profile.shift}/>
                <InfoBox label="Region"      value={profile.region}/>
                <InfoBox label="Phone"       value={profile.phone}/>
              </div>

              <div style={{ background:"rgba(59,130,246,.07)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 14px", display:"flex", gap:8, alignItems:"flex-start" }}>
                <FiLock size={13} color="#3b82f6" style={{ flexShrink:0, marginTop:2 }}/>
                <span style={{ color:"#60a5fa", fontSize:12, lineHeight:1.6 }}>
                  Profile details are managed by your Zone Admin. To update name, email, or shift — contact your Zone Admin. To change your password, use the Security tab.
                </span>
              </div>
            </>
          )}

          {/* ── Security ── */}
          {tab === "Security" && (
            <>
              <div className="section-title">Security</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:"rgba(59,130,246,.07)", border:"1px solid rgba(59,130,246,.2)", borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <FiLock size={14} color="#3b82f6"/>
                    <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>Change Password</span>
                  </div>
                  <p style={{ color:"#94a3b8", fontSize:13, lineHeight:1.7, margin:0 }}>
                    Use the <strong style={{ color:"#60a5fa" }}>"Forgot password?"</strong> link on the Login page. A secure one-time reset link will be sent to your registered email — no plain-text password is ever sent.
                  </p>
                </div>
                <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.2)", borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <FiShield size={14} color="#22c55e"/>
                    <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>Role-Based Access Control</span>
                  </div>
                  <p style={{ color:"#94a3b8", fontSize:13, lineHeight:1.7, margin:"0 0 10px" }}>
                    Module access is controlled by your Zone Admin. Active permissions:
                  </p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {(operator?.permissions || []).map(p => (
                      <span key={p} className="badge badge-active" style={{ fontSize:11 }}>{p}</span>
                    ))}
                    {(!operator?.permissions?.length) && <span style={{ color:"#64748b", fontSize:12 }}>No modules assigned</span>}
                  </div>
                </div>
                <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <FiSettings size={14} color="#4a6fa5"/>
                    <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>Session Information</span>
                  </div>
                  {[
                    ["Operator ID",  operator?.id     || "—"],
                    ["Zone",         operator?.zone    || "—"],
                    ["Region",       operator?.region  || "—"],
                    ["Shift",        operator?.shift   || "—"],
                    ["Auth Method",  "Secure session token"],
                    ["Password",     "Hashed · never stored as plain text"],
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

          {/* ── Notifications ── */}
          {tab === "Notifications" && (
            <>
              <div className="section-title">Notification Preferences</div>
              {[
                { key:"gpsAlerts",         label:"GPS Alerts",          desc:"Get notified when wagon GPS signal is lost"  },
                { key:"cargoAlerts",       label:"Cargo Alerts",        desc:"Alerts for cargo temperature or seal issues"  },
                { key:"maintenanceAlerts", label:"Maintenance Alerts",  desc:"Upcoming or overdue maintenance tasks"        },
                { key:"emailNotifs",       label:"Email Notifications", desc:"Receive alert summaries via email"            },
                { key:"smsNotifs",         label:"SMS Notifications",   desc:"Receive critical alerts via SMS"              },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a3356" }}>
                  <div>
                    <div style={{ color:"#f1f5f9", fontSize:14, fontWeight:600 }}>{label}</div>
                    <div style={{ color:"#64748b", fontSize:12 }}>{desc}</div>
                  </div>
                  <Toggle val={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]:v }))}/>
                </div>
              ))}
              {saveBtn}
            </>
          )}

          {/* ── Theme ── */}
          {tab === "Theme" && (
            <>
              <div className="section-title">Display &amp; Theme</div>

              {/* Preset Themes */}
              <div style={{ marginBottom:24 }}>
                <div style={{ color:"#64748b", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:".5px", marginBottom:10 }}>Preset Themes</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
                  {Object.entries(PRESET_THEMES).map(([name, preset]) => {
                    const isActive = theme.colorScheme === preset.colorScheme && theme.accentColor === preset.accentColor && theme.cardStyle === preset.cardStyle;
                    const icons = { "Dark Mode":"🌙", "Light Mode":"☀️", "Railway Theme":<img src="/BW-iconic.png" style={{width:13,height:13,objectFit:"contain",verticalAlign:"middle",marginRight:3}}/>, "Corporate Theme":"🏢" };
                    return (
                      <button key={name} onClick={() => handleThemeChange(preset)} style={{
                        padding:"14px 10px", borderRadius:12, border:`2px solid ${isActive ? "var(--accent,#3b82f6)" : "#1a3356"}`,
                        background: isActive ? "rgba(37,99,235,.15)" : "#071628",
                        color: isActive ? "var(--accent,#60a5fa)" : "#94a3b8",
                        cursor:"pointer", textAlign:"center", transition:"all .15s",
                      }}>
                        <div style={{ fontSize:22, marginBottom:6 }}>{icons[name]}</div>
                        <div style={{ fontSize:12, fontWeight:700 }}>{name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Scheme */}
              <Field label="Color Scheme">
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {Object.keys(FULL_SCHEME_MAP).map(s => (
                    <div key={s} onClick={() => handleThemeChange({ colorScheme:s })}
                      style={{ padding:"10px 18px", borderRadius:10, cursor:"pointer", fontSize:13, fontWeight:600, transition:"all .15s",
                        border:`2px solid ${theme.colorScheme===s ? "var(--accent,#3b82f6)" : "#1a3356"}`,
                        background: theme.colorScheme===s ? "rgba(37,99,235,.15)" : "#071628",
                        color:      theme.colorScheme===s ? "var(--accent,#60a5fa)" : "#94a3b8",
                      }}>{s}</div>
                  ))}
                </div>
              </Field>

              {/* Primary & Secondary Color */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <Field label="Primary Color">
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <input type="color" value={theme.primaryColor || "#3b82f6"}
                      onChange={e => handleThemeChange({ primaryColor:e.target.value, accentColor:"Blue" })}
                      style={{ width:44, height:38, borderRadius:8, border:"1px solid #1a3356", background:"#071628", cursor:"pointer", padding:2 }}/>
                    <input className="form-input" value={theme.primaryColor || "#3b82f6"}
                      onChange={e => handleThemeChange({ primaryColor:e.target.value })}
                      style={{ flex:1 }} placeholder="#3b82f6"/>
                  </div>
                </Field>
                <Field label="Secondary Color">
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <input type="color" value={theme.secondaryColor || "#1d4ed8"}
                      onChange={e => handleThemeChange({ secondaryColor:e.target.value })}
                      style={{ width:44, height:38, borderRadius:8, border:"1px solid #1a3356", background:"#071628", cursor:"pointer", padding:2 }}/>
                    <input className="form-input" value={theme.secondaryColor || "#1d4ed8"}
                      onChange={e => handleThemeChange({ secondaryColor:e.target.value })}
                      style={{ flex:1 }} placeholder="#1d4ed8"/>
                  </div>
                </Field>
              </div>

              {/* Accent presets */}
              <Field label="Accent Color Preset">
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {Object.entries(ACCENT_MAP).map(([name, val]) => (
                    <div key={name} onClick={() => handleThemeChange({ accentColor:name, primaryColor:val.primary, secondaryColor:val.dark })}
                      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer" }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:val.primary, border: theme.accentColor===name ? "3px solid white" : "3px solid transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {theme.accentColor===name && <FiCheck color="white" size={16}/>}
                      </div>
                      <span style={{ color: theme.accentColor===name ? val.primary : "#64748b", fontSize:11, fontWeight:600 }}>{name}</span>
                    </div>
                  ))}
                </div>
              </Field>

              {/* Font Family & Size */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <Field label="Font Family">
                  <select className="form-select" value={theme.fontFamily || "System"}
                    onChange={e => handleThemeChange({ fontFamily:e.target.value })}>
                    {Object.keys(FONT_FAMILY_MAP).map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Font Size">
                  <select className="form-select" value={theme.fontSize} onChange={e => handleThemeChange({ fontSize:e.target.value })}>
                    {["Small","Medium","Large"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>

              {/* Card Style & Border Radius */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <Field label="Card Style">
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {Object.keys(CARD_STYLE_MAP).map(s => (
                      <div key={s} onClick={() => handleThemeChange({ cardStyle:s })}
                        style={{ padding:"8px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, transition:"all .15s", textTransform:"capitalize",
                          border:`2px solid ${theme.cardStyle===s ? "var(--accent,#3b82f6)" : "#1a3356"}`,
                          background: theme.cardStyle===s ? "rgba(37,99,235,.15)" : "#071628",
                          color:      theme.cardStyle===s ? "var(--accent,#60a5fa)" : "#94a3b8",
                        }}>{s}</div>
                    ))}
                  </div>
                </Field>
                <Field label="Border Radius">
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {Object.keys(BORDER_RADIUS_MAP).map(s => (
                      <div key={s} onClick={() => handleThemeChange({ borderRadius:s })}
                        style={{ padding:"8px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, transition:"all .15s", textTransform:"capitalize",
                          border:`2px solid ${theme.borderRadius===s ? "var(--accent,#3b82f6)" : "#1a3356"}`,
                          background: theme.borderRadius===s ? "rgba(37,99,235,.15)" : "#071628",
                          color:      theme.borderRadius===s ? "var(--accent,#60a5fa)" : "#94a3b8",
                        }}>{s}</div>
                    ))}
                  </div>
                </Field>
              </div>

              {[
                { label:"Compact Mode",      key:"compactMode",       desc:"Reduce spacing for more content density" },
                { label:"Enable Animations", key:"animationsEnabled", desc:"Smooth UI transitions and effects"        },
              ].map(({ label, key, desc }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a3356" }}>
                  <div>
                    <div style={{ color:"#f1f5f9", fontSize:14, fontWeight:600 }}>{label}</div>
                    <div style={{ color:"#64748b", fontSize:12 }}>{desc}</div>
                  </div>
                  <Toggle val={theme[key]} onChange={v => handleThemeChange({ [key]:v })}/>
                </div>
              ))}
              {saveBtn}
            </>
          )}

          {/* ── Language ── */}
          {tab === "Language" && (
            <>
              <div className="section-title">Language &amp; Regional Settings</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Interface Language">
                  <select className="form-select" value={lang.language} onChange={e => setLang(p => ({ ...p, language:e.target.value }))}>
                    {["English","Hindi","Tamil","Telugu","Kannada","Malayalam","Bengali","Marathi"].map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
                <Field label="Timezone">
                  <select className="form-select" value={lang.timezone} onChange={e => setLang(p => ({ ...p, timezone:e.target.value }))}>
                    <option>IST (UTC+5:30)</option>
                    <option>UTC</option>
                  </select>
                </Field>
                <Field label="Date Format">
                  <select className="form-select" value={lang.dateFormat} onChange={e => setLang(p => ({ ...p, dateFormat:e.target.value }))}>
                    {["DD/MM/YYYY","MM/DD/YYYY","YYYY-MM-DD"].map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>
              </div>
              {saveBtn}
            </>
          )}

          {/* ── Dashboard Preferences ── */}
          {tab === "Dashboard" && (
            <>
              <div className="section-title">Dashboard Preferences</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <Field label="Default Zone">
                  <select className="form-select" value={dash.defaultZone} onChange={e => setDash(p => ({ ...p, defaultZone:e.target.value }))}>
                    {["NR","CR","SR","ER","WR","SCR","SWR","NWR"].map(z => <option key={z}>{z}</option>)}
                  </select>
                </Field>
                <Field label="Auto Refresh Interval (sec)">
                  <input className="form-input" type="number" min="10" max="300"
                    value={dash.refreshInterval}
                    onChange={e => setDash(p => ({ ...p, refreshInterval:e.target.value }))}/>
                </Field>
              </div>
              {[
                { key:"showKPICards",  label:"Show KPI Cards",   desc:"Display summary KPI cards at top of dashboard" },
                { key:"showAlertFeed", label:"Show Alert Feed",   desc:"Display live alert feed panel"                 },
                { key:"autoRefresh",   label:"Auto Refresh Data", desc:"Automatically refresh dashboard data"          },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a3356" }}>
                  <div>
                    <div style={{ color:"#f1f5f9", fontSize:14, fontWeight:600 }}>{label}</div>
                    <div style={{ color:"#64748b", fontSize:12 }}>{desc}</div>
                  </div>
                  <Toggle val={dash[key]} onChange={v => setDash(p => ({ ...p, [key]:v }))}/>
                </div>
              ))}
              {saveBtn}
            </>
          )}

          {/* ── Report Preferences ── */}
          {tab === "Reports" && (
            <>
              <div className="section-title">Report Preferences</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
                <Field label="Default Export Format">
                  <select className="form-select" value={rptPref.defaultFormat} onChange={e => setRptPref(p => ({ ...p, defaultFormat:e.target.value }))}>
                    {["PDF","Excel","CSV"].map(f => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Scheduled Report Time">
                  <input className="form-input" type="time" value={rptPref.scheduleTime}
                    onChange={e => setRptPref(p => ({ ...p, scheduleTime:e.target.value }))}/>
                </Field>
              </div>
              {[
                { key:"includeCharts", label:"Include Charts in PDF", desc:"Embed visual charts in exported PDF reports"  },
                { key:"autoSchedule",  label:"Auto-Schedule Daily",   desc:"Automatically generate reports each morning"  },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a3356" }}>
                  <div>
                    <div style={{ color:"#f1f5f9", fontSize:14, fontWeight:600 }}>{label}</div>
                    <div style={{ color:"#64748b", fontSize:12 }}>{desc}</div>
                  </div>
                  <Toggle val={rptPref[key]} onChange={v => setRptPref(p => ({ ...p, [key]:v }))}/>
                </div>
              ))}
              {saveBtn}
            </>
          )}

        </div>
      </div>
    </OperatorLayout>
  );
}
