import { useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FiFileText, FiDownload, FiEye, FiX, FiCalendar,
  FiCheckCircle, FiClock, FiFilter,
  FiActivity, FiTruck, FiAlertTriangle, FiTool, FiUser,
} from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";
import StatCard from "../components/StatCard";
import { useOperatorData } from "../context/OperatorDataContext";
import ReportExportPanel from "../components/ReportExportPanel";

const OPERATOR_ACTIVITY = [
  { action:"Logged in",                 at:"08:30 AM", module:"Portal",      wagon:"—"       },
  { action:"Viewed Live Tracking",      at:"08:35 AM", module:"Tracking",    wagon:"—"       },
  { action:"Selected WGN-1042",         at:"08:40 AM", module:"Tracking",    wagon:"WGN-1042"},
  { action:"Resolved ALT-003",          at:"09:10 AM", module:"Alerts",      wagon:"WGN-1042"},
  { action:"Updated WGN-1042 status",   at:"09:45 AM", module:"Wagons",      wagon:"WGN-1042"},
  { action:"Scheduled MNT-006",         at:"10:05 AM", module:"Maintenance", wagon:"WGN-1042"},
  { action:"Viewed Cargo — WGN-5774",   at:"10:20 AM", module:"Cargo",       wagon:"WGN-5774"},
  { action:"Downloaded RPT-D001",       at:"10:30 AM", module:"Reports",     wagon:"—"       },
  { action:"Started MNT-005",           at:"11:00 AM", module:"Maintenance", wagon:"WGN-5774"},
  { action:"Resolved ALT-006",          at:"11:15 AM", module:"Alerts",      wagon:"WGN-5774"},
];

// ── Report type definitions ───────────────────────────────────────────────────
const REPORT_TYPES_DEF = [
  { key:"wagon",    label:"Daily Wagon Activity",   icon:FiTruck,         color:"#3b82f6",  desc:"Wagon movement, speed, status and GPS summary"  },
  { key:"delay",    label:"Delay Report",           icon:FiClock,         color:"#f59e0b",  desc:"Delayed wagons, root causes and impact analysis" },
  { key:"cargo",    label:"Cargo Report",           icon:FiActivity,      color:"#8b5cf6",  desc:"Cargo types, load efficiency and transit data"   },
  { key:"maint",    label:"Maintenance Report",     icon:FiTool,          color:"#ef4444",  desc:"Scheduled, completed and overdue maintenance"    },
  { key:"operator", label:"Operator Activity",      icon:FiUser,          color:"#22c55e",  desc:"Operator actions, module usage and audit log"    },
];

const TODAY = new Date().toISOString().slice(0, 10);
const MINUS = (d) => { const dt = new Date(); dt.setDate(dt.getDate() - d); return dt.toISOString().slice(0, 10); };
const fmtDate = iso => iso ? new Date(iso).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) : "—";

