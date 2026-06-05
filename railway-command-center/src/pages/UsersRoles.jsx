import { useState } from "react";
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const SHIFTS       = ["Shift A","Shift B","Shift C"];
const DEPARTMENTS  = ["Operations","Logistics","Maintenance","Cargo","Safety","IT","Administration"];

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
function ActivationLinkModal({ link, name, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard?.writeText(link).catch(()=>{}); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>Activation Link Generated</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>

        <div style={{ background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.25)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ color:"#22c55e", fontWeight:700, fontSize:13, marginBottom:4 }}>✓ Account created for {name}</div>
          <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.6 }}>
            The operator must click the activation link below to <strong>set their own password</strong>. No password has been generated or stored.
          </div>
        </div>

        <div style={{ background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ color:"#f59e0b", fontSize:12, fontWeight:700, marginBottom:4 }}>📧 Email Workflow (Simulated)</div>
          <div style={{ color:"#94a3b8", fontSize:12, lineHeight:1.7 }}>
            Subject: "Your access request has been approved."<br/>
            Body: "Your account has been created. Click the secure activation link below to create your password. This link expires in 72 hours."<br/>
            <strong style={{ color:"#ef4444" }}>No password is ever included in this email.</strong>
          </div>
        </div>

        <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
          <div style={{ color:"#64748b", fontSize:11, marginBottom:6, textTransform:"uppercase", letterSpacing:1 }}>Secure Activation Link (valid 72h)</div>
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
            ["Employee ID",  req.employeeId  || "—"],
            ["Department",   req.department  || "—"],
            ["Designation",  req.designation || "—"],
            ["Zone",         req.zone],
            ["Shift",        req.shift],
            ["Requested",    req.requestedAt],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(26,51,86,.4)" }}>
              <span style={{ color:"#64748b", fontSize:12 }}>{k}</span>
              <span style={{ color:"#f1f5f9", fontSize:12, fontWeight:600 }}>{v}</span>
            </div>
          ))}
          {req.note && <div style={{ color:"#94a3b8", fontSize:11, marginTop:8, fontStyle:"italic" }}>{req.note}</div>}
        </div>

        <div style={{ background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.2)", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", gap:8 }}>
          <FiLock size={13} color="#22c55e" style={{ flexShrink:0, marginTop:2 }}/>
          <span style={{ color:"#22c55e", fontSize:12, lineHeight:1.6 }}>
            Approving will create the account and generate a <strong>secure activation link</strong>. No password will be generated or emailed.
          </span>
        </div>

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

        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-success" style={{ flex:1, justifyContent:"center" }} onClick={() => onApprove(perms)}>
            <FiCheckCircle size={13}/> Approve & Generate Activation Link
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
  } = useAuth();

  const myZone   = admin?.zone || "NR";
  const zoneOps  = operators.filter(o => o.zone === myZone);
  const zoneReqs = requests.filter(r => r.zone === myZone);
  const pending  = zoneReqs.filter(r => r.status === "Pending");

  const [tab,          setTab]         = useState("operators");
  const [query,        setQuery]        = useState("");
  const [statusF,      setStatusF]      = useState("All");
  const [createOpen,   setCreate]       = useState(false);
  const [editTarget,   setEdit]         = useState(null);
  const [delTarget,    setDel]          = useState(null);
  const [logTarget,    setLog]          = useState(null);
  const [approveReq,   setApprove]      = useState(null);
  const [activLink,    setActivLink]    = useState(null); // { link, name }
  const [resetLink,    setResetLink]    = useState(null); // { link, name }
  const [toast,        setToast]        = useState({ msg:"", ok:true });

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast({ msg:"", ok:true }), 3200); };

  const filtered = zoneOps.filter(o =>
    (statusF === "All" || o.status === statusF || o.accountStatus === statusF) &&
    (`${o.name} ${o.email} ${o.id} ${o.employeeId||""}`.toLowerCase().includes(query.toLowerCase()))
  );

  // Handlers
  const handleCreate = (form) => {
    const result = adminCreateOperator(form);
    setCreate(false);
    setActivLink({ link: result.activationLink, name: result.name });
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

  const handleResendActivation = (op) => {
    const result = adminResendActivation(op.id);
    setActivLink({ link: result.activationLink, name: op.name });
    showToast(`✓ New activation link generated for ${op.name}.`);
  };

  const handleDelete = () => {
    adminDeleteOperator(delTarget.id);
    setDel(null);
    showToast(`✓ "${delTarget.name}" removed.`);
  };

  const handleApprove = (perms) => {
    const result = adminApproveRequest(approveReq.id, perms);
    setApprove(null);
    setActivLink({ link: result.activationLink, name: result.name });
    showToast(`✓ Approved. Activation link generated for "${result.name}".`);
  };

  const handleReject = (req) => {
    adminRejectRequest(req.id);
    showToast(`Request from "${req.name}" rejected.`, false);
  };

  const handlePermToggle = (opId, key) => {
    const op = operators.find(o => o.id === opId);
    if (!op) return;
    const perms = op.permissions.includes(key) ? op.permissions.filter(p => p !== key) : [...op.permissions, key];
    adminUpdateOperator(opId, { permissions: perms });
  };

  const TABS = [
    { key:"operators",   label:"Operators",       count:zoneOps.length          },
    { key:"requests",    label:"Access Requests", count:pending.length, alert:pending.length > 0 },
    { key:"permissions", label:"Permissions",     count:null            },
    { key:"logs",        label:"Audit Logs",      count:null            },
  ];

  const isLocked = (op) => op.lockedUntil && Date.now() < op.lockedUntil;

  return (
    <DashboardLayout title="Operator Management" sub={`Zone ${myZone} — ${admin?.name||""} · Secure RBAC`}>

      <Toast msg={toast.msg} ok={toast.ok}/>

      {/* Zone banner */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:12, padding:"12px 18px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <FiLock size={14} color="#3b82f6"/>
          <span style={{ color:"#60a5fa", fontSize:13, fontWeight:600 }}>Zone <strong>{myZone}</strong> — you can only manage operators in your zone.</span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <span className="badge badge-info" style={{ fontSize:10 }}>🔒 No plain-text passwords</span>
          <span className="badge badge-active">Admin: {admin?.name}</span>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard title="Zone Operators"   value={zoneOps.length}                                          color="#3b82f6" icon={FiUsers}        />
        <StatCard title="Active"           value={zoneOps.filter(o=>o.accountStatus==="active").length}    color="#22c55e" icon={FiShield}       />
        <StatCard title="Pending Activate" value={zoneOps.filter(o=>o.accountStatus==="pending_activation").length} color="#f59e0b" icon={FiClock} />
        <StatCard title="Suspended"        value={zoneOps.filter(o=>o.accountStatus==="suspended"||o.accountStatus==="deactivated").length} color="#ef4444" icon={FiSlash} />
        <StatCard title="Pending Requests" value={pending.length}                                          color="#f97316" icon={FiAlertTriangle} />
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
                  <tr><th>Operator</th><th>Email / Emp ID</th><th>Department</th><th>Shift</th><th>Account Status</th><th>Last Login</th><th>Perms</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(op => (
                    <tr key={op.id}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700, flexShrink:0 }}>
                            {op.name[0]}
                          </div>
                          <div>
                            <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>
                              {op.name}
                              {isLocked(op) && <FiLock size={10} color="#ef4444" style={{ marginLeft:5 }} title="Account Locked"/>}
                            </div>
                            <div style={{ color:"#4a6fa5", fontSize:11 }}>{op.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ color:"#64748b", fontSize:12 }}>{op.email}</div>
                        {op.employeeId && <div style={{ color:"#4a6fa5", fontSize:11 }}>{op.employeeId}</div>}
                      </td>
                      <td>
                        <div style={{ color:"#94a3b8", fontSize:12 }}>{op.department||"—"}</div>
                        {op.designation && <div style={{ color:"#4a6fa5", fontSize:11 }}>{op.designation}</div>}
                      </td>
                      <td><span className="badge badge-info" style={{ fontSize:10 }}>{op.shift}</span></td>
                      <td>{accountStatusBadge(op.accountStatus || (op.status === "Active" ? "active" : "suspended"))}</td>
                      <td style={{ color:"#4a6fa5", fontSize:12 }}>{op.lastLogin}</td>
                      <td><span style={{ color:"#22c55e", fontSize:11, fontWeight:600 }}>{op.permissions.length}/{ALL_PERMISSIONS.length}</span></td>
                      <td>
                        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setEdit(op)}><FiEdit2 size={11}/></button>

                          {op.accountStatus === "pending_activation" && (
                            <button className="btn btn-ghost btn-sm" title="Resend Activation Link" style={{ color:"#f59e0b" }} onClick={() => handleResendActivation(op)}>
                              <FiLink size={11}/>
                            </button>
                          )}

                          {isLocked(op) && (
                            <button className="btn btn-ghost btn-sm" title="Unlock Account" style={{ color:"#22c55e" }} onClick={() => handleUnlock(op)}>
                              <FiUnlock size={11}/>
                            </button>
                          )}

                          {op.accountStatus === "active" && (
                            <button className="btn btn-ghost btn-sm" title="Send Password Reset Link" onClick={() => handleResetPassword(op)}>
                              <FiKey size={11}/>
                            </button>
                          )}

                          {op.accountStatus === "active" && (
                            <button className="btn btn-ghost btn-sm" title="Suspend" style={{ color:"#f59e0b" }} onClick={() => handleSuspend(op)}>
                              <FiUserX size={11}/>
                            </button>
                          )}

                          {(op.accountStatus === "suspended" || op.accountStatus === "deactivated") && (
                            <button className="btn btn-ghost btn-sm" title="Reactivate" style={{ color:"#22c55e" }} onClick={() => handleReactivate(op)}>
                              <FiUserCheck size={11}/>
                            </button>
                          )}

                          {op.accountStatus === "active" && (
                            <button className="btn btn-ghost btn-sm" title="Deactivate" style={{ color:"#ef4444" }} onClick={() => handleDeactivate(op)}>
                              <FiSlash size={11}/>
                            </button>
                          )}

                          <button className="btn btn-ghost btn-sm" title="Audit Logs" onClick={() => setLog(op)}><FiActivity size={11}/></button>
                          <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }} title="Delete" onClick={() => setDel(op)}><FiTrash2 size={11}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign:"center", color:"#4a6fa5", padding:32 }}>No operators found in Zone {myZone}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Icon legend */}
          <div style={{ display:"flex", gap:14, marginTop:12, flexWrap:"wrap" }}>
            {[
              [FiEdit2,     "#3b82f6", "Edit"],
              [FiLink,      "#f59e0b", "Resend Activation"],
              [FiUnlock,    "#22c55e", "Unlock Account"],
              [FiKey,       "#94a3b8", "Reset Password Link"],
              [FiUserX,     "#f59e0b", "Suspend"],
              [FiUserCheck, "#22c55e", "Reactivate"],
              [FiSlash,     "#ef4444", "Deactivate"],
              [FiActivity,  "#3b82f6", "Audit Logs"],
              [FiTrash2,    "#ef4444", "Delete"],
            ].map(([Icon, color, label]) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <Icon size={11} color={color}/><span style={{ color:"#4a6fa5", fontSize:11 }}>{label}</span>
              </div>
            ))}
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
                  <tr><th>Applicant</th><th>Employee ID</th><th>Department</th><th>Shift</th><th>Requested</th><th>Status</th><th>Actions</th></tr>
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

      {/* ── Modals ── */}
      {createOpen  && <OperatorModal adminZone={myZone} onSave={handleCreate} onClose={() => setCreate(false)}/>}
      {editTarget  && <OperatorModal op={editTarget} adminZone={myZone} onSave={handleEdit} onClose={() => setEdit(null)}/>}
      {logTarget   && <LogModal op={logTarget} onClose={() => setLog(null)}/>}
      {approveReq  && <ApproveModal req={approveReq} onApprove={handleApprove} onClose={() => setApprove(null)}/>}
      {activLink   && <ActivationLinkModal link={activLink.link} name={activLink.name} onClose={() => setActivLink(null)}/>}
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
