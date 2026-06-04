import { useState } from "react";
import { FiMapPin, FiActivity, FiWifi, FiNavigation, FiClock, FiRefreshCw } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const WAGONS = [
  { id:"WGN-001", route:"New Delhi → Mumbai CST",     lat:"28.6139° N", lon:"77.2090° E", speed:"87",  status:"Moving",  eta:"6h 42m",  signal:"Strong"  },
  { id:"WGN-002", route:"Chennai → Hyderabad Deccan", lat:"13.0827° N", lon:"80.2707° E", speed:"64",  status:"Delayed", eta:"3h 18m",  signal:"Weak"    },
  { id:"WGN-003", route:"Howrah → New Delhi",         lat:"22.5726° N", lon:"88.3639° E", speed:"92",  status:"Moving",  eta:"11h 05m", signal:"Strong"  },
  { id:"WGN-005", route:"Bengaluru → Chennai Ctrl",   lat:"12.9716° N", lon:"77.5946° E", speed:"78",  status:"Moving",  eta:"4h 30m",  signal:"Strong"  },
  { id:"WGN-006", route:"Ahmedabad → New Delhi",      lat:"23.0225° N", lon:"72.5714° E", speed:"55",  status:"Delayed", eta:"9h 15m",  signal:"Medium"  },
  { id:"WGN-007", route:"Lucknow → Kolkata",          lat:"26.8467° N", lon:"80.9462° E", speed:"81",  status:"Moving",  eta:"7h 22m",  signal:"Strong"  },
  { id:"WGN-009", route:"Nagpur → Hyderabad",         lat:"21.1458° N", lon:"79.0882° E", speed:"73",  status:"Moving",  eta:"5h 10m",  signal:"Medium"  },
];

const ROUTES = [
  { name:"Delhi → Mumbai",      wagons:14, status:"Active",  dist:"1,384 km", delay:"-"     },
  { name:"Chennai → Kolkata",   wagons:9,  status:"Active",  dist:"1,659 km", delay:"-"     },
  { name:"Bengaluru → Pune",    wagons:6,  status:"Delayed", dist:"832 km",   delay:"47 min"},
  { name:"Ahmedabad → Delhi",   wagons:11, status:"Active",  dist:"934 km",   delay:"-"     },
  { name:"Hyderabad → Mumbai",  wagons:8,  status:"Active",  dist:"711 km",   delay:"-"     },
  { name:"Howrah → Delhi",      wagons:12, status:"Active",  dist:"1,442 km", delay:"-"     },
];

const signalColor = s => ({ Strong:"#22c55e", Medium:"#f59e0b", Weak:"#ef4444" }[s] || "#64748b");
const statusClass = s => ({ Moving:"badge-active", Delayed:"badge-delayed", Stopped:"badge-maint" }[s] || "badge-info");

