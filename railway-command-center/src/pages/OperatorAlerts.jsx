import { useState } from "react";
import { FiAlertTriangle, FiEye, FiCheckCircle, FiX } from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";

const INIT_ALERTS = [
  { id:"ALT-001", wagon:"WGN-2187", type:"Speed Anomaly",       severity:"Critical", time:"10:14 AM", detail:"Wagon detected at 142 km/h on a 90 km/h restricted zone near Vizag Station. Immediate brake check required." },
  { id:"ALT-002", wagon:"WGN-4056", type:"Brake Wear",          severity:"High",     time:"09:32 AM", detail:"Brake pad thickness below 8mm threshold on Axle 3 & 4. Maintenance flagged." },
  { id:"ALT-003", wagon:"WGN-1042", type:"Route Deviation",     severity:"Medium",   time:"08:50 AM", detail:"Wagon deviated 2.3 km from planned route near Kota Jn. Driver alerted via cabin display." },
  { id:"ALT-004", wagon:"WGN-6613", type:"GPS Signal Lost",     severity:"High",     time:"08:22 AM", detail:"GPS module unresponsive for 14 minutes. Last known location: Bhopal Jn. Reconnection attempt underway." },
  { id:"ALT-005", wagon:"WGN-8421", type:"Cargo Overload",      severity:"Critical", time:"07:58 AM", detail:"Cargo weight detected at 108% of rated capacity. Immediate load redistribution advised before departure." },
  { id:"ALT-006", wagon:"WGN-5774", type:"Temperature Alert",   severity:"Medium",   time:"07:30 AM", detail:"Axle bearing temperature reached 78°C (threshold: 70°C). Wagon speed reduced as precautionary measure." },
  { id:"ALT-007", wagon:"WGN-3301", type:"Engine Vibration",    severity:"Low",      time:"07:10 AM", detail:"Unusual vibration pattern detected in coupling unit. Scheduled for inspection at next halt." },
];

const SEV_COLOR = { Critical:"#ef4444", High:"#f97316", Medium:"#f59e0b", Low:"#22c55e" };
const SEV_BADGE = { Critical:"badge-critical", High:"badge-high", Medium:"badge-medium", Low:"badge-low" };

