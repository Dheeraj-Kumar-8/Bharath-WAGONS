import { useState } from "react";
import { FiBox, FiTruck, FiAlertTriangle, FiCheckCircle, FiSearch, FiFilter } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const CARGO = [
  { id:"CRG-001", type:"Coal",         weight:"58.2T", wagon:"WGN-001", origin:"Dhanbad",       dest:"Mumbai",     status:"In Transit", temp:"Ambient", risk:"Low"    },
  { id:"CRG-002", type:"Steel",        weight:"54.8T", wagon:"WGN-003", origin:"Jamshedpur",    dest:"Delhi",      status:"In Transit", temp:"Ambient", risk:"Low"    },
  { id:"CRG-003", type:"Fuel Oil",     weight:"44.1T", wagon:"WGN-002", origin:"Vizag",         dest:"Hyderabad",  status:"Delayed",    temp:"Controlled",risk:"Medium"},
  { id:"CRG-004", type:"Grain",        weight:"52.3T", wagon:"WGN-007", origin:"Amritsar",      dest:"Kolkata",    status:"In Transit", temp:"Ambient", risk:"Low"    },
  { id:"CRG-005", type:"Chemicals",    weight:"38.6T", wagon:"WGN-009", origin:"Vadodara",      dest:"Chennai",    status:"In Transit", temp:"Controlled",risk:"High"  },
  { id:"CRG-006", type:"Automobiles",  weight:"47.0T", wagon:"WGN-005", origin:"Pune",          dest:"Bengaluru",  status:"In Transit", temp:"Ambient", risk:"Low"    },
  { id:"CRG-007", type:"Cotton",       weight:"31.2T", wagon:"WGN-011", origin:"Surat",         dest:"Ahmedabad",  status:"In Transit", temp:"Ambient", risk:"Low"    },
  { id:"CRG-008", type:"Food Grain",   weight:"62.4T", wagon:"WGN-010", origin:"Patna",         dest:"Delhi",      status:"Overweight", temp:"Ambient", risk:"High"   },
  { id:"CRG-009", type:"Machinery",    weight:"55.9T", wagon:"WGN-013", origin:"Bhopal",        dest:"Delhi",      status:"In Transit", temp:"Ambient", risk:"Medium" },
  { id:"CRG-010", type:"LPG",          weight:"42.0T", wagon:"WGN-014", origin:"Vizag",         dest:"Chennai",    status:"Halted",     temp:"Controlled",risk:"Critical"},
  { id:"CRG-011", type:"Cement",       weight:"59.7T", wagon:"WGN-015", origin:"Kanpur",        dest:"Kolkata",    status:"In Transit", temp:"Ambient", risk:"Low"    },
  { id:"CRG-012", type:"Iron Ore",     weight:"60.0T", wagon:"WGN-006", origin:"Rourkela",      dest:"Mumbai",     status:"In Transit", temp:"Ambient", risk:"Low"    },
];

const STATUSES = ["All","In Transit","Delayed","Overweight","Halted"];
const TYPES    = ["All","Coal","Steel","Fuel Oil","Grain","Chemicals","Automobiles","Cotton","Food Grain","Machinery","LPG","Cement","Iron Ore"];

const statusClass = s => ({
  "In Transit":"badge-transit","Delayed":"badge-delayed","Overweight":"badge-high","Halted":"badge-maint"
}[s]||"badge-info");

const riskClass = r => ({
  Low:"badge-low", Medium:"badge-medium", High:"badge-high", Critical:"badge-critical"
}[r]||"badge-info");

