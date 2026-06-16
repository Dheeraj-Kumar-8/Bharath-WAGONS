import { useState } from "react";
import { FiAlertTriangle, FiAlertOctagon, FiInfo, FiCheck, FiX, FiBell } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const ALL_ALERTS = [
  { id:"ALT-001", wagon:"WGN-101", type:"GPS Signal Lost",     priority:"Critical", zone:"NR",  time:"12:15 PM", status:"Active",   desc:"GPS module offline. Signal lost in North Zone near Mathura." },
  { id:"ALT-002", wagon:"WGN-234", type:"Route Deviation",     priority:"High",     zone:"CR",  time:"12:18 PM", status:"Active",   desc:"Wagon deviated 12 km from planned route. Manual override needed." },
  { id:"ALT-003", wagon:"WGN-876", type:"Door Open Detected",  priority:"High",     zone:"SR",  time:"12:20 PM", status:"Active",   desc:"Cargo door sensor triggered while wagon in motion at 64 km/h." },
  { id:"ALT-004", wagon:"WGN-555", type:"Speed Limit Exceeded",priority:"Medium",   zone:"WR",  time:"12:22 PM", status:"Resolved", desc:"Wagon exceeded 100 km/h limit. Auto-brakes engaged. Now 87 km/h." },
  { id:"ALT-005", wagon:"WGN-789", type:"Cargo Overweight",    priority:"Low",      zone:"SCR", time:"12:25 PM", status:"Pending",  desc:"Cargo load 4.2T above rated capacity. Inspection recommended." },
  { id:"ALT-006", wagon:"WGN-312", type:"Brake Failure",       priority:"Critical", zone:"ER",  time:"12:30 PM", status:"Active",   desc:"Primary brake system fault detected. Emergency stop triggered." },
  { id:"ALT-007", wagon:"WGN-451", type:"Temperature Alert",   priority:"Medium",   zone:"SWR", time:"12:35 PM", status:"Active",   desc:"Axle temperature 92°C, exceeding 85°C threshold." },
  { id:"ALT-008", wagon:"WGN-602", type:"GPS Weak Signal",     priority:"Low",      zone:"NWR", time:"12:40 PM", status:"Resolved", desc:"Signal strength below 40%. Reconnected via backup satellite." },
  { id:"ALT-009", wagon:"WGN-145", type:"Wheel Wear Alert",    priority:"High",     zone:"ECR", time:"12:44 PM", status:"Pending",  desc:"Wheel wear index 0.87 — critical threshold 0.90. Schedule maintenance." },
  { id:"ALT-010", wagon:"WGN-930", type:"Battery Low",         priority:"Low",      zone:"NCR", time:"12:48 PM", status:"Active",   desc:"GPS tracker battery at 12%. Estimated 6 hours until shutdown." },
  { id:"ALT-011", wagon:"WGN-277", type:"Route Congestion",    priority:"Medium",   zone:"CR",  time:"12:52 PM", status:"Active",   desc:"Mumbai Corridor congested. AI recommends alternate route via Pune." },
  { id:"ALT-012", wagon:"WGN-099", type:"Fuel Level Critical", priority:"Critical", zone:"SCR", time:"12:55 PM", status:"Active",   desc:"Diesel level below 8%. Nearest depot is Nagpur — 42 km ahead." },
];

const TABS = ["All","Critical","High","Medium","Low"];
const priorityClass = p => ({ Critical:"badge-critical",High:"badge-high",Medium:"badge-medium",Low:"badge-low" }[p]||"badge-info");
const statusClass   = s => ({ Active:"badge-critical",Resolved:"badge-low",Pending:"badge-medium" }[s]||"badge-info");

