import { useState } from "react";
import { FiMapPin, FiEye, FiRefreshCw, FiX, FiTruck } from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";
import { useOperatorData } from "../context/OperatorDataContext";

const STATUSES = ["On Time","Running","Delayed","Halted","Maintenance"];

const badge = s => {
  const m = {"On Time":"badge-ontime","Running":"badge-active","Delayed":"badge-delayed","Maintenance":"badge-maint","Halted":"badge-high","Active":"badge-active","Offline":"badge-offline"};
  return <span className={`badge ${m[s]||"badge-info"}`}>{s}</span>;
};

function DetailModal({ wagon, onClose }) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{maxWidth:"520px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div className="modal-title" style={{margin:0}}><img src="/BW-iconic.png" alt="" style={{width:18,height:18,objectFit:"contain",verticalAlign:"middle",marginRight:6}}/> {wagon.id} — Details</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer"}}><FiX size={18}/></button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
          {[
            ["Route",    wagon.route],
            ["Location", wagon.location],
            ["Status",   null, badge(wagon.status)],
            ["ETA",      wagon.eta],
            ["Speed",    `${wagon.speed} km/h`],
            ["Load",     `${wagon.load}%`],
            ["Type",     wagon.type],
            ["GPS",      null, badge(wagon.gps)],
          ].map(([label,val,node])=>(
            <div key={label} style={{background:"#071628",border:"1px solid #1a3356",borderRadius:"10px",padding:"12px"}}>
              <div style={{color:"#4a6fa5",fontSize:"11px",marginBottom:"4px",textTransform:"uppercase",letterSpacing:".5px"}}>{label}</div>
              <div style={{color:"#f1f5f9",fontWeight:600,fontSize:"14px"}}>{node||val}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-outline" style={{marginTop:"20px",width:"100%",justifyContent:"center"}} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function StatusModal({ wagon, onSave, onClose }) {
  const [status, setStatus] = useState(wagon.status);
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{maxWidth:"380px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div className="modal-title" style={{margin:0}}>Update Status — {wagon.id}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer"}}><FiX size={18}/></button>
        </div>
        <div className="form-group">
          <label className="form-label">New Status</label>
          <select className="form-select" value={status} onChange={e=>setStatus(e.target.value)}>
            {STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
        </div>
        <div style={{display:"flex",gap:"10px",marginTop:"8px"}}>
          <button className="btn btn-primary" style={{flex:1,justifyContent:"center"}} onClick={()=>onSave(status)}>Save</button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function OperatorWagons() {
  const { wagons, updateWagonStatus } = useOperatorData();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState("All");
  const [detail, setDetail]   = useState(null);
  const [updateW, setUpdateW] = useState(null);
  const [toast, setToast]     = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const handleSaveStatus = (status) => {
    updateWagonStatus(updateW.id, status);
    showToast(`✓ ${updateW.id} status updated to "${status}"`);
    setUpdateW(null);
  };

  const filtered = wagons.filter(w =>
    (filter==="All" || w.status===filter) &&
    (w.id.toLowerCase().includes(search.toLowerCase()) || w.route.toLowerCase().includes(search.toLowerCase()) || w.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <OperatorLayout title="Assigned Wagons" sub="Manage and monitor your assigned wagon fleet" moduleKey="wagons">
      {toast && (
        <div style={{position:"fixed",top:"20px",right:"24px",background:"#16a34a",color:"#fff",padding:"12px 20px",borderRadius:"10px",fontWeight:600,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
          {toast}
        </div>
      )}

      <div className="card mb-20" style={{padding:"16px 20px"}}>
        <div className="flex items-center justify-between" style={{flexWrap:"wrap",gap:"12px"}}>
          <div className="flex items-center gap-12">
            <div className="search-box" style={{width:"240px"}}>
              <FiMapPin size={13} color="#4a6fa5"/>
              <input placeholder="Search by ID, route, location…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="form-select" style={{width:"160px",padding:"9px 12px"}} value={filter} onChange={e=>setFilter(e.target.value)}>
              {["All","On Time","Running","Delayed","Halted","Maintenance"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-12">
            {[["#3b82f6","Total",wagons.length],["#22c55e","On Time",wagons.filter(w=>w.status==="On Time").length],["#f59e0b","Delayed",wagons.filter(w=>w.status==="Delayed").length],["#ef4444","Maintenance",wagons.filter(w=>w.status==="Maintenance").length]].map(([c,l,v])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{color:c,fontWeight:800,fontSize:"18px"}}>{v}</div>
                <div style={{color:"#64748b",fontSize:"11px"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Wagon ID</th><th>Route</th><th>Current Location</th><th>Status</th><th>ETA</th><th>Speed</th><th>Load</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(w=>(
                <tr key={w.id}>
                  <td><span style={{color:"#60a5fa",fontWeight:700}}>{w.id}</span></td>
                  <td style={{fontSize:"13px"}}>{w.route}</td>
                  <td><span className="flex items-center gap-8"><FiMapPin size={12} color="#4a6fa5"/>{w.location}</span></td>
                  <td>{badge(w.status)}</td>
                  <td style={{color:"#94a3b8"}}>{w.eta}</td>
                  <td style={{color:"#94a3b8"}}>{w.speed} km/h</td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                      <div className="progress-bg" style={{width:"60px"}}>
                        <div className="progress-fill" style={{width:`${w.load}%`,background:w.load>80?"#ef4444":w.load>60?"#f59e0b":"#22c55e"}}/>
                      </div>
                      <span style={{color:"#94a3b8",fontSize:"12px"}}>{w.load}%</span>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={()=>setDetail(w)}><FiEye size={12}/> View</button>
                      <button className="btn btn-outline btn-sm" onClick={()=>setUpdateW(w)}><FiRefreshCw size={12}/> Status</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length===0 && (
          <div style={{textAlign:"center",padding:"40px",color:"#4a6fa5"}}>
            <FiTruck size={32} style={{marginBottom:"12px",opacity:.4}}/>
            <div>No wagons match your filter</div>
          </div>
        )}
      </div>

      {detail  && <DetailModal wagon={detail}  onClose={()=>setDetail(null)}/>}
      {updateW && <StatusModal wagon={updateW} onSave={handleSaveStatus} onClose={()=>setUpdateW(null)}/>}
    </OperatorLayout>
  );
}