// ── Build report data per type ────────────────────────────────────────────────
function buildReportData(type, fromDate, toDate, operatorName, WAGONS, MAINTENANCE, ALERTS) {
  const period = `${fmtDate(fromDate)} – ${fmtDate(toDate)}`;

  if (type === "wagon") {
    return {
      title:   "Daily Wagon Activity Report",
      period,
      columns: ["Wagon ID","Route","Location","Status","Speed (km/h)","GPS","Load %","Cargo","ETA","Health %"],
      rows:    WAGONS.map(w => [w.id, w.route, w.location, w.status, w.speed, w.gps, `${w.load}%`, w.cargo, w.eta, `${w.health}%`]),
      summary: [
        ["Total Wagons",       WAGONS.length],
        ["On Time",            WAGONS.filter(w => w.status === "On Time").length],
        ["Delayed",            WAGONS.filter(w => w.status === "Delayed").length],
        ["In Maintenance",     WAGONS.filter(w => w.status === "Maintenance").length],
        ["GPS Active",         WAGONS.filter(w => w.gps === "Active").length],
        ["GPS Offline",        WAGONS.filter(w => w.gps === "Offline").length],
        ["Avg Speed (active)", `${Math.round(WAGONS.filter(w=>w.speed>0).reduce((s,w)=>s+w.speed,0)/(WAGONS.filter(w=>w.speed>0).length||1))} km/h`],
        ["Avg Health",         `${Math.round(WAGONS.reduce((s,w)=>s+w.health,0)/WAGONS.length)}%`],
      ],
    };
  }

  if (type === "delay") {
    const delayed = WAGONS.filter(w => w.status === "Delayed" || w.status === "Maintenance");
    return {
      title:   "Delay Report",
      period,
      columns: ["Wagon ID","Route","Current Location","Status","Speed","Delay Reason","Severity","ETA"],
      rows:    delayed.map(w => {
        const alert = ALERTS.find(a => a.wagon === w.id);
        return [w.id, w.route, w.location, w.status, `${w.speed} km/h`, alert?.type || "Schedule delay", alert?.severity || "Medium", w.eta];
      }),
      summary: [
        ["Total Delayed",      delayed.length],
        ["Critical Delays",    ALERTS.filter(a=>a.severity==="Critical").length],
        ["High Priority",      ALERTS.filter(a=>a.severity==="High").length],
        ["Avg Delay Estimate", "47 min"],
        ["Most Affected Route","Kolkata → Chennai"],
        ["GPS-related Delays", "1"],
        ["Weather/Track",      "1"],
        ["On-Time Rate",       `${Math.round(WAGONS.filter(w=>w.status==="On Time").length/WAGONS.length*100)}%`],
      ],
    };
  }

  if (type === "cargo") {
    return {
      title:   "Cargo Report",
      period,
      columns: ["Wagon ID","Cargo Type","Wagon Type","Load %","Route","Status","ETA","Health %"],
      rows:    WAGONS.map(w => [w.id, w.cargo, w.type, `${w.load}%`, w.route, w.status, w.eta, `${w.health}%`]),
      summary: [
        ["Total Cargo Wagons",  WAGONS.filter(w=>w.load>0).length],
        ["Fully Loaded (≥90%)", WAGONS.filter(w=>w.load>=90).length],
        ["Overloaded (>100%)",  0],
        ["Partially Loaded",    WAGONS.filter(w=>w.load>0&&w.load<90).length],
        ["Avg Load Efficiency", `${Math.round(WAGONS.filter(w=>w.load>0).reduce((s,w)=>s+w.load,0)/WAGONS.filter(w=>w.load>0).length)}%`],
        ["Top Cargo Type",      "Steel Coils"],
        ["Empty Wagons",        WAGONS.filter(w=>w.load===0).length],
        ["Cargo Alerts",        ALERTS.filter(a=>a.type.toLowerCase().includes("cargo")).length],
      ],
    };
  }

  if (type === "maint") {
    return {
      title:   "Maintenance Report",
      period,
      columns: ["Task ID","Wagon ID","Type","Priority","Scheduled","Technician","Status","Notes"],
      rows:    MAINTENANCE.map(m => [m.id, m.wagon, m.type, m.priority, fmtDate(m.scheduledDate || m.date), m.tech, m.status, m.notes]),
      summary: [
        ["Total Tasks",     MAINTENANCE.length],
        ["Completed",       MAINTENANCE.filter(m=>m.status==="Completed").length],
        ["In Progress",     MAINTENANCE.filter(m=>m.status==="In Progress").length],
        ["Pending",         MAINTENANCE.filter(m=>m.status==="Pending").length],
        ["Upcoming",        MAINTENANCE.filter(m=>m.status==="Upcoming").length],
        ["Overdue",         MAINTENANCE.filter(m=>m.status==="Overdue").length],
        ["Critical Tasks",  MAINTENANCE.filter(m=>m.priority==="Critical").length],
        ["Unique Technicians", [...new Set(MAINTENANCE.map(m=>m.tech))].length],
      ],
    };
  }

  if (type === "operator") {
    return {
      title:   "Operator Activity Report",
      period,
      columns: ["Time","Action","Module","Wagon"],
      rows:    OPERATOR_ACTIVITY.map(a => [a.at, a.action, a.module, a.wagon]),
      summary: [
        ["Operator",        operatorName || "Operator"],
        ["Total Actions",   OPERATOR_ACTIVITY.length],
        ["Modules Used",    [...new Set(OPERATOR_ACTIVITY.map(a=>a.module))].join(", ")],
        ["Wagons Accessed", [...new Set(OPERATOR_ACTIVITY.filter(a=>a.wagon!=="—").map(a=>a.wagon))].join(", ")],
        ["Alerts Resolved", OPERATOR_ACTIVITY.filter(a=>a.action.includes("Resolved")).length],
        ["Reports Downloaded", OPERATOR_ACTIVITY.filter(a=>a.action.includes("Downloaded")).length],
        ["Maintenance Actions", OPERATOR_ACTIVITY.filter(a=>a.module==="Maintenance").length],
        ["Session Start",   OPERATOR_ACTIVITY[0]?.at || "—"],
      ],
    };
  }

  return { title:"Report", period, columns:[], rows:[], summary:[] };
}

