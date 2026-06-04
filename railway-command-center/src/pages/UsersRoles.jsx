import { useState } from "react";
import { FiUsers, FiShield, FiBarChart2, FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiLock } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";

const ZONES = ["NR","CR","SR","ER","WR","SCR","NCR","NWR","ECR","SWR","ECoR","WCR"];

// ── Each zone has 1 Admin + Operators + Analysts ──────────────────────────────
const INITIAL_USERS = [
  // NR — Rajesh Kumar's zone
  { id:"USR-001", name:"Rajesh Kumar",    email:"rajesh.k@railways.gov.in",   role:"Admin",    zone:"NR",   status:"Active",   lastLogin:"Today 09:42 AM"  },
  { id:"USR-002", name:"Priya Sharma",    email:"priya.s@railways.gov.in",    role:"Operator", zone:"NR",   status:"Active",   lastLogin:"Today 08:15 AM"  },
  { id:"USR-003", name:"Arun Mishra",     email:"arun.m@railways.gov.in",     role:"Analyst",  zone:"NR",   status:"Active",   lastLogin:"Yesterday"       },

  // CR
  { id:"USR-004", name:"Deepak Singh",    email:"deepak.s@railways.gov.in",   role:"Admin",    zone:"CR",   status:"Active",   lastLogin:"Today 11:20 AM"  },
  { id:"USR-005", name:"Amit Verma",      email:"amit.v@railways.gov.in",     role:"Operator", zone:"CR",   status:"Active",   lastLogin:"Today 10:02 AM"  },
  { id:"USR-006", name:"Neha Joshi",      email:"neha.j@railways.gov.in",     role:"Analyst",  zone:"CR",   status:"Active",   lastLogin:"Today 09:00 AM"  },

  // SR
  { id:"USR-007", name:"Kavitha Reddy",   email:"kavitha.r@railways.gov.in",  role:"Admin",    zone:"SR",   status:"Active",   lastLogin:"Today 08:30 AM"  },
  { id:"USR-008", name:"Sunita Nair",     email:"sunita.n@railways.gov.in",   role:"Operator", zone:"SR",   status:"Active",   lastLogin:"Yesterday"       },
  { id:"USR-009", name:"Manoj Kumar",     email:"manoj.k@railways.gov.in",    role:"Analyst",  zone:"SR",   status:"Inactive", lastLogin:"3 days ago"      },

  // ER
  { id:"USR-010", name:"Subhash Ghosh",   email:"subhash.g@railways.gov.in",  role:"Admin",    zone:"ER",   status:"Active",   lastLogin:"Today 07:45 AM"  },
  { id:"USR-011", name:"Ritu Banerjee",   email:"ritu.b@railways.gov.in",     role:"Operator", zone:"ER",   status:"Active",   lastLogin:"Today 09:10 AM"  },
  { id:"USR-012", name:"Sanjay Das",      email:"sanjay.d@railways.gov.in",   role:"Analyst",  zone:"ER",   status:"Active",   lastLogin:"Today 10:30 AM"  },

  // WR
  { id:"USR-013", name:"Rohit Patel",     email:"rohit.p@railways.gov.in",    role:"Admin",    zone:"WR",   status:"Active",   lastLogin:"Today 07:55 AM"  },
  { id:"USR-014", name:"Meena Shah",      email:"meena.s@railways.gov.in",    role:"Operator", zone:"WR",   status:"Active",   lastLogin:"Yesterday"       },
  { id:"USR-015", name:"Lakshmi Iyer",    email:"lakshmi.i@railways.gov.in",  role:"Analyst",  zone:"WR",   status:"Inactive", lastLogin:"1 week ago"      },

  // SCR
  { id:"USR-016", name:"Venkat Rao",      email:"venkat.r@railways.gov.in",   role:"Admin",    zone:"SCR",  status:"Active",   lastLogin:"Today 08:00 AM"  },
  { id:"USR-017", name:"Anitha Reddy",    email:"anitha.r@railways.gov.in",   role:"Operator", zone:"SCR",  status:"Active",   lastLogin:"Today 09:45 AM"  },
  { id:"USR-018", name:"Prasad Murthy",   email:"prasad.m@railways.gov.in",   role:"Analyst",  zone:"SCR",  status:"Active",   lastLogin:"Yesterday"       },
];

