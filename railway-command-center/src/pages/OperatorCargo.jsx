import { useState } from "react";
import { FiBox, FiThermometer, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";

const CARGO = [
  { wagon:"WGN-1042", type:"Steel Coils",       weight:58.4, capacity:72,  temp:28,  tempLimit:40,  status:"Normal",   destination:"Mumbai",    origin:"New Delhi",  seal:"SEALED",  id:"CGO-4421" },
  { wagon:"WGN-2187", type:"Chemical Drums",    weight:45.1, capacity:60,  temp:18,  tempLimit:25,  status:"Warning",  destination:"Chennai",   origin:"Kolkata",    seal:"SEALED",  id:"CGO-4422" },
  { wagon:"WGN-3301", type:"Auto Parts",        weight:61.8, capacity:65,  temp:31,  tempLimit:45,  status:"Critical", destination:"Hyderabad", origin:"Mumbai",     seal:"BROKEN",  id:"CGO-4423" },
  { wagon:"WGN-4056", type:"Food Grain",        weight:0,    capacity:80,  temp:22,  tempLimit:30,  status:"Empty",    destination:"Delhi",     origin:"Chennai",    seal:"OPEN",    id:"CGO-4424" },
  { wagon:"WGN-5774", type:"Coal",              weight:71.2, capacity:90,  temp:35,  tempLimit:50,  status:"Normal",   destination:"Kolkata",   origin:"Hyderabad",  seal:"SEALED",  id:"CGO-4425" },
  { wagon:"WGN-6613", type:"Petroleum Products",weight:52.0, capacity:60,  temp:42,  tempLimit:40,  status:"Critical", destination:"Bengaluru", origin:"Delhi",      seal:"SEALED",  id:"CGO-4426" },
  { wagon:"WGN-7890", type:"Cotton Bales",      weight:38.5, capacity:70,  temp:27,  tempLimit:40,  status:"Normal",   destination:"Kolkata",   origin:"Mumbai",     seal:"SEALED",  id:"CGO-4427" },
  { wagon:"WGN-8421", type:"Machinery",         weight:63.0, capacity:75,  temp:29,  tempLimit:45,  status:"Normal",   destination:"Delhi",     origin:"Bengaluru",  seal:"SEALED",  id:"CGO-4428" },
];

const statusStyle = s => ({
  Normal:   { badge:"badge-active",   color:"#22c55e" },
  Warning:  { badge:"badge-medium",   color:"#f59e0b" },
  Critical: { badge:"badge-critical", color:"#ef4444" },
  Empty:    { badge:"badge-inactive", color:"#64748b" },
}[s] || { badge:"badge-info", color:"#3b82f6" });

const loadColor = pct => pct >= 95 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#22c55e";
const tempColor = (temp, limit) => temp > limit ? "#ef4444" : temp > limit * 0.85 ? "#f59e0b" : "#22c55e";

export default function OperatorCargo() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = CARGO.filter(c =>
    (filter === "All" || c.status === filter) &&
    (c.wagon.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase()))
  );

  const totalWeight = CARGO.reduce((s,c)=>s+c.weight,0).toFixed(1);
  const avgLoad     = Math.round(CARGO.reduce((s,c)=>s+(c.weight/c.capacity*100),0)/CARGO.length);
  const critical    = CARGO.filter(c=>c.status==="Critical").length;

  return (
    <OperatorLayout title="Cargo Monitoring" sub="Real-time cargo weight, temperature, and load monitoring">
      {/* KPIs */}
      <div className="grid-4 mb-20">
        <div className="glass" style={{display:"flex",gap:"14px",alignItems:"center"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#3b82f618",display:"flex",alignItems:"center",justifyContent:"center"}}><FiBox size={20} color="#3b82f6"/></div>
          <div><div style={{color:"#64748b",fontSize:"11px",textTransform:"uppercase"}}>Total Wagons</div><div style={{color:"#f1f5f9",fontSize:"26px",fontWeight:800}}>{CARGO.length}</div></div>
        </div>
        <div className="glass" style={{display:"flex",gap:"14px",alignItems:"center"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#22c55e18",display:"flex",alignItems:"center",justifyContent:"center"}}><FiBox size={20} color="#22c55e"/></div>
          <div><div style={{color:"#64748b",fontSize:"11px",textTransform:"uppercase"}}>Total Weight</div><div style={{color:"#f1f5f9",fontSize:"26px",fontWeight:800}}>{totalWeight} T</div></div>
        </div>
        <div className="glass" style={{display:"flex",gap:"14px",alignItems:"center"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#f59e0b18",display:"flex",alignItems:"center",justifyContent:"center"}}><FiBox size={20} color="#f59e0b"/></div>
          <div><div style={{color:"#64748b",fontSize:"11px",textTransform:"uppercase"}}>Avg Load</div><div style={{color:"#f1f5f9",fontSize:"26px",fontWeight:800}}>{avgLoad}%</div></div>
        </div>
        <div className="glass" style={{display:"flex",gap:"14px",alignItems:"center"}}>
          <div style={{width:"48px",height:"48px",borderRadius:"12px",background:"#ef444418",display:"flex",alignItems:"center",justifyContent:"center"}}><FiAlertTriangle size={20} color="#ef4444"/></div>
          <div><div style={{color:"#64748b",fontSize:"11px",textTransform:"uppercase"}}>Critical</div><div style={{color:"#f1f5f9",fontSize:"26px",fontWeight:800}}>{critical}</div></div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-20" style={{padding:"12px 20px"}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            {["All","Normal","Warning","Critical","Empty"].map(s=>(
              <button key={s} onClick={()=>setFilter(s)} className={`btn btn-sm ${filter===s?"btn-primary":"btn-ghost"}`}>{s}</button>
            ))}
          </div>
          <div className="search-box" style={{width:"220px"}}>
            <FiBox size={13} color="#4a6fa5"/>
            <input placeholder="Search wagon / cargo…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
        </div>
      </div>

      {/* Cargo Cards */}
      <div className="grid-3">
        {filtered.map(c => {
          const loadPct  = Math.round(c.weight / c.capacity * 100);
          const lColor   = loadColor(loadPct);
          const tColor   = tempColor(c.temp, c.tempLimit);
          const ss       = statusStyle(c.status);
          return (
            <div key={c.wagon} className="card" style={{
              border:`1px solid ${ss.color}28`,
              transition:"transform .18s,box-shadow .18s",
            }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.35)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-16">
                <div>
                  <div style={{color:"#60a5fa",fontWeight:700,fontSize:"14px"}}>{c.wagon}</div>
                  <div style={{color:"#4a6fa5",fontSize:"12px"}}>{c.id}</div>
                </div>
                <span className={`badge ${ss.badge}`}>{c.status}</span>
              </div>

              {/* Cargo type */}
              <div style={{background:"#071628",border:"1px solid #1a3356",borderRadius:"10px",padding:"10px 12px",marginBottom:"12px"}}>
                <div style={{color:"#4a6fa5",fontSize:"11px",marginBottom:"2px"}}>CARGO TYPE</div>
                <div style={{color:"#f1f5f9",fontWeight:700}}>{c.type}</div>
                <div style={{color:"#64748b",fontSize:"11px",marginTop:"2px"}}>{c.origin} → {c.destination}</div>
              </div>

              {/* Weight / Load */}
              <div style={{marginBottom:"12px"}}>
                <div className="flex items-center justify-between mb-6">
                  <span style={{color:"#64748b",fontSize:"12px"}}>Load — {c.weight}T / {c.capacity}T</span>
                  <span style={{color:lColor,fontWeight:800,fontSize:"14px"}}>{loadPct}%</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{width:`${loadPct}%`,background:lColor}}/>
                </div>
              </div>

              {/* Temperature */}
              <div style={{marginBottom:"12px"}}>
                <div className="flex items-center justify-between mb-6">
                  <span className="flex items-center gap-6" style={{color:"#64748b",fontSize:"12px"}}>
                    <FiThermometer size={12} color={tColor}/> Temperature
                  </span>
                  <span style={{color:tColor,fontWeight:800,fontSize:"14px"}}>{c.temp}°C <span style={{color:"#1e3a5f",fontWeight:400}}>/ {c.tempLimit}°C</span></span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{width:`${Math.min(c.temp/c.tempLimit*100,100)}%`,background:tColor}}/>
                </div>
              </div>

              {/* Seal */}
              <div className="flex items-center justify-between">
                <span style={{color:"#64748b",fontSize:"12px"}}>Cargo Seal</span>
                <span style={{display:"flex",alignItems:"center",gap:"5px"}}>
                  {c.seal==="SEALED"
                    ? <><FiCheckCircle size={12} color="#22c55e"/><span style={{color:"#22c55e",fontSize:"12px",fontWeight:600}}>SEALED</span></>
                    : <><FiAlertTriangle size={12} color="#ef4444"/><span style={{color:"#ef4444",fontSize:"12px",fontWeight:600}}>{c.seal}</span></>}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length===0 && (
        <div style={{textAlign:"center",padding:"60px",color:"#4a6fa5"}}>
          <FiBox size={36} style={{marginBottom:"12px",opacity:.4}}/>
          <div>No cargo found</div>
        </div>
      )}
    </OperatorLayout>
  );
}