// ── PDF export ────────────────────────────────────────────────────────────────
function exportPDF(data, rtype, REPORT_TYPES) {
  const doc = new jsPDF({ orientation: data.columns.length > 7 ? "landscape" : "portrait" });
  const typeColor = REPORT_TYPES.find(r => r.key === rtype)?.color || "#3b82f6";
  const rgb = hexToRgb(typeColor);

  // Header banner
  doc.setFillColor(13, 31, 60);
  doc.rect(0, 0, doc.internal.pageSize.width, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14); doc.setFont("helvetica", "bold");
  doc.text("Indian Railways — Operator Portal", 14, 13);
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(data.title, 14, 23);

  // Meta row
  doc.setTextColor(100, 116, 139); doc.setFontSize(8);
  doc.text(`Period: ${data.period}   |   Generated: ${new Date().toLocaleString("en-IN")}`, 14, 38);

  // Accent line
  doc.setDrawColor(...rgb); doc.setLineWidth(0.8);
  doc.line(14, 41, doc.internal.pageSize.width - 14, 41);

  // Main table
  autoTable(doc, {
    startY: 46,
    head: [data.columns],
    body: data.rows,
    headStyles: { fillColor: [13, 31, 60], textColor: [...rgb], fontStyle: "bold", fontSize: 7.5 },
    bodyStyles: { textColor: [203, 213, 225], fontSize: 7.5, fillColor: [7, 22, 40] },
    alternateRowStyles: { fillColor: [13, 31, 60] },
    styles: { cellPadding: 2.5, overflow: "linebreak" },
    columnStyles: { 0: { textColor: [96, 165, 250], fontStyle: "bold" } },
  });

  // Summary table
  const y1 = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.setTextColor(241, 245, 249);
  doc.text("Summary", 14, y1);

  autoTable(doc, {
    startY: y1 + 4,
    head: [["Metric", "Value"]],
    body: data.summary,
    headStyles: { fillColor: [...rgb], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { textColor: [203, 213, 225], fontSize: 8.5, fillColor: [7, 22, 40] },
    alternateRowStyles: { fillColor: [13, 31, 60] },
    columnStyles: { 1: { textColor: [96, 165, 250], fontStyle: "bold" } },
  });

  // Footer
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5); doc.setTextColor(74, 111, 165);
    const ph = doc.internal.pageSize.height;
    doc.text(`Ministry of Railways · Operator Portal · Confidential · Page ${i}/${pages}`, 14, ph - 8);
  }

  doc.save(`${data.title.replace(/\s+/g, "_")}_${TODAY}.pdf`);
}