const LiveTracking = () => {
  const [selected, setSelected] = useState(WAGONS[0]);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <DashboardLayout title="Live Tracking" sub="Real-time GPS monitoring of all active wagons across the network">
      {/* KPIs */}
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Wagons Moving"   value="1,041" color="#22c55e" icon={FiActivity} trend="+2.1%" trendUp />
        <StatCard title="Routes Active"   value="84"    color="#3b82f6" icon={FiNavigation} trend="+3" trendUp />
        <StatCard title="GPS Online"      value="1,041" color="#06b6d4" icon={FiWifi} trend="+0.9%" trendUp />
        <StatCard title="Avg Speed"       value="76 km/h" color="#8b5cf6" icon={FiActivity} trend="+4%" trendUp />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:"20px", marginBottom:"20px" }}>
        {/* Map placeholder */}
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #1a3356", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div className="section-title" style={{ margin:0 }}>Live GPS Map</div>
            <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
              <span className="dot dot-green" />
              <span style={{ color:"#22c55e", fontSize:"12px", fontWeight:600 }}>NavIC Active</span>
              <button className="btn btn-ghost btn-sm" onClick={refresh}>
                <FiRefreshCw size={12} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }} />
                Refresh
              </button>
            </div>
          </div>
          <div style={{ height:"340px", background:"#071628", position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {/* India outline mockup */}
            <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle at 30% 40%, rgba(59,130,246,.06) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(34,197,94,.04) 0%, transparent 50%)" }} />
            <div style={{ textAlign:"center", zIndex:1 }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>🗺️</div>
              <div style={{ color:"#3b82f6", fontWeight:700, fontSize:"16px" }}>Interactive Map View</div>
              <div style={{ color:"#4a6fa5", fontSize:"12px", marginTop:"6px" }}>NavIC GPS · 1,041 wagons tracked live</div>
              <div style={{ display:"flex", gap:"10px", justifyContent:"center", marginTop:"16px", flexWrap:"wrap" }}>
                {["Delhi","Mumbai","Chennai","Kolkata","Hyderabad","Bengaluru"].map(c => (
                  <div key={c} style={{ display:"flex", alignItems:"center", gap:"5px", background:"rgba(37,99,235,.12)", border:"1px solid #1a3356", borderRadius:"20px", padding:"4px 12px" }}>
                    <span className="dot dot-green" style={{ width:6, height:6 }} />
                    <span style={{ color:"#60a5fa", fontSize:"11px", fontWeight:600 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Simulated ping dots */}
            {[
              { top:"30%", left:"35%", label:"WGN-001" },
              { top:"70%", left:"25%", label:"WGN-002" },
              { top:"25%", left:"65%", label:"WGN-003" },
              { top:"55%", left:"55%", label:"WGN-009" },
              { top:"45%", left:"70%", label:"WGN-007" },
            ].map(p => (
              <div key={p.label} style={{ position:"absolute", top:p.top, left:p.left }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:"#3b82f6", boxShadow:"0 0 0 4px rgba(59,130,246,.3), 0 0 12px rgba(59,130,246,.6)" }} />
                <div style={{ position:"absolute", left:"14px", top:"-2px", background:"rgba(13,31,60,.9)", border:"1px solid #1a3356", borderRadius:"6px", padding:"2px 6px", whiteSpace:"nowrap" }}>
                  <span style={{ color:"#60a5fa", fontSize:"10px", fontWeight:600 }}>{p.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Wagon Detail */}
        <div className="card">
          <div className="section-title">Wagon Detail</div>
          <div style={{ background:"#071628", borderRadius:"12px", padding:"16px", marginBottom:"16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
              <span style={{ color:"#60a5fa", fontWeight:700, fontSize:"16px" }}>{selected.id}</span>
              <span className={`badge ${statusClass(selected.status)}`}>{selected.status}</span>
            </div>
            {[
              { icon:FiNavigation, label:"Route",    val: selected.route      },
              { icon:FiMapPin,     label:"Position", val:`${selected.lat}, ${selected.lon}` },
              { icon:FiActivity,   label:"Speed",    val:`${selected.speed} km/h` },
              { icon:FiClock,      label:"ETA",      val: selected.eta        },
              { icon:FiWifi,       label:"Signal",   val: selected.signal, color: signalColor(selected.signal) },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                <r.icon color="#3b82f6" size={13} style={{ flexShrink:0 }} />
                <span style={{ color:"#4a6fa5", fontSize:"12px", width:"64px", flexShrink:0 }}>{r.label}</span>
                <span style={{ color: r.color || "#cbd5e1", fontSize:"13px", fontWeight:600 }}>{r.val}</span>
              </div>
            ))}
          </div>

          <div className="section-title">Select Wagon</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"6px", maxHeight:"160px", overflowY:"auto" }}>
            {WAGONS.map(w => (
              <div key={w.id} onClick={() => setSelected(w)}
                style={{ padding:"9px 12px", borderRadius:"9px", cursor:"pointer", background: selected.id === w.id ? "rgba(37,99,235,.18)" : "#071628", border:`1px solid ${selected.id === w.id ? "#3b82f6" : "#1a3356"}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ color: selected.id === w.id ? "#60a5fa" : "#94a3b8", fontSize:"13px", fontWeight:600 }}>{w.id}</span>
                <span className={`badge ${statusClass(w.status)}`} style={{ fontSize:"10px" }}>{w.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Route Status Table */}
      <div className="card">
        <div className="section-title">Active Route Status</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Route</th><th>Wagons</th><th>Distance</th><th>Status</th><th>Delay</th></tr>
            </thead>
            <tbody>
              {ROUTES.map((r, i) => (
                <tr key={i}>
                  <td style={{ color:"#f1f5f9", fontWeight:600 }}>{r.name}</td>
                  <td style={{ color:"#3b82f6" }}>{r.wagons}</td>
                  <td style={{ color:"#64748b" }}>{r.dist}</td>
                  <td><span className={`badge ${r.status === "Active" ? "badge-active" : "badge-delayed"}`}>{r.status}</span></td>
                  <td style={{ color: r.delay === "-" ? "#22c55e" : "#f59e0b" }}>{r.delay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LiveTracking;