function AlertModal({ alert, onClose }) {
  return (
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal-box" style={{maxWidth:"480px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
          <div className="modal-title" style={{margin:0}}>Alert {alert.id}</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#64748b",cursor:"pointer"}}><FiX size={18}/></button>
        </div>
        <div style={{
          padding:"16px",marginBottom:"16px",
          background:`${SEV_COLOR[alert.severity]}10`,
          border:`1px solid ${SEV_COLOR[alert.severity]}40`,
          borderRadius:"12px",borderLeft:`4px solid ${SEV_COLOR[alert.severity]}`,
        }}>
          <div style={{color:SEV_COLOR[alert.severity],fontWeight:700,fontSize:"15px",marginBottom:"6px"}}>{alert.type}</div>
          <div style={{color:"#94a3b8",fontSize:"13px",lineHeight:1.6}}>{alert.detail}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
          {[["Alert ID",alert.id],["Wagon",alert.wagon],["Severity",null,<span className={`badge ${SEV_BADGE[alert.severity]}`}>{alert.severity}</span>],["Time",alert.time]].map(([l,v,n])=>(
            <div key={l} style={{background:"#071628",border:"1px solid #1a3356",borderRadius:"10px",padding:"10px"}}>
              <div style={{color:"#4a6fa5",fontSize:"11px",marginBottom:"3px",textTransform:"uppercase"}}>{l}</div>
              <div style={{color:"#f1f5f9",fontWeight:600,fontSize:"13px"}}>{n||v}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-outline" style={{marginTop:"16px",width:"100%",justifyContent:"center"}} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function OperatorAlerts() {
  const [active,   setActive]   = useState(INIT_ALERTS);
  const [resolved, setResolved] = useState([]);
  const [detail,   setDetail]   = useState(null);
  const [filter,   setFilter]   = useState("All");
  const [toast,    setToast]    = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const resolve = id => {
    const item = active.find(a=>a.id===id);
    setActive(a => a.filter(x=>x.id!==id));
    setResolved(r => [{ ...item, resolvedAt: new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}) }, ...r]);
    showToast(`✓ Alert ${id} resolved`);
  };

  const filtered = active.filter(a => filter==="All" || a.severity===filter);

  return (
    <OperatorLayout title="AI Alerts" sub="Monitor and resolve AI-generated operational alerts" alertCount={active.length}>
      {toast && (
        <div style={{position:"fixed",top:"20px",right:"24px",background:"#16a34a",color:"#fff",padding:"12px 20px",borderRadius:"10px",fontWeight:600,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
          {toast}
        </div>
      )}

      {/* KPIs */}
      <div className="grid-4 mb-20">
        {[
          ["Active Alerts",  active.length,                              "#ef4444"],
          ["Critical",       active.filter(a=>a.severity==="Critical").length, "#ef4444"],
          ["High",           active.filter(a=>a.severity==="High").length,     "#f97316"],
          ["Resolved Today", resolved.length,                           "#22c55e"],
        ].map(([l,v,c])=>(
          <div key={l} className="glass" style={{textAlign:"center"}}>
            <div style={{color:c,fontSize:"32px",fontWeight:800}}>{v}</div>
            <div style={{color:"#64748b",fontSize:"12px",marginTop:"4px"}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card mb-20" style={{padding:"12px 20px"}}>
        <div className="flex items-center gap-10">
          {["All","Critical","High","Medium","Low"].map(s=>(
            <button key={s} onClick={()=>setFilter(s)} className={`btn btn-sm ${filter===s?"btn-primary":"btn-ghost"}`}>{s}</button>
          ))}
          <span style={{marginLeft:"auto",color:"#4a6fa5",fontSize:"12px"}}>{filtered.length} active alert{filtered.length!==1?"s":""}</span>
        </div>
      </div>

      {/* Active Alerts Table */}
      <div className="card mb-20">
        <div className="section-title" style={{marginBottom:"16px"}}>Active Alerts</div>
        {filtered.length === 0 ? (
          <div style={{textAlign:"center",padding:"48px",color:"#4a6fa5"}}>
            <FiCheckCircle size={36} style={{marginBottom:"12px",opacity:.4}}/>
            <div>No active alerts for this filter</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Alert ID</th><th>Wagon ID</th><th>Alert Type</th><th>Severity</th><th>Time</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(a=>(
                  <tr key={a.id}>
                    <td style={{color:"#60a5fa",fontWeight:700}}>{a.id}</td>
                    <td style={{color:"#94a3b8",fontWeight:600}}>{a.wagon}</td>
                    <td>
                      <span className="flex items-center gap-8">
                        <FiAlertTriangle size={12} color={SEV_COLOR[a.severity]}/>
                        {a.type}
                      </span>
                    </td>
                    <td><span className={`badge ${SEV_BADGE[a.severity]}`}>{a.severity}</span></td>
                    <td style={{color:"#4a6fa5"}}>{a.time}</td>
                    <td>
                      <div className="flex items-center gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={()=>setDetail(a)}><FiEye size={12}/> View</button>
                        <button className="btn btn-success btn-sm" onClick={()=>resolve(a.id)}><FiCheckCircle size={12}/> Resolve</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolved Log */}
      {resolved.length > 0 && (
        <div className="card" style={{border:"1px solid rgba(34,197,94,.15)"}}>
          <div className="section-title" style={{marginBottom:"16px",color:"#22c55e"}}>✓ Resolved Alerts ({resolved.length})</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Alert ID</th><th>Wagon ID</th><th>Alert Type</th><th>Severity</th><th>Resolved At</th></tr></thead>
              <tbody>
                {resolved.map(a=>(
                  <tr key={a.id} style={{opacity:.65}}>
                    <td style={{color:"#4a6fa5"}}>{a.id}</td>
                    <td>{a.wagon}</td>
                    <td>{a.type}</td>
                    <td><span className={`badge ${SEV_BADGE[a.severity]}`}>{a.severity}</span></td>
                    <td style={{color:"#22c55e"}}>{a.resolvedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {detail && <AlertModal alert={detail} onClose={()=>setDetail(null)}/>}
    </OperatorLayout>
  );
}
