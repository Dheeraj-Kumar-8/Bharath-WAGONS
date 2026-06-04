import { useState } from "react";
import { FiUsers, FiShield, FiEye, FiPlus, FiEdit2, FiTrash2, FiX, FiSearch } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const INITIAL_USERS = [
  { id:"USR-001", name:"Rajesh Kumar",    email:"rajesh.k@railways.gov.in",   role:"Admin",    zone:"All",  status:"Active",   lastLogin:"Today 09:42 AM"   },
  { id:"USR-002", name:"Priya Sharma",    email:"priya.s@railways.gov.in",    role:"Operator", zone:"NR",   status:"Active",   lastLogin:"Today 08:15 AM"   },
  { id:"USR-003", name:"Amit Verma",      email:"amit.v@railways.gov.in",     role:"Operator", zone:"CR",   status:"Active",   lastLogin:"Today 10:02 AM"   },
  { id:"USR-004", name:"Sunita Nair",     email:"sunita.n@railways.gov.in",   role:"Viewer",   zone:"SR",   status:"Active",   lastLogin:"Yesterday"        },
  { id:"USR-005", name:"Rohit Patel",     email:"rohit.p@railways.gov.in",    role:"Operator", zone:"WR",   status:"Active",   lastLogin:"Today 07:55 AM"   },
  { id:"USR-006", name:"Kavitha Reddy",   email:"kavitha.r@railways.gov.in",  role:"Viewer",   zone:"SCR",  status:"Inactive", lastLogin:"3 days ago"       },
  { id:"USR-007", name:"Deepak Singh",    email:"deepak.s@railways.gov.in",   role:"Admin",    zone:"All",  status:"Active",   lastLogin:"Today 11:20 AM"   },
  { id:"USR-008", name:"Neha Joshi",      email:"neha.j@railways.gov.in",     role:"Viewer",   zone:"ER",   status:"Active",   lastLogin:"Today 09:00 AM"   },
  { id:"USR-009", name:"Arun Mishra",     email:"arun.m@railways.gov.in",     role:"Operator", zone:"ECR",  status:"Active",   lastLogin:"Yesterday"        },
  { id:"USR-010", name:"Lakshmi Iyer",    email:"lakshmi.i@railways.gov.in",  role:"Viewer",   zone:"SWR",  status:"Inactive", lastLogin:"1 week ago"       },
];

const ROLES = [
  { role:"Admin",    icon:FiShield, color:"#ef4444", perms:["Full system access","User management","Report generation","System configuration"] },
  { role:"Operator", icon:FiUsers,  color:"#3b82f6", perms:["Live tracking","Wagon management","Alert management","Station monitoring"]         },
  { role:"Viewer",   icon:FiEye,    color:"#22c55e", perms:["View dashboard","View reports","View alerts","View tracking (read-only)"]           },
];

const ZONES = ["All","NR","CR","SR","ER","WR","SCR","NCR","NWR","ECR","SWR"];
const roleClass = r => ({ Admin:"badge-critical", Operator:"badge-info", Viewer:"badge-active" }[r]||"badge-info");
const statusClass = s => ({ Active:"badge-active", Inactive:"badge-inactive" }[s]||"badge-info");
const emptyForm = () => ({ name:"", email:"", role:"Operator", zone:"NR", status:"Active" });

