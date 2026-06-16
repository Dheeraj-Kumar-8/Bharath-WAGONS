import { FiThermometer, FiActivity, FiAlertTriangle, FiBattery, FiTruck } from "react-icons/fi";
import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const HEALTH_DATA = [
  { id:"WGN-001", temp:68,  wheel:"Good",     brake:"Good",     battery:87, gps:"Active",  health:94, status:"Healthy"  },
  { id:"WGN-002", temp:71,  wheel:"Good",     brake:"Worn",     battery:72, gps:"Active",  health:82, status:"Warning"  },
  { id:"WGN-003", temp:65,  wheel:"Good",     brake:"Good",     battery:91, gps:"Active",  health:97, status:"Healthy"  },
  { id:"WGN-004", temp:89,  wheel:"Worn",     brake:"Critical", battery:34, gps:"Weak",    health:42, status:"Critical" },
  { id:"WGN-005", temp:67,  wheel:"Good",     brake:"Good",     battery:83, gps:"Active",  health:93, status:"Healthy"  },
  { id:"WGN-006", temp:74,  wheel:"Fair",     brake:"Good",     battery:61, gps:"Active",  health:78, status:"Warning"  },
  { id:"WGN-007", temp:63,  wheel:"Good",     brake:"Good",     battery:95, gps:"Active",  health:98, status:"Healthy"  },
  { id:"WGN-008", temp:92,  wheel:"Critical", brake:"Worn",     battery:28, gps:"Offline", health:31, status:"Critical" },
  { id:"WGN-009", temp:69,  wheel:"Good",     brake:"Good",     battery:79, gps:"Active",  health:91, status:"Healthy"  },
  { id:"WGN-010", temp:76,  wheel:"Fair",     brake:"Fair",     battery:55, gps:"Active",  health:72, status:"Warning"  },
  { id:"WGN-011", temp:64,  wheel:"Good",     brake:"Good",     battery:88, gps:"Active",  health:95, status:"Healthy"  },
  { id:"WGN-012", temp:66,  wheel:"Good",     brake:"Good",     battery:84, gps:"Active",  health:96, status:"Healthy"  },
];

const healthColor = s => ({ Healthy:"#22c55e", Warning:"#f59e0b", Critical:"#ef4444" }[s]||"#64748b");
const condColor   = c => ({ Good:"#22c55e", Fair:"#f59e0b", Worn:"#f97316", Critical:"#ef4444" }[c]||"#64748b");
const battColor   = v => v > 70 ? "#22c55e" : v > 40 ? "#f59e0b" : "#ef4444";
const tempColor   = v => v < 75 ? "#22c55e" : v < 85 ? "#f59e0b" : "#ef4444";

const avg = arr => Math.round(arr.reduce((s,v)=>s+v,0)/arr.length);

