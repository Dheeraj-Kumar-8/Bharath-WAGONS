import { useState } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiMap, FiActivity, FiWifi } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const INITIAL = [
  { name:"New Delhi Junction", code:"NDLS", zone:"NR",   platforms:16, routes:24, wagons:142, status:"Online"  },
  { name:"Mumbai CST",         code:"CSTM", zone:"CR",   platforms:18, routes:22, wagons:128, status:"Online"  },
  { name:"Chennai Central",    code:"MAS",  zone:"SR",   platforms:12, routes:18, wagons:96,  status:"Online"  },
  { name:"Howrah Junction",    code:"HWH",  zone:"ER",   platforms:23, routes:26, wagons:112, status:"Online"  },
  { name:"Hyderabad Deccan",   code:"HYB",  zone:"SCR",  platforms:8,  routes:14, wagons:87,  status:"Online"  },
  { name:"Bengaluru City",     code:"SBC",  zone:"SWR",  platforms:10, routes:16, wagons:78,  status:"Online"  },
  { name:"Ahmedabad Junction", code:"ADI",  zone:"WR",   platforms:7,  routes:12, wagons:64,  status:"Online"  },
  { name:"Pune Junction",      code:"PUNE", zone:"CR",   platforms:6,  routes:10, wagons:56,  status:"Offline" },
  { name:"Lucknow NR",         code:"LKO",  zone:"NR",   platforms:9,  routes:15, wagons:72,  status:"Online"  },
  { name:"Nagpur Junction",    code:"NGP",  zone:"SCR",  platforms:8,  routes:12, wagons:61,  status:"Online"  },
  { name:"Jaipur Junction",    code:"JP",   zone:"NWR",  platforms:6,  routes:9,  wagons:48,  status:"Maintenance"},
  { name:"Patna Junction",     code:"PNBE", zone:"ECR",  platforms:7,  routes:11, wagons:54,  status:"Online"  },
];

const ZONES = ["NR","CR","SR","ER","WR","SCR","NCR","NWR","ECR","SWR","ECoR","WCR"];
const emptyForm = () => ({ name:"", code:"", zone:"NR", platforms:"", routes:"", wagons:"0", status:"Online" });
const statusClass = s => ({ Online:"badge-online", Offline:"badge-offline", Maintenance:"badge-maint" }[s]||"badge-info");

const StationModal = ({ station, onSave, onClose }) => {
  const [form, setForm] = useState(station || emptyForm());
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <div className="modal-title" style={{ margin:0 }}>{station ? "Edit Station" : "Add New Station"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18} /></button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          {[
            { label:"Station Name", key:"name",      type:"text",   ph:"e.g. Nagpur Junction" },
            { label:"Station Code", key:"code",      type:"text",   ph:"e.g. NGP"             },
            { label:"Platforms",    key:"platforms", type:"number", ph:"e.g. 8"               },
            { label:"Active Routes",key:"routes",    type:"number", ph:"e.g. 12"              },
          ].map(f => (
            <div className="form-group" key={f.key} style={{ margin:0 }}>
              <label className="form-label">{f.label}</label>
              <input className="form-input" type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
            </div>
          ))}
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Zone</label>
            <select className="form-select" value={form.zone} onChange={e => set("zone", e.target.value)}>
              {ZONES.map(z => <option key={z}>{z}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
              {["Online","Offline","Maintenance"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={() => onSave(form)}>
            {station ? "Update Station" : "Add Station"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const Stations = () => {
  const [data, setData]     = useState(INITIAL);
  const [query, setQuery]   = useState("");
  const [addModal, setAdd]  = useState(false);
  const [editTarget,setEdit]= useState(null);
  const [delTarget, setDel] = useState(null);

  const filtered = data.filter(s =>
    `${s.name} ${s.code} ${s.zone}`.toLowerCase().includes(query.toLowerCase())
  );

  const handleAdd    = f => { setData(p => [...p, { ...f, wagons: "0" }]); setAdd(false); };
  const handleEdit   = f => { setData(p => p.map(s => s.code === f.code ? f : s)); setEdit(null); };
  const handleDelete = ()  => { setData(p => p.filter(s => s.code !== delTarget.code)); setDel(null); };

  return (
    <DashboardLayout title="Stations" sub="Manage railway stations across all zones">
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Total Stations" value={data.length} color="#3b82f6" icon={FiMap} />
        <StatCard title="Online"         value={data.filter(s=>s.status==="Online").length}       color="#22c55e" icon={FiWifi} />
        <StatCard title="Offline"        value={data.filter(s=>s.status==="Offline").length}      color="#ef4444" icon={FiWifi} />
        <StatCard title="Under Maint."   value={data.filter(s=>s.status==="Maintenance").length}  color="#f59e0b" icon={FiActivity} />
      </div>

      <div style={{ display:"flex", gap:"12px", marginBottom:"16px", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"#060e1e", border:"1px solid #1a3356", borderRadius:"10px", padding:"8px 14px", flex:1 }}>
          <FiSearch color="#3a5a7c" size={14} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, code, zone…"
            style={{ background:"transparent", border:"none", outline:"none", color:"#f1f5f9", fontSize:"13px", width:"100%" }} />
        </div>
        <button className="btn btn-primary" onClick={() => setAdd(true)}>
          <FiPlus size={14} /> Add Station
        </button>
      </div>

      <div className="card">
        <div className="section-title">Station Directory ({filtered.length})</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Station Name</th><th>Code</th><th>Zone</th><th>Platforms</th><th>Active Routes</th><th>Wagons Present</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.code}>
                  <td style={{ color:"#f1f5f9", fontWeight:600 }}>{s.name}</td>
                  <td style={{ color:"#60a5fa", fontWeight:700 }}>{s.code}</td>
                  <td><span className="badge badge-info">{s.zone}</span></td>
                  <td style={{ color:"#94a3b8" }}>{s.platforms}</td>
                  <td style={{ color:"#3b82f6", fontWeight:600 }}>{s.routes}</td>
                  <td style={{ color:"#22c55e", fontWeight:600 }}>{s.wagons}</td>
                  <td><span className={`badge ${statusClass(s.status)}`}>{s.status}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEdit(s)}><FiEdit2 size={12} /></button>
                      <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }} onClick={() => setDel(s)}><FiTrash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {addModal   && <StationModal onSave={handleAdd} onClose={() => setAdd(false)} />}
      {editTarget && <StationModal station={editTarget} onSave={handleEdit} onClose={() => setEdit(null)} />}
      {delTarget  && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDel(null)}>
          <div className="modal-box" style={{ maxWidth:380 }}>
            <div className="modal-title">Delete Station</div>
            <p style={{ color:"#94a3b8", marginBottom:"24px" }}>Delete <strong style={{ color:"#60a5fa" }}>{delTarget.name}</strong>?</p>
            <div style={{ display:"flex", gap:"10px" }}>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:"center" }} onClick={handleDelete}>Delete</button>
              <button className="btn btn-outline" onClick={() => setDel(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Stations;
