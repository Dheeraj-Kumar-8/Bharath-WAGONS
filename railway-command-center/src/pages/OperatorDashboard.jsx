import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiTruck, FiCheckCircle, FiAlertTriangle, FiClipboard, FiMapPin, FiActivity, FiArrowRight } from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";

const WAGONS = [
  { id: "WGN-1042", route: "New Delhi → Mumbai", location: "Kota Jn.", status: "On Time",    eta: "14:30" },
  { id: "WGN-2187", route: "Kolkata → Chennai",  location: "Vizag",     status: "Delayed",   eta: "18:45" },
  { id: "WGN-3301", route: "Mumbai → Hyderabad", location: "Pune",      status: "On Time",   eta: "12:10" },
  { id: "WGN-4056", route: "Chennai → Delhi",    location: "Nagpur",    status: "Maintenance",eta: "--" },
  { id: "WGN-5774", route: "Hyderabad → Kolkata",location: "Raipur",    status: "On Time",   eta: "20:00" },
];

const TASKS = [
  { id: 1, text: "Inspect Wagon WGN-1042 at Kota Jn.", priority: "High",   done: false },
  { id: 2, text: "Update GPS status for WGN-2187",     priority: "Medium", done: false },
  { id: 3, text: "Verify cargo load — WGN-3301",        priority: "Low",    done: true  },
  { id: 4, text: "Brake inspection — WGN-4056",         priority: "High",   done: false },
  { id: 5, text: "Route deviation review — WGN-5774",   priority: "Medium", done: true  },
];

const ALERTS = [
  { id: "ALT-001", wagon: "WGN-2187", type: "Speed Anomaly",    severity: "Critical", time: "10:14 AM" },
  { id: "ALT-002", wagon: "WGN-4056", type: "Brake Wear",       severity: "High",     time: "09:32 AM" },
  { id: "ALT-003", wagon: "WGN-1042", type: "Route Deviation",  severity: "Medium",   time: "08:50 AM" },
];

const MAINT = [
  { wagon: "WGN-4056", type: "Brake Inspection", status: "In Progress", pct: 60 },
  { wagon: "WGN-2187", type: "Wheel Alignment",  status: "Pending",     pct: 0  },
  { wagon: "WGN-3301", type: "Routine Check",    status: "Completed",   pct: 100},
];

const statusBadge = s => {
  const m = { "On Time":"badge-ontime","Delayed":"badge-delayed","Maintenance":"badge-maint","Active":"badge-active","Pending":"badge-pending","Completed":"badge-completed","In Progress":"badge-info" };
  return <span className={`badge ${m[s]||"badge-info"}`}>{s}</span>;
};
const sevBadge = s => {
  const m = { Critical:"badge-critical",High:"badge-high",Medium:"badge-medium",Low:"badge-low" };
  return <span className={`badge ${m[s]||"badge-info"}`}>{s}</span>;
};
const priorityColor = p => ({ High:"#ef4444",Medium:"#f59e0b",Low:"#22c55e" }[p] || "#3b82f6");

