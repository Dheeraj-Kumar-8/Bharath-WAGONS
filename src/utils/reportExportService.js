import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ── Role-based report permissions ─────────────────────────────────────────────
export const ROLE_REPORTS = {
  admin:    ["wagon_stats","movement_trends","alert_summary","monthly_performance","zone_performance","maintenance_analytics"],
  operator: ["wagon_stats","movement_trends","alert_summary"],
  analyst:  ["movement_trends","alert_summary","monthly_performance","zone_performance","maintenance_analytics"],
};

export function canAccessReport(role, key) {
  return (ROLE_REPORTS[role] || []).includes(key);
}

// ── File naming: ReportType_YYYY_MM_DD ────────────────────────────────────────
export function buildFileName(label, ext) {
  const d = new Date();
  const ymd = `${d.getFullYear()}_${String(d.getMonth()+1).padStart(2,"0")}_${String(d.getDate()).padStart(2,"0")}`;
  return `${label.replace(/\s+/g,"_").replace(/[^a-zA-Z0-9_-]/g,"")}_${ymd}.${ext}`;
}

// ── Report data definitions ───────────────────────────────────────────────────
export const REPORT_DEFINITIONS = [
  {
    key:"wagon_stats", label:"Wagon_Statistics", color:"#3b82f6",
    getData:() => ({
      title:"Wagon Statistics",
      columns:["Zone","Total","Active","Delayed","Maintenance","GPS Active","Health %"],
      rows:[
        ["NR (North)","312","298","9","5","291","95.8%"],
        ["SR (South)","198","189","6","3","186","95.5%"],
        ["ER (East)","224","214","7","3","210","95.5%"],
        ["CR (Central)","187","178","6","3","175","95.2%"],
        ["WR (West)","156","149","4","3","146","95.5%"],
        ["SCR","143","136","5","2","133","95.1%"],
        ["SWR","127","125","4","2","100","98.4%"],
      ],
      summary:[
        ["Total Fleet","1,247"],["Active","1,089 (87.3%)"],
        ["GPS Active","1,041"],["Avg Health","95.6%"],
        ["Zones","12"],["New This Month","6"],
      ],
    }),
  },
  {
    key:"movement_trends", label:"Movement_Trends", color:"#22c55e",
    getData:() => ({
      title:"Movement Trends",
      columns:["Day","Active","Movements","Avg Speed","On-Time %","Alerts"],
      rows:[
        ["Monday","1,021","3,180","74 km/h","94.9%","22"],
        ["Tuesday","1,045","3,246","77 km/h","95.8%","19"],
        ["Wednesday","1,032","3,207","75 km/h","95.3%","21"],
        ["Thursday","1,067","3,318","78 km/h","96.2%","16"],
        ["Friday","1,055","3,280","76 km/h","95.6%","18"],
        ["Saturday","1,078","3,351","79 km/h","96.0%","15"],
        ["Sunday","1,089","3,387","76 km/h","95.7%","18"],
      ],
      summary:[
        ["Total Movements","22,274"],["Best Day","Thursday (96.2%)"],
        ["Avg Daily Active","1,055"],["Total Alerts","124"],
        ["Avg Speed","76 km/h"],["On-Time Rate","95.6%"],
      ],
    }),
  },
  {
    key:"alert_summary", label:"Alert_Summary", color:"#f59e0b",
    getData:() => ({
      title:"Alert Summaries",
      columns:["Alert Type","Total","Critical","High","Medium","Low","Resolved %"],
      rows:[
        ["GPS Signal Lost","18","8","6","3","1","89%"],
        ["Route Deviation","22","4","10","6","2","77%"],
        ["Door Open","15","2","8","4","1","93%"],
        ["Speed Limit Exceed","31","0","5","18","8","100%"],
        ["Cargo Overweight","12","1","4","5","2","83%"],
        ["Engine Anomaly","9","3","4","2","0","67%"],
        ["Brake Warning","17","5","7","4","1","76%"],
      ],
      summary:[
        ["Total Alerts","124"],["Critical","23"],
        ["Resolved","96 (77%)"],["Pending","28"],
        ["Avg Resolution","1h 42min"],["Most Common","Speed Exceed (31)"],
      ],
    }),
  },
  {
    key:"monthly_performance", label:"Monthly_Performance", color:"#8b5cf6",
    getData:() => ({
      title:"Monthly Performance",
      columns:["Month","Wagons","Movements","On-Time %","Alerts","Maintenance","Health %"],
      rows:[
        ["January","1,180","88,200","94.1%","512","198","94.2%"],
        ["February","1,195","89,400","94.8%","489","185","94.7%"],
        ["March","1,210","90,600","95.1%","467","176","95.0%"],
        ["April","1,220","91,400","95.3%","451","168","95.2%"],
        ["May","1,230","92,100","95.5%","438","162","95.4%"],
        ["June","1,247","94,800","95.6%","478","228","95.6%"],
        ["July*","1,089","22,274","95.7%","124","42","95.8%"],
      ],
      summary:[
        ["YTD Movements","5,68,774"],["Best Month","June 2025"],
        ["Avg Fleet Size","1,196"],["Avg On-Time","95.1%"],
        ["Total Alerts YTD","2,959"],["Total Maintenance","1,159"],
      ],
    }),
  },
  {
    key:"zone_performance", label:"Zone_Performance", color:"#06b6d4",
    getData:() => ({
      title:"Zone Performance",
      columns:["Zone","Wagons","On-Time %","Avg Speed","Alerts","Maintenance","Score"],
      rows:[
        ["NR (North)","312","96.2%","79 km/h","28","12","A+"],
        ["SR (South)","198","95.4%","74 km/h","18","8","A"],
        ["ER (East)","224","95.5%","76 km/h","22","10","A"],
        ["CR (Central)","187","94.9%","73 km/h","19","9","B+"],
        ["WR (West)","156","95.5%","77 km/h","14","6","A"],
        ["SCR","143","95.1%","75 km/h","12","5","A-"],
        ["SWR","127","98.4%","81 km/h","8","4","A+"],
        ["NWR","100","93.8%","71 km/h","15","7","B+"],
      ],
      summary:[
        ["Best Zone","SWR (98.4%)"],["Needs Attention","NWR (93.8%)"],
        ["Total Zones","12"],["Avg On-Time","95.6%"],
        ["Avg Speed","75.8 km/h"],["Total Wagons","1,247"],
      ],
    }),
  },
  {
    key:"maintenance_analytics", label:"Maintenance_Analytics", color:"#ef4444",
    getData:() => ({
      title:"Maintenance Analytics",
      columns:["Type","Jobs","Avg Duration","Pass Rate","Critical","Overdue","Cost Level"],
      rows:[
        ["Routine Check","68","1.8h","100%","0","0","Low"],
        ["Wheel Inspection","42","2.5h","100%","2","1","Medium"],
        ["Brake Inspection","38","2.2h","100%","3","0","Medium"],
        ["GPS Calibration","24","1.2h","100%","0","0","Low"],
        ["Engine Service","18","4.5h","100%","4","2","High"],
        ["Axle Lubrication","31","1.5h","100%","0","0","Low"],
        ["Full Overhaul","7","8h","100%","7","0","Critical"],
      ],
      summary:[
        ["Total Jobs","228"],["Completed","168 (74%)"],
        ["Overdue","3"],["Pass Rate","100%"],
        ["Total Hours","686h"],["Next Due (7d)","12 jobs"],
      ],
    }),
  },
];

