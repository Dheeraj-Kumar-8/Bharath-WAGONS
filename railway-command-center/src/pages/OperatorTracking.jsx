import { useState, useEffect } from "react";
import { FiMapPin, FiWifi, FiWifiOff, FiRefreshCw, FiNavigation } from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";

const INIT_DATA = [
  { id:"WGN-1042", route:"New Delhi → Mumbai",    location:"Kota Jn.",     speed:78,  gps:"Active",  heading:"SW", lat:"25.1820", lng:"75.8333", updated:"10:42 AM", status:"On Time"   },
  { id:"WGN-2187", route:"Kolkata → Chennai",     location:"Vizag Port",   speed:54,  gps:"Active",  heading:"S",  lat:"17.6868", lng:"83.2185", updated:"10:39 AM", status:"Delayed"   },
  { id:"WGN-3301", route:"Mumbai → Hyderabad",    location:"Pune Jn.",     speed:85,  gps:"Active",  heading:"E",  lat:"18.5204", lng:"73.8567", updated:"10:41 AM", status:"On Time"   },
  { id:"WGN-4056", route:"Chennai → Delhi",       location:"Nagpur Yard",  speed:0,   gps:"Offline", heading:"--", lat:"21.1458", lng:"79.0882", updated:"09:15 AM", status:"Halted"    },
  { id:"WGN-5774", route:"Hyderabad → Kolkata",   location:"Raipur Jn.",   speed:91,  gps:"Active",  heading:"NE", lat:"21.2514", lng:"81.6296", updated:"10:44 AM", status:"On Time"   },
  { id:"WGN-6613", route:"Delhi → Bengaluru",     location:"Bhopal Jn.",   speed:44,  gps:"Active",  heading:"S",  lat:"23.2599", lng:"77.4126", updated:"10:38 AM", status:"Delayed"   },
  { id:"WGN-7890", route:"Mumbai → Kolkata",      location:"Wardha",       speed:80,  gps:"Active",  heading:"E",  lat:"20.7453", lng:"78.6022", updated:"10:43 AM", status:"On Time"   },
  { id:"WGN-8421", route:"Bengaluru → Delhi",     location:"Secunderabad", speed:76,  gps:"Active",  heading:"N",  lat:"17.4399", lng:"78.4983", updated:"10:40 AM", status:"On Time"   },
];

const statusColor = s => ({  "On Time":"#22c55e","Delayed":"#f59e0b","Halted":"#ef4444","Maintenance":"#f97316" }[s]||"#3b82f6");
const speedBar = speed => {
  const pct = Math.min(speed/120*100,100);
  const color = speed>80?"#ef4444":speed>60?"#f59e0b":"#22c55e";
  return { pct, color };
};

