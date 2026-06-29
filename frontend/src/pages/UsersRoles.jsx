import { useState, useEffect } from "react";
import {
  FiUsers, FiShield, FiPlus, FiEdit2, FiTrash2, FiX,
  FiSearch, FiLock, FiUnlock, FiCheck,
  FiAlertTriangle, FiClock, FiActivity, FiCheckCircle,
  FiSlash, FiEye, FiLink,
  FiKey, FiUserX, FiUserCheck,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { useAuth, ALL_PERMISSIONS } from "../context/AuthContext";
import { api } from "../utils/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
const SHIFTS          = ["Shift A","Shift B","Shift C"];
const DEPARTMENTS     = ["Operations","Logistics","Maintenance","Cargo","Safety","IT","Administration"];
const ANL_DEPARTMENTS = ["Analytics","Data Science","Reporting","Business Intelligence","IT","Administration"];

const accountStatusBadge = (s) => {
  const map = {
    active:              { cls:"badge-active",   label:"Active"          },
    pending_activation:  { cls:"badge-medium",   label:"Pending Activation" },
    suspended:           { cls:"badge-high",     label:"Suspended"       },
    deactivated:         { cls:"badge-critical", label:"Deactivated"     },
  };
  const m = map[s] || { cls:"badge-info", label:s };
  return <span className={`badge ${m.cls}`}>{m.label}</span>;
};

function Toast({ msg, ok = true }) {
  if (!msg) return null;
  return (
    <div style={{ position:"fixed", top:20, right:24, background: ok ? "#16a34a" : "#dc2626", color:"#fff", padding:"12px 20px", borderRadius:10, fontWeight:600, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,.4)", display:"flex", alignItems:"center", gap:8, maxWidth:480 }}>
      {ok ? <FiCheckCircle size={14}/> : <FiAlertTriangle size={14}/>}
      {msg}
    </div>
  );
}

// ── Activation Link Modal ─────────────────────────────────────────────────────
function ActivationLinkModal({ link, name, role, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(link).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const isAnl = role === "Analyst";
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>Activation Email Dispatched</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>

        <div style={{ background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.25)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ color:"#22c55e", fontWeight:700, fontSize:13, marginBottom:4 }}>✓ Account created for {name}</div>
          <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.6 }}>
            A secure activation email has been <strong>automatically sent</strong> to the {isAnl ? "analyst's" : "operator's"} registered @railway.gov.in address.
            They must click the link to set their own password.
          </div>
        </div>

        <div style={{ background:"rgba(34,197,94,.06)", border:"1px solid rgba(34,197,94,.15)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ color:"#22c55e", fontSize:12, fontWeight:700, marginBottom:4 }}>📧 Email Sent (Simulated)</div>
          <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
            Subject: "Your {isAnl ? "Analyst" : "Operator"} access has been approved"<br/>
            Recipient: {isAnl ? "Analyst" : "Operator"} — {name}<br/>
            Link valid for <strong style={{ color:"#60a5fa" }}>72 hours</strong> · Single-use · Permanently invalidated after activation<br/>
            <strong style={{ color:"#ef4444" }}>No password is ever included in this email.</strong>
          </div>
        </div>

        <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ color:"#64748b", fontSize:11, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Simulated Activation Link (valid 72h)</div>
          <div style={{ color: isAnl ? "#c084fc" : "#60a5fa", fontSize:12, wordBreak:"break-all", lineHeight:1.6 }}>{link}</div>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center", ...(isAnl ? { background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none" } : {}) }} onClick={copy}>
            {copied ? <><FiCheck size={13}/> Copied!</> : <><FiLink size={13}/> Copy Link</>}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Link Modal ──────────────────────────────────────────────────────────
function ResetLinkModal({ link, name, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(link).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:500 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>Password Reset Link</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>

        <div style={{ background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ color:"#60a5fa", fontWeight:700, fontSize:13, marginBottom:4 }}><FiLock size={13} style={{ marginRight:6 }}/>Password Reset for {name}</div>
          <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.6 }}>
            A secure one-time reset link has been generated. The operator must click it to create a new password. <strong style={{ color:"#ef4444" }}>No password is ever sent.</strong>
          </div>
        </div>

        <div style={{ background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ color:"#f59e0b", fontSize:12, fontWeight:700, marginBottom:4 }}>📧 Email Workflow (Simulated)</div>
          <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
            Subject: "Password Reset Request"<br/>
            Body: "Click the secure link below to reset your password. This link expires in 1 hour."<br/>
            <strong style={{ color:"#ef4444" }}>No password is ever included.</strong>
          </div>
        </div>

        <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ color:"#64748b", fontSize:11, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Secure Reset Link (valid 1h)</div>
          <div style={{ color:"#60a5fa", fontSize:12, wordBreak:"break-all", lineHeight:1.6 }}>{link}</div>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={copy}>
            {copied ? <><FiCheck size={13}/> Copied!</> : <><FiLink size={13}/> Copy Link</>}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Create/Edit Analyst Modal ─────────────────────────────────────────────────