// ── PDF ───────────────────────────────────────────────────────────────────────
export function exportReportPDF(def, dateFrom, dateTo) {
  const data = def.getData();
  const doc  = new jsPDF({ orientation: data.columns.length > 6 ? "landscape" : "portrait" });
  const rgb  = hexToRgb(def.color);
  const period = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : new Date().toLocaleDateString("en-IN");

  doc.setFillColor(13,31,60);
  doc.rect(0,0,doc.internal.pageSize.width,32,"F");
  doc.setTextColor(255,255,255);
  doc.setFontSize(14); doc.setFont("helvetica","bold");
  doc.text("Indian Railways — Command Center",14,13);
  doc.setFontSize(10); doc.setFont("helvetica","normal");
  doc.text(data.title,14,23);

  doc.setDrawColor(...rgb); doc.setLineWidth(0.8);
  doc.line(14,34,doc.internal.pageSize.width-14,34);
  doc.setTextColor(100,116,139); doc.setFontSize(8);
  doc.text(`Period: ${period}   |   Generated: ${new Date().toLocaleString("en-IN")}`,14,40);

  autoTable(doc,{
    startY:46, head:[data.columns], body:data.rows,
    headStyles:{ fillColor:[13,31,60], textColor:[...rgb], fontStyle:"bold", fontSize:8 },
    bodyStyles:{ textColor:[203,213,225], fontSize:8, fillColor:[7,22,40] },
    alternateRowStyles:{ fillColor:[13,31,60] },
    styles:{ cellPadding:2.5 },
    columnStyles:{ 0:{ textColor:[96,165,250], fontStyle:"bold" } },
  });

  const y1 = doc.lastAutoTable.finalY+10;
  doc.setFontSize(10); doc.setFont("helvetica","bold");
  doc.setTextColor(241,245,249); doc.text("Summary",14,y1);
  autoTable(doc,{
    startY:y1+4, head:[["Metric","Value"]], body:data.summary,
    headStyles:{ fillColor:[...rgb], textColor:[255,255,255], fontSize:9 },
    bodyStyles:{ textColor:[203,213,225], fontSize:9, fillColor:[7,22,40] },
    alternateRowStyles:{ fillColor:[13,31,60] },
    columnStyles:{ 1:{ textColor:[96,165,250], fontStyle:"bold" } },
  });

  const pages = doc.internal.getNumberOfPages();
  for(let i=1;i<=pages;i++){
    doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(74,111,165);
    doc.text(`Ministry of Railways · Command Center · Confidential · Page ${i}/${pages}`,14,doc.internal.pageSize.height-8);
  }
  doc.save(buildFileName(def.label,"pdf"));
}