const CargoMonitoring = () => {
  const [query, setQuery]         = useState("");
  const [statusF, setStatusF]     = useState("All");
  const [typeF, setTypeF]         = useState("All");
  const [selected, setSelected]   = useState(null);

  const filtered = CARGO.filter(c =>
    (statusF === "All" || c.status === statusF) &&
    (typeF   === "All" || c.type   === typeF) &&
    (`${c.id} ${c.type} ${c.wagon} ${c.dest}`.toLowerCase().includes(query.toLowerCase()))
  );

  const totalWeight = CARGO.reduce((s, c) => s + parseFloat(c.weight), 0).toFixed(1);

  return (
    <DashboardLayout title="Cargo Monitoring" sub="Track all cargo shipments, weights, and transport status">
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Total Cargo"    value={CARGO.length}                                 color="#3b82f6" icon={FiBox} />
        <StatCard title="In Transit"     value={CARGO.filter(c=>c.status==="In Transit").length} color="#22c55e" icon={FiTruck} />
        <StatCard title="Delayed/Halted" value={CARGO.filter(c=>["Delayed","Halted"].includes(c.status)).length} color="#ef4444" icon={FiAlertTriangle} />
        <StatCard title="Total Weight"   value={`${totalWeight}T`} color="#8b5cf6" icon={FiCheckCircle} sub="Combined cargo load" />
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"#060e1e", border:"1px solid #1a3356", borderRadius:"10px", padding:"8px 14px", flex:1, minWidth:"200px" }}>
          <FiSearch color="#3a5a7c" size={14} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by cargo ID, type, wagon, destination…"
            style={{ background:"transparent", border:"none", outline:"none", color:"#f1f5f9", fontSize:"13px", width:"100%" }} />
        </div>
        <div style={{ display:"flex", gap:"6px" }}>
          <FiFilter color="#3a5a7c" size={14} style={{ alignSelf:"center" }} />
          <select className="form-select" value={statusF} onChange={e => setStatusF(e.target.value)} style={{ padding:"8px 12px", width:"auto" }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" value={typeF} onChange={e => setTypeF(e.target.value)} style={{ padding:"8px 12px", width:"auto" }}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Cargo Manifest ({filtered.length})</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Cargo ID</th><th>Type</th><th>Weight</th><th>Wagon</th><th>Origin</th><th>Destination</th><th>Temp</th><th>Risk</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ cursor:"pointer" }} onClick={() => setSelected(c)}>
                  <td style={{ color:"#4a6fa5", fontWeight:600 }}>{c.id}</td>
                  <td style={{ color:"#f1f5f9", fontWeight:600 }}>{c.type}</td>
                  <td style={{ color:"#94a3b8" }}>{c.weight}</td>
                  <td style={{ color:"#60a5fa", fontWeight:600 }}>{c.wagon}</td>
                  <td>{c.origin}</td>
                  <td>{c.dest}</td>
                  <td style={{ color:"#64748b" }}>{c.temp}</td>
                  <td><span className={`badge ${riskClass(c.risk)}`}>{c.risk}</span></td>
                  <td><span className={`badge ${statusClass(c.status)}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"16px" }}>
              <div className="modal-title" style={{ margin:0 }}>{selected.id} — {selected.type}</div>
              <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ display:"flex", gap:"8px", marginBottom:"16px" }}>
              <span className={`badge ${statusClass(selected.status)}`}>{selected.status}</span>
              <span className={`badge ${riskClass(selected.risk)}`}>Risk: {selected.risk}</span>
            </div>
            {[
              ["Cargo ID", selected.id], ["Type", selected.type], ["Weight", selected.weight],
              ["Assigned Wagon", selected.wagon], ["Origin", selected.origin], ["Destination", selected.dest],
              ["Temperature", selected.temp],
            ].map(([l, v]) => (
              <div key={l} style={{ display:"flex", gap:"12px", marginBottom:"10px" }}>
                <span style={{ color:"#4a6fa5", fontSize:"13px", width:"130px", flexShrink:0 }}>{l}</span>
                <span style={{ color:"#f1f5f9", fontSize:"13px", fontWeight:600 }}>{v}</span>
              </div>
            ))}
            <button className="btn btn-outline" style={{ marginTop:"16px" }} onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CargoMonitoring;