function AnalystModal({ anl, adminZone, onSave, onClose }) {
  const isEdit = !!anl;
  const [form, setForm] = useState(isEdit ? {
    name:anl.name, email:anl.email, employeeId:anl.employeeId||"",
    department:anl.department||"Analytics", designation:anl.designation||"",
    zone:anl.zone, status:anl.status,
  } : {
    name:"", email:"", employeeId:"", department:"Analytics", designation:"",
    zone:adminZone, status:"Active",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));
  const valid = form.name.trim() && form.email.trim();
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:540, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>{isEdit ? "Edit Analyst" : "Create Analyst Account"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>
        {!isEdit && (
          <div style={{ background:"rgba(168,85,247,.08)", border:"1px solid rgba(168,85,247,.2)", borderRadius:10, padding:"10px 14px", marginBottom:14, display:"flex", gap:8 }}>
            <FiLock size={13} color="#a855f7" style={{ flexShrink:0, marginTop:2 }}/>
            <span style={{ color:"#c084fc", fontSize:12, lineHeight:1.6 }}>No password required. A secure activation link will be generated for the analyst to set their own password.</span>
          </div>
        )}
        <div style={{ background:"rgba(168,85,247,.06)", border:"1px solid rgba(168,85,247,.2)", borderRadius:10, padding:"10px 14px", marginBottom:14, display:"flex", gap:8, alignItems:"center" }}>
          <FiShield size={13} color="#a855f7"/>
          <span style={{ color:"#c084fc", fontSize:12, fontWeight:600 }}>Role: Analytics &amp; Reporting — read-only analytics data access</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="e.g. Priya Sharma" value={form.name} onChange={e => set("name", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="analyst@railways.gov.in" value={form.email} onChange={e => set("email", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Employee ID</label>
            <input className="form-input" placeholder="EMP-ANL-NR-042" value={form.employeeId} onChange={e => set("employeeId", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Designation</label>
            <input className="form-input" placeholder="Senior Analyst" value={form.designation} onChange={e => set("designation", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Department</label>
            <select className="form-select" value={form.department} onChange={e => set("department", e.target.value)}>
              {ANL_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Assigned Zone</label>
            <input className="form-input" value={form.zone} readOnly
              style={{ opacity:.6, cursor:"not-allowed" }}/>
          </div>
        </div>
        {isEdit && (
          <div className="form-group" style={{ marginTop:12, marginBottom:0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
              <option>Active</option><option>Inactive</option>
            </select>
          </div>
        )}
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center", background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none" }} disabled={!valid} onClick={() => onSave(form)}>
            {isEdit ? "Update Analyst" : <><FiLink size={13}/> Create &amp; Get Activation Link</>}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Analyst Log Modal ─────────────────────────────────────────────────────────
function AnalystLogModal({ anl, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div className="modal-title" style={{ margin:0 }}>Audit Log — {anl.name}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>
        <div style={{ maxHeight:340, overflowY:"auto", display:"flex", flexDirection:"column", gap:5 }}>
          {(anl.activityLog||[]).length === 0
            ? <div style={{ color:"#4a6fa5", textAlign:"center", padding:32 }}>No activity recorded yet.</div>
            : (anl.activityLog||[]).map((l, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"9px 12px", background:"#071628", borderRadius:8, borderLeft:"3px solid #7c3aed" }}>
                <FiClock size={12} color="#a855f7" style={{ marginTop:2, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ color:"#cbd5e1", fontSize:12, fontWeight:600 }}>{l.action}</div>
                  <div style={{ color:"#4a6fa5", fontSize:11, marginTop:2 }}>{l.at}</div>
                </div>
              </div>
            ))
          }
        </div>
        <button className="btn btn-outline" style={{ marginTop:16, width:"100%", justifyContent:"center" }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ── Create Operator Modal (no password field) ─────────────────────────────────
function OperatorModal({ op, adminZone, onSave, onClose }) {
  const isEdit = !!op;
  const [form, setForm] = useState(isEdit ? {
    name:op.name, email:op.email, employeeId:op.employeeId||"",
    department:op.department||"Operations", designation:op.designation||"",
    shift:op.shift, status:op.status, permissions:[...op.permissions],
  } : {
    name:"", email:"", employeeId:"", department:"Operations", designation:"",
    shift:"Shift A", status:"Active", permissions:ALL_PERMISSIONS.map(p => p.key),
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));
  const togglePerm = (key) => set("permissions", form.permissions.includes(key) ? form.permissions.filter(p => p !== key) : [...form.permissions, key]);
  const valid = form.name.trim() && form.email.trim();

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:560, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>{isEdit ? "Edit Operator" : "Create Operator Account"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>

        {!isEdit && (
          <div style={{ background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.2)", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", gap:8 }}>
            <FiLock size={13} color="#22c55e" style={{ flexShrink:0, marginTop:2 }}/>
            <span style={{ color:"#22c55e", fontSize:12, lineHeight:1.6 }}>
              No password required. A secure activation link will be generated for the operator to set their own password.
            </span>
          </div>
        )}

        <div style={{ background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
          <FiLock size={13} color="#3b82f6"/>
          <span style={{ color:"#60a5fa", fontSize:12, fontWeight:600 }}>Zone locked to your region: {adminZone}</span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="e.g. Rajan Verma" value={form.name} onChange={e => set("name", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Email *</label>
            <input className="form-input" type="email" placeholder="operator@railways.gov.in" value={form.email} onChange={e => set("email", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Employee ID</label>
            <input className="form-input" placeholder="EMP-NR-042" value={form.employeeId} onChange={e => set("employeeId", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Designation</label>
            <input className="form-input" placeholder="Senior Operator" value={form.designation} onChange={e => set("designation", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Department</label>
            <select className="form-select" value={form.department} onChange={e => set("department", e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Shift</label>
            <select className="form-select" value={form.shift} onChange={e => set("shift", e.target.value)}>
              {SHIFTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {isEdit && (
          <div className="form-group" style={{ marginTop:12, marginBottom:0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
              <option>Active</option><option>Inactive</option>
            </select>
          </div>
        )}

        <div style={{ marginTop:16 }}>
          <div style={{ color:"#64748b", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Module Permissions</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {ALL_PERMISSIONS.map(p => {
              const on = form.permissions.includes(p.key);
              return (
                <div key={p.key} onClick={() => togglePerm(p.key)}
                  style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, cursor:"pointer", border:`1px solid ${on ? "rgba(59,130,246,.3)" : "#1a3356"}`, background: on ? "rgba(59,130,246,.08)" : "transparent", transition:"all .15s" }}>
                  <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${on ? "#3b82f6" : "#2a4a6e"}`, background: on ? "#3b82f6" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {on && <FiCheck size={10} color="#fff"/>}
                  </div>
                  <span style={{ color: on ? "#60a5fa" : "#64748b", fontSize:12, fontWeight: on ? 600 : 400 }}>{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} disabled={!valid} onClick={() => onSave({ ...form, zone:adminZone })}>
            {isEdit ? "Update Operator" : <><FiLink size={13}/> Create & Get Activation Link</>}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Approve Request Modal ─────────────────────────────────────────────────────
function ApproveModal({ req, onApprove, onClose }) {
  const isAnalyst = req.role === "Analyst";
  const [perms, setPerms] = useState(ALL_PERMISSIONS.map(p => p.key));
  const toggle = key => setPerms(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key]);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>Approve Request — {req.name}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>

        <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:14, marginBottom:16 }}>
          {[
            ["Email",        req.email],
            ["Requested Role", req.role || "Operator"],
            ["Employee ID",  req.employeeId  || "—"],
            ["Department",   req.department  || "—"],
            ["Designation",  req.designation || "—"],
            ["Zone",         req.zone],
            ["Shift",        req.shift],
            ["Requested",    req.requestedAt],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(26,51,86,.4)" }}>
              <span style={{ color:"#64748b", fontSize:12 }}>{k}</span>
              <span style={{ color: k==="Requested Role" ? (isAnalyst ? "#a855f7" : "#60a5fa") : "#f1f5f9", fontSize:12, fontWeight:600 }}>{v}</span>
            </div>
          ))}
          {req.note && <div style={{ color:"#94a3b8", fontSize:11, marginTop:8, fontStyle:"italic" }}>{req.note}</div>}
        </div>

        <div style={{ background: isAnalyst ? "rgba(168,85,247,.08)" : "rgba(34,197,94,.08)", border: isAnalyst ? "1px solid rgba(168,85,247,.2)" : "1px solid rgba(34,197,94,.2)", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", gap:8 }}>
          <FiLock size={13} color={isAnalyst ? "#a855f7" : "#22c55e"} style={{ flexShrink:0, marginTop:2 }}/>
          <span style={{ color: isAnalyst ? "#c084fc" : "#22c55e", fontSize:12, lineHeight:1.6 }}>
            {isAnalyst
              ? "Approving will create an Analyst account and automatically send a secure activation email to the applicant's @railway.gov.in address."
              : "Approving will create the Operator account and automatically send a secure activation email to the applicant's @railway.gov.in address. No password will be generated or emailed."}
          </span>
        </div>

        {!isAnalyst && (
          <>
            <div style={{ color:"#64748b", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Grant Module Permissions</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:20 }}>
              {ALL_PERMISSIONS.map(p => {
                const on = perms.includes(p.key);
                return (
                  <div key={p.key} onClick={() => toggle(p.key)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 11px", borderRadius:9, cursor:"pointer", border:`1px solid ${on ? "rgba(59,130,246,.3)" : "#1a3356"}`, background: on ? "rgba(59,130,246,.08)" : "transparent" }}>
                    <div style={{ width:15, height:15, borderRadius:4, border:`2px solid ${on ? "#3b82f6" : "#2a4a6e"}`, background: on ? "#3b82f6" : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {on && <FiCheck size={9} color="#fff"/>}
                    </div>
                    <span style={{ color: on ? "#60a5fa" : "#64748b", fontSize:11, fontWeight: on ? 600 : 400 }}>{p.label}</span>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button
            className="btn btn-success"
            style={{ flex:1, justifyContent:"center", ...(isAnalyst ? { background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none" } : {}) }}
            onClick={() => onApprove(isAnalyst ? [] : perms)}
          >
            <FiCheckCircle size={13}/> Approve & Generate Activation Link
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Change Role Modal ───────────────────────────────────────────────────────────────
function ChangeRoleModal({ user, onSave, onClose }) {
  const [role, setRole] = useState(user.role || "operator");
  const userName = user.name || user.username || "this user";
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:360 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>Change Role</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>
        <p style={{ color:"#94a3b8", fontSize:12, marginBottom:16 }}>
          Changing role for <strong style={{ color:"#f1f5f9" }}>{userName}</strong>.
        </p>
        <div className="form-group" style={{ margin:0, marginBottom:20 }}>
          <label className="form-label">Role</label>
          <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
            <option value="operator">Operator</option>
            <option value="analyst">Analyst</option>
          </select>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} disabled={role === user.role} onClick={() => onSave(role)}>
            <FiCheck size={13}/> Save Role
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Status Modal (Suspend / Reactivate) ─────────────────────────────
function ConfirmStatusModal({ user, action, onConfirm, onClose }) {
  const isSuspend = action === "suspend";
  const userName  = user.name || user.username || "this user";
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:380 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div className="modal-title" style={{ margin:0 }}>{isSuspend ? "Suspend User" : "Reactivate User"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>
        <p style={{ color:"#94a3b8", marginBottom:24, fontSize:13 }}>
          {isSuspend
            ? <>Are you sure you want to suspend <strong style={{ color:"#f1f5f9" }}>{userName}</strong>? They will lose access immediately.</>
            : <>Are you sure you want to reactivate <strong style={{ color:"#f1f5f9" }}>{userName}</strong>? They will regain access immediately.</>
          }
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <button
            className="btn btn-sm"
            style={{ flex:1, justifyContent:"center", background: isSuspend ? "rgba(245,158,11,.15)" : "rgba(34,197,94,.15)", color: isSuspend ? "#f59e0b" : "#22c55e", border:`1px solid ${isSuspend ? "rgba(245,158,11,.3)" : "rgba(34,197,94,.3)"}` }}
            onClick={onConfirm}
          >
            {isSuspend ? <><FiUserX size={12}/> Suspend</> : <><FiUserCheck size={12}/> Reactivate</>}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit User Modal (backend) ───────────────────────────────────────────────
function EditUserModal({ user, onSave, onClose }) {
  const displayName = user.name || user.username || "";
  const [form, setForm] = useState({
    name:   displayName,
    zone:   user.zone   || "",
    status: user.status || "active",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const valid = form.name.trim();
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:420 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>Edit User</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Full Name *</label>
            <input className="form-input" value={form.name} onChange={e => set("name", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Zone</label>
            <input className="form-input" value={form.zone} onChange={e => set("zone", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
              <option value="active">Active</option>
              <option value="pending_activation">Pending Activation</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} disabled={!valid} onClick={() => onSave(form)}>
            <FiCheck size={13}/> Save Changes
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Activity Log Modal ────────────────────────────────────────────────────────
function LogModal({ op, onClose }) {
  const [view, setView] = useState("activity");
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:560 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div className="modal-title" style={{ margin:0 }}>Audit Logs — {op.name}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>

        <div style={{ display:"flex", gap:4, marginBottom:16, background:"rgba(0,0,0,.2)", borderRadius:10, padding:4 }}>
          {[["activity","Activity Log"],["login","Login History"]].map(([k,l]) => (
            <button key={k} onClick={() => setView(k)} style={{ flex:1, padding:"7px 0", border:"none", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700, background: view===k ? "#1d4ed8" : "transparent", color: view===k ? "#fff" : "#64748b" }}>{l}</button>
          ))}
        </div>

        {view === "activity" && (
          <div style={{ maxHeight:340, overflowY:"auto", display:"flex", flexDirection:"column", gap:5 }}>
            {(op.activityLog||[]).length === 0
              ? <div style={{ color:"#4a6fa5", textAlign:"center", padding:32 }}>No activity recorded yet.</div>
              : (op.activityLog||[]).map((l, i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"9px 12px", background:"#071628", borderRadius:8, borderLeft:"3px solid #1a3356" }}>
                  <FiClock size={12} color="#4a6fa5" style={{ marginTop:2, flexShrink:0 }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ color:"#cbd5e1", fontSize:12, fontWeight:600 }}>{l.action}</div>
                    <div style={{ color:"#4a6fa5", fontSize:11, marginTop:2 }}>{l.at}{l.ip && l.ip !== "—" ? ` · IP: ${l.ip}` : ""}</div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {view === "login" && (
          <div style={{ maxHeight:340, overflowY:"auto", display:"flex", flexDirection:"column", gap:5 }}>
            {(op.loginHistory||[]).length === 0
              ? <div style={{ color:"#4a6fa5", textAlign:"center", padding:32 }}>No login history recorded.</div>
              : (op.loginHistory||[]).map((l, i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"9px 12px", background: l.success ? "rgba(34,197,94,.05)" : "rgba(239,68,68,.05)", borderRadius:8, borderLeft:`3px solid ${l.success ? "#22c55e" : "#ef4444"}` }}>
                  {l.success
                    ? <FiCheckCircle size={12} color="#22c55e" style={{ flexShrink:0 }}/>
                    : <FiX          size={12} color="#ef4444" style={{ flexShrink:0 }}/>
                  }
                  <div style={{ flex:1 }}>
                    <div style={{ color: l.success ? "#22c55e" : "#ef4444", fontSize:12, fontWeight:600 }}>
                      {l.success ? "Successful Login" : "Failed Login Attempt"}
                    </div>
                    <div style={{ color:"#4a6fa5", fontSize:11 }}>{l.at}{l.ip && l.ip !== "—" ? ` · IP: ${l.ip}` : ""}</div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        <button className="btn btn-outline" style={{ marginTop:16, width:"100%", justifyContent:"center" }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const UsersRoles = () => {
  const {
    admin, operators, requests,
    adminCreateOperator, adminUpdateOperator,
    adminSuspendOperator,
    adminDeactivateOperator, adminReactivateOperator, adminUnlockOperator,
    adminResetPassword, adminApproveRequest, adminRejectRequest,
    adminDeleteOperator, adminResendActivation,
    analystUsers,
    adminCreateAnalyst, adminUpdateAnalyst, adminDeleteAnalyst,
    adminSuspendAnalyst, adminDeactivateAnalyst, adminReactivateAnalyst,
    adminResetAnalystPassword, adminResendAnalystActivation,
  } = useAuth();

  const myZone   = admin?.zone || "NR";
  const zoneReqs = requests.filter(r => r.zone === myZone);
  const pending  = zoneReqs.filter(r => r.status === "Pending");

  // ── Backend API state ─────────────────────────────────────────────────────
  const [dbUsers,   setDbUsers]   = useState([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError,   setDbError]   = useState(null);

  useEffect(() => {
    setDbLoading(true);
    api.getUsers()
      .then(res => { setDbUsers(res.users || []); setDbError(null); })
      .catch(err => setDbError(err.message))
      .finally(() => setDbLoading(false));
  }, []);

  const dbOperators = dbUsers.filter(u => u.role === "operator");
  const dbAnalysts  = dbUsers.filter(u => u.role === "analyst");

  // Zone-filtered for table display — removed zone gate so all backend users render
  // regardless of which zone the admin account is assigned to.
  // The zone badge in each row still shows the user's zone clearly.
  const zoneOps      = dbOperators;
  const zoneAnalysts = dbAnalysts;

  const [tab,           setTab]         = useState("operators");
  const [query,         setQuery]        = useState("");
  const [statusF,       setStatusF]      = useState("All");
  const [createOpen,    setCreate]       = useState(false);
  const [editTarget,    setEdit]         = useState(null);
  const [delTarget,     setDel]          = useState(null);
  const [logTarget,     setLog]          = useState(null);
  const [approveReq,    setApprove]      = useState(null);
  const [activLink,     setActivLink]    = useState(null);
  const [resetLink,     setResetLink]    = useState(null);
  const [toast,         setToast]        = useState({ msg:"", ok:true });
  const [anlQuery,      setAnlQuery]     = useState("");
  const [anlStatusF,    setAnlStatusF]   = useState("All");
  const [anlCreateOpen, setAnlCreate]    = useState(false);
  const [anlEditTarget, setAnlEdit]      = useState(null);
  const [anlDelTarget,  setAnlDel]       = useState(null);
  const [anlLogTarget,  setAnlLog]       = useState(null);
  const [anlActivLink,  setAnlActivLink] = useState(null);
  const [anlResetLink,  setAnlResetLink] = useState(null);
  const [dbEditTarget,  setDbEdit]       = useState(null);
  const [statusTarget,  setStatusTarget] = useState(null); // { user, action: 'suspend'|'reactivate' }
  const [dbDeleteTarget, setDbDelete]     = useState(null);
  const [roleTarget,     setRoleTarget]   = useState(null);

  const refreshUsers = () => {
    api.getUsers()
      .then(res => { setDbUsers(res.users || []); })
      .catch(() => {});
  };

  const handleDbEdit = (form) => {
    api.updateUser(dbEditTarget._id, { name: form.name, zone: form.zone, status: form.status })
      .then(() => {
        setDbEdit(null);
        refreshUsers();
        showToast(`✓ "${form.name}" updated successfully.`);
      })
      .catch(err => showToast(`Failed to update: ${err.message}`, false));
  };

  const handleStatusConfirm = () => {
    const { user, action } = statusTarget;
    const newStatus = action === "suspend" ? "suspended" : "active";
    const userName  = user.name || user.username || "User";
    api.patchUserStatus(user._id, newStatus)
      .then(() => {
        setStatusTarget(null);
        refreshUsers();
        showToast(action === "suspend" ? `${userName} suspended.` : `✓ ${userName} reactivated.`, action !== "suspend");
      })
      .catch(err => showToast(`Failed: ${err.message}`, false));
  };

  const handleDbDelete = () => {
    const userName = dbDeleteTarget.name || dbDeleteTarget.username || "User";
    api.deleteUser(dbDeleteTarget._id)
      .then(() => {
        setDbDelete(null);
        refreshUsers();
        showToast(`✓ "${userName}" deleted successfully.`);
      })
      .catch(err => {
        setDbDelete(null);
        showToast(err.message || "Failed to delete user.", false);
      });
  };

  const handleRoleSave = (newRole) => {
    const userName = roleTarget.name || roleTarget.username || "User";
    api.patchUserRole(roleTarget._id, newRole)
      .then(() => {
        setRoleTarget(null);
        refreshUsers();
        showToast(`✓ "${userName}" role changed to ${newRole}.`);
      })
      .catch(err => showToast(err.message || "Failed to change role.", false));
  };

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast({ msg:"", ok:true }), 3200); };

  const filtered = zoneOps.filter(o => {
    const matchStatus = statusF === "All" || o.status === statusF.toLowerCase();
    const matchQuery  = `${o.name} ${o.email} ${o._id || ""}`.toLowerCase().includes(query.toLowerCase());
    return matchStatus && matchQuery;
  });
  // Handlers
  const handleCreate = (form) => {
    const result = adminCreateOperator(form);
    setCreate(false);
    setActivLink({ link: result.activationLink, name: result.name, role: "Operator" });
    showToast(`Account created for "${result.name}". Activation link ready.`);
  };

  const handleEdit = (form) => {
    const changes = { name:form.name, email:form.email, employeeId:form.employeeId, department:form.department, designation:form.designation, shift:form.shift, status:form.status, permissions:form.permissions };
    adminUpdateOperator(editTarget.id, changes);
    setEdit(null);
    showToast(`✓ "${form.name}" updated.`);
  };

  const handleSuspend    = (op) => { adminSuspendOperator(op.id);    showToast(`${op.name} suspended.`, false); };
  const handleDeactivate = (op) => { adminDeactivateOperator(op.id); showToast(`${op.name} deactivated.`, false); };
  const handleReactivate = (op) => { adminReactivateOperator(op.id); showToast(`✓ ${op.name} reactivated.`); };
  const handleUnlock     = (op) => { adminUnlockOperator(op.id);     showToast(`✓ ${op.name}'s account unlocked.`); };

  const handleResetPassword = (op) => {
    const result = adminResetPassword(op.id);
    setResetLink({ link: result.resetLink, name: op.name });
    showToast(`✓ Reset link generated for ${op.name}.`);
  };

  const handleResendActivation = async (op) => {
    const result = await adminResendActivation(op.id);
    setActivLink({ link: result.activationLink, name: op.name, role: "Operator" });
    showToast(`✓ New activation link generated for ${op.name}.`);
  };

  const handleDelete = () => {
    adminDeleteOperator(delTarget.id);
    setDel(null);
    showToast(`✓ "${delTarget.name}" removed.`);
  };

  const handleApprove = async (perms) => {
    const isAnalyst = approveReq.role === "Analyst";
    const result = await adminApproveRequest(approveReq.id, perms, admin?.name || "Zone Admin");
    setApprove(null);
    const link = result.activationLink;
    const name = result.name;
    if (isAnalyst) {
      setAnlActivLink({ link, name, role: "Analyst" });
    } else {
      setActivLink({ link, name, role: "Operator" });
    }
    showToast(`✓ Approved. Activation email dispatched to "${name}".`);
  };

  const handleReject = (req) => {
    adminRejectRequest(req.id, admin?.name || "Zone Admin");
    showToast(`Request from "${req.name}" rejected.`, false);
  };

  const handlePermToggle = (opId, key) => {
    const op = operators.find(o => o.id === opId);
    if (!op) return;
    const perms = op.permissions.includes(key) ? op.permissions.filter(p => p !== key) : [...op.permissions, key];
    adminUpdateOperator(opId, { permissions: perms });
  };

  // Analyst handlers
  const handleAnlCreate = (form) => {
    const result = adminCreateAnalyst({ ...form, zone: myZone, region: `${myZone} Railway` });
    setAnlCreate(false);
    setAnlActivLink({ link: result.activationLink, name: result.name, role: "Analyst" });
    showToast(`✓ Analyst account created for "${result.name}". Activation link ready.`);
  };
  const handleAnlEdit = (form) => {
    adminUpdateAnalyst(anlEditTarget.id, { name:form.name, email:form.email, employeeId:form.employeeId, department:form.department, designation:form.designation, zone:myZone, status:form.status });
    setAnlEdit(null);
    showToast(`✓ "${form.name}" updated.`);
  };
  const handleAnlSuspend    = (a) => { adminSuspendAnalyst(a.id);    showToast(`${a.name} suspended.`, false); };
  const handleAnlDeactivate = (a) => { adminDeactivateAnalyst(a.id); showToast(`${a.name} deactivated.`, false); };
  const handleAnlReactivate = (a) => { adminReactivateAnalyst(a.id); showToast(`✓ ${a.name} reactivated.`); };
  const handleAnlDelete = () => { adminDeleteAnalyst(anlDelTarget.id); setAnlDel(null); showToast(`✓ "${anlDelTarget.name}" removed.`); };
  const handleAnlResetPassword = (a) => {
    const result = adminResetAnalystPassword(a.id);
    setAnlResetLink({ link: result.resetLink, name: a.name });
    showToast(`✓ Reset link generated for ${a.name}.`);
  };
  const handleAnlResendActivation = async (a) => {
    const result = await adminResendAnalystActivation(a.id);
    setAnlActivLink({ link: result.activationLink, name: a.name, role: "Analyst" });
    showToast(`✓ New activation link for ${a.name}.`);
  };

  const anlFiltered = zoneAnalysts.filter(a => {
    const matchStatus = anlStatusF === "All" || a.status === anlStatusF.toLowerCase();
    const matchQuery  = `${a.name} ${a.email} ${a._id || ""}`.toLowerCase().includes(anlQuery.toLowerCase());
    return matchStatus && matchQuery;
  });

  const TABS = [
    { key:"operators", label:"Operators", count:zoneOps.length      },
    { key:"analysts",  label:"Analysts",  count:zoneAnalysts.length },
  ];

  const isLocked = (op) => op.lockedUntil && Date.now() < op.lockedUntil;

  return (
    <DashboardLayout title="User Management" sub={`Zone ${myZone} — ${admin?.name||""} · Operators & Analysts RBAC`}>

      <Toast msg={toast.msg} ok={toast.ok}/>

      {/* Zone banner */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:12, padding:"12px 18px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <FiLock size={14} color="#3b82f6"/>
          <span style={{ color:"#60a5fa", fontSize:13, fontWeight:600 }}>Zone <strong>{myZone}</strong> — you can only manage operators and analysts in your zone.</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span className="badge badge-info" style={{ fontSize:10 }}>🔒 No plain-text passwords</span>
          <span className="badge badge-active">Admin: {admin?.name}</span>
        </div>
      </div>

      {/* DB fetch status */}
      {dbLoading && (
        <div style={{ background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 16px", marginBottom:14, color:"#60a5fa", fontSize:12 }}>
          Loading users from database…
        </div>
      )}
      {dbError && (
        <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:10, padding:"10px 16px", marginBottom:14, color:"#ef4444", fontSize:12 }}>
          Failed to load users: {dbError}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard title="Total Operators"  value={dbLoading ? "…" : dbOperators.length}                                    color="#3b82f6" icon={FiUsers}    />
        <StatCard title="Active Operators" value={dbLoading ? "…" : dbOperators.filter(u => u.status === "active").length} color="#22c55e" icon={FiShield}   />
        <StatCard title="Total Analysts"   value={dbLoading ? "…" : dbAnalysts.length}                                     color="#a855f7" icon={FiActivity} />
        <StatCard title="Active Analysts"  value={dbLoading ? "…" : dbAnalysts.filter(u => u.status === "active").length}  color="#22c55e" icon={FiShield}   />
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:"rgba(0,0,0,.2)", borderRadius:12, padding:4, border:"1px solid #1a3356" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex:1, padding:"9px 0", border:"none", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700, transition:"all .2s", position:"relative",
              background: tab===t.key ? "#1d4ed8" : "transparent",
              color:       tab===t.key ? "#fff"    : "#64748b",
              boxShadow:   tab===t.key ? "0 2px 12px rgba(37,99,235,.4)" : "none",
            }}>
            {t.label}
            {t.alert && t.count > 0 && (
              <span style={{ position:"absolute", top:4, right:8, width:16, height:16, background:"#ef4444", borderRadius:"50%", fontSize:9, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: Analysts ── */}
      {tab === "analysts" && (
        <>
          <div style={{ display:"flex", gap:12, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
            <div className="search-box" style={{ flex:1 }}>
              <FiSearch size={14} color="#4a6fa5"/>
              <input value={anlQuery} onChange={e => setAnlQuery(e.target.value)} placeholder="Search by name, email, ID…"/>
            </div>
            <select className="form-select" style={{ width:"auto", padding:"8px 12px" }} value={anlStatusF} onChange={e => setAnlStatusF(e.target.value)}>
              {["All","Active","Inactive","pending_activation","suspended","deactivated"].map(s => (
                <option key={s} value={s}>{s==="All"?"All Statuses":s==="pending_activation"?"Pending Activation":s.charAt(0).toUpperCase()+s.slice(1)}</option>
              ))}
            </select>
            <button className="btn btn-primary" style={{ background:"linear-gradient(135deg,#7c3aed,#a855f7)", border:"none" }} onClick={() => setAnlCreate(true)}>
              <FiPlus size={13}/> New Analyst
            </button>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Zone</th><th>Account Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {anlFiltered.map(a => {
                    const anlName = a.name || a.username || "—";
                    return (
                    <tr key={a._id || a.id}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#7c3aed,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>{anlName[0].toUpperCase()}</div>
                          <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{anlName}</div>
                        </div>
                      </td>
                      <td><div style={{ color:"#64748b", fontSize:12 }}>{a.email}</div></td>
                      <td><span className="badge badge-info" style={{ fontSize:10 }}>{a.zone}</span></td>
                      <td>{accountStatusBadge(a.status)}</td>
                      <td>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setDbEdit(a)}><FiEdit2 size={11}/></button>
                          <button className="btn btn-ghost btn-sm" title="Change Role" disabled={a._id === admin?._id} onClick={() => setRoleTarget(a)}><FiShield size={11}/></button>
                          <button className="btn btn-ghost btn-sm" title="Suspend" disabled={a.status === "suspended"} onClick={() => setStatusTarget({ user: a, action: "suspend" })}><FiUserX size={11}/></button>
                          <button className="btn btn-ghost btn-sm" title="Reactivate" disabled={a.status === "active"} onClick={() => setStatusTarget({ user: a, action: "reactivate" })}><FiUserCheck size={11}/></button>
                          <button className="btn btn-ghost btn-sm" title="Delete" disabled={a._id === admin?._id} onClick={() => setDbDelete(a)} style={{ color:"#ef4444", opacity: a._id === admin?._id ? 0.35 : 1 }}><FiTrash2 size={11}/></button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                  {dbLoading && (
                    <tr><td colSpan={5} style={{ textAlign:"center", color:"#4a6fa5", padding:32 }}>Loading analysts…</td></tr>
                  )}
                  {!dbLoading && anlFiltered.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign:"center", color:"#4a6fa5", padding:32 }}>No analysts found. Click "New Analyst" to create one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginTop:12, background:"rgba(168,85,247,.06)", border:"1px solid rgba(168,85,247,.15)", borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <FiShield size={14} color="#a855f7"/>
            <span style={{ color:"#94a3b8", fontSize:12 }}>Analysts have <strong style={{ color:"#c084fc" }}>read-only access</strong> to Analytics Dashboard, Performance Reports, Zone Analytics, Alert Analytics, and Reports. No operational data access.</span>
          </div>
        </>
      )}

      {/* ── TAB: Operators ── */}
      {tab === "operators" && (
        <>
          <div style={{ display:"flex", gap:12, marginBottom:16, alignItems:"center", flexWrap:"wrap" }}>
            <div className="search-box" style={{ flex:1 }}>
              <FiSearch size={14} color="#4a6fa5"/>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email, ID or employee ID…"/>
            </div>
            <select className="form-select" style={{ width:"auto", padding:"8px 12px" }} value={statusF} onChange={e => setStatusF(e.target.value)}>
              {["All","Active","Inactive","pending_activation","suspended","deactivated"].map(s => (
                <option key={s} value={s}>{s === "All" ? "All Statuses" : s === "pending_activation" ? "Pending Activation" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={() => setCreate(true)}>
              <FiPlus size={13}/> New Operator
            </button>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Zone</th><th>Account Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(op => {
                    const opName = op.name || op.username || "—";
                    return (
                    <tr key={op._id || op.id}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>
                            {opName[0].toUpperCase()}
                          </div>
                          <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{opName}</div>
                        </div>
                      </td>
                      <td><div style={{ color:"#64748b", fontSize:12 }}>{op.email}</div></td>
                      <td><span className="badge badge-info" style={{ fontSize:10 }}>{op.zone}</span></td>
                      <td>{accountStatusBadge(op.status)}</td>
                      <td>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setDbEdit(op)}><FiEdit2 size={11}/></button>
                          <button className="btn btn-ghost btn-sm" title="Change Role" disabled={op._id === admin?._id} onClick={() => setRoleTarget(op)}><FiShield size={11}/></button>
                          <button className="btn btn-ghost btn-sm" title="Suspend" disabled={op.status === "suspended"} onClick={() => setStatusTarget({ user: op, action: "suspend" })}><FiUserX size={11}/></button>
                          <button className="btn btn-ghost btn-sm" title="Reactivate" disabled={op.status === "active"} onClick={() => setStatusTarget({ user: op, action: "reactivate" })}><FiUserCheck size={11}/></button>
                          <button className="btn btn-ghost btn-sm" title="Delete" disabled={op._id === admin?._id} onClick={() => setDbDelete(op)} style={{ color:"#ef4444", opacity: op._id === admin?._id ? 0.35 : 1 }}><FiTrash2 size={11}/></button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                  {dbLoading && (
                    <tr><td colSpan={5} style={{ textAlign:"center", color:"#4a6fa5", padding:32 }}>Loading operators…</td></tr>
                  )}
                  {!dbLoading && filtered.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign:"center", color:"#4a6fa5", padding:32 }}>No operators found in Zone {myZone}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>


        </>
      )}

      {/* ── TAB: Access Requests ── */}
      {tab === "requests" && (
        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <div className="section-title" style={{ margin:0 }}>Access Requests — Zone {myZone}</div>
            {pending.length > 0 && <span className="badge badge-high">{pending.length} pending</span>}
          </div>
          {zoneReqs.length === 0 ? (
            <div style={{ textAlign:"center", padding:48, color:"#4a6fa5" }}>No access requests for Zone {myZone}.</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Applicant</th><th>Employee ID</th><th>Requested Role</th><th>Department</th><th>Shift</th><th>Requested</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {zoneReqs.map(req => (
                    <tr key={req.id}>
                      <td>
                        <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{req.name}</div>
                        <div style={{ color:"#64748b", fontSize:11 }}>{req.email}</div>
                      </td>
                      <td style={{ color:"#94a3b8", fontSize:12 }}>{req.employeeId||"—"}</td>
                      <td>
                        <span className={`badge ${req.role === "Analyst" ? "badge-info" : "badge-medium"}`} style={{ fontSize:11 }}>
                          {req.role === "Analyst" ? "📊 Analyst" : "🚆 Operator"}
                        </span>
                      </td>
                      <td>
                        <div style={{ color:"#94a3b8", fontSize:12 }}>{req.department||"—"}</div>
                        {req.designation && <div style={{ color:"#4a6fa5", fontSize:11 }}>{req.designation}</div>}
                      </td>
                      <td><span className="badge badge-info" style={{ fontSize:10 }}>{req.shift}</span></td>
                      <td style={{ color:"#4a6fa5", fontSize:12 }}>{req.requestedAt}</td>
                      <td>
                        <span className={`badge ${req.status==="Pending"?"badge-medium":req.status==="Approved"?"badge-active":"badge-critical"}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>
                        {req.status === "Pending" ? (
                          <div style={{ display:"flex", gap:6 }}>
                            <button className="btn btn-success btn-sm" onClick={() => setApprove(req)}>
                              <FiCheckCircle size={12}/> Approve
                            </button>
                            <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }} onClick={() => handleReject(req)}>
                              <FiX size={12}/> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color:"#4a6fa5", fontSize:12 }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Permissions ── */}
      {tab === "permissions" && (
        <div className="card">
          <div style={{ marginBottom:16 }}>
            <div className="section-title" style={{ margin:0, marginBottom:4 }}>Module Permissions — Zone {myZone}</div>
            <div style={{ color:"#64748b", fontSize:12 }}>Toggle module access per operator. Changes apply immediately via RBAC.</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Operator</th><th>Status</th>
                  {ALL_PERMISSIONS.map(p => <th key={p.key} style={{ textAlign:"center" }}>{p.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {zoneOps.map(op => (
                  <tr key={op.id}>
                    <td>
                      <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{op.name}</div>
                      <div style={{ color:"#4a6fa5", fontSize:11 }}>{op.id}</div>
                    </td>
                    <td>{accountStatusBadge(op.accountStatus || "active")}</td>
                    {ALL_PERMISSIONS.map(p => {
                      const has      = op.permissions.includes(p.key);
                      const disabled = op.accountStatus !== "active";
                      return (
                        <td key={p.key} style={{ textAlign:"center" }}>
                          <div onClick={() => !disabled && handlePermToggle(op.id, p.key)}
                            title={disabled ? "Account not active" : has ? "Revoke" : "Grant"}
                            style={{ width:32, height:18, borderRadius:9, background: has ? "#2563eb" : "#1a3356", cursor: disabled ? "not-allowed" : "pointer", position:"relative", transition:"background .2s", margin:"0 auto", opacity: disabled ? .35 : 1 }}>
                            <div style={{ position:"absolute", top:2, left: has ? 16 : 2, width:14, height:14, borderRadius:"50%", background:"white", transition:"left .2s" }}/>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {zoneOps.length === 0 && (
                  <tr><td colSpan={ALL_PERMISSIONS.length + 2} style={{ textAlign:"center", color:"#4a6fa5", padding:32 }}>No operators in Zone {myZone}.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Audit Logs ── */}
      {tab === "logs" && (
        <div className="card">
          <div style={{ marginBottom:16 }}>
            <div className="section-title" style={{ margin:0, marginBottom:4 }}>Audit Logs — Zone {myZone}</div>
            <div style={{ color:"#64748b", fontSize:12 }}>All operator actions, login events, and admin changes.</div>
          </div>
          {zoneOps.map(op => (
            <div key={op.id} style={{ marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:28, height:28, borderRadius:7, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700 }}>
                    {op.name[0]}
                  </div>
                  <div>
                    <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{op.name}</span>
                    <span style={{ color:"#4a6fa5", fontSize:11, marginLeft:8 }}>{op.id}</span>
                  </div>
                  {accountStatusBadge(op.accountStatus || "active")}
                  {isLocked(op) && <span className="badge badge-critical" style={{ fontSize:9 }}>🔒 Locked</span>}
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ color:"#4a6fa5", fontSize:11 }}>Last login: {op.lastLogin}</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setLog(op)}><FiEye size={11}/> View All</button>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:4, paddingLeft:38 }}>
                {(op.activityLog||[]).slice(0,4).map((l, i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"7px 12px", background:"#071628", borderRadius:8, borderLeft:"3px solid #1a3356" }}>
                    <FiClock size={11} color="#4a6fa5" style={{ flexShrink:0 }}/>
                    <span style={{ color:"#94a3b8", fontSize:12, flex:1 }}>{l.action}</span>
                    <span style={{ color:"#4a6fa5", fontSize:11 }}>{l.at}</span>
                  </div>
                ))}
                {(op.activityLog||[]).length === 0 && (
                  <div style={{ color:"#2a4a6e", fontSize:12, padding:"6px 12px" }}>No activity recorded.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Analyst Modals ── */}
      {anlCreateOpen && <AnalystModal adminZone={myZone} onSave={handleAnlCreate} onClose={() => setAnlCreate(false)}/>}
      {anlEditTarget && <AnalystModal anl={anlEditTarget} adminZone={myZone} onSave={handleAnlEdit} onClose={() => setAnlEdit(null)}/>}
      {anlLogTarget  && <AnalystLogModal anl={anlLogTarget} onClose={() => setAnlLog(null)}/>}
      {anlActivLink  && <ActivationLinkModal link={anlActivLink.link} name={anlActivLink.name} role={anlActivLink.role || "Analyst"} onClose={() => setAnlActivLink(null)}/>}
      {anlResetLink  && <ResetLinkModal link={anlResetLink.link} name={anlResetLink.name} onClose={() => setAnlResetLink(null)}/>}
      {anlDelTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAnlDel(null)}>
          <div className="modal-box" style={{ maxWidth:380 }}>
            <div className="modal-title">Remove Analyst</div>
            <p style={{ color:"#94a3b8", marginBottom:24 }}>Permanently remove <strong style={{ color:"#c084fc" }}>{anlDelTarget.name}</strong> ({anlDelTarget.id})? All analytics access will be revoked immediately.</p>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:"center" }} onClick={handleAnlDelete}>Remove Permanently</button>
              <button className="btn btn-outline" onClick={() => setAnlDel(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {roleTarget     && <ChangeRoleModal user={roleTarget} onSave={handleRoleSave} onClose={() => setRoleTarget(null)}/>}
      {dbEditTarget  && <EditUserModal user={dbEditTarget} onSave={handleDbEdit} onClose={() => setDbEdit(null)}/>}
      {statusTarget  && <ConfirmStatusModal user={statusTarget.user} action={statusTarget.action} onConfirm={handleStatusConfirm} onClose={() => setStatusTarget(null)}/>}
      {dbDeleteTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDbDelete(null)}>
          <div className="modal-box" style={{ maxWidth:380 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div className="modal-title" style={{ margin:0 }}>Delete User</div>
              <button onClick={() => setDbDelete(null)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
            </div>
            <p style={{ color:"#94a3b8", marginBottom:24, fontSize:13 }}>
              Permanently delete <strong style={{ color:"#f1f5f9" }}>{dbDeleteTarget.name || dbDeleteTarget.username}</strong>? This action cannot be undone.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:"center" }} onClick={handleDbDelete}>
                <FiTrash2 size={12}/> Delete Permanently
              </button>
              <button className="btn btn-outline" onClick={() => setDbDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Operator Modals ── */}
      {createOpen  && <OperatorModal adminZone={myZone} onSave={handleCreate} onClose={() => setCreate(false)}/>}
      {editTarget  && <OperatorModal op={editTarget} adminZone={myZone} onSave={handleEdit} onClose={() => setEdit(null)}/>}
      {logTarget   && <LogModal op={logTarget} onClose={() => setLog(null)}/>}
      {approveReq  && <ApproveModal req={approveReq} onApprove={handleApprove} onClose={() => setApprove(null)}/>}
      {activLink   && <ActivationLinkModal link={activLink.link} name={activLink.name} role={activLink.role || "Operator"} onClose={() => setActivLink(null)}/>}
      {resetLink   && <ResetLinkModal link={resetLink.link} name={resetLink.name} onClose={() => setResetLink(null)}/>}

      {delTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDel(null)}>
          <div className="modal-box" style={{ maxWidth:380 }}>
            <div className="modal-title">Remove Operator</div>
            <p style={{ color:"#94a3b8", marginBottom:24 }}>
              Permanently remove <strong style={{ color:"#60a5fa" }}>{delTarget.name}</strong> ({delTarget.id}) from Zone {myZone}?
              All access will be revoked immediately.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:"center" }} onClick={handleDelete}>Remove Permanently</button>
              <button className="btn btn-outline" onClick={() => setDel(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersRoles;
