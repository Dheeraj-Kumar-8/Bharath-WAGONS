import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import {
  FiTruck, FiActivity, FiAlertTriangle, FiBox, FiMapPin,
  FiWifi, FiFileText, FiTool, FiBell, FiX,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

// ── Sample Data ────────────────────────────────────────────────────────────────
const wagons = [
  { id:"WGN-001", location:"New Delhi",    dest:"Mumbai CST",     speed:"87 km/h",  status:"On Time",    updated:"2 min ago" },
  { id:"WGN-002", location:"Chennai Ctrl", dest:"Hyderabad",      speed:"64 km/h",  status:"Delayed",    updated:"5 min ago" },
  { id:"WGN-003", location:"Howrah",       dest:"New Delhi",      speed:"92 km/h",  status:"On Time",    updated:"1 min ago" },
  { id:"WGN-004", location:"Pune Jn",      dest:"Mumbai CST",     speed:"0 km/h",   status:"Maintenance",updated:"8 min ago" },
  { id:"WGN-005", location:"Bengaluru",    dest:"Chennai",        speed:"78 km/h",  status:"On Time",    updated:"3 min ago" },
  { id:"WGN-006", location:"Ahmedabad",    dest:"New Delhi",      speed:"55 km/h",  status:"Delayed",    updated:"6 min ago" },
  { id:"WGN-007", location:"Lucknow",      dest:"Kolkata",        speed:"81 km/h",  status:"On Time",    updated:"4 min ago" },
  { id:"WGN-008", location:"Jaipur",       dest:"Mumbai",         speed:"0 km/h",   status:"Maintenance",updated:"15 min ago"},
  { id:"WGN-009", location:"Nagpur",       dest:"Hyderabad",      speed:"73 km/h",  status:"On Time",    updated:"2 min ago" },
  { id:"WGN-010", location:"Patna",        dest:"New Delhi",      speed:"68 km/h",  status:"Delayed",    updated:"7 min ago" },
  { id:"WGN-011", location:"Surat",        dest:"Ahmedabad",      speed:"90 km/h",  status:"On Time",    updated:"1 min ago" },
  { id:"WGN-012", location:"Coimbatore",   dest:"Bengaluru",      speed:"59 km/h",  status:"On Time",    updated:"4 min ago" },
];

const lineData = [
  { day:"Mon", active:820, delayed:38 },
  { day:"Tue", active:940, delayed:55 },
  { day:"Wed", active:870, delayed:42 },
  { day:"Thu", active:1020,delayed:60 },
  { day:"Fri", active:980, delayed:47 },
  { day:"Sat", active:1089,delayed:47 },
  { day:"Sun", active:950, delayed:39 },
];

const barData = [
  { station:"Delhi",     arrivals:142, departures:138 },
  { station:"Mumbai",    arrivals:128, departures:131 },
  { station:"Chennai",   arrivals:96,  departures:99 },
  { station:"Kolkata",   arrivals:112, departures:108 },
  { station:"Hyderabad", arrivals:87,  departures:90 },
  { station:"Bengaluru", arrivals:78,  departures:74 },
];

const pieData = [
  { name:"GPS Alert",   value:34 },
  { name:"Route Dev.",  value:27 },
  { name:"Maintenance", value:22 },
  { name:"Cargo Alert", value:17 },
];
const PIE_COLORS = ["#ef4444","#f59e0b","#3b82f6","#22c55e"];

const aiAlerts = [
  { wagon:"WGN-101", type:"GPS Signal Lost",     priority:"Critical", time:"12:15 PM", status:"Active"   },
  { wagon:"WGN-234", type:"Route Deviation",     priority:"High",     time:"12:18 PM", status:"Active"   },
  { wagon:"WGN-876", type:"Door Open Detected",  priority:"High",     time:"12:20 PM", status:"Active"   },
  { wagon:"WGN-555", type:"Speed Limit Exceeded",priority:"Medium",   time:"12:22 PM", status:"Resolved" },
  { wagon:"WGN-789", type:"Cargo Overweight",    priority:"Low",      time:"12:25 PM", status:"Pending"  },
];

const logs = [
  { time:"12:31 PM", msg:"WGN-101: GPS signal reconnected",              color:"#22c55e" },
  { time:"12:28 PM", msg:"AI Engine: Route optimisation applied for WGN-009", color:"#3b82f6" },
  { time:"12:25 PM", msg:"WGN-789: Cargo weight threshold exceeded",    color:"#f59e0b" },
  { time:"12:22 PM", msg:"WGN-555: Speed alert auto-resolved",           color:"#22c55e" },
  { time:"12:20 PM", msg:"WGN-876: Door open alert triggered",           color:"#ef4444" },
  { time:"12:18 PM", msg:"WGN-234: Route deviation detected by NavIC",   color:"#ef4444" },
  { time:"12:15 PM", msg:"WGN-101: GPS signal lost in Zone NR",          color:"#ef4444" },
  { time:"12:10 PM", msg:"AI Monitoring: Daily health scan completed",   color:"#3b82f6" },
  { time:"12:05 PM", msg:"Server: Auto-backup completed successfully",   color:"#22c55e" },
];

const cities = [
  { name:"Hyderabad",  active:87,  moving:72, delayed:9,  offline:6  },
  { name:"Delhi",      active:142, moving:128,delayed:11, offline:3  },
  { name:"Mumbai",     active:128, moving:115,delayed:8,  offline:5  },
  { name:"Chennai",    active:96,  moving:88, delayed:6,  offline:2  },
  { name:"Kolkata",    active:112, moving:102,delayed:7,  offline:3  },
  { name:"Bengaluru",  active:78,  moving:71, delayed:5,  offline:2  },
];

const predictions = [
  { label:"Delay Prediction",     value:78, color:"#f59e0b", detail:"23 wagons likely delayed tomorrow" },
  { label:"Maintenance Forecast", value:65, color:"#ef4444", detail:"18 wagons need service in 7 days"  },
  { label:"Fuel Efficiency",      value:88, color:"#22c55e", detail:"Avg efficiency up 4.2% this week"  },
  { label:"Route Optimisation",   value:92, color:"#3b82f6", detail:"12 routes optimised by AI engine"  },
];

const statusBadge = (s) => {
  const m = { "On Time":"badge-ontime","Delayed":"badge-delayed","Maintenance":"badge-maint","Active":"badge-active","Resolved":"badge-low","Pending":"badge-medium" };
  return <span className={`badge ${m[s] || "badge-info"}`}>{s}</span>;
};
const priorityBadge = (p) => {
  const m = { Critical:"badge-critical", High:"badge-high", Medium:"badge-medium", Low:"badge-low" };
  return <span className={`badge ${m[p] || "badge-info"}`}>{p}</span>;
};

// ── Quick Action Modal ─────────────────────────────────────────────────────────
const MODALS = {
  addWagon: {
    title: "Add New Wagon",
    fields: [
      { label: "Wagon ID",    name: "id",   type: "text",   ph: "e.g. WGN-1300" },
      { label: "Type",        name: "type", type: "select", opts: ["Freight","Passenger","Tank","Flatbed"] },
      { label: "Origin",      name: "org",  type: "text",   ph: "e.g. New Delhi" },
      { label: "Destination", name: "dest", type: "text",   ph: "e.g. Mumbai" },
    ],
  },
  addStation: {
    title: "Add New Station",
    fields: [
      { label: "Station Name", name: "name", type: "text",   ph: "e.g. Nagpur Junction" },
      { label: "Zone",         name: "zone", type: "select", opts: ["NR","CR","SR","ER","WR","SCR","NCR","NWR"] },
      { label: "Platform Count",name:"plat", type: "text",   ph: "e.g. 6" },
      { label: "Status",       name: "stat", type: "select", opts: ["Active","Inactive","Under Maintenance"] },
    ],
  },
  scheduleMaint: {
    title: "Schedule Maintenance",
    fields: [
      { label: "Wagon ID",  name: "wid",  type: "text",   ph: "e.g. WGN-004" },
      { label: "Date",      name: "date", type: "date",   ph: "" },
      { label: "Type",      name: "type", type: "select", opts: ["Routine","Wheel Check","Brake Inspection","Full Overhaul"] },
      { label: "Technician",name: "tech", type: "text",   ph: "e.g. Ramesh Kumar" },
    ],
  },
};

function QuickModal({ type, onClose }) {
  const cfg = MODALS[type];
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState(false);
  if (!cfg) return null;
  const handleSave = () => { setSaved(true); setTimeout(onClose, 1200); };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div className="modal-title" style={{ margin: 0 }}>{cfg.title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer" }}><FiX size={18} /></button>
        </div>
        {cfg.fields.map(f => (
          <div className="form-group" key={f.name}>
            <label className="form-label">{f.label}</label>
            {f.type === "select"
              ? <select className="form-select" value={form[f.name]||""} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))}>
                  <option value="">Select…</option>
                  {f.opts.map(o => <option key={o}>{o}</option>)}
                </select>
              : <input className="form-input" type={f.type} placeholder={f.ph} value={form[f.name]||""} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} />
            }
          </div>
        ))}
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button className="btn btn-primary flex-1" style={{ flex: 1, justifyContent: "center" }} onClick={handleSave}>
            {saved ? "✓ Saved!" : "Save"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [modal, setModal] = useState(null);

  return (
    <DashboardLayout>
      {/* ── SECTION 1: KPI Cards ── */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "20px", flexWrap: "wrap" }}>
        <StatCard title="Total Wagons"      value="1,247" color="#3b82f6" icon={FiTruck}        trend="+3.2%"  trendUp />
        <StatCard title="Active Wagons"     value="1,089" color="#22c55e" icon={FiActivity}     trend="+1.8%"  trendUp />
        <StatCard title="Delayed Wagons"    value="47"    color="#f59e0b" icon={FiAlertTriangle} trend="-5.1%" trendUp={false} />
        <StatCard title="Maintenance Req."  value="28"    color="#ef4444" icon={FiTool}          trend="+2"     trendUp={false} />
        <StatCard title="Stations Online"   value="124"   color="#8b5cf6" icon={FiMapPin}        trend="+2"     trendUp />
        <StatCard title="GPS Active"        value="1,041" color="#06b6d4" icon={FiWifi}          trend="+0.9%"  trendUp />
        <StatCard title="AI Alerts"         value="18"    color="#f97316" icon={FiBell}          trend="-12%"   trendUp />
        <StatCard title="Cargo Loads"       value="3,482" color="#10b981" icon={FiBox}           trend="+6.4%"  trendUp />
      </div>

      {/* ── SECTION 2: Wagon Activity Table ── */}
      <div className="card mb-20">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="section-title" style={{ margin: 0 }}>Recent Wagon Activity</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/wagons")}>View All</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Wagon ID</th><th>Current Location</th><th>Destination</th>
                <th>Speed</th><th>Status</th><th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {wagons.map(w => (
                <tr key={w.id}>
                  <td style={{ color: "#60a5fa", fontWeight: 600 }}>{w.id}</td>
                  <td>{w.location}</td>
                  <td>{w.dest}</td>
                  <td style={{ color: "#94a3b8" }}>{w.speed}</td>
                  <td>{statusBadge(w.status)}</td>
                  <td style={{ color: "#4a6fa5" }}>{w.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 3 + Charts Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", marginBottom: "20px" }}>
        {/* Line Chart */}
        <div className="card">
          <div className="section-title">Wagon Movement Analytics</div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
              <XAxis dataKey="day" stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:12 }} />
              <YAxis stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:12 }} />
              <Tooltip contentStyle={{ background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:10, color:"#f1f5f9" }} />
              <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }} />
              <Line type="monotone" dataKey="active"  stroke="#3b82f6" strokeWidth={2.5} dot={false} name="Active Wagons" />
              <Line type="monotone" dataKey="delayed" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Delayed Wagons" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* System Health Panel */}
        <div className="card">
          <div className="section-title">System Health</div>
          {[
            { label:"GPS Active",      val:"1,041", color:"#22c55e", pct:89 },
            { label:"GPS Offline",     val:"47",    color:"#ef4444", pct:4  },
            { label:"Stations Online", val:"124",   color:"#3b82f6", pct:96 },
            { label:"Server Status",   val:"OK",    color:"#22c55e", pct:100},
            { label:"AI Engine",       val:"Active",color:"#8b5cf6", pct:100},
            { label:"System Health",   val:"94%",   color:"#22c55e", pct:94 },
          ].map(h => (
            <div key={h.label} style={{ marginBottom: "14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                <span style={{ color:"#94a3b8", fontSize:"12px" }}>{h.label}</span>
                <span style={{ color: h.color, fontSize:"12px", fontWeight:700 }}>{h.val}</span>
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width:`${h.pct}%`, background: h.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bar Chart + Pie Chart ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "20px", marginBottom: "20px" }}>
        <div className="card">
          <div className="section-title">Station Activity</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#1a3356" />
              <XAxis dataKey="station" stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }} />
              <YAxis stroke="#4a6fa5" tick={{ fill:"#4a6fa5", fontSize:11 }} />
              <Tooltip contentStyle={{ background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:10, color:"#f1f5f9" }} />
              <Legend wrapperStyle={{ color:"#94a3b8", fontSize:12 }} />
              <Bar dataKey="arrivals"   fill="#3b82f6" radius={[4,4,0,0]} name="Arrivals" />
              <Bar dataKey="departures" fill="#22c55e" radius={[4,4,0,0]} name="Departures" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-title">Alert Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:10, color:"#f1f5f9" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display:"flex", alignItems:"center", gap:"5px" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:PIE_COLORS[i], display:"inline-block" }} />
                <span style={{ color:"#64748b", fontSize:"11px" }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: Live Tracking Overview ── */}
      <div className="card mb-20">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <div className="section-title" style={{ margin:0 }}>Live Tracking Overview</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/live-tracking")}>Open Map</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px" }}>
          {cities.map(c => (
            <div key={c.name} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:"12px", padding:"16px" }}>
              <div style={{ color:"#60a5fa", fontWeight:700, fontSize:"14px", marginBottom:"10px" }}>📍 {c.name}</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px" }}>
                <div style={{ fontSize:"11px", color:"#64748b" }}>Active Routes</div>
                <div style={{ fontSize:"12px", color:"#22c55e", fontWeight:700 }}>{c.active}</div>
                <div style={{ fontSize:"11px", color:"#64748b" }}>Moving Wagons</div>
                <div style={{ fontSize:"12px", color:"#3b82f6", fontWeight:700 }}>{c.moving}</div>
                <div style={{ fontSize:"11px", color:"#64748b" }}>Delayed Routes</div>
                <div style={{ fontSize:"12px", color:"#f59e0b", fontWeight:700 }}>{c.delayed}</div>
                <div style={{ fontSize:"11px", color:"#64748b" }}>Offline GPS</div>
                <div style={{ fontSize:"12px", color:"#ef4444", fontWeight:700 }}>{c.offline}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 6: AI Alerts Table ── */}
      <div className="card mb-20">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <div className="section-title" style={{ margin:0 }}>AI Alerts</div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/ai-alerts")}>View All</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Wagon ID</th><th>Alert Type</th><th>Priority</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {aiAlerts.map((a, i) => (
                <tr key={i}>
                  <td style={{ color:"#60a5fa", fontWeight:600 }}>{a.wagon}</td>
                  <td>{a.type}</td>
                  <td>{priorityBadge(a.priority)}</td>
                  <td style={{ color:"#4a6fa5" }}>{a.time}</td>
                  <td>{statusBadge(a.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 7: Predictive Insights ── */}
      <div className="card mb-20">
        <div className="section-title">Predictive Insights</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px" }}>
          {predictions.map(p => (
            <div key={p.label} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:"12px", padding:"16px" }}>
              <div style={{ color:"#94a3b8", fontSize:"12px", marginBottom:"8px" }}>{p.label}</div>
              <div style={{ color: p.color, fontSize:"26px", fontWeight:800, marginBottom:"8px" }}>{p.value}%</div>
              <div className="progress-bg" style={{ marginBottom:"8px" }}>
                <div className="progress-fill" style={{ width:`${p.value}%`, background: p.color }} />
              </div>
              <div style={{ color:"#4a6fa5", fontSize:"11px" }}>{p.detail}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 8 + 9: Logs + Quick Actions ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"20px" }}>
        {/* System Logs */}
        <div className="card">
          <div className="section-title">Recent System Logs</div>
          <div style={{ maxHeight:"220px", overflowY:"auto", display:"flex", flexDirection:"column", gap:"6px" }}>
            {logs.map((l, i) => (
              <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start", padding:"8px 10px", background:"#071628", borderRadius:"8px", borderLeft:`3px solid ${l.color}` }}>
                <span style={{ color:"#4a6fa5", fontSize:"11px", flexShrink:0, marginTop:"1px" }}>{l.time}</span>
                <span style={{ color:"#94a3b8", fontSize:"12px" }}>{l.msg}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="section-title">Quick Actions</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {[
              { label:"Add Wagon",          icon:FiTruck,    action:() => setModal("addWagon"),       cls:"btn-primary" },
              { label:"Add Station",         icon:FiMapPin,   action:() => setModal("addStation"),     cls:"btn-outline" },
              { label:"Generate Report",     icon:FiFileText, action:() => navigate("/reports"),       cls:"btn-ghost"   },
              { label:"View Alerts",         icon:FiBell,     action:() => navigate("/ai-alerts"),     cls:"btn-ghost"   },
              { label:"Schedule Maintenance",icon:FiTool,     action:() => setModal("scheduleMaint"),  cls:"btn-warning" },
            ].map(btn => (
              <button key={btn.label} className={`btn ${btn.cls}`} style={{ width:"100%", justifyContent:"flex-start" }} onClick={btn.action}>
                <btn.icon size={14} /> {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {modal && <QuickModal type={modal} onClose={() => setModal(null)} />}
    </DashboardLayout>
  );
};

export default AdminDashboard;
