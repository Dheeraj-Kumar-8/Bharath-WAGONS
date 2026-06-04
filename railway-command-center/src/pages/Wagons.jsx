import { useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiFilter } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { FiTruck, FiActivity, FiAlertTriangle, FiTool } from "react-icons/fi";

const INITIAL = [
  { id:"WGN-001", type:"Freight",   location:"New Delhi",    dest:"Mumbai CST",     speed:"87",  status:"On Time",     capacity:"60T", zone:"NR"  },
  { id:"WGN-002", type:"Tank",      location:"Chennai Ctrl", dest:"Hyderabad",      speed:"64",  status:"Delayed",     capacity:"45T", zone:"SR"  },
  { id:"WGN-003", type:"Freight",   location:"Howrah",       dest:"New Delhi",      speed:"92",  status:"On Time",     capacity:"60T", zone:"ER"  },
  { id:"WGN-004", type:"Flatbed",   location:"Pune Jn",      dest:"Mumbai CST",     speed:"0",   status:"Maintenance", capacity:"55T", zone:"CR"  },
  { id:"WGN-005", type:"Passenger", location:"Bengaluru",    dest:"Chennai",        speed:"78",  status:"On Time",     capacity:"200P",zone:"SWR" },
  { id:"WGN-006", type:"Freight",   location:"Ahmedabad",    dest:"New Delhi",      speed:"55",  status:"Delayed",     capacity:"60T", zone:"WR"  },
  { id:"WGN-007", type:"Freight",   location:"Lucknow",      dest:"Kolkata",        speed:"81",  status:"On Time",     capacity:"60T", zone:"NR"  },
  { id:"WGN-008", type:"Tank",      location:"Jaipur",       dest:"Mumbai",         speed:"0",   status:"Maintenance", capacity:"45T", zone:"NWR" },
  { id:"WGN-009", type:"Freight",   location:"Nagpur",       dest:"Hyderabad",      speed:"73",  status:"On Time",     capacity:"60T", zone:"SCR" },
  { id:"WGN-010", type:"Flatbed",   location:"Patna",        dest:"New Delhi",      speed:"68",  status:"Delayed",     capacity:"55T", zone:"ECR" },
  { id:"WGN-011", type:"Freight",   location:"Surat",        dest:"Ahmedabad",      speed:"90",  status:"On Time",     capacity:"60T", zone:"WR"  },
  { id:"WGN-012", type:"Passenger", location:"Coimbatore",   dest:"Bengaluru",      speed:"59",  status:"On Time",     capacity:"200P",zone:"SR"  },
  { id:"WGN-013", type:"Freight",   location:"Bhopal",       dest:"Delhi",          speed:"82",  status:"On Time",     capacity:"60T", zone:"WCR" },
  { id:"WGN-014", type:"Tank",      location:"Vizag",        dest:"Chennai",        speed:"0",   status:"Maintenance", capacity:"45T", zone:"ECoR"},
  { id:"WGN-015", type:"Flatbed",   location:"Kanpur",       dest:"Kolkata",        speed:"77",  status:"On Time",     capacity:"55T", zone:"NCR" },
];

const TYPES    = ["All","Freight","Passenger","Tank","Flatbed"];
const STATUSES = ["All","On Time","Delayed","Maintenance"];

const statusClass = s => ({ "On Time":"badge-ontime","Delayed":"badge-delayed","Maintenance":"badge-maint" }[s]||"badge-info");

const emptyForm = () => ({ id:"", type:"Freight", location:"", dest:"", speed:"", status:"On Time", capacity:"", zone:"" });

