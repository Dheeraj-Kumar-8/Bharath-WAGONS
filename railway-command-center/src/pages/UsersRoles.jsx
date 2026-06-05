import { useState } from "react";
import {
  FiUsers, FiShield, FiPlus, FiEdit2, FiTrash2, FiX,
  FiSearch, FiLock, FiUnlock, FiRefreshCw, FiCheck,
  FiAlertTriangle, FiClock, FiActivity, FiCheckCircle,
  FiSlash, FiEye, FiEyeOff,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { useAuth, ALL_PERMISSIONS } from "../context/AuthContext";

// ── Helpers ───────────────────────────────────────────────────────────────────
const statusBadge = s => (
  <span className={`badge ${s === "Active" ? "badge-active" : "badge-inactive"}`}>{s}</span>
);
const shiftOpts  = ["Shift A", "Shift B", "Shift C"];
const genPassword = (zone) => `${zone}@${new Date().getFullYear()}`;

// ── Create / Edit Operator Modal ──────────────────────────────────────────────
function OperatorModal({ op, adminZone, onSave, onClose }) {
  const isEdit = !!op;
  const [form, setForm] = useState(op ? {
    name:op.name, email:op.email, password:"", shift:op.shift,
    status:op.status, permissions:[...op.permissions],
  } : {
    name:"", email:"", password:genPassword(adminZone), shift:"Shift A",
    status:"Active", permissions:ALL_PERMISSIONS.map(p => p.key),
  });
  const [showPw, setShowPw] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));

  const togglePerm = (key) => {
    set("permissions", form.permissions.includes(key)
      ? form.permissions.filter(p => p !== key)
      : [...form.permissions, key]);
  };

  const valid = form.name.trim() && form.email.trim() && (isEdit || form.password.trim());

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:540 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>{isEdit ? "Edit Operator" : "Create Operator Account"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 14px", marginBottom:16 }}>
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
            <label className="form-label">{isEdit ? "New Password (leave blank to keep)" : "Password *"}</label>
            <div style={{ position:"relative" }}>
              <input className="form-input" type={showPw ? "text" : "password"} style={{ paddingRight:36 }} value={form.password} onChange={e => set("password", e.target.value)} placeholder={isEdit ? "Leave blank to keep current" : ""}/>
              <button onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer" }}>
                {showPw ? <FiEyeOff size={14}/> : <FiEye size={14}/>}
              </button>
            </div>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Shift</label>
            <select className="form-select" value={form.shift} onChange={e => set("shift", e.target.value)}>
              {shiftOpts.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group" style={{ marginTop:12, marginBottom:0 }}>
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
            <option>Active</option><option>Inactive</option>
          </select>
        </div>

        {/* Permissions */}
        <div style={{ marginTop:16 }}>
          <div style={{ color:"#64748b", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>
            Module Permissions
          </div>
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
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}
            disabled={!valid}
            onClick={() => onSave({ ...form, zone:adminZone })}>
            {isEdit ? "Update Operator" : "Create Operator"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Reset Password Modal ──────────────────────────────────────────────────────
function ResetPwModal({ op, onSave, onClose }) {
  const [pw, setPw]       = useState(genPassword(op.zone));
  const [showPw, setShow] = useState(false);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:380 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>Reset Password — {op.name}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>
        <div className="form-group">
          <label className="form-label">New Password</label>
          <div style={{ position:"relative" }}>
            <input className="form-input" type={showPw ? "text" : "password"} style={{ paddingRight:36 }} value={pw} onChange={e => setPw(e.target.value)}/>
            <button onClick={() => setShow(p => !p)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer" }}>
              {showPw ? <FiEyeOff size={14}/> : <FiEye size={14}/>}
            </button>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:8 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} disabled={!pw.trim()} onClick={() => onSave(pw)}>Reset Password</button>
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
      <div className="modal-box" style={{ maxWidth:480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>Approve Request — {req.name}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>
        <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:14, marginBottom:16 }}>
          {[["Email",req.email],["Zone",req.zone],["Region",req.region],["Shift",req.shift],["Requested",req.requestedAt]].map(([k,v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0", borderBottom:"1px solid rgba(26,51,86,.4)" }}>
              <span style={{ color:"#64748b", fontSize:12 }}>{k}</span>
              <span style={{ color:"#f1f5f9", fontSize:12, fontWeight:600 }}>{v}</span>
            </div>
          ))}
          {req.note && <div style={{ color:"#94a3b8", fontSize:11, marginTop:8, fontStyle:"italic" }}>{req.note}</div>}
        </div>
        <div style={{ color:"#64748b", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:10 }}>Grant Permissions</div>
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
        <div style={{ color:"#4a6fa5", fontSize:11, marginBottom:16 }}>
          Default password: <span style={{ color:"#60a5fa", fontWeight:700 }}>{genPassword(req.zone)}</span> — operator must change on first login.
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={() => onApprove(perms)}>
            <FiCheckCircle size={13}/> Approve & Create Account
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Activity Log Modal ────────────────────────────────────────────────────────
function LogModal({ op, onClose }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>Activity Log — {op.name}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>
        <div style={{ maxHeight:360, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
          {(op.activityLog || []).length === 0
            ? <div style={{ color:"#4a6fa5", textAlign:"center", padding:32 }}>No activity recorded yet.</div>
            : (op.activityLog || []).map((l, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"9px 12px", background:"#071628", borderRadius:8, borderLeft:"3px solid #1a3356" }}>
                <FiClock size={12} color="#4a6fa5" style={{ marginTop:2, flexShrink:0 }}/>
                <div>
                  <div style={{ color:"#cbd5e1", fontSize:12, fontWeight:600 }}>{l.action}</div>
                  <div style={{ color:"#4a6fa5", fontSize:11, marginTop:2 }}>{l.at}{l.ip && l.ip !== "—" ? ` · IP: ${l.ip}` : ""}</div>
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

// ── Main Page ─────────────────────────────────────────────────────────────────
const UsersRoles = () => {
  const {
    admin, operators, requests,
    adminCreateOperator, adminUpdateOperator, adminToggleOperator,
    adminResetPassword, adminApproveRequest, adminRejectRequest,
    adminDeleteOperator,
  } = useAuth();

  const myZone    = admin?.zone || "NR";
  const zoneOps   = operators.filter(o => o.zone === myZone);
  const zoneReqs  = requests.filter(r => r.zone === myZone);
  const pending   = zoneReqs.filter(r => r.status === "Pending");

  const [tab,        setTab]     = useState("operators");
  const [query,      setQuery]   = useState("");
  const [statusF,    setStatusF] = useState("All");
  const [createOpen, setCreate]  = useState(false);
  const [editTarget, setEdit]    = useState(null);
  const [delTarget,  setDel]     = useState(null);
  const [resetTarget,setReset]   = useState(null);
  const [logTarget,  setLog]     = useState(null);
  const [approveReq, setApprove] = useState(null);
  const [toast,      setToast]   = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const filtered = zoneOps.filter(o =>
    (statusF === "All" || o.status === statusF) &&
    (`${o.name} ${o.email} ${o.id}`.toLowerCase().includes(query.toLowerCase()))
  );

  // Handlers
  const handleCreate = (form) => {
    const newOp = adminCreateOperator(form);
    setCreate(false);
    showToast(`✓ Operator "${newOp.name}" created. Password: ${form.password}`);
  };

  const handleEdit = (form) => {
    const changes = { name:form.name, email:form.email, shift:form.shift, status:form.status, permissions:form.permissions };
    if (form.password) changes.password = form.password;
    adminUpdateOperator(editTarget.id, changes);
    setEdit(null);
    showToast(`✓ Operator "${form.name}" updated.`);
  };

  const handleToggle = (op) => {
    adminToggleOperator(op.id);
    showToast(`✓ ${op.name} ${op.status === "Active" ? "deactivated" : "activated"}.`);
  };

  const handleReset = (pw) => {
    adminResetPassword(resetTarget.id, pw);
    setReset(null);
    showToast(`✓ Password reset for ${resetTarget.name}. New: ${pw}`);
  };

  const handleDelete = () => {
    adminDeleteOperator(delTarget.id);
    setDel(null);
    showToast(`✓ Operator "${delTarget.name}" removed.`);
  };

  const handleApprove = (perms) => {
    adminApproveRequest(approveReq.id, perms);
    setApprove(null);
    showToast(`✓ Request approved. Account created for "${approveReq.name}".`);
  };

  const handleReject = (req) => {
    adminRejectRequest(req.id);
    showToast(`Rejected request from "${req.name}".`);
  };

  const handlePermToggle = (opId, key) => {
    const op = operators.find(o => o.id === opId);
    if (!op) return;
    const perms = op.permissions.includes(key)
      ? op.permissions.filter(p => p !== key)
      : [...op.permissions, key];
    adminUpdateOperator(opId, { permissions: perms });
  };

  const TABS = [
    { key:"operators",   label:"Operators",        count:zoneOps.length  },
    { key:"requests",    label:"Access Requests",  count:pending.length, alert:pending.length > 0  },
    { key:"permissions", label:"Permissions",      count:null            },
    { key:"logs",        label:"Activity Logs",    count:null            },
  ];

  return (
    <DashboardLayout title="Operator Management" sub={`Zone ${myZone} — ${admin?.name || ""} · Role-Based Access Control`}>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:20, right:24, background:"#16a34a", color:"#fff", padding:"12px 20px", borderRadius:10, fontWeight:600, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,.4)" }}>
          {toast}
        </div>
      )}

      {/* Zone banner */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:12, padding:"12px 18px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <FiLock size={14} color="#3b82f6"/>
          <span style={{ color:"#60a5fa", fontSize:13, fontWeight:600 }}>
            Zone <strong>{myZone}</strong> — you can only manage operators within your zone.
          </span>
        </div>
        <span className="badge badge-info">Admin: {admin?.name}</span>
      </div>

      {/* KPI row */}
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard title="Zone Operators" value={zoneOps.length}                                  color="#3b82f6" icon={FiUsers}   />
        <StatCard title="Active"         value={zoneOps.filter(o=>o.status==="Active").length}   color="#22c55e" icon={FiShield}  />
        <StatCard title="Inactive"       value={zoneOps.filter(o=>o.status==="Inactive").length} color="#ef4444" icon={FiSlash}   />
        <StatCard title="Pending Requests" value={pending.length}                                color="#f59e0b" icon={FiAlertTriangle} />
      </div>

      {/* Tab bar */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:"rgba(0,0,0,.2)", borderRadius:12, padding:4, border:"1px solid #1a3356" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ flex:1, padding:"9px 0", border:"none", borderRadius:9, cursor:"pointer", fontSize:13, fontWeight:700, transition:"all .2s",
              background: tab === t.key ? "#1d4ed8" : "transparent",
              color:       tab === t.key ? "#fff"    : "#64748b",
              boxShadow:   tab === t.key ? "0 2px 12px rgba(37,99,235,.4)" : "none",
              position:"relative",
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
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email or ID…"/>
            </div>
            <select className="form-select" style={{ width:"auto", padding:"8px 12px" }} value={statusF} onChange={e => setStatusF(e.target.value)}>
              {["All","Active","Inactive"].map(s => <option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => setCreate(true)}>
              <FiPlus size={13}/> New Operator
            </button>
          </div>

          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div className="section-title" style={{ margin:0 }}>Operators — Zone {myZone} ({filtered.length})</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Operator</th><th>Email</th><th>Shift</th><th>Status</th><th>Last Login</th><th>Permissions</th><th>Actions</th></tr>
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
                            <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{op.name}</div>
                            <div style={{ color:"#4a6fa5", fontSize:11 }}>{op.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color:"#64748b", fontSize:12 }}>{op.email}</td>
                      <td><span className="badge badge-info" style={{ fontSize:10 }}>{op.shift}</span></td>
                      <td>{statusBadge(op.status)}</td>
                      <td style={{ color:"#4a6fa5", fontSize:12 }}>{op.lastLogin}</td>
                      <td>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                          <span style={{ color:"#22c55e", fontSize:11, fontWeight:600 }}>{op.permissions.length}/{ALL_PERMISSIONS.length} modules</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display:"flex", gap:5 }}>
                          <button className="btn btn-ghost btn-sm" title="Edit" onClick={() => setEdit(op)}><FiEdit2 size={12}/></button>
                          <button className="btn btn-ghost btn-sm" title={op.status === "Active" ? "Deactivate" : "Activate"}
                            style={{ color: op.status === "Active" ? "#f59e0b" : "#22c55e" }}
                            onClick={() => handleToggle(op)}>
                            {op.status === "Active" ? <FiLock size={12}/> : <FiUnlock size={12}/>}
                          </button>
                          <button className="btn btn-ghost btn-sm" title="Reset Password" onClick={() => setReset(op)}><FiRefreshCw size={12}/></button>
                          <button className="btn btn-ghost btn-sm" title="Activity Log" onClick={() => setLog(op)}><FiActivity size={12}/></button>
                          <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }} title="Delete" onClick={() => setDel(op)}><FiTrash2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign:"center", color:"#4a6fa5", padding:32 }}>No operators found in Zone {myZone}</td></tr>
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
                  <tr><th>Applicant</th><th>Email</th><th>Shift</th><th>Requested</th><th>Note</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {zoneReqs.map(req => (
                    <tr key={req.id}>
                      <td style={{ color:"#f1f5f9", fontWeight:600 }}>{req.name}</td>
                      <td style={{ color:"#64748b", fontSize:12 }}>{req.email}</td>
                      <td><span className="badge badge-info" style={{ fontSize:10 }}>{req.shift}</span></td>
                      <td style={{ color:"#4a6fa5", fontSize:12 }}>{req.requestedAt}</td>
                      <td style={{ color:"#94a3b8", fontSize:12, maxWidth:200 }}>{req.note}</td>
                      <td>
                        <span className={`badge ${req.status === "Pending" ? "badge-medium" : req.status === "Approved" ? "badge-active" : "badge-critical"}`}>
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
            <div style={{ color:"#64748b", fontSize:12 }}>Toggle individual module access per operator. Changes take effect immediately.</div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Status</th>
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
                    <td>{statusBadge(op.status)}</td>
                    {ALL_PERMISSIONS.map(p => {
                      const has = op.permissions.includes(p.key);
                      const disabled = op.status === "Inactive";
                      return (
                        <td key={p.key} style={{ textAlign:"center" }}>
                          <div
                            onClick={() => !disabled && handlePermToggle(op.id, p.key)}
                            title={disabled ? "Operator is inactive" : has ? "Revoke access" : "Grant access"}
                            style={{ width:32, height:18, borderRadius:9, background: has ? "#2563eb" : "#1a3356", cursor: disabled ? "not-allowed" : "pointer", position:"relative", transition:"background .2s", margin:"0 auto", opacity: disabled ? .4 : 1 }}>
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

      {/* ── TAB: Activity Logs ── */}
      {tab === "logs" && (
        <div className="card">
          <div style={{ marginBottom:16 }}>
            <div className="section-title" style={{ margin:0, marginBottom:4 }}>Activity Logs — Zone {myZone}</div>
            <div style={{ color:"#64748b", fontSize:12 }}>Operator actions and login events.</div>
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
                  {statusBadge(op.status)}
                </div>
                <span style={{ color:"#4a6fa5", fontSize:11 }}>Last login: {op.lastLogin}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:5, paddingLeft:38 }}>
                {(op.activityLog || []).slice(0, 5).map((l, i) => (
                  <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"7px 12px", background:"#071628", borderRadius:8, borderLeft:"3px solid #1a3356" }}>
                    <FiClock size={11} color="#4a6fa5" style={{ flexShrink:0 }}/>
                    <span style={{ color:"#94a3b8", fontSize:12, flex:1 }}>{l.action}</span>
                    <span style={{ color:"#4a6fa5", fontSize:11 }}>{l.at}</span>
                  </div>
                ))}
                {(op.activityLog || []).length > 5 && (
                  <button className="btn btn-ghost btn-sm" style={{ alignSelf:"flex-start" }} onClick={() => setLog(op)}>
                    View all {op.activityLog.length} entries →
                  </button>
                )}
                {(op.activityLog || []).length === 0 && (
                  <div style={{ color:"#2a4a6e", fontSize:12, padding:"6px 12px" }}>No activity recorded.</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      {createOpen  && <OperatorModal adminZone={myZone} onSave={handleCreate} onClose={() => setCreate(false)}/>}
      {editTarget  && <OperatorModal op={editTarget}  adminZone={myZone} onSave={handleEdit}  onClose={() => setEdit(null)}/>}
      {resetTarget && <ResetPwModal  op={resetTarget} onSave={handleReset} onClose={() => setReset(null)}/>}
      {logTarget   && <LogModal      op={logTarget}   onClose={() => setLog(null)}/>}
      {approveReq  && <ApproveModal  req={approveReq} onApprove={handleApprove} onClose={() => setApprove(null)}/>}

      {delTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDel(null)}>
          <div className="modal-box" style={{ maxWidth:380 }}>
            <div className="modal-title">Remove Operator</div>
            <p style={{ color:"#94a3b8", marginBottom:24 }}>
              Remove <strong style={{ color:"#60a5fa" }}>{delTarget.name}</strong> ({delTarget.id}) from Zone {myZone}?
              This will revoke all access permanently.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:"center" }} onClick={handleDelete}>Remove Operator</button>
              <button className="btn btn-outline" onClick={() => setDel(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersRoles;