// ── Excel ─────────────────────────────────────────────────────────────────────
export function exportReportExcel(def, dateFrom, dateTo) {
  const data   = def.getData();
  const period = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : new Date().toLocaleDateString("en-IN");
  const wb     = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet([
    [data.title],
    [`Period: ${period}`,`Generated: ${new Date().toLocaleString("en-IN")}`],
    [], data.columns, ...data.rows,
  ]);
  ws1["!cols"] = data.columns.map(()=>({wch:20}));
  XLSX.utils.book_append_sheet(wb, ws1, data.title.slice(0,31));

  const ws2 = XLSX.utils.aoa_to_sheet([["Metric","Value"], ...data.summary]);
  ws2["!cols"] = [{wch:32},{wch:22}];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  XLSX.writeFile(wb, buildFileName(def.label,"xlsx"));
}

// ── CSV ───────────────────────────────────────────────────────────────────────
export function exportReportCSV(def, dateFrom, dateTo) {
  const data   = def.getData();
  const period = dateFrom && dateTo ? `${dateFrom} to ${dateTo}` : new Date().toLocaleDateString("en-IN");
  const esc    = v => `"${String(v).replace(/"/g,'""')}"`;
  const lines  = [
    `# ${data.title}`,
    `# Period: ${period} | Generated: ${new Date().toLocaleString("en-IN")}`,
    "", data.columns.map(esc).join(","),
    ...data.rows.map(r=>r.map(esc).join(",")),
    "","# Summary","Metric,Value",
    ...data.summary.map(r=>r.map(esc).join(",")),
  ];
  const blob = new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8;"});
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"),{href:url,download:buildFileName(def.label,"csv")}).click();
  URL.revokeObjectURL(url);
}

// ── Bulk export ───────────────────────────────────────────────────────────────
export function bulkExportAll(format, role, dateFrom, dateTo) {
  REPORT_DEFINITIONS
    .filter(d => canAccessReport(role, d.key))
    .forEach(def => {
      if(format==="pdf")   exportReportPDF(def,dateFrom,dateTo);
      if(format==="excel") exportReportExcel(def,dateFrom,dateTo);
      if(format==="csv")   exportReportCSV(def,dateFrom,dateTo);
    });
}

// ── Scheduled daily reports ───────────────────────────────────────────────────
const SCHEDULE_KEY = "rcc_scheduled_report";

export function getSchedule()         { try { return JSON.parse(localStorage.getItem(SCHEDULE_KEY))||null; } catch { return null; } }
export function saveSchedule(cfg)     { localStorage.setItem(SCHEDULE_KEY,JSON.stringify({...cfg,savedAt:Date.now()})); }
export function clearSchedule()       { localStorage.removeItem(SCHEDULE_KEY); }

export function checkAndRunSchedule(role) {
  const s = getSchedule();
  if(!s||!s.enabled||s.role!==role) return false;
  const [h,m]  = (s.time||"06:00").split(":").map(Number);
  const target = new Date(); target.setHours(h,m,0,0);
  if(Date.now()>=target.getTime()&&(s.lastRun||0)<target.getTime()){
    const today = new Date().toISOString().slice(0,10);
    bulkExportAll(s.format||"pdf",role,today,today);
    saveSchedule({...s,lastRun:Date.now()});
    return true;
  }
  return false;
}

function hexToRgb(hex){
  return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)];
}