const WagonHealth = () => {
  const avgHealth  = avg(HEALTH_DATA.map(w => w.health));
  const avgBatt    = avg(HEALTH_DATA.map(w => w.battery));
  const avgTemp    = avg(HEALTH_DATA.map(w => w.temp));

  const radialData = [{ name:"Health", value: avgHealth, fill:"#3b82f6" }];

  return (
    <DashboardLayout title="Wagon Health" sub="Real-time health diagnostics for the entire wagon fleet">
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Fleet Health Score" value={`${avgHealth}%`}  color="#22c55e" icon={FiActivity}    trend="+1.4%"  trendUp />
        <StatCard title="Healthy Wagons"     value={HEALTH_DATA.filter(w=>w.status==="Healthy").length}   color="#22c55e" icon={FiTruck} />
        <StatCard title="Warnings"           value={HEALTH_DATA.filter(w=>w.status==="Warning").length}   color="#f59e0b" icon={FiAlertTriangle} />
        <StatCard title="Critical"           value={HEALTH_DATA.filter(w=>w.status==="Critical").length}  color="#ef4444" icon={FiAlertTriangle} />
        <StatCard title="Avg Temperature"    value={`${avgTemp}°C`}   color="#f97316" icon={FiThermometer} />
        <StatCard title="Avg Battery"        value={`${avgBatt}%`}    color="#3b82f6" icon={FiBattery} />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", gap:"20px", marginBottom:"20px" }}>
        {/* Radial Health Score */}
        <div className="card" style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div className="section-title" style={{ textAlign:"center" }}>Fleet Health</div>
          <div style={{ position:"relative", width:180, height:180 }}>
            <ResponsiveContainer width={180} height={180}>
              <RadialBarChart innerRadius="60%" outerRadius="100%" data={radialData} startAngle={180} endAngle={0}>
                <RadialBar background={{ fill:"#1a3356" }} dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", paddingTop:"30px" }}>
              <div style={{ color:"#3b82f6", fontSize:"28px", fontWeight:800 }}>{avgHealth}%</div>
              <div style={{ color:"#64748b", fontSize:"11px" }}>Avg Health</div>
            </div>
          </div>
          {/* Legend */}
          {[["Healthy",HEALTH_DATA.filter(w=>w.status==="Healthy").length,"#22c55e"],
            ["Warning",HEALTH_DATA.filter(w=>w.status==="Warning").length,"#f59e0b"],
            ["Critical",HEALTH_DATA.filter(w=>w.status==="Critical").length,"#ef4444"]
          ].map(([l,v,c]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%", marginTop:"8px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:c, display:"inline-block" }} />
                <span style={{ color:"#94a3b8", fontSize:"12px" }}>{l}</span>
              </div>
              <span style={{ color: c, fontWeight:700, fontSize:"13px" }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Health Metric Summary */}
        <div className="card">
          <div className="section-title">System-wide Health Metrics</div>
          {[
            { label:"Wheel Condition",    good:HEALTH_DATA.filter(w=>w.wheel==="Good").length,    total:HEALTH_DATA.length, color:"#22c55e" },
            { label:"Brake Condition",    good:HEALTH_DATA.filter(w=>w.brake==="Good").length,    total:HEALTH_DATA.length, color:"#3b82f6" },
            { label:"GPS Signal",         good:HEALTH_DATA.filter(w=>w.gps==="Active").length,    total:HEALTH_DATA.length, color:"#06b6d4" },
            { label:"Battery ≥70%",       good:HEALTH_DATA.filter(w=>w.battery>=70).length,        total:HEALTH_DATA.length, color:"#8b5cf6" },
            { label:"Temperature < 75°C", good:HEALTH_DATA.filter(w=>w.temp<75).length,            total:HEALTH_DATA.length, color:"#f59e0b" },
          ].map(m => (
            <div key={m.label} style={{ marginBottom:"18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                <span style={{ color:"#94a3b8", fontSize:"13px" }}>{m.label}</span>
                <span style={{ color: m.color, fontSize:"13px", fontWeight:700 }}>{m.good}/{m.total}</span>
              </div>
              <div className="progress-bg">
                <div className="progress-fill" style={{ width:`${(m.good/m.total)*100}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <div className="section-title">Wagon Health Details</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Wagon ID</th><th>Temperature</th><th>Wheel</th><th>Brakes</th><th>Battery</th><th>GPS</th><th>Health Score</th><th>Status</th></tr>
            </thead>
            <tbody>
              {HEALTH_DATA.map(w => (
                <tr key={w.id}>
                  <td style={{ color:"#60a5fa", fontWeight:700 }}>{w.id}</td>
                  <td style={{ color: tempColor(w.temp), fontWeight:600 }}>{w.temp}°C</td>
                  <td><span style={{ color: condColor(w.wheel), fontWeight:600, fontSize:13 }}>{w.wheel}</span></td>
                  <td><span style={{ color: condColor(w.brake), fontWeight:600, fontSize:13 }}>{w.brake}</span></td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div className="progress-bg" style={{ width:60 }}>
                        <div className="progress-fill" style={{ width:`${w.battery}%`, background: battColor(w.battery) }} />
                      </div>
                      <span style={{ color: battColor(w.battery), fontSize:"12px", fontWeight:600 }}>{w.battery}%</span>
                    </div>
                  </td>
                  <td style={{ color: w.gps === "Active" ? "#22c55e" : w.gps === "Weak" ? "#f59e0b" : "#ef4444", fontWeight:600 }}>{w.gps}</td>
                  <td>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <div className="progress-bg" style={{ flex:1 }}>
                        <div className="progress-fill" style={{ width:`${w.health}%`, background: healthColor(w.status) }} />
                      </div>
                      <span style={{ color: healthColor(w.status), fontSize:"12px", fontWeight:700, width:"30px" }}>{w.health}%</span>
                    </div>
                  </td>
                  <td><span className={`badge ${w.status==="Healthy"?"badge-active":w.status==="Warning"?"badge-medium":"badge-critical"}`}>{w.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WagonHealth;