const UserModal = ({ user, onSave, onClose }) => {
  const [form, setForm] = useState(user || emptyForm());
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <div className="modal-title" style={{ margin:0 }}>{user ? "Edit User" : "Add New User"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18} /></button>
        </div>
        {[
          { label:"Full Name", key:"name",  type:"text",  ph:"e.g. Rajesh Kumar"          },
          { label:"Email",     key:"email", type:"email", ph:"e.g. user@railways.gov.in"  },
        ].map(f => (
          <div className="form-group" key={f.key}>
            <label className="form-label">{f.label}</label>
            <input className="form-input" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
          {[
            { label:"Role",   key:"role",   opts:["Admin","Operator","Viewer"] },
            { label:"Zone",   key:"zone",   opts:ZONES },
            { label:"Status", key:"status", opts:["Active","Inactive"] },
          ].map(f => (
            <div className="form-group" key={f.key} style={{ margin:0 }}>
              <label className="form-label">{f.label}</label>
              <select className="form-select" value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={() => onSave(form)}>
            {user ? "Update User" : "Add User"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const UsersRoles = () => {
  const [users, setUsers]      = useState(INITIAL_USERS);
  const [query, setQuery]      = useState("");
  const [roleFilter, setRoleF] = useState("All");
  const [addModal, setAdd]     = useState(false);
  const [editTarget, setEdit]  = useState(null);
  const [delTarget,  setDel]   = useState(null);

  const filtered = users.filter(u =>
    (roleFilter === "All" || u.role === roleFilter) &&
    (`${u.name} ${u.email} ${u.zone}`.toLowerCase().includes(query.toLowerCase()))
  );

  const nextId = () => `USR-${String(users.length + 1).padStart(3, "0")}`;
  const handleAdd    = f => { setUsers(p => [...p, { ...f, id:nextId(), lastLogin:"Never" }]); setAdd(false); };
  const handleEdit   = f => { setUsers(p => p.map(u => u.id === f.id ? f : u)); setEdit(null); };
  const handleDelete = ()  => { setUsers(p => p.filter(u => u.id !== delTarget.id)); setDel(null); };

  return (
    <DashboardLayout title="Users & Roles" sub="Manage system users, roles, and access permissions">
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Total Users"  value={users.length}                                    color="#3b82f6" icon={FiUsers} />
        <StatCard title="Admins"       value={users.filter(u=>u.role==="Admin").length}         color="#ef4444" icon={FiShield} />
        <StatCard title="Operators"    value={users.filter(u=>u.role==="Operator").length}      color="#3b82f6" icon={FiUsers} />
        <StatCard title="Viewers"      value={users.filter(u=>u.role==="Viewer").length}        color="#22c55e" icon={FiEye} />
      </div>

      {/* Role Overview */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"16px", marginBottom:"20px" }}>
        {ROLES.map(r => (
          <div key={r.role} className="card">
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"14px" }}>
              <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:`${r.color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <r.icon color={r.color} size={18} />
              </div>
              <div>
                <div style={{ color:"#f1f5f9", fontWeight:700 }}>{r.role}</div>
                <div style={{ color:"#64748b", fontSize:"12px" }}>{users.filter(u=>u.role===r.role).length} users</div>
              </div>
            </div>
            {r.perms.map(p => (
              <div key={p} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
                <span style={{ color: r.color, flexShrink:0 }}>✓</span>
                <span style={{ color:"#94a3b8", fontSize:"12px" }}>{p}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"16px", alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"#060e1e", border:"1px solid #1a3356", borderRadius:"10px", padding:"8px 14px", flex:1 }}>
          <FiSearch color="#3a5a7c" size={14} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, email, zone…"
            style={{ background:"transparent", border:"none", outline:"none", color:"#f1f5f9", fontSize:"13px", width:"100%" }} />
        </div>
        <select className="form-select" value={roleFilter} onChange={e => setRoleF(e.target.value)} style={{ padding:"8px 12px", width:"auto" }}>
          {["All","Admin","Operator","Viewer"].map(r => <option key={r}>{r}</option>)}
        </select>
        <button className="btn btn-primary" onClick={() => setAdd(true)}>
          <FiPlus size={13} /> Add User
        </button>
      </div>

      <div className="card">
        <div className="section-title">User Directory ({filtered.length})</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Zone</th><th>Status</th><th>Last Login</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <div style={{ width:30, height:30, borderRadius:"8px", background:"rgba(37,99,235,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#60a5fa", fontWeight:700, fontSize:13, flexShrink:0 }}>
                        {u.name[0]}
                      </div>
                      <span style={{ color:"#f1f5f9", fontWeight:600 }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ color:"#64748b" }}>{u.email}</td>
                  <td><span className={`badge ${roleClass(u.role)}`}>{u.role}</span></td>
                  <td><span className="badge badge-info">{u.zone}</span></td>
                  <td><span className={`badge ${statusClass(u.status)}`}>{u.status}</span></td>
                  <td style={{ color:"#4a6fa5", fontSize:"12px" }}>{u.lastLogin}</td>
                  <td>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEdit(u)}><FiEdit2 size={12} /></button>
                      <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }} onClick={() => setDel(u)}><FiTrash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {addModal   && <UserModal onSave={handleAdd} onClose={() => setAdd(false)} />}
      {editTarget && <UserModal user={editTarget} onSave={handleEdit} onClose={() => setEdit(null)} />}
      {delTarget  && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDel(null)}>
          <div className="modal-box" style={{ maxWidth:380 }}>
            <div className="modal-title">Remove User</div>
            <p style={{ color:"#94a3b8", marginBottom:"24px" }}>Remove <strong style={{ color:"#60a5fa" }}>{delTarget.name}</strong> from the system?</p>
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
