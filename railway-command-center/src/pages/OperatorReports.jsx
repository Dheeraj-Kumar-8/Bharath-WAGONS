import { useState } from "react";
import { FiFileText, FiDownload, FiRefreshCw, FiCheckCircle } from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";

const REPORTS = {
  Daily: [
    { id:"RPT-D001", title:"Daily Wagon Movement Summary",     date:"03 Jul 2025", wagons:48, status:"Ready",    size:"1.2 MB" },
    { id:"RPT-D002", title:"Daily Maintenance Log",            date:"03 Jul 2025", wagons:8,  status:"Ready",    size:"0.8 MB" },
    { id:"RPT-D003", title:"Daily AI Alerts Summary",          date:"03 Jul 2025", wagons:7,  status:"Ready",    size:"0.5 MB" },
    { id:"RPT-D004", title:"Daily Cargo Status Report",        date:"02 Jul 2025", wagons:48, status:"Ready",    size:"1.4 MB" },
    { id:"RPT-D005", title:"Daily GPS Tracking Log",           date:"02 Jul 2025", wagons:48, status:"Ready",    size:"2.1 MB" },
  ],
  Weekly: [
    { id:"RPT-W001", title:"Weekly Operations Summary",        date:"Week 26 · 2025", wagons:48, status:"Ready",    size:"4.8 MB" },
    { id:"RPT-W002", title:"Weekly Maintenance Report",        date:"Week 26 · 2025", wagons:12, status:"Ready",    size:"2.3 MB" },
    { id:"RPT-W003", title:"Weekly Cargo Analysis",            date:"Week 26 · 2025", wagons:48, status:"Ready",    size:"3.1 MB" },
    { id:"RPT-W004", title:"Weekly Alert Trend Report",        date:"Week 25 · 2025", wagons:48, status:"Ready",    size:"1.9 MB" },
  ],
  Monthly: [
    { id:"RPT-M001", title:"Monthly Performance Report",       date:"Jun 2025",    wagons:48, status:"Ready",    size:"12.4 MB" },
    { id:"RPT-M002", title:"Monthly Maintenance Overview",     date:"Jun 2025",    wagons:48, status:"Ready",    size:"8.2 MB" },
    { id:"RPT-M003", title:"Monthly Cargo Statistics",         date:"Jun 2025",    wagons:48, status:"Ready",    size:"9.7 MB" },
    { id:"RPT-M004", title:"Monthly AI Alert Analysis",        date:"May 2025",    wagons:48, status:"Ready",    size:"6.5 MB" },
    { id:"RPT-M005", title:"Monthly Compliance Report",        date:"May 2025",    wagons:48, status:"Ready",    size:"5.1 MB" },
  ],
};

const TAB_COLOR = { Daily:"#3b82f6", Weekly:"#8b5cf6", Monthly:"#f59e0b" };

export default function OperatorReports() {
  const [tab,        setTab]       = useState("Daily");
  const [generating, setGenerating]= useState(null);
  const [generated,  setGenerated] = useState({});
  const [downloading,setDownloading]=useState(null);
  const [downloaded, setDownloaded]= useState({});
  const [toast,      setToast]     = useState("");

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),2500); };

  const handleGenerate = id => {
    setGenerating(id);
    setTimeout(()=>{
      setGenerating(null);
      setGenerated(g=>({...g,[id]:true}));
      showToast(`✓ Report ${id} generated successfully`);
    }, 1400);
  };

  const handleDownload = id => {
    setDownloading(id);
    setTimeout(()=>{
      setDownloading(null);
      setDownloaded(d=>({...d,[id]:true}));
      showToast(`✓ Report ${id} downloaded`);
    }, 1000);
  };

  const reports = REPORTS[tab];

  return (
    <OperatorLayout title="Reports" sub="Generate and download operational reports">
      {toast && (
        <div style={{position:"fixed",top:"20px",right:"24px",background:"#16a34a",color:"#fff",padding:"12px 20px",borderRadius:"10px",fontWeight:600,zIndex:9999,boxShadow:"0 4px 20px rgba(0,0,0,.4)"}}>
          {toast}
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid-3 mb-20">
        {Object.entries(REPORTS).map(([type,reps])=>(
          <div key={type} className="glass" style={{borderLeft:`3px solid ${TAB_COLOR[type]}`}}>
            <div style={{color:TAB_COLOR[type],fontSize:"11px",fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",marginBottom:"6px"}}>{type} Reports</div>
            <div style={{color:"#f1f5f9",fontSize:"28px",fontWeight:800}}>{reps.length}</div>
            <div style={{color:"#4a6fa5",fontSize:"12px",marginTop:"4px"}}>Available</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card mb-20" style={{padding:"12px 20px"}}>
        <div className="flex items-center gap-10">
          {Object.keys(REPORTS).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`btn btn-sm ${tab===t?"btn-primary":"btn-ghost"}`}
              style={tab===t ? {background:TAB_COLOR[t]+"30",color:TAB_COLOR[t],border:`1px solid ${TAB_COLOR[t]}50`} : {}}>
              {t} Reports
            </button>
          ))}
          <button className="btn btn-outline btn-sm" style={{marginLeft:"auto"}}
            onClick={()=>{ REPORTS[tab].forEach(r=>handleGenerate(r.id)); }}>
            <FiRefreshCw size={12}/> Generate All
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"16px"}}>
          <div className="section-title" style={{margin:0}}>{tab} Reports</div>
          <span style={{color:"#4a6fa5",fontSize:"12px"}}>{reports.length} reports</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Report ID</th><th>Title</th><th>Period</th><th>Wagons</th><th>File Size</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {reports.map(r=>(
                <tr key={r.id}>
                  <td style={{color:"#60a5fa",fontWeight:700}}>{r.id}</td>
                  <td style={{display:"flex",alignItems:"center",gap:"8px"}}>
                    <FiFileText size={13} color={TAB_COLOR[tab]}/>
                    <span style={{color:"#cbd5e1"}}>{r.title}</span>
                  </td>
                  <td style={{color:"#94a3b8"}}>{r.date}</td>
                  <td style={{color:"#94a3b8"}}>{r.wagons}</td>
                  <td style={{color:"#64748b"}}>{r.size}</td>
                  <td>
                    {generated[r.id]
                      ? <span className="badge badge-completed"><FiCheckCircle size={10}/> Generated</span>
                      : <span className="badge badge-info">{r.status}</span>}
                  </td>
                  <td>
                    <div className="flex items-center gap-8">
                      <button className="btn btn-ghost btn-sm" onClick={()=>handleGenerate(r.id)} disabled={generating===r.id}>
                        {generating===r.id
                          ? <><FiRefreshCw size={11} style={{animation:"spin 1s linear infinite"}}/> Generating…</>
                          : <><FiRefreshCw size={11}/> Generate</>}
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={()=>handleDownload(r.id)}
                        disabled={downloading===r.id}
                        style={downloaded[r.id]?{background:"#16a34a"}:{}}>
                        {downloading===r.id
                          ? "Downloading…"
                          : downloaded[r.id]
                            ? <><FiCheckCircle size={11}/> Downloaded</>
                            : <><FiDownload size={11}/> Download</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </OperatorLayout>
  );
}