const KPI = ({ icon: Icon, title, value, color, sub }) => (
  <div className="glass" style={{ display:"flex", gap:"16px", alignItems:"center" }}>
    <div style={{ width:"52px",height:"52px",borderRadius:"14px",background:`${color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ color:"#64748b",fontSize:"12px",fontWeight:600,textTransform:"uppercase",letterSpacing:".5px" }}>{title}</div>
      <div style={{ color:"#f1f5f9",fontSize:"28px",fontWeight:800,lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ color:color,fontSize:"11px",marginTop:"2px" }}>{sub}</div>}
    </div>
  </div>
);

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks]   = useState(TASKS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const toggleTask = id => setTasks(t => t.map(x => x.id === id ? { ...x, done: !x.done } : x));

  const filteredWagons = WAGONS.filter(w =>
    (filter === "All" || w.status === filter) &&
    (w.id.toLowerCase().includes(search.toLowerCase()) || w.route.toLowerCase().includes(search.toLowerCase()))
  );

  const completed = tasks.filter(t => t.done).length;

  return (
    <OperatorLayout title="Operator Dashboard" sub="Railway Operations Center · Zone NR" alertCount={ALERTS.length}>
      {/* KPIs */}
      <div className="grid-4 mb-20">
        <KPI icon={FiTruck}         title="Assigned Wagons" value="48"       color="#3b82f6" sub="+2 today" />
        <KPI icon={FiClipboard}     title="Pending Tasks"   value={tasks.filter(t=>!t.done).length} color="#f59e0b" sub="Due today" />
        <KPI icon={FiCheckCircle}   title="Completed Tasks" value={completed} color="#22c55e" sub="Today" />
        <KPI icon={FiAlertTriangle} title="Critical Alerts" value={ALERTS.filter(a=>a.severity==="Critical").length} color="#ef4444" sub="Needs attention" />
      </div>

      {/* Assigned Wagons Table */}
      <div className="card mb-20">
        <div className="flex items-center justify-between mb-16">
          <div className="section-title" style={{margin:0}}>Assigned Wagons</div>
          <div className="flex items-center gap-12">
            <div className="search-box" style={{width:"200px"}}>
              <FiMapPin size={13} color="#4a6fa5" />
              <input placeholder="Search wagons…" value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <select className="form-select" style={{width:"140px",padding:"8px 12px"}} value={filter} onChange={e=>setFilter(e.target.value)}>
              {["All","On Time","Delayed","Maintenance"].map(s=><option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate("/operator/wagons")}>View All <FiArrowRight size={12}/></button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Wagon ID</th><th>Route</th><th>Current Location</th><th>Status</th><th>ETA</th></tr></thead>
            <tbody>
              {filteredWagons.map(w=>(
                <tr key={w.id}>
                  <td style={{color:"#60a5fa",fontWeight:600}}>{w.id}</td>
                  <td>{w.route}</td>
                  <td><span className="flex items-center gap-8"><FiMapPin size={12} color="#4a6fa5"/>{w.location}</span></td>
                  <td>{statusBadge(w.status)}</td>
                  <td style={{color:"#94a3b8"}}>{w.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tasks + Alerts side by side */}
      <div className="grid-2 mb-20">
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div className="section-title" style={{margin:0}}>Today's Tasks</div>
            <span style={{color:"#64748b",fontSize:"12px"}}>{completed}/{tasks.length} done</span>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
            {tasks.map(t=>(
              <div key={t.id} onClick={()=>toggleTask(t.id)} style={{
                display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",
                background:t.done?"rgba(34,197,94,.05)":"#071628",
                border:`1px solid ${t.done?"rgba(34,197,94,.2)":"#1a3356"}`,
                borderRadius:"10px",cursor:"pointer",transition:"all .18s",
              }}>
                <div style={{
                  width:"18px",height:"18px",borderRadius:"50%",flexShrink:0,
                  background:t.done?"#22c55e":"transparent",
                  border:`2px solid ${t.done?"#22c55e":priorityColor(t.priority)}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>
                  {t.done && <span style={{color:"#fff",fontSize:"10px",fontWeight:700}}>✓</span>}
                </div>
                <span style={{flex:1,color:t.done?"#4a6fa5":"#cbd5e1",fontSize:"13px",textDecoration:t.done?"line-through":"none"}}>{t.text}</span>
                <span className={`badge badge-${t.priority==="High"?"high":t.priority==="Medium"?"medium":"low"}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div className="section-title" style={{margin:0}}>Recent Alerts</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate("/operator/alerts")}>View All</button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
            {ALERTS.map(a=>(
              <div key={a.id} style={{
                padding:"14px",background:"#071628",
                border:"1px solid #1a3356",borderRadius:"12px",
                borderLeft:`3px solid ${a.severity==="Critical"?"#ef4444":a.severity==="High"?"#f97316":"#f59e0b"}`,
              }}>
                <div className="flex items-center justify-between mb-8">
                  <span style={{color:"#60a5fa",fontWeight:700,fontSize:"13px"}}>{a.wagon}</span>
                  {sevBadge(a.severity)}
                </div>
                <div style={{color:"#cbd5e1",fontSize:"13px",marginBottom:"4px"}}>{a.type}</div>
                <div style={{color:"#4a6fa5",fontSize:"11px"}}>{a.id} · {a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Summary + Live Monitoring */}
      <div className="grid-2">
        <div className="card">
          <div className="flex items-center justify-between mb-16">
            <div className="section-title" style={{margin:0}}>Maintenance Summary</div>
            <button className="btn btn-ghost btn-sm" onClick={()=>navigate("/operator/maintenance")}>Manage</button>
          </div>
          {MAINT.map(m=>(
            <div key={m.wagon} style={{marginBottom:"16px"}}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span style={{color:"#60a5fa",fontWeight:700,fontSize:"13px"}}>{m.wagon}</span>
                  <span style={{color:"#64748b",fontSize:"12px",marginLeft:"8px"}}>{m.type}</span>
                </div>
                {statusBadge(m.status)}
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{width:`${m.pct}%`,background:m.pct===100?"#22c55e":m.pct>0?"#3b82f6":"#1a3356"}} />
              </div>
              <div style={{color:"#4a6fa5",fontSize:"11px",marginTop:"4px"}}>{m.pct}% complete</div>
            </div>
          ))}
        </div>

        <div className="card" style={{background:"linear-gradient(135deg,rgba(13,31,60,0.9),rgba(7,22,40,0.95))",border:"1px solid rgba(34,197,94,.2)"}}>
          <div className="flex items-center justify-between mb-16">
            <div className="section-title" style={{margin:0}}>Live Monitoring</div>
            <span className="badge badge-active">● Live</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"16px"}}>
            {[
              {label:"Active GPS",value:"43/48",color:"#22c55e",icon:"📡"},
              {label:"Avg Speed",value:"72 km/h",color:"#3b82f6",icon:"⚡"},
              {label:"On-Time Rate",value:"89%",color:"#22c55e",icon:"✅"},
              {label:"Delayed",value:"5",color:"#f59e0b",icon:"⚠️"},
            ].map(s=>(
              <div key={s.label} style={{background:"rgba(255,255,255,.03)",border:"1px solid #1a3356",borderRadius:"10px",padding:"12px"}}>
                <div style={{fontSize:"18px",marginBottom:"4px"}}>{s.icon}</div>
                <div style={{color:s.color,fontSize:"18px",fontWeight:800}}>{s.value}</div>
                <div style={{color:"#4a6fa5",fontSize:"11px"}}>{s.label}</div>
              </div>
            ))}
          </div>
          <button className="btn btn-success" style={{width:"100%",justifyContent:"center"}} onClick={()=>navigate("/operator/tracking")}>
            <FiActivity size={14}/> Open Live Tracking
          </button>
        </div>
      </div>
    </OperatorLayout>
  );
}