const WagonModal = ({ wagon, onSave, onClose }) => {
  const [form, setForm] = useState(wagon || emptyForm());
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <div className="modal-title" style={{ margin:0 }}>{wagon ? "Edit Wagon" : "Add New Wagon"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18} /></button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          {[
            { label:"Wagon ID",    key:"id",       type:"text",   ph:"e.g. WGN-016"   },
            { label:"Capacity",    key:"capacity", type:"text",   ph:"e.g. 60T"        },
            { label:"Location",    key:"location", type:"text",   ph:"Current location"},
            { label:"Destination", key:"dest",     type:"text",   ph:"Destination"     },
            { label:"Speed (km/h)",key:"speed",    type:"number", ph:"e.g. 80"         },
            { label:"Zone",        key:"zone",     type:"text",   ph:"e.g. NR"         },
          ].map(f => (
            <div className="form-group" key={f.key} style={{ margin:0 }}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => set(f.key, e.target.value)} disabled={f.key==="id" && !!wagon} />
            </div>
          ))}
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {["Freight","Passenger","Tank","Flatbed"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
              {["On Time","Delayed","Maintenance"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={() => onSave(form)}>
            {wagon ? "Update Wagon" : "Add Wagon"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal = ({ wagon, onConfirm, onClose }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-box" style={{ maxWidth:380 }}>
      <div className="modal-title">Delete Wagon</div>
      <p style={{ color:"#94a3b8", marginBottom:"24px" }}>Are you sure you want to delete <strong style={{ color:"#60a5fa" }}>{wagon.id}</strong>? This action cannot be undone.</p>
      <div style={{ display:"flex", gap:"10px" }}>
        <button className="btn btn-danger" style={{ flex:1, justifyContent:"center" }} onClick={onConfirm}>Delete</button>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

const Wagons = () => {
  const [data, setData]       = useState(INITIAL);
  const [query, setQuery]     = useState("");
  const [typeFilter, setType] = useState("All");
  const [statusFilter, setSt] = useState("All");
  const [addModal, setAdd]    = useState(false);
  const [editTarget, setEdit] = useState(null);
  const [delTarget,  setDel]  = useState(null);

  const filtered = data.filter(w =>
    (typeFilter === "All" || w.type === typeFilter) &&
    (statusFilter === "All" || w.status === statusFilter) &&
    (`${w.id} ${w.location} ${w.dest} ${w.type}`.toLowerCase().includes(query.toLowerCase()))
  );

  const counts = {
    total: data.length,
    active: data.filter(w => w.status === "On Time").length,
    delayed: data.filter(w => w.status === "Delayed").length,
    maint: data.filter(w => w.status === "Maintenance").length,
  };

  const handleAdd    = form => { setData(p => [...p, form]); setAdd(false); };
  const handleEdit   = form => { setData(p => p.map(w => w.id === form.id ? form : w)); setEdit(null); };
  const handleDelete = ()   => { setData(p => p.filter(w => w.id !== delTarget.id)); setDel(null); };

  return (
    <DashboardLayout title="Wagons" sub="Manage and monitor all wagons across the network">
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Total Wagons"   value={counts.total}   color="#3b82f6" icon={FiTruck} />
        <StatCard title="On Time"        value={counts.active}  color="#22c55e" icon={FiActivity} />
        <StatCard title="Delayed"        value={counts.delayed} color="#f59e0b" icon={FiAlertTriangle} />
        <StatCard title="Maintenance"    value={counts.maint}   color="#ef4444" icon={FiTool} />
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"#060e1e", border:"1px solid #1a3356", borderRadius:"10px", padding:"8px 14px", flex:1, minWidth:"200px" }}>
          <FiSearch color="#3a5a7c" size={14} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by ID, location, route…"
            style={{ background:"transparent", border:"none", outline:"none", color:"#f1f5f9", fontSize:"13px", width:"100%" }} />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <FiFilter color="#3a5a7c" size={14} />
          <select className="form-select" value={typeFilter} onChange={e => setType(e.target.value)} style={{ width:"auto", padding:"8px 12px" }}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="form-select" value={statusFilter} onChange={e => setSt(e.target.value)} style={{ width:"auto", padding:"8px 12px" }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setAdd(true)}>
          <FiPlus size={14} /> Add Wagon
        </button>
      </div>

      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
          <div className="section-title" style={{ margin:0 }}>Wagon Fleet ({filtered.length})</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Wagon ID</th><th>Type</th><th>Location</th><th>Destination</th><th>Speed</th><th>Capacity</th><th>Zone</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(w => (
                <tr key={w.id}>
                  <td style={{ color:"#60a5fa", fontWeight:700 }}>{w.id}</td>
                  <td style={{ color:"#94a3b8" }}>{w.type}</td>
                  <td>{w.location}</td>
                  <td>{w.dest}</td>
                  <td style={{ color:"#cbd5e1" }}>{w.speed} km/h</td>
                  <td style={{ color:"#64748b" }}>{w.capacity}</td>
                  <td style={{ color:"#64748b" }}>{w.zone}</td>
                  <td><span className={`badge ${statusClass(w.status)}`}>{w.status}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEdit(w)}><FiEdit2 size={12} /></button>
                      <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }} onClick={() => setDel(w)}><FiTrash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign:"center", color:"#4a6fa5", padding:"30px" }}>No wagons match your search</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addModal  && <WagonModal onSave={handleAdd}              onClose={() => setAdd(false)} />}
      {editTarget && <WagonModal wagon={editTarget} onSave={handleEdit} onClose={() => setEdit(null)} />}
      {delTarget  && <DeleteModal wagon={delTarget} onConfirm={handleDelete} onClose={() => setDel(null)} />}
    </DashboardLayout>
  );
};

export default Wagons;