const roleClass   = r => ({ Admin:"badge-critical", Operator:"badge-info", Analyst:"badge-active" }[r] || "badge-info");
const statusClass = s => ({ Active:"badge-active",  Inactive:"badge-inactive" }[s] || "badge-info");
const emptyForm   = (zone) => ({ name:"", email:"", role:"Operator", zone, status:"Active" });

// ── Add / Edit Modal ──────────────────────────────────────────────────────────
const UserModal = ({ user, adminZone, onSave, onClose }) => {
  const [form, setForm] = useState(user || emptyForm(adminZone));
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const isEdit = !!user;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <div className="modal-title" style={{ margin:0 }}>{isEdit ? "Edit User" : "Add New User"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18} /></button>
        </div>

        {/* Zone locked to admin's zone */}
        <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 14px", marginBottom:16 }}>
          <FiLock size={13} color="#3b82f6" />
          <span style={{ color:"#60a5fa", fontSize:12, fontWeight:600 }}>Zone locked to your region: {adminZone}</span>
        </div>

        {[
          { label:"Full Name", key:"name",  type:"text",  ph:"e.g. Rajesh Kumar"         },
          { label:"Email",     key:"email", type:"email", ph:"e.g. user@railways.gov.in" },
        ].map(f => (
          <div className="form-group" key={f.key}>
            <label className="form-label">{f.label}</label>
            <input className="form-input" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
          </div>
        ))}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={e => set("role", e.target.value)}>
              {/* Admins cannot create another Admin */}
              {["Operator","Analyst"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
              {["Active","Inactive"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}
            onClick={() => onSave({ ...form, zone: adminZone })}>
            {isEdit ? "Update User" : "Add User"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const UsersRoles = () => {
  const { admin: CURRENT_ADMIN } = useAuth();
  const [users, setUsers]     = useState(INITIAL_USERS);
  const [query, setQuery]     = useState("");
  const [roleFilter, setRoleF]= useState("All");
  const [addModal, setAdd]    = useState(false);
  const [editTarget, setEdit] = useState(null);
  const [delTarget,  setDel]  = useState(null);

  const myZone     = CURRENT_ADMIN?.zone || "NR";
  const zoneUsers  = users.filter(u => u.zone === myZone);

  const filtered = zoneUsers.filter(u =>
    (roleFilter === "All" || u.role === roleFilter) &&
    (`${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase()))
  );

  const nextId = () => `USR-${String(users.length + 1).padStart(3, "0")}`;

  const handleAdd  = f => { setUsers(p => [...p, { ...f, id:nextId(), lastLogin:"Never" }]); setAdd(false); };
  const handleEdit = f => {
    // Safety: only allow editing users in own zone
    if (f.zone !== myZone) return;
    setUsers(p => p.map(u => u.id === f.id ? f : u));
    setEdit(null);
  };
  const handleDelete = () => {
    // Safety: cannot delete another admin
    if (delTarget.role === "Admin") return;
    setUsers(p => p.filter(u => u.id !== delTarget.id));
    setDel(null);
  };

  return (
    <DashboardLayout title="Users & Roles" sub={`Managing users for Zone ${myZone} — ${CURRENT_ADMIN.name}`}>

      {/* Zone context banner */}
      <div style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:12, padding:"12px 18px", marginBottom:20 }}>
        <FiLock size={15} color="#3b82f6" />
        <span style={{ color:"#60a5fa", fontSize:13, fontWeight:600 }}>
          You are managing Zone <strong>{myZone}</strong> — you can only view and manage users assigned to your zone.
        </span>
      </div>

      {/* KPI Cards */}
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Zone Users"  value={zoneUsers.length}                                    color="#3b82f6" icon={FiUsers}    />
        <StatCard title="Operators"   value={zoneUsers.filter(u=>u.role==="Operator").length}     color="#3b82f6" icon={FiUsers}    />
        <StatCard title="Analysts"    value={zoneUsers.filter(u=>u.role==="Analyst").length}      color="#22c55e" icon={FiBarChart2}/>
        <StatCard title="Active"      value={zoneUsers.filter(u=>u.status==="Active").length}     color="#22c55e" icon={FiShield}   />
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"16px", alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"var(--surface-alt, #060e1e)", border:"1px solid #1a3356", borderRadius:"10px", padding:"8px 14px", flex:1 }}>
          <FiSearch color="#3a5a7c" size={14} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or email…"
            style={{ background:"transparent", border:"none", outline:"none", color:"#f1f5f9", fontSize:"13px", width:"100%" }} />
        </div>
        <select className="form-select" value={roleFilter} onChange={e => setRoleF(e.target.value)} style={{ padding:"8px 12px", width:"auto" }}>
          {["All","Operator","Analyst"].map(r => <option key={r}>{r}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setAdd(true)}>
          <FiPlus size={13} /> Add User
        </button>
      </div>

      {/* User Table */}
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div className="section-title" style={{ margin:0 }}>
            Zone {myZone} — User Directory ({filtered.length})
          </div>
          <span className="badge badge-info">Zone {myZone}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const isMe = u.id === CURRENT_ADMIN.id;
                const isOtherAdmin = u.role === "Admin" && !isMe;
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:30, height:30, borderRadius:"8px", background:"rgba(37,99,235,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#60a5fa", fontWeight:700, fontSize:13, flexShrink:0 }}>
                          {u.name[0]}
                        </div>
                        <div>
                          <span style={{ color:"#f1f5f9", fontWeight:600 }}>{u.name}</span>
                          {isMe && <span style={{ marginLeft:6, color:"#22c55e", fontSize:11, fontWeight:700 }}>(You)</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ color:"#64748b" }}>{u.email}</td>
                    <td><span className={`badge ${roleClass(u.role)}`}>{u.role}</span></td>
                    <td><span className={`badge ${statusClass(u.status)}`}>{u.status}</span></td>
                    <td style={{ color:"#4a6fa5", fontSize:"12px" }}>{u.lastLogin}</td>
                    <td>
                      {isOtherAdmin ? (
                        /* Cannot edit/delete another admin */
                        <span style={{ color:"#2a4a6e", fontSize:11, display:"flex", alignItems:"center", gap:4 }}>
                          <FiLock size={11} /> Protected
                        </span>
                      ) : (
                        <div style={{ display:"flex", gap:"6px" }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEdit(u)}><FiEdit2 size={12} /></button>
                          {!isMe && (
                            <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }} onClick={() => setDel(u)}><FiTrash2 size={12} /></button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:"center", color:"#4a6fa5", padding:30 }}>No users found in Zone {myZone}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {addModal && (
        <UserModal adminZone={myZone} onSave={handleAdd} onClose={() => setAdd(false)} />
      )}
      {editTarget && (
        <UserModal user={editTarget} adminZone={myZone} onSave={handleEdit} onClose={() => setEdit(null)} />
      )}
      {delTarget && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDel(null)}>
          <div className="modal-box" style={{ maxWidth:380 }}>
            <div className="modal-title">Remove User</div>
            <p style={{ color:"#94a3b8", marginBottom:"24px" }}>
              Remove <strong style={{ color:"#60a5fa" }}>{delTarget.name}</strong> from Zone {myZone}? This cannot be undone.
            </p>
            <div style={{ display:"flex", gap:"10px" }}>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:"center" }} onClick={handleDelete}>Remove</button>
              <button className="btn btn-outline" onClick={() => setDel(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UsersRoles;