const AIAlerts = () => {
  const [alerts, setAlerts] = useState(ALL_ALERTS);
  const [tab, setTab] = useState("All");
  const [detail, setDetail] = useState(null);

  const filtered = tab === "All" ? alerts : alerts.filter(a => a.priority === tab);

  const resolve  = id => setAlerts(p => p.map(a => a.id === id ? { ...a, status:"Resolved" } : a));
  const dismiss  = id => setAlerts(p => p.filter(a => a.id !== id));

  const counts = {
    Critical: alerts.filter(a => a.priority==="Critical").length,
    High:     alerts.filter(a => a.priority==="High").length,
    Medium:   alerts.filter(a => a.priority==="Medium").length,
    Low:      alerts.filter(a => a.priority==="Low").length,
  };

  return (
    <DashboardLayout title="AI Alerts" sub="Real-time AI-powered monitoring alerts across the wagon network">
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Critical" value={counts.Critical} color="#ef4444" icon={FiAlertOctagon} />
        <StatCard title="High"     value={counts.High}     color="#f97316" icon={FiAlertTriangle} />
        <StatCard title="Medium"   value={counts.Medium}   color="#f59e0b" icon={FiBell} />
        <StatCard title="Low"      value={counts.Low}      color="#22c55e" icon={FiInfo} />
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"16px" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-outline"}`}>
            {t} {t !== "All" && <span style={{ marginLeft:"4px", background:"rgba(255,255,255,.2)", borderRadius:"10px", padding:"1px 6px", fontSize:"10px" }}>{counts[t]||0}</span>}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="section-title">Alert Log ({filtered.length})</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Alert ID</th><th>Wagon</th><th>Alert Type</th><th>Priority</th><th>Zone</th><th>Time</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td style={{ color:"#4a6fa5", fontWeight:600 }}>{a.id}</td>
                  <td style={{ color:"#60a5fa", fontWeight:600, cursor:"pointer" }} onClick={() => setDetail(a)}>{a.wagon}</td>
                  <td style={{ color:"#f1f5f9" }}>{a.type}</td>
                  <td>{<span className={`badge ${priorityClass(a.priority)}`}>{a.priority}</span>}</td>
                  <td><span className="badge badge-info">{a.zone}</span></td>
                  <td style={{ color:"#4a6fa5" }}>{a.time}</td>
                  <td>{<span className={`badge ${statusClass(a.status)}`}>{a.status}</span>}</td>
                  <td>
                    <div style={{ display:"flex", gap:"6px" }}>
                      {a.status === "Active" && (
                        <button className="btn btn-sm" style={{ background:"rgba(34,197,94,.12)", color:"#22c55e" }} onClick={() => resolve(a.id)}>
                          <FiCheck size={11} /> Resolve
                        </button>
                      )}
                      <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }} onClick={() => dismiss(a.id)}>
                        <FiX size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign:"center", color:"#4a6fa5", padding:"30px" }}>No alerts for this priority level</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDetail(null)}>
          <div className="modal-box">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <div className="modal-title" style={{ margin:0 }}>Alert Details</div>
              <button onClick={() => setDetail(null)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18} /></button>
            </div>
            <div style={{ display:"flex", gap:"10px", marginBottom:"16px" }}>
              <span className={`badge ${priorityClass(detail.priority)}`}>{detail.priority}</span>
              <span className={`badge ${statusClass(detail.status)}`}>{detail.status}</span>
              <span className="badge badge-info">{detail.zone}</span>
            </div>
            {[
              { label:"Alert ID",    val: detail.id     },
              { label:"Wagon",       val: detail.wagon  },
              { label:"Alert Type",  val: detail.type   },
              { label:"Time",        val: detail.time   },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", gap:"12px", marginBottom:"10px" }}>
                <span style={{ color:"#4a6fa5", fontSize:"13px", width:"90px", flexShrink:0 }}>{r.label}</span>
                <span style={{ color:"#f1f5f9", fontSize:"13px", fontWeight:600 }}>{r.val}</span>
              </div>
            ))}
            <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:"10px", padding:"14px", marginTop:"12px" }}>
              <div style={{ color:"#4a6fa5", fontSize:"12px", marginBottom:"6px" }}>Description</div>
              <div style={{ color:"#cbd5e1", fontSize:"13px" }}>{detail.desc}</div>
            </div>
            <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
              {detail.status === "Active" && (
                <button className="btn btn-success" style={{ flex:1, justifyContent:"center" }} onClick={() => { resolve(detail.id); setDetail(null); }}>
                  <FiCheck size={14} /> Mark Resolved
                </button>
              )}
              <button className="btn btn-outline" onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AIAlerts;
