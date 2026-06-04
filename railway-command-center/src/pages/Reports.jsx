import { useState } from "react";
import { FiFileText, FiDownload, FiBarChart2, FiActivity, FiCalendar, FiCheckCircle } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const REPORTS = {
  Daily: [
    { id:"RPT-D001", title:"Daily Operations Summary",    date:"2025-07-11", wagons:1089, alerts:18,  status:"Ready"    },
    { id:"RPT-D002", title:"Daily Cargo Report",          date:"2025-07-11", wagons:342,  alerts:4,   status:"Ready"    },
    { id:"RPT-D003", title:"Daily Delay Analysis",        date:"2025-07-11", wagons:47,   alerts:12,  status:"Ready"    },
    { id:"RPT-D004", title:"Daily Maintenance Log",       date:"2025-07-11", wagons:28,   alerts:6,   status:"Ready"    },
    { id:"RPT-D005", title:"Daily GPS Status Report",     date:"2025-07-10", wagons:1041, alerts:8,   status:"Ready"    },
  ],
  Weekly: [
    { id:"RPT-W001", title:"Weekly Operations Summary",   date:"Jul 5–11",   wagons:7250, alerts:124, status:"Ready"    },
    { id:"RPT-W002", title:"Weekly Performance Report",   date:"Jul 5–11",   wagons:7250, alerts:98,  status:"Ready"    },
    { id:"RPT-W003", title:"Weekly Alert Analysis",       date:"Jul 5–11",   wagons:7250, alerts:124, status:"Ready"    },
    { id:"RPT-W004", title:"Weekly Maintenance Summary",  date:"Jun 28–Jul4",wagons:6980, alerts:139, status:"Ready"    },
  ],
  Monthly: [
    { id:"RPT-M001", title:"Monthly Fleet Report",         date:"June 2025",  wagons:31200,alerts:478, status:"Ready"   },
    { id:"RPT-M002", title:"Monthly AI Analytics Report",  date:"June 2025",  wagons:31200,alerts:478, status:"Ready"   },
    { id:"RPT-M003", title:"Monthly Cargo Summary",        date:"June 2025",  wagons:31200,alerts:208, status:"Ready"   },
    { id:"RPT-M004", title:"Monthly Maintenance Report",   date:"May 2025",   wagons:29400,alerts:512, status:"Ready"   },
  ],
};

const SUMMARY = [
  { metric:"Total Wagon Movements",  daily:"3,182",  weekly:"22,274", monthly:"94,800" },
  { metric:"On-Time Deliveries",     daily:"3,042",  weekly:"21,182", monthly:"89,920" },
  { metric:"Delayed Wagons",         daily:"47",     weekly:"329",    monthly:"1,404"  },
  { metric:"AI Alerts Generated",    daily:"18",     weekly:"124",    monthly:"478"    },
  { metric:"Maintenance Completed",  daily:"6",      weekly:"42",     monthly:"168"    },
  { metric:"Cargo Loads Tracked",    daily:"342",    weekly:"2,394",  monthly:"10,260" },
  { metric:"GPS Active Devices",     daily:"1,041",  weekly:"avg 1,021",monthly:"avg 1,008"},
];

const Reports = () => {
  const [tab, setTab]         = useState("Daily");
  const [generating, setGen]  = useState(null);
  const [notification, setNotif] = useState("");

  const handleExport = (type) => {
    setNotif(`Exporting ${tab} report as ${type}…`);
    setTimeout(() => setNotif(""), 3000);
  };
  const handleGenerate = (id) => {
    setGen(id);
    setTimeout(() => setGen(null), 1500);
  };

  return (
    <DashboardLayout title="Reports" sub="Generate and export operational reports for all time periods">
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Daily Reports"   value={REPORTS.Daily.length}   color="#3b82f6" icon={FiFileText} />
        <StatCard title="Weekly Reports"  value={REPORTS.Weekly.length}  color="#22c55e" icon={FiBarChart2} />
        <StatCard title="Monthly Reports" value={REPORTS.Monthly.length} color="#8b5cf6" icon={FiActivity} />
        <StatCard title="Total Generated" value={Object.values(REPORTS).flat().length} color="#f59e0b" icon={FiCheckCircle} />
      </div>

      {/* Notification toast */}
      {notification && (
        <div style={{ background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.3)", borderRadius:"10px", padding:"12px 18px", marginBottom:"16px", color:"#22c55e", fontSize:"13px", fontWeight:600 }}>
          ✓ {notification}
        </div>
      )}

      {/* Tabs + Export */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px", flexWrap:"wrap", gap:"12px" }}>
        <div style={{ display:"flex", gap:"6px" }}>
          {["Daily","Weekly","Monthly"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab===t?"btn-primary":"btn-outline"}`}>
              <FiCalendar size={12} /> {t}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          {["PDF","Excel","CSV"].map(type => (
            <button key={type} className="btn btn-ghost btn-sm" onClick={() => handleExport(type)}>
              <FiDownload size={12} /> Export {type}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"16px", marginBottom:"24px" }}>
        {REPORTS[tab].map(r => (
          <div key={r.id} className="card" style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:"14px", marginBottom:"4px" }}>{r.title}</div>
                <div style={{ color:"#4a6fa5", fontSize:"12px" }}>{r.id} · {r.date}</div>
              </div>
              <span className="badge badge-active">{r.status}</span>
            </div>
            <div style={{ display:"flex", gap:"20px" }}>
              <div>
                <div style={{ color:"#64748b", fontSize:"11px" }}>Wagons</div>
                <div style={{ color:"#3b82f6", fontWeight:700, fontSize:"16px" }}>{r.wagons.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color:"#64748b", fontSize:"11px" }}>Alerts</div>
                <div style={{ color:"#f59e0b", fontWeight:700, fontSize:"16px" }}>{r.alerts}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:"center" }}
                onClick={() => handleGenerate(r.id)}>
                {generating === r.id ? "Generating…" : "Generate"}
              </button>
              {["PDF","Excel"].map(fmt => (
                <button key={fmt} className="btn btn-ghost btn-sm" onClick={() => handleExport(fmt)}>
                  <FiDownload size={11} /> {fmt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Table */}
      <div className="card">
        <div className="section-title">Performance Summary</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Metric</th><th>Daily</th><th>Weekly</th><th>Monthly</th></tr>
            </thead>
            <tbody>
              {SUMMARY.map(s => (
                <tr key={s.metric}>
                  <td style={{ color:"#f1f5f9", fontWeight:600 }}>{s.metric}</td>
                  <td style={{ color:"#3b82f6", fontWeight:600 }}>{s.daily}</td>
                  <td style={{ color:"#22c55e", fontWeight:600 }}>{s.weekly}</td>
                  <td style={{ color:"#8b5cf6", fontWeight:600 }}>{s.monthly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
