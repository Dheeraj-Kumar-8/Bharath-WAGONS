import { useState } from "react";
import { FiTool, FiCheckCircle, FiPlay, FiFilter, FiX } from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";

const INIT = [
  { id:"MNT-001", wagon:"WGN-4056", type:"Brake Inspection",    priority:"Critical", assigned:"01 Jul 2025", status:"In Progress", tech:"Ramesh Kumar",   notes:"Replace worn brake pads on all axles" },
  { id:"MNT-002", wagon:"WGN-2187", type:"Wheel Alignment",     priority:"High",     assigned:"02 Jul 2025", status:"Pending",     tech:"Sanjay Mishra",  notes:"Wheel flange thickness below threshold" },
  { id:"MNT-003", wagon:"WGN-3301", type:"Routine Check",       priority:"Low",      assigned:"30 Jun 2025", status:"Completed",   tech:"Priya Singh",    notes:"Monthly routine — all clear" },
  { id:"MNT-004", wagon:"WGN-6613", type:"Coupler Replacement", priority:"High",     assigned:"02 Jul 2025", status:"Pending",     tech:"Anil Verma",     notes:"Coupler pin shows stress fractures" },
  { id:"MNT-005", wagon:"WGN-5774", type:"GPS Unit Repair",     priority:"Medium",   assigned:"01 Jul 2025", status:"In Progress", tech:"Deepa Nair",     notes:"GPS intermittent signal loss" },
  { id:"MNT-006", wagon:"WGN-1042", type:"Oil & Lubrication",   priority:"Low",      assigned:"03 Jul 2025", status:"Pending",     tech:"Suresh Patel",   notes:"Scheduled quarterly lubrication" },
  { id:"MNT-007", wagon:"WGN-7890", type:"Air Brake Test",      priority:"Medium",   assigned:"01 Jul 2025", status:"Completed",   tech:"Kavitha Rajan",  notes:"Air brake pressure test — passed" },
  { id:"MNT-008", wagon:"WGN-8421", type:"Full Overhaul",       priority:"Critical", assigned:"03 Jul 2025", status:"Pending",     tech:"Mohan Das",      notes:"Periodic full overhaul — 50k km service" },
];

const NEXT = { "Pending":"In Progress","In Progress":"Completed" };
const PRIORITY_BADGE = { Critical:"badge-critical",High:"badge-high",Medium:"badge-medium",Low:"badge-low" };
const STATUS_BADGE   = { "Pending":"badge-pending","In Progress":"badge-info","Completed":"badge-completed" };

function NoteModal({ item, onClose }) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{maxWidth:"440px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div className="modal-title" style={{margin:0}}>{item.id} — Details</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer"}}><FiX size={18}/></button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
          {[
            ["Wagon ID",    item.wagon],
            ["Task Type",   item.type],
            ["Priority",    null, <span className={`badge ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span>],
            ["Status",      null, <span className={`badge ${STATUS_BADGE[item.status]}`}>{item.status}</span>],
            ["Assigned Date",item.assigned],
            ["Technician",  item.tech],
            ["Notes",       item.notes],
          ].map(([label,val,node])=>(
            <div key={label} style={{background:"#071628",border:"1px solid #1a3356",borderRadius:"10px",padding:"12px"}}>
              <div style={{color:"#4a6fa5",fontSize:"11px",marginBottom:"4px",textTransform:"uppercase"}}>{label}</div>
              <div style={{color:"#f1f5f9",fontSize:"13px",fontWeight:600}}>{node||val}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-outline" style={{marginTop:"16px",width:"100%",justifyContent:"center"}} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function OperatorMaintenance() {
  const [items, setItems]   = useState(INIT);
  const [filter, setFilter] = useState("All");
  const [detail, setDetail] = useState(null);
  const [toast, setToast]   = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const advance = id => {
    let msg = "";
    setItems(it => it.map(x => {
      if (x.id !== id) return x;
      const next = NEXT[x.status];
      if (!next) return x;
      msg = `${x.id}: ${x.status} → ${next}`;
      return { ...x, status: next };
    }));
    showToast("✓ " + msg);
  };

  const counts = {
    All:        items.length,
    Pending:    items.filter(i=>i.status==="Pending").length,
    "In Progress": items.filter(i=>i.status==="In Progress").length,
    Completed:  items.filter(i=>i.status==="Completed").length,
  };

  const filtered = filter === "All" ? items : items.filter(i=>i.status===filter);

  return (
    <OperatorLayout title="Maintenance" sub="Track and manage wagon maintenance tasks">
      {toast && (
        <div style={{position:"fixed",top:"20px",right:"24px",background:"#16a34a",color:"#fff",padding:"12px 20px",borderRadius:"10px",fontWeight:600,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
          {toast}
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid-4 mb-20">
        {[["Total Tasks","badge-info",items.length,"#3b82f6"],["Pending","badge-pending",counts.Pending,"#f59e0b"],["In Progress","badge-info",counts["In Progress"],"#3b82f6"],["Completed","badge-completed",counts.Completed,"#22c55e"]].map(([l,b,v,c])=>(
          <div key={l} className="glass" style={{textAlign:"center"}}>
            <div style={{color:c,fontSize:"32px",fontWeight:800}}>{v}</div>
            <div style={{color:"#64748b",fontSize:"12px",marginTop:"4px"}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="card mb-20" style={{padding:"14px 20px"}}>
        <div className="flex items-center gap-12">
          <FiFilter size={14} color="#4a6fa5"/>
          {["All","Pending","In Progress","Completed"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`btn btn-sm ${filter===s?"btn-primary":"btn-ghost"}`}>
              {s} <span style={{opacity:.7}}>({counts[s]??items.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Task ID</th><th>Wagon ID</th><th>Maintenance Type</th><th>Priority</th><th>Assigned Date</th><th>Technician</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(item=>(
                <tr key={item.id}>
                  <td style={{color:"#60a5fa",fontWeight:700}}>{item.id}</td>
                  <td style={{color:"#94a3b8",fontWeight:600}}>{item.wagon}</td>
                  <td style={{display:"flex",alignItems:"center",gap:"8px"}}><FiTool size={12} color="#4a6fa5"/>{item.type}</td>
                  <td><span className={`badge ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span></td>
                  <td style={{color:"#64748b"}}>{item.assigned}</td>
                  <td style={{color:"#94a3b8"}}>{item.tech}</td>
                  <td><span className={`badge ${STATUS_BADGE[item.status]}`}>{item.status}</span></td>
                  <td>
                    <div className="flex items-center gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={()=>setDetail(item)}>Details</button>
                      {item.status==="Pending" && (
                        <button className="btn btn-primary btn-sm" onClick={()=>advance(item.id)}><FiPlay size={11}/> Start</button>
                      )}
                      {item.status==="In Progress" && (
                        <button className="btn btn-success btn-sm" onClick={()=>advance(item.id)}><FiCheckCircle size={11}/> Complete</button>
                      )}
                      {item.status==="Completed" && (
                        <span style={{color:"#22c55e",fontSize:"12px",fontWeight:600}}>✓ Done</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {detail && <NoteModal item={detail} onClose={()=>setDetail(null)}/>}
    </OperatorLayout>
  );
}
