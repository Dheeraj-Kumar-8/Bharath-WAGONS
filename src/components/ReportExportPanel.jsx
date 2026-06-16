import { useState, useEffect } from "react";
import { FiDownload, FiX, FiCalendar, FiClock, FiCheck, FiAlertTriangle } from "react-icons/fi";
import {
  REPORT_DEFINITIONS, canAccessReport,
  exportReportPDF, exportReportExcel, exportReportCSV,
  bulkExportAll,
  getSchedule, saveSchedule, clearSchedule, checkAndRunSchedule,
} from "../utils/reportExportService";

const TODAY = new Date().toISOString().slice(0, 10);
const MINUS = d => { const dt = new Date(); dt.setDate(dt.getDate()-d); return dt.toISOString().slice(0,10); };

const FMT_COLORS = { pdf:"#ef4444", excel:"#22c55e", csv:"#f59e0b" };

export default function ReportExportPanel({ role = "admin", isOpen, onClose }) {
  const [fromDate,  setFrom]    = useState(MINUS(7));
  const [toDate,    setTo]      = useState(TODAY);
  const [toast,     setToast]   = useState(null);
  const [schedule,  setSchedule]= useState(getSchedule);
  const [schedOpen, setSchedOpen]= useState(false);
  const [schedTime, setSchedTime]= useState(schedule?.time || "06:00");
  const [schedFmt,  setSchedFmt] = useState(schedule?.format || "pdf");

  // Check + run scheduled export on open
  useEffect(() => {
    if(isOpen) checkAndRunSchedule(role);
  }, [isOpen, role]);

  const showToast = (msg, ok=true) => {
    setToast({msg, ok});
    setTimeout(()=>setToast(null), 3000);
  };

  const doExport = (def, fmt) => {
    try {
      if(fmt==="pdf")   exportReportPDF(def,fromDate,toDate);
      if(fmt==="excel") exportReportExcel(def,fromDate,toDate);
      if(fmt==="csv")   exportReportCSV(def,fromDate,toDate);
      showToast(`${def.label.replace(/_/g," ")} exported as ${fmt.toUpperCase()}`);
    } catch {
      showToast("Export failed — try again", false);
    }
  };

  const doBulk = fmt => {
    try {
      bulkExportAll(fmt, role, fromDate, toDate);
      showToast(`All reports exported as ${fmt.toUpperCase()}`);
    } catch {
      showToast("Bulk export failed", false);
    }
  };

  const saveScheduleConfig = () => {
    const cfg = { enabled:true, time:schedTime, format:schedFmt, role, lastRun:0 };
    saveSchedule(cfg);
    setSchedule(cfg);
    setSchedOpen(false);
    showToast(`Daily ${schedFmt.toUpperCase()} scheduled at ${schedTime}`);
  };

  const removeSchedule = () => {
    clearSchedule();
    setSchedule(null);
    showToast("Scheduled report removed");
  };

  const allowedDefs = REPORT_DEFINITIONS.filter(d => canAccessReport(role, d.key));

  if(!isOpen) return null;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9000,
      background:"rgba(0,0,0,.65)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }} onClick={e => e.target===e.currentTarget && onClose()}>

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:20, right:24, zIndex:9999,
          background: toast.ok ? "#16a34a" : "#dc2626",
          color:"#fff", padding:"11px 18px", borderRadius:10,
          fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:8,
          boxShadow:"0 4px 20px rgba(0,0,0,.4)",
        }}>
          {toast.ok ? <FiCheck size={14}/> : <FiAlertTriangle size={14}/>}
          {toast.msg}
        </div>
      )}

      <div style={{
        background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:20,
        width:"92vw", maxWidth:820, maxHeight:"92vh",
        display:"flex", flexDirection:"column", overflow:"hidden",
        boxShadow:"0 0 60px rgba(37,99,235,.3)",
      }}>

        {/* Header */}
        <div style={{
          padding:"16px 22px", borderBottom:"1px solid #1a3356",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:"linear-gradient(135deg,#0d1f3c,#071628)", flexShrink:0,
        }}>
          <div>
            <div style={{color:"#f1f5f9",fontWeight:700,fontSize:16,display:"flex",alignItems:"center",gap:8}}>
              <FiDownload size={16} color="#3b82f6"/> Report Export Centre
            </div>
            <div style={{color:"#4a6fa5",fontSize:12,marginTop:3}}>
              {allowedDefs.length} reports available · Role: <span style={{color:"#60a5fa",textTransform:"capitalize"}}>{role}</span>
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.08)",border:"none",borderRadius:8,padding:"6px 8px",cursor:"pointer",color:"#94a3b8",display:"flex"}}>
            <FiX size={16}/>
          </button>
        </div>

        <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>

          {/* Date filters */}
          <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",marginBottom:18,padding:"12px 16px",background:"rgba(255,255,255,.03)",border:"1px solid #1a3356",borderRadius:12}}>
            <FiCalendar size={14} color="#4a6fa5"/>
            <label style={{color:"#64748b",fontSize:12,fontWeight:600}}>FROM</label>
            <input type="date" value={fromDate} max={toDate}
              onChange={e=>setFrom(e.target.value)}
              style={{padding:"6px 10px",borderRadius:8,border:"1px solid #1a3356",background:"#071628",color:"#f1f5f9",fontSize:12}}/>
            <label style={{color:"#64748b",fontSize:12,fontWeight:600}}>TO</label>
            <input type="date" value={toDate} min={fromDate} max={TODAY}
              onChange={e=>setTo(e.target.value)}
              style={{padding:"6px 10px",borderRadius:8,border:"1px solid #1a3356",background:"#071628",color:"#f1f5f9",fontSize:12}}/>
            {[["Today",0,0],["7d",7,0],["30d",30,0]].map(([l,f])=>(
              <button key={l} onClick={()=>{setFrom(MINUS(f));setTo(TODAY);}}
                style={{padding:"5px 10px",borderRadius:8,border:"1px solid #1a3356",background:"rgba(255,255,255,.05)",color:"#94a3b8",cursor:"pointer",fontSize:11,fontWeight:600}}>
                {l}
              </button>
            ))}
            <button onClick={()=>setSchedOpen(v=>!v)}
              style={{marginLeft:"auto",padding:"6px 12px",borderRadius:8,
                border:`1px solid ${schedule?.enabled?"#22c55e44":"#1a3356"}`,
                background: schedule?.enabled?"rgba(34,197,94,.1)":"rgba(255,255,255,.05)",
                color: schedule?.enabled?"#22c55e":"#94a3b8",
                cursor:"pointer",fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
              <FiClock size={12}/>
              {schedule?.enabled ? `Scheduled ${schedule.time}` : "Schedule"}
            </button>
          </div>

          {/* Schedule config */}
          {schedOpen && (
            <div style={{marginBottom:18,padding:"14px 16px",background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.2)",borderRadius:12}}>
              <div style={{color:"#f1f5f9",fontWeight:700,fontSize:13,marginBottom:12}}>Daily Scheduled Export</div>
              <div style={{display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <label style={{color:"#64748b",fontSize:12,fontWeight:600}}>TIME</label>
                  <input type="time" value={schedTime} onChange={e=>setSchedTime(e.target.value)}
                    style={{padding:"6px 10px",borderRadius:8,border:"1px solid #1a3356",background:"#071628",color:"#f1f5f9",fontSize:12}}/>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <label style={{color:"#64748b",fontSize:12,fontWeight:600}}>FORMAT</label>
                  <select value={schedFmt} onChange={e=>setSchedFmt(e.target.value)}
                    style={{padding:"6px 10px",borderRadius:8,border:"1px solid #1a3356",background:"#071628",color:"#f1f5f9",fontSize:12}}>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <button onClick={saveScheduleConfig}
                  style={{padding:"6px 14px",borderRadius:8,border:"none",background:"#22c55e",color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700}}>
                  Save Schedule
                </button>
                {schedule?.enabled && (
                  <button onClick={removeSchedule}
                    style={{padding:"6px 14px",borderRadius:8,border:"1px solid #ef444444",background:"rgba(239,68,68,.1)",color:"#ef4444",cursor:"pointer",fontSize:12,fontWeight:600}}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Per-report rows */}
          <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
            {allowedDefs.map(def => (
              <div key={def.key} style={{
                display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,
                padding:"12px 16px",background:"rgba(255,255,255,.03)",
                border:`1px solid ${def.color}22`,borderLeft:`3px solid ${def.color}`,borderRadius:10,
              }}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:def.color,flexShrink:0}}/>
                  <span style={{color:"#f1f5f9",fontWeight:600,fontSize:13}}>{def.label.replace(/_/g," ")}</span>
                </div>
                <div style={{display:"flex",gap:8}}>
                  {["pdf","excel","csv"].map(fmt=>(
                    <button key={fmt} onClick={()=>doExport(def,fmt)} style={{
                      padding:"5px 12px",borderRadius:8,
                      border:`1px solid ${FMT_COLORS[fmt]}44`,
                      background:`${FMT_COLORS[fmt]}12`,
                      color:FMT_COLORS[fmt],cursor:"pointer",
                      fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:4,
                    }}>
                      <FiDownload size={10}/>{fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bulk export */}
          <div style={{padding:"14px 16px",background:"rgba(37,99,235,.08)",border:"1px solid rgba(37,99,235,.2)",borderRadius:12}}>
            <div style={{color:"#f1f5f9",fontWeight:700,fontSize:13,marginBottom:4}}>One-Click Bulk Export</div>
            <div style={{color:"#4a6fa5",fontSize:12,marginBottom:12}}>
              Download all {allowedDefs.length} reports at once for {fromDate} → {toDate}
            </div>
            <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
              {["pdf","excel","csv"].map(fmt=>(
                <button key={fmt} onClick={()=>doBulk(fmt)} style={{
                  padding:"8px 20px",borderRadius:10,
                  border:`1px solid ${FMT_COLORS[fmt]}44`,
                  background:`${FMT_COLORS[fmt]}15`,
                  color:FMT_COLORS[fmt],cursor:"pointer",
                  fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:6,
                }}>
                  <FiDownload size={13}/>All as {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{padding:"10px 22px",borderTop:"1px solid #1a3356",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <span style={{color:"#2a4a6e",fontSize:11}}>Ministry of Railways · Indian Railways Command Center · File: ReportType_YYYY_MM_DD</span>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
