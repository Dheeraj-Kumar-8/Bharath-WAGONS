import { useState } from "react";
import { FiBox, FiThermometer, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";
import StatCard from "../components/StatCard";
import { useOperatorData } from "../context/OperatorDataContext";

const statusStyle = s => ({
  Normal:   { badge:"badge-active",   color:"#22c55e" },
  Warning:  { badge:"badge-medium",   color:"#f59e0b" },
  Critical: { badge:"badge-critical", color:"#ef4444" },
  Empty:    { badge:"badge-inactive", color:"#64748b" },
}[s] || { badge:"badge-info", color:"#3b82f6" });

const loadColor = pct => pct >= 95 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#22c55e";
const tempColor = (temp, limit) => temp > limit ? "#ef4444" : temp > limit * 0.85 ? "#f59e0b" : "#22c55e";

export default function OperatorCargo() {
  const { cargo } = useOperatorData();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = cargo.filter(c =>
    (filter === "All" || c.status === filter) &&
    (c.wagon.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase()))
  );

  const totalWeight = cargo.reduce((s,c)=>s+c.weight,0).toFixed(1);
  const avgLoad     = Math.round(cargo.reduce((s,c)=>s+(c.weight/c.capacity*100),0)/cargo.length);
  const critical    = cargo.filter(c=>c.status==="Critical").length;

  return (
    <OperatorLayout title="Cargo Monitoring" sub="Real-time cargo weight, temperature, and load monitoring" moduleKey="cargo">
      {/* KPIs */}
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Total Wagons" value={cargo.length}    color="#3b82f6" icon={FiBox} />
        <StatCard title="Total Weight" value={`${totalWeight}T`} color="#22c55e" icon={FiBox} />
        <StatCard title="Avg Load"     value={`${avgLoad}%`}   color="#f59e0b" icon={FiBox} />
        <StatCard title="Critical"     value={critical}        color="#ef4444" icon={FiAlertTriangle} />
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
              <div className="flex items-center justify-between mb-16">
                <div>
                  <div style={{color:"#60a5fa",fontWeight:700,fontSize:"14px"}}>{c.wagon}</div>
                  <div style={{color:"#4a6fa5",fontSize:"12px"}}>{c.id}</div>
                </div>
                <span className={`badge ${ss.badge}`}>{c.status}</span>
              </div>

              <div style={{background:"#071628",border:"1px solid #1a3356",borderRadius:"10px",padding:"10px 12px",marginBottom:"12px"}}>
                <div style={{color:"#4a6fa5",fontSize:"11px",marginBottom:"2px"}}>CARGO TYPE</div>
                <div style={{color:"#f1f5f9",fontWeight:700}}>{c.type}</div>
                <div style={{color:"#64748b",fontSize:"11px",marginTop:"2px"}}>{c.origin} → {c.destination}</div>
              </div>

              <div style={{marginBottom:"12px"}}>
                <div className="flex items-center justify-between mb-6">
                  <span style={{color:"#64748b",fontSize:"12px"}}>Load — {c.weight}T / {c.capacity}T</span>
                  <span style={{color:lColor,fontWeight:800,fontSize:"14px"}}>{loadPct}%</span>
                </div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{width:`${loadPct}%`,background:lColor}}/>
                </div>
              </div>

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