export default function OperatorTracking() {
  const [wagons, setWagons] = useState(INIT_DATA);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Simulate live speed updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWagons(ws => ws.map(w => w.gps === "Offline" ? w : {
        ...w,
        speed: Math.max(0, Math.min(120, w.speed + (Math.random()*10 - 5) | 0)),
        updated: new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setLastRefresh(new Date()); setRefreshing(false); }, 800);
  };

  const filtered = wagons.filter(w =>
    (filter === "All" || (filter === "Active" ? w.gps === "Active" : w.gps === "Offline")) &&
    (w.id.toLowerCase().includes(search.toLowerCase()) || w.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <OperatorLayout title="Live Tracking" sub="Real-time GPS tracking for assigned wagons" alertCount={3}>
      {/* Status Bar */}
      <div className="card mb-20" style={{padding:"14px 20px"}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-20">
            <div className="flex items-center gap-8">
              <span className="dot dot-green"/>
              <span style={{color:"#22c55e",fontSize:"13px",fontWeight:600}}>
                {wagons.filter(w=>w.gps==="Active").length} GPS Active
              </span>
            </div>
            <div className="flex items-center gap-8">
              <span className="dot dot-red"/>
              <span style={{color:"#ef4444",fontSize:"13px",fontWeight:600}}>
                {wagons.filter(w=>w.gps==="Offline").length} Offline
              </span>
            </div>
            <span style={{color:"#4a6fa5",fontSize:"12px"}}>
              Last updated: {lastRefresh.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
            </span>
          </div>
          <div className="flex items-center gap-12">
            <div className="search-box" style={{width:"200px"}}>
              <FiMapPin size={13} color="#4a6fa5"/>
              <input placeholder="Search wagons…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <select className="form-select" style={{width:"140px",padding:"8px 12px"}} value={filter} onChange={e=>setFilter(e.target.value)}>
              {["All","Active","Offline"].map(s=><option key={s}>{s}</option>)}
            </select>
            <button className="btn btn-ghost btn-sm" onClick={handleRefresh} style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <FiRefreshCw size={13} style={{animation:refreshing?"spin 1s linear infinite":""}}/>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tracking Cards */}
      <div className="grid-3">
        {filtered.map(w => {
          const bar = speedBar(w.speed);
          return (
            <div key={w.id} className="glass" style={{
              border:`1px solid ${w.gps==="Offline"?"rgba(239,68,68,.25)":"rgba(34,197,94,.15)"}`,
              transition:"transform .18s,box-shadow .18s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 30px rgba(0,0,0,.3)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=""; }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div className="flex items-center gap-10">
                  <div style={{
                    width:"38px",height:"38px",borderRadius:"10px",
                    background:`${statusColor(w.status)}18`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",
                  }}>🚆</div>
                  <div>
                    <div style={{color:"#60a5fa",fontWeight:700,fontSize:"14px"}}>{w.id}</div>
                    <div style={{color:"#4a6fa5",fontSize:"11px"}}>{w.route}</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {w.gps==="Active"
                    ? <FiWifi size={14} color="#22c55e"/>
                    : <FiWifiOff size={14} color="#ef4444"/>}
                  <span style={{color:w.gps==="Active"?"#22c55e":"#ef4444",fontSize:"11px",fontWeight:600}}>{w.gps}</span>
                </div>
              </div>

              {/* Location */}
              <div style={{background:"rgba(255,255,255,.03)",border:"1px solid #1a3356",borderRadius:"10px",padding:"12px",marginBottom:"12px"}}>
                <div className="flex items-center gap-8 mb-8">
                  <FiMapPin size={13} color="#3b82f6"/>
                  <span style={{color:"#94a3b8",fontSize:"12px"}}>Current Location</span>
                </div>
                <div style={{color:"#f1f5f9",fontWeight:700,fontSize:"15px"}}>{w.location}</div>
                <div style={{color:"#4a6fa5",fontSize:"11px",marginTop:"3px"}}>{w.lat}°N, {w.lng}°E</div>
              </div>

              {/* Speed */}
              <div style={{marginBottom:"12px"}}>
                <div className="flex items-center justify-between mb-6">
                  <span style={{color:"#64748b",fontSize:"12px"}}>Speed</span>
                  <span style={{color:bar.color,fontWeight:800,fontSize:"16px"}}>{w.speed} km/h</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{width:`${bar.pct}%`,background:bar.color}}/>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <FiNavigation size={12} color="#4a6fa5"/>
                  <span style={{color:"#64748b",fontSize:"11px"}}>Heading {w.heading}</span>
                </div>
                <div>
                  <span className={`badge ${{"On Time":"badge-ontime","Delayed":"badge-delayed","Halted":"badge-high","Maintenance":"badge-maint"}[w.status]||"badge-info"}`}>{w.status}</span>
                </div>
              </div>
              <div style={{color:"#1e3a5f",fontSize:"10px",marginTop:"8px"}}>Last updated: {w.updated}</div>
            </div>
          );
        })}
      </div>

      {filtered.length===0 && (
        <div style={{textAlign:"center",padding:"60px",color:"#4a6fa5"}}>
          <FiMapPin size={36} style={{marginBottom:"12px",opacity:.4}}/>
          <div>No wagons found</div>
        </div>
      )}
    </OperatorLayout>
  );
}