// ── Excel export ──────────────────────────────────────────────────────────────
function exportExcel(data) {
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet([
    [data.title],
    [`Period: ${data.period}`, `Generated: ${new Date().toLocaleString("en-IN")}`],
    [],
    data.columns,
    ...data.rows,
  ]);
  ws1["!cols"] = data.columns.map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(wb, ws1, data.title.slice(0, 31));

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["Metric", "Value"], ...data.summary,
  ]);
  ws2["!cols"] = [{ wch: 30 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  XLSX.writeFile(wb, `${data.title.replace(/\s+/g, "_")}_${TODAY}.xlsx`);
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCSV(data) {
  const esc = v => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    `# ${data.title}`,
    `# Period: ${data.period} | Generated: ${new Date().toLocaleString("en-IN")}`,
    "",
    data.columns.map(esc).join(","),
    ...data.rows.map(r => r.map(esc).join(",")),
    "",
    "# Summary",
    "Metric,Value",
    ...data.summary.map(r => r.map(esc).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `${data.title.replace(/\s+/g, "_")}_${TODAY}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return [r, g, b];
}

// ── Status colour helper ──────────────────────────────────────────────────────
const cellColor = v => {
  const l = String(v).toLowerCase();
  if (["on time","completed","active","passed","✓"].some(x => l.includes(x))) return "#22c55e";
  if (["delayed","partial","overdue","pending","medium"].some(x => l.includes(x))) return "#f59e0b";
  if (["maintenance","offline","critical","halted","✗"].some(x => l.includes(x))) return "#ef4444";
  if (["high"].some(x => l.includes(x))) return "#f97316";
  if (["in progress","upcoming"].some(x => l.includes(x))) return "#3b82f6";
  return null;
};

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ data, rtype, onClose, onDownload, REPORT_TYPES }) {
  const meta = REPORT_TYPES.find(r => r.key === rtype);
  const col  = meta?.color || "#3b82f6";
  const MetaIcon = meta?.icon || FiFileText;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:20,
        width:"96vw", maxWidth:1000, maxHeight:"92vh",
        display:"flex", flexDirection:"column", overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{ padding:"16px 22px", borderBottom:"1px solid #1a3356", display:"flex", justifyContent:"space-between", alignItems:"center", background:"linear-gradient(135deg,#0d1f3c,#071628)", flexShrink:0 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
              <MetaIcon size={14} color={col}/>
              <span style={{ color:"#f1f5f9", fontWeight:700, fontSize:15 }}>{data.title}</span>
            </div>
            <span style={{ color:"#4a6fa5", fontSize:12 }}>Period: {data.period} · Generated {new Date().toLocaleTimeString("en-IN")}</span>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {[["PDF","#ef4444"],["Excel","#22c55e"],["CSV","#f59e0b"]].map(([fmt, c]) => (
              <button key={fmt} onClick={() => onDownload(fmt)} style={{
                padding:"5px 12px", border:`1px solid ${c}44`, borderRadius:8,
                background:`${c}18`, color:c, cursor:"pointer", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", gap:5,
              }}>
                <FiDownload size={11}/> {fmt}
              </button>
            ))}
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.08)", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", color:"#94a3b8", display:"flex" }}>
              <FiX size={16}/>
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display:"flex", borderBottom:"1px solid #1a3356", flexShrink:0 }}>
          {data.summary.slice(0, 4).map(([label, val]) => (
            <div key={label} style={{ flex:1, padding:"10px 18px", borderRight:"1px solid #1a3356" }}>
              <div style={{ color:"#4a6fa5", fontSize:10, marginBottom:2, textTransform:"uppercase", letterSpacing:.5 }}>{label}</div>
              <div style={{ color:col, fontWeight:800, fontSize:16 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"18px 22px" }}>
          <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13, marginBottom:10 }}>Data Table</div>
          <div className="table-wrap" style={{ marginBottom:24 }}>
            <table>
              <thead>
                <tr>{data.columns.map(c => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => {
                      const c = cellColor(cell);
                      return (
                        <td key={j} style={{ color: j === 0 ? "#60a5fa" : "inherit", fontWeight: j === 0 ? 700 : 400 }}>
                          {c && j > 0
                            ? <span style={{ padding:"2px 8px", borderRadius:20, fontSize:11, fontWeight:700, background:`${c}22`, color:c, border:`1px solid ${c}44` }}>{cell}</span>
                            : cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13, marginBottom:10 }}>Summary</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {data.summary.map(([label, val]) => (
              <div key={label} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:9, padding:"10px 14px" }}>
                <div style={{ color:"#4a6fa5", fontSize:10, marginBottom:3, textTransform:"uppercase" }}>{label}</div>
                <div style={{ color:col, fontWeight:700, fontSize:13 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"10px 22px", borderTop:"1px solid #1a3356", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <span style={{ color:"#2a4a6e", fontSize:11 }}>Ministry of Railways · Operator Portal · Confidential</span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => onDownload("PDF")}><FiDownload size={11}/> Download PDF</button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OperatorReports() {
  const { wagons: WAGONS, maintenance: MAINTENANCE, alerts: ALERTS } = useOperatorData();
  const REPORT_TYPES = REPORT_TYPES_DEF;
  const [fromDate, setFromDate] = useState(MINUS(7));
  const [toDate,   setToDate]   = useState(TODAY);
  const [preview,  setPreview]  = useState(null);
  const [history,  setHistory]  = useState([]);
  const [generating, setGen]    = useState(null);
  const [toast,    setToast]    = useState("");
  const [historyOpen, setHistOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(""), 3000);
  };

  const addHistory = (rtype, format) => {
    const meta = REPORT_TYPES.find(r => r.key === rtype);
    setHistory(h => [{
      id:     `RPT-${Date.now().toString(36).toUpperCase()}`,
      title:  meta?.label || rtype,
      rtype,
      format,
      ts:     new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" }),
      period: `${fmtDate(fromDate)} – ${fmtDate(toDate)}`,
    }, ...h].slice(0, 30));
  };

  const handleGenerate = (rtype) => {
    setGen(rtype);
    setTimeout(() => {
      const data = buildReportData(rtype, fromDate, toDate, undefined, WAGONS, MAINTENANCE, ALERTS);
      setGen(null);
      setPreview({ data, rtype });
      addHistory(rtype, "Preview");
      showToast(`${REPORT_TYPES.find(r=>r.key===rtype)?.label} generated`);
    }, 900);
  };

  const handleDownload = (format, rtype, data) => {
    try {
      if (format === "PDF")   exportPDF(data, rtype, REPORT_TYPES);
      if (format === "Excel") exportExcel(data);
      if (format === "CSV")   exportCSV(data);
      addHistory(rtype, format);
      showToast(`${data.title} downloaded as ${format}`);
    } catch {
      showToast("Download failed — try again", false);
    }
  };

  const handleQuickDownload = (rtype, format) => {
    const data = buildReportData(rtype, fromDate, toDate, undefined, WAGONS, MAINTENANCE, ALERTS);
    handleDownload(format, rtype, data);
  };

  const totalDownloads = useMemo(() => history.filter(h => h.format !== "Preview").length, [history]);

  return (
    <OperatorLayout title="Reports" sub="Generate, preview and download operational reports" moduleKey="reports">

      <ReportExportPanel role="operator" isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      {/* Toast */}
      {toast && (
        <div style={{
          position:"fixed", top:20, right:24, zIndex:9999,
          background: toast.ok !== false ? "#16a34a" : "#dc2626",
          color:"#fff", padding:"11px 18px", borderRadius:10,
          fontWeight:600, fontSize:13, display:"flex", alignItems:"center", gap:8,
          boxShadow:"0 4px 20px rgba(0,0,0,.4)",
        }}>
          {toast.ok !== false ? <FiCheckCircle size={14}/> : <FiAlertTriangle size={14}/>}
          {toast.msg}
        </div>
      )}

      {/* KPIs */}
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard title="Report Types"   value={REPORT_TYPES.length} color="#3b82f6" icon={FiFileText}/>
        <StatCard title="Generated"      value={history.filter(h=>h.format==="Preview").length} color="#8b5cf6" icon={FiActivity}/>
        <StatCard title="Downloaded"     value={totalDownloads}      color="#22c55e" icon={FiDownload}/>
        <StatCard title="Date Range"     value={`${Math.round((new Date(toDate)-new Date(fromDate))/(864e5))} days`} color="#f59e0b" icon={FiCalendar}/>
      </div>

      {/* Controls row */}
      <div className="card mb-20" style={{ padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <FiFilter size={14} color="#4a6fa5"/>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <label style={{ color:"#64748b", fontSize:12, fontWeight:600 }}>FROM</label>
            <input type="date" className="form-input" style={{ padding:"7px 10px", fontSize:12, width:140 }}
              value={fromDate} max={toDate} onChange={e => setFromDate(e.target.value)}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <label style={{ color:"#64748b", fontSize:12, fontWeight:600 }}>TO</label>
            <input type="date" className="form-input" style={{ padding:"7px 10px", fontSize:12, width:140 }}
              value={toDate} min={fromDate} max={TODAY} onChange={e => setToDate(e.target.value)}/>
          </div>
          {/* Quick presets */}
          {[["Today",0,0],["7 Days",7,0],["30 Days",30,0]].map(([l,f,t]) => (
            <button key={l} className="btn btn-ghost btn-sm"
              onClick={() => { setFromDate(MINUS(f)); setToDate(MINUS(t)); }}>
              {l}
            </button>
          ))}
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            {history.length > 0 && (
              <button className="btn btn-outline btn-sm" onClick={() => setHistOpen(h => !h)}>
                <FiClock size={12}/> History ({history.length})
              </button>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setExportOpen(true)}>
              <FiDownload size={12}/> Export Centre
            </button>
          </div>
        </div>
      </div>

      {/* Report History panel */}
      {historyOpen && history.length > 0 && (
        <div className="card mb-20" style={{ padding:0 }}>
          <div style={{ padding:"12px 18px", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>Export History</div>
            <button onClick={() => setHistOpen(false)} style={{ background:"none", border:"none", color:"#4a6fa5", cursor:"pointer" }}><FiX size={14}/></button>
          </div>
          <div style={{ maxHeight:220, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["ID","Report","Period","Format","Time"].map(h => (
                    <th key={h} style={{ color:"#4a6fa5", fontSize:10, fontWeight:700, textTransform:"uppercase", padding:"8px 14px", textAlign:"left", borderBottom:"1px solid #1a3356" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map(h => {
                  const meta = REPORT_TYPES.find(r => r.key === h.rtype);
                  const fmtColor = h.format==="PDF"?"#ef4444":h.format==="Excel"?"#22c55e":h.format==="CSV"?"#f59e0b":"#8b5cf6";
                  return (
                    <tr key={h.id} style={{ borderBottom:"1px solid rgba(26,51,86,.4)" }}>
                      <td style={{ padding:"8px 14px", color:"#4a6fa5", fontSize:11 }}>{h.id}</td>
                      <td style={{ padding:"8px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          {meta && <meta.icon size={11} color={meta.color}/>}
                          <span style={{ color:"#cbd5e1", fontSize:12 }}>{h.title}</span>
                        </div>
                      </td>
                      <td style={{ padding:"8px 14px", color:"#4a6fa5", fontSize:11 }}>{h.period}</td>
                      <td style={{ padding:"8px 14px" }}>
                        <span style={{ padding:"2px 8px", borderRadius:20, fontSize:10, fontWeight:700, background:`${fmtColor}18`, color:fmtColor, border:`1px solid ${fmtColor}33` }}>{h.format}</span>
                      </td>
                      <td style={{ padding:"8px 14px", color:"#4a6fa5", fontSize:11 }}>{h.ts}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(380px,1fr))", gap:16, marginBottom:24 }}>
        {REPORT_TYPES.map(({ key, label, icon: Icon, color, desc }) => {
          const isGen = generating === key;
          const genCount = history.filter(h => h.rtype === key && h.format === "Preview").length;
          const dlCount  = history.filter(h => h.rtype === key && h.format !== "Preview").length;

          return (
            <div key={key} className="card" style={{ display:"flex", flexDirection:"column", gap:14, borderLeft:`3px solid ${color}` }}>
              {/* Card header */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon size={17} color={color}/>
                  </div>
                  <div>
                    <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>{label}</div>
                    <div style={{ color:"#4a6fa5", fontSize:11, marginTop:2 }}>{desc}</div>
                  </div>
                </div>
                {(genCount > 0 || dlCount > 0) && (
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    {genCount > 0 && <span style={{ background:"rgba(139,92,246,.15)", color:"#8b5cf6", border:"1px solid rgba(139,92,246,.3)", borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:600 }}>×{genCount}</span>}
                    {dlCount  > 0 && <span style={{ background:"rgba(34,197,94,.15)",  color:"#22c55e", border:"1px solid rgba(34,197,94,.3)",  borderRadius:20, padding:"2px 8px", fontSize:10, fontWeight:600 }}>↓{dlCount}</span>}
                  </div>
                )}
              </div>

              {/* Data preview mini-stats */}
              <div style={{ display:"flex", gap:8 }}>
                {key === "wagon"    && [["Wagons",WAGONS.length,"#3b82f6"],["On Time",WAGONS.filter(w=>w.status==="On Time").length,"#22c55e"],["Delayed",WAGONS.filter(w=>w.status==="Delayed").length,"#f59e0b"]].map(([l,v,c])=>miniStat(l,v,c))}
                {key === "delay"    && [["Delayed",WAGONS.filter(w=>w.status==="Delayed").length,"#f59e0b"],["Critical",ALERTS.filter(a=>a.severity==="Critical").length,"#ef4444"],["Alerts",ALERTS.length,"#f97316"]].map(([l,v,c])=>miniStat(l,v,c))}
                {key === "cargo"    && [["Loads",WAGONS.filter(w=>w.load>0).length,"#8b5cf6"],["Avg Load",`${Math.round(WAGONS.filter(w=>w.load>0).reduce((s,w)=>s+w.load,0)/(WAGONS.filter(w=>w.load>0).length||1))}%`,"#06b6d4"],["Overloaded",0,"#22c55e"]].map(([l,v,c])=>miniStat(l,v,c))}
                {key === "maint"    && [["Total",MAINTENANCE.length,"#ef4444"],["Overdue",MAINTENANCE.filter(m=>m.status==="Overdue").length,"#f97316"],["Done",MAINTENANCE.filter(m=>m.status==="Completed").length,"#22c55e"]].map(([l,v,c])=>miniStat(l,v,c))}
                {key === "operator" && [["Actions",OPERATOR_ACTIVITY.length,"#22c55e"],["Modules",[...new Set(OPERATOR_ACTIVITY.map(a=>a.module))].length,"#3b82f6"],["Resolved",OPERATOR_ACTIVITY.filter(a=>a.action.includes("Resolved")).length,"#f59e0b"]].map(([l,v,c])=>miniStat(l,v,c))}
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex:1, justifyContent:"center", background: isGen ? "rgba(255,255,255,.1)" : undefined }}
                  disabled={isGen}
                  onClick={() => handleGenerate(key)}>
                  {isGen
                    ? <><span style={{ display:"inline-block", width:10, height:10, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite", marginRight:6 }}/>Generating…</>
                    : <><FiEye size={11}/> Generate & Preview</>}
                </button>
                {[["PDF","#ef4444"],["Excel","#22c55e"],["CSV","#f59e0b"]].map(([fmt, c]) => (
                  <button key={fmt} onClick={() => handleQuickDownload(key, fmt)} style={{
                    padding:"6px 10px", border:`1px solid ${c}44`, borderRadius:8,
                    background:`${c}12`, color:c, cursor:"pointer", fontSize:11, fontWeight:700,
                    display:"flex", alignItems:"center", gap:4,
                  }}>
                    <FiDownload size={10}/> {fmt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bulk export footer */}
      <div className="card" style={{ padding:"14px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>Bulk Export — All Reports</div>
            <div style={{ color:"#4a6fa5", fontSize:12 }}>Download all 5 report types at once for period: {fmtDate(fromDate)} – {fmtDate(toDate)}</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            {[["PDF","#ef4444"],["Excel","#22c55e"],["CSV","#f59e0b"]].map(([fmt, c]) => (
              <button key={fmt} onClick={() => {
                REPORT_TYPES.forEach(rt => handleQuickDownload(rt.key, fmt));
                showToast(`All reports exported as ${fmt}`);
              }} style={{
                padding:"8px 16px", border:`1px solid ${c}44`, borderRadius:10,
                background:`${c}15`, color:c, cursor:"pointer", fontSize:12, fontWeight:700,
                display:"flex", alignItems:"center", gap:6,
              }}>
                <FiDownload size={12}/> All as {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview modal */}
      {preview && (
        <PreviewModal
          data={preview.data}
          rtype={preview.rtype}
          REPORT_TYPES={REPORT_TYPES}
          onClose={() => setPreview(null)}
          onDownload={(fmt) => handleDownload(fmt, preview.rtype, preview.data)}
        />
      )}

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </OperatorLayout>
  );
}

function miniStat(label, value, color) {
  return (
    <div key={label} style={{ flex:1, background:"#071628", border:`1px solid ${color}20`, borderRadius:8, padding:"7px 10px", textAlign:"center" }}>
      <div style={{ color, fontWeight:800, fontSize:16 }}>{value}</div>
      <div style={{ color:"#4a6fa5", fontSize:10, marginTop:2 }}>{label}</div>
    </div>
  );
}
