import { useState } from "react";
import { FiUser, FiSettings, FiBell, FiSun, FiSave, FiCheck } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";

const TAB_ICONS = { Profile:FiUser, System:FiSettings, Notifications:FiBell, Theme:FiSun };

const Settings = () => {
  const [tab, setTab] = useState("Profile");
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({ name:"Admin User", email:"admin@railways.gov.in", phone:"+91 98765 43210", zone:"All Zones", role:"Super Admin" });
  const [system,  setSystem]  = useState({ timezone:"IST (UTC+5:30)", language:"English", gpsRefresh:"5", dataRetention:"90", autoBackup:true, maintenanceMode:false });
  const [notifs,  setNotifs]  = useState({ gpsAlerts:true, routeDeviation:true, maintenanceAlerts:true, cargoAlerts:true, systemAlerts:true, emailNotifs:true, smsNotifs:false, dailyReport:true });
  const [theme,   setTheme]   = useState({ colorScheme:"Dark Navy", accentColor:"Blue", fontSize:"Medium", compactMode:false, animationsEnabled:true });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ val, onChange }) => (
    <div onClick={() => onChange(!val)}
      style={{ width:44, height:24, borderRadius:12, background: val ? "#2563eb" : "#1a3356", cursor:"pointer", position:"relative", transition:"background .2s", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left: val ? 23 : 3, width:18, height:18, borderRadius:"50%", background:"white", transition:"left .2s" }} />
    </div>
  );

  const Field = ({ label, children }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {children}
    </div>
  );

  return (
    <DashboardLayout title="Settings" sub="Configure system preferences, profile, and notifications">
      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr", gap:"20px" }}>
        {/* Tab Sidebar */}
        <div className="card" style={{ padding:"12px", height:"fit-content" }}>
          {Object.keys(TAB_ICONS).map(t => {
            const Icon = TAB_ICONS[t];
            return (
              <button key={t} onClick={() => setTab(t)}
                style={{ display:"flex", alignItems:"center", gap:"10px", width:"100%", padding:"11px 14px", marginBottom:"4px", borderRadius:"10px", border:"none", cursor:"pointer", textAlign:"left", fontSize:"13px", fontWeight: tab===t ? 700 : 400, background: tab===t ? "rgba(37,99,235,.18)" : "transparent", color: tab===t ? "#60a5fa" : "#64748b", transition:"all .15s" }}>
                <Icon size={15} />{t}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="card">
          {/* Profile */}
          {tab === "Profile" && (
            <>
              <div className="section-title">Profile Settings</div>
              <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"24px", padding:"16px", background:"#071628", borderRadius:"12px", border:"1px solid #1a3356" }}>
                <div style={{ width:60, height:60, borderRadius:"14px", background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:24, fontWeight:800 }}>A</div>
                <div>
                  <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:"16px" }}>{profile.name}</div>
                  <div style={{ color:"#4a6fa5", fontSize:"13px" }}>{profile.email}</div>
                  <span className="badge badge-critical" style={{ marginTop:6 }}>{profile.role}</span>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <Field label="Full Name"><input className="form-input" value={profile.name}  onChange={e=>setProfile(p=>({...p,name:e.target.value}))} /></Field>
                <Field label="Email Address"><input className="form-input" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} /></Field>
                <Field label="Phone Number"><input className="form-input" value={profile.phone} onChange={e=>setProfile(p=>({...p,phone:e.target.value}))} /></Field>
                <Field label="Zone">
                  <select className="form-select" value={profile.zone} onChange={e=>setProfile(p=>({...p,zone:e.target.value}))}>
                    {["All Zones","NR","CR","SR","ER","WR","SCR"].map(z=><option key={z}>{z}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Current Password"><input className="form-input" type="password" placeholder="Enter current password" /></Field>
              <Field label="New Password"><input className="form-input" type="password" placeholder="Enter new password" /></Field>
            </>
          )}

          {/* System */}
          {tab === "System" && (
            <>
              <div className="section-title">System Settings</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <Field label="Timezone">
                  <select className="form-select" value={system.timezone} onChange={e=>setSystem(p=>({...p,timezone:e.target.value}))}>
                    <option>IST (UTC+5:30)</option><option>UTC</option>
                  </select>
                </Field>
                <Field label="Language">
                  <select className="form-select" value={system.language} onChange={e=>setSystem(p=>({...p,language:e.target.value}))}>
                    <option>English</option><option>Hindi</option>
                  </select>
                </Field>
                <Field label="GPS Refresh Interval (sec)">
                  <input className="form-input" type="number" value={system.gpsRefresh} onChange={e=>setSystem(p=>({...p,gpsRefresh:e.target.value}))} />
                </Field>
                <Field label="Data Retention (days)">
                  <input className="form-input" type="number" value={system.dataRetention} onChange={e=>setSystem(p=>({...p,dataRetention:e.target.value}))} />
                </Field>
              </div>
              {[
                { label:"Auto Backup",       key:"autoBackup"      },
                { label:"Maintenance Mode",  key:"maintenanceMode" },
              ].map(({ label, key }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a3356" }}>
                  <div>
                    <div style={{ color:"#f1f5f9", fontSize:"14px", fontWeight:600 }}>{label}</div>
                    <div style={{ color:"#64748b", fontSize:"12px" }}>{key === "autoBackup" ? "Automatic daily backups" : "Enable for system maintenance"}</div>
                  </div>
                  <Toggle val={system[key]} onChange={v=>setSystem(p=>({...p,[key]:v}))} />
                </div>
              ))}
            </>
          )}

          {/* Notifications */}
          {tab === "Notifications" && (
            <>
              <div className="section-title">Notification Settings</div>
              {[
                { label:"GPS Alerts",           key:"gpsAlerts",         desc:"Alert when GPS signal is lost"        },
                { label:"Route Deviation",       key:"routeDeviation",    desc:"Alert on route deviation detection"   },
                { label:"Maintenance Alerts",    key:"maintenanceAlerts", desc:"Alert for upcoming maintenance"       },
                { label:"Cargo Alerts",          key:"cargoAlerts",       desc:"Alert for cargo issues"               },
                { label:"System Alerts",         key:"systemAlerts",      desc:"Critical system notifications"        },
                { label:"Email Notifications",   key:"emailNotifs",       desc:"Receive alerts via email"             },
                { label:"SMS Notifications",     key:"smsNotifs",         desc:"Receive alerts via SMS"               },
                { label:"Daily Report",          key:"dailyReport",       desc:"Receive daily summary report"         },
              ].map(({ label, key, desc }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a3356" }}>
                  <div>
                    <div style={{ color:"#f1f5f9", fontSize:"14px", fontWeight:600 }}>{label}</div>
                    <div style={{ color:"#64748b", fontSize:"12px" }}>{desc}</div>
                  </div>
                  <Toggle val={notifs[key]} onChange={v=>setNotifs(p=>({...p,[key]:v}))} />
                </div>
              ))}
            </>
          )}

          {/* Theme */}
          {tab === "Theme" && (
            <>
              <div className="section-title">Theme Settings</div>
              <Field label="Color Scheme">
                <div style={{ display:"flex", gap:"10px" }}>
                  {["Dark Navy","Dark","Midnight"].map(s => (
                    <div key={s} onClick={() => setTheme(p=>({...p,colorScheme:s}))}
                      style={{ padding:"10px 18px", borderRadius:"10px", cursor:"pointer", border:`2px solid ${theme.colorScheme===s?"#3b82f6":"#1a3356"}`, background: theme.colorScheme===s?"rgba(37,99,235,.15)":"#071628", color: theme.colorScheme===s?"#60a5fa":"#94a3b8", fontSize:13, fontWeight:600 }}>
                      {s}
                    </div>
                  ))}
                </div>
              </Field>
              <Field label="Accent Color">
                <div style={{ display:"flex", gap:"10px" }}>
                  {[["Blue","#3b82f6"],["Green","#22c55e"],["Purple","#8b5cf6"],["Cyan","#06b6d4"]].map(([name,color]) => (
                    <div key={name} onClick={() => setTheme(p=>({...p,accentColor:name}))}
                      style={{ width:36, height:36, borderRadius:"10px", background:color, cursor:"pointer", border: theme.accentColor===name?"3px solid white":"3px solid transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {theme.accentColor===name && <FiCheck color="white" size={16} />}
                    </div>
                  ))}
                </div>
              </Field>
              <Field label="Font Size">
                <select className="form-select" value={theme.fontSize} onChange={e=>setTheme(p=>({...p,fontSize:e.target.value}))}>
                  {["Small","Medium","Large"].map(s=><option key={s}>{s}</option>)}
                </select>
              </Field>
              {[
                { label:"Compact Mode",       key:"compactMode",        desc:"Reduce spacing for more content density" },
                { label:"Enable Animations",  key:"animationsEnabled",  desc:"Smooth UI transitions and animations"     },
              ].map(({ label, key, desc }) => (
                <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 0", borderBottom:"1px solid #1a3356" }}>
                  <div>
                    <div style={{ color:"#f1f5f9", fontSize:"14px", fontWeight:600 }}>{label}</div>
                    <div style={{ color:"#64748b", fontSize:"12px" }}>{desc}</div>
                  </div>
                  <Toggle val={theme[key]} onChange={v=>setTheme(p=>({...p,[key]:v}))} />
                </div>
              ))}
            </>
          )}

          {/* Save Button */}
          <div style={{ marginTop:"24px", display:"flex", justifyContent:"flex-end" }}>
            <button className="btn btn-primary btn-lg" onClick={handleSave}>
              {saved ? <><FiCheck size={16} /> Saved!</> : <><FiSave size={16} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
