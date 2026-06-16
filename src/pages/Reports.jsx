import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FiFileText, FiDownload, FiBarChart2, FiActivity,
  FiCalendar, FiCheckCircle, FiX, FiEye,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import ReportExportPanel from "../components/ReportExportPanel";

const REPORTS = {
  Daily: [
    { id:"RPT-D001", title:"Daily Operations Summary",  date:"2025-07-11", wagons:1089, alerts:18,  status:"Ready" },
    { id:"RPT-D002", title:"Daily Cargo Report",         date:"2025-07-11", wagons:342,  alerts:4,   status:"Ready" },
    { id:"RPT-D003", title:"Daily Delay Analysis",       date:"2025-07-11", wagons:47,   alerts:12,  status:"Ready" },
    { id:"RPT-D004", title:"Daily Maintenance Log",      date:"2025-07-11", wagons:28,   alerts:6,   status:"Ready" },
    { id:"RPT-D005", title:"Daily GPS Status Report",    date:"2025-07-10", wagons:1041, alerts:8,   status:"Ready" },
  ],
  Weekly: [
    { id:"RPT-W001", title:"Weekly Operations Summary",  date:"Jul 5–11",    wagons:7250,  alerts:124, status:"Ready" },
    { id:"RPT-W002", title:"Weekly Performance Report",  date:"Jul 5–11",    wagons:7250,  alerts:98,  status:"Ready" },
    { id:"RPT-W003", title:"Weekly Alert Analysis",      date:"Jul 5–11",    wagons:7250,  alerts:124, status:"Ready" },
    { id:"RPT-W004", title:"Weekly Maintenance Summary", date:"Jun 28–Jul 4",wagons:6980,  alerts:139, status:"Ready" },
  ],
  Monthly: [
    { id:"RPT-M001", title:"Monthly Fleet Report",        date:"June 2025", wagons:31200, alerts:478, status:"Ready" },
    { id:"RPT-M002", title:"Monthly AI Analytics Report", date:"June 2025", wagons:31200, alerts:478, status:"Ready" },
    { id:"RPT-M003", title:"Monthly Cargo Summary",       date:"June 2025", wagons:31200, alerts:208, status:"Ready" },
    { id:"RPT-M004", title:"Monthly Maintenance Report",  date:"May 2025",  wagons:29400, alerts:512, status:"Ready" },
  ],
};

// ── Unique data per report ────────────────────────────────────────────────────
const REPORT_DATA = {
  "RPT-D001": {
    tableTitle: "Wagon Operations Overview",
    columns: ["Wagon ID","From","To","Speed","Status","On-Time","Zone"],
    rows: [
      ["WGN-001","New Delhi","Mumbai CST","87 km/h","On Time","✓","NR"],
      ["WGN-003","Howrah","New Delhi","92 km/h","On Time","✓","ER"],
      ["WGN-005","Bengaluru","Chennai","78 km/h","On Time","✓","SWR"],
      ["WGN-007","Lucknow","Kolkata","81 km/h","On Time","✓","NR"],
      ["WGN-009","Nagpur","Hyderabad","73 km/h","On Time","✓","SCR"],
      ["WGN-011","Surat","Ahmedabad","90 km/h","On Time","✓","WR"],
      ["WGN-002","Chennai Ctrl","Hyderabad","64 km/h","Delayed","✗","SR"],
      ["WGN-006","Ahmedabad","New Delhi","55 km/h","Delayed","✗","WR"],
      ["WGN-004","Pune Jn","Mumbai CST","0 km/h","Maintenance","–","CR"],
      ["WGN-008","Jaipur","Mumbai","0 km/h","Maintenance","–","NWR"],
    ],
    summaryTitle: "Daily Operations Summary",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Total Active Wagons","1,089"],["On-Time","1,042 (95.7%)"],
      ["Delayed","47 (4.3%)"],["In Maintenance","28"],
      ["Avg Speed","76 km/h"],["GPS Active","1,041"],
    ],
  },

  "RPT-D002": {
    tableTitle: "Cargo Load Details",
    columns: ["Wagon ID","Cargo Type","Weight (T)","Origin","Destination","Load %","Status"],
    rows: [
      ["WGN-001","Steel Coils","58","New Delhi","Mumbai CST","97%","Loaded"],
      ["WGN-003","Coal","60","Howrah","New Delhi","100%","Loaded"],
      ["WGN-007","Cement","52","Lucknow","Kolkata","87%","Loaded"],
      ["WGN-009","Fertilizer","45","Nagpur","Hyderabad","75%","Loaded"],
      ["WGN-011","Iron Ore","60","Surat","Ahmedabad","100%","Loaded"],
      ["WGN-013","Grain","48","Bhopal","Delhi","80%","Loaded"],
      ["WGN-015","Chemicals","40","Kanpur","Kolkata","73%","Loaded"],
      ["WGN-002","Petroleum","45","Chennai","Hyderabad","100%","Loaded"],
      ["WGN-006","Auto Parts","38","Ahmedabad","New Delhi","63%","Partial"],
      ["WGN-010","Machinery","50","Patna","New Delhi","91%","Loaded"],
    ],
    summaryTitle: "Cargo Summary",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Total Cargo Loads","342"],["Fully Loaded","289 (84%)"],
      ["Partially Loaded","53 (16%)"],["Total Weight","18,420 T"],
      ["Overweight Alerts","1"],["Avg Load Efficiency","80%"],
    ],
  },

  "RPT-D003": {
    tableTitle: "Delayed Wagons — Root Cause",
    columns: ["Wagon ID","Route","Delay","Reason","Priority","Last Updated"],
    rows: [
      ["WGN-101","Zone NR → Mumbai","2h 05m","GPS lost + rerouted","Critical","12:15 PM"],
      ["WGN-234","SCR Zone","1h 30m","Route deviation detected","High","12:18 PM"],
      ["WGN-006","Ahmedabad → Delhi","1h 12m","Track maintenance block","High","12:10 PM"],
      ["WGN-789","Hyderabad → Chennai","55m","Cargo overweight check","Medium","12:25 PM"],
      ["WGN-002","Chennai → Hyderabad","47m","Signal failure at Kazipet","High","12:05 PM"],
      ["WGN-010","Patna → Delhi","38m","Bridge inspection slow order","Medium","11:58 AM"],
      ["WGN-012","Coimbatore → Bengaluru","22m","Station congestion","Low","12:15 PM"],
    ],
    summaryTitle: "Delay Statistics",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Total Delayed","47"],["Critical (>2h)","3"],
      ["High Priority","12"],["Medium Priority","22"],
      ["Low Priority","10"],["Avg Delay","48 min"],
      ["Most Affected Zone","NR (11 wagons)"],
    ],
  },

  "RPT-D004": {
    tableTitle: "Maintenance Activity Log",
    columns: ["MNT ID","Wagon ID","Type","Technician","Date","Duration","Result"],
    rows: [
      ["MNT-C01","WGN-001","Routine Check","Ramesh Kumar","2025-07-08","2h","Passed"],
      ["MNT-C02","WGN-003","Wheel Inspection","Suresh Verma","2025-07-07","3h","Passed"],
      ["MNT-C03","WGN-005","Brake Test","Pradeep Singh","2025-07-06","1.5h","Passed"],
      ["MNT-C04","WGN-007","GPS Calibration","Vijay Patel","2025-07-05","1h","Passed"],
      ["MNT-C05","WGN-009","Engine Service","Arjun Sharma","2025-07-04","4h","Passed"],
      ["MNT-001","WGN-004","Brake Inspection","Ramesh Kumar","2025-07-12","–","Scheduled"],
      ["MNT-002","WGN-008","Wheel Replacement","Suresh Verma","2025-07-13","–","Scheduled"],
      ["MNT-003","WGN-014","Engine Overhaul","Pradeep Singh","2025-07-14","–","Scheduled"],
    ],
    summaryTitle: "Maintenance Summary",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Completed Today","6"],["Scheduled (7 days)","7"],
      ["Critical Priority","2"],["Avg Duration","2.3h"],
      ["Pass Rate","100%"],["Pending Approval","2"],
    ],
  },

  "RPT-D005": {
    tableTitle: "GPS Device Status",
    columns: ["Wagon ID","GPS Status","Signal","Latitude","Longitude","Last Ping","Zone"],
    rows: [
      ["WGN-001","Active","Strong","28.6139° N","77.2090° E","12:30 PM","NR"],
      ["WGN-003","Active","Strong","22.5726° N","88.3639° E","12:30 PM","ER"],
      ["WGN-005","Active","Strong","12.9716° N","77.5946° E","12:29 PM","SWR"],
      ["WGN-007","Active","Medium","26.8467° N","80.9462° E","12:30 PM","NR"],
      ["WGN-009","Active","Medium","21.1458° N","79.0882° E","12:28 PM","SCR"],
      ["WGN-002","Active","Weak","13.0827° N","80.2707° E","12:25 PM","SR"],
      ["WGN-006","Active","Medium","23.0225° N","72.5714° E","12:27 PM","WR"],
      ["WGN-101","Offline","None","–","–","12:15 PM","NR"],
      ["WGN-004","Inactive","–","–","–","8:00 AM","CR"],
      ["WGN-008","Inactive","–","–","–","7:45 AM","NWR"],
    ],
    summaryTitle: "GPS Coverage Summary",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["GPS Active","1,041 (89%)"],["GPS Offline","47 (4%)"],
      ["GPS Inactive","159 (7%)"],["Strong Signal","820"],
      ["Medium Signal","180"],["Weak Signal","41"],
      ["NavIC Status","Active"],
    ],
  },

  "RPT-W001": {
    tableTitle: "Daily Breakdown — Week Jul 5–11",
    columns: ["Day","Active Wagons","Delayed","Maintenance","Avg Speed","Alerts","On-Time %"],
    rows: [
      ["Monday Jul 5","1,021","52","31","74 km/h","22","94.9%"],
      ["Tuesday Jul 6","1,045","44","29","77 km/h","19","95.8%"],
      ["Wednesday Jul 7","1,032","49","30","75 km/h","21","95.3%"],
      ["Thursday Jul 8","1,067","41","27","78 km/h","16","96.2%"],
      ["Friday Jul 9","1,055","46","28","76 km/h","18","95.6%"],
      ["Saturday Jul 10","1,078","43","26","79 km/h","15","96.0%"],
      ["Sunday Jul 11","1,089","47","28","76 km/h","18","95.7%"],
    ],
    summaryTitle: "Weekly Operations KPIs",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Total Movements","22,274"],["Best Day","Thu Jul 8 (96.2%)"],
      ["Worst Day","Mon Jul 5 (94.9%)"],["Avg Daily Active","1,055"],
      ["Total Alerts","129"],["Total Maintenance Jobs","199"],
    ],
  },

  "RPT-W002": {
    tableTitle: "Route Performance — Jul 5–11",
    columns: ["Route","Wagons","Avg Speed","On-Time %","Delays","Distance","Score"],
    rows: [
      ["Delhi → Mumbai","98","79 km/h","96.9%","3","1,384 km","A+"],
      ["Howrah → Delhi","84","76 km/h","95.2%","4","1,442 km","A"],
      ["Chennai → Kolkata","63","74 km/h","95.2%","3","1,659 km","A"],
      ["Ahmedabad → Delhi","77","72 km/h","93.5%","5","934 km","B+"],
      ["Bengaluru → Pune","42","70 km/h","88.1%","5","832 km","B"],
      ["Hyderabad → Mumbai","56","75 km/h","96.4%","2","711 km","A+"],
    ],
    summaryTitle: "Performance Highlights",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Best Route","Delhi → Mumbai (96.9%)"],["Worst Route","Bengaluru → Pune (88.1%)"],
      ["Total Active Routes","84"],["Avg On-Time","94.2%"],
      ["Total Distance Covered","1,84,240 km"],["Overall Score","A"],
    ],
  },

  "RPT-W003": {
    tableTitle: "Alert Type Breakdown — Jul 5–11",
    columns: ["Alert Type","Count","Critical","High","Medium","Low","Resolved %"],
    rows: [
      ["GPS Signal Lost","18","8","6","3","1","89%"],
      ["Route Deviation","22","4","10","6","2","77%"],
      ["Door Open Detected","15","2","8","4","1","93%"],
      ["Speed Limit Exceeded","31","0","5","18","8","100%"],
      ["Cargo Overweight","12","1","4","5","2","83%"],
      ["Engine Anomaly","9","3","4","2","0","67%"],
      ["Brake Warning","17","5","7","4","1","76%"],
    ],
    summaryTitle: "Alert Resolution Stats",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Total Alerts","124"],["Critical","23"],
      ["Resolved","96 (77%)"],["Pending","28"],
      ["Avg Resolution Time","1h 42min"],["Most Common","Speed Exceeded (31)"],
    ],
  },

  "RPT-W004": {
    tableTitle: "Maintenance Jobs — Jun 28 to Jul 4",
    columns: ["MNT ID","Wagon ID","Type","Technician","Date","Priority","Status"],
    rows: [
      ["MNT-W01","WGN-001","Routine Check","Ramesh Kumar","Jun 28","Low","Completed"],
      ["MNT-W02","WGN-003","Wheel Inspection","Suresh Verma","Jun 29","Medium","Completed"],
      ["MNT-W03","WGN-005","Brake Test","Pradeep Singh","Jun 30","Low","Completed"],
      ["MNT-W04","WGN-007","GPS Calibration","Vijay Patel","Jun 30","Medium","Completed"],
      ["MNT-W05","WGN-009","Engine Service","Arjun Sharma","Jul 1","High","Completed"],
      ["MNT-W06","WGN-011","Cargo Door Repair","Ravi Nair","Jul 2","Medium","Completed"],
      ["MNT-W07","WGN-013","Axle Lubrication","Anil Gupta","Jul 3","Low","Completed"],
      ["MNT-W08","WGN-004","Brake Inspection","Ramesh Kumar","Jul 4","Critical","Completed"],
    ],
    summaryTitle: "Weekly Maintenance KPIs",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Total Jobs Completed","42"],["Critical Jobs","4"],
      ["Total Technician Hours","186h"],["Avg Duration Per Wagon","2.1h"],
      ["Pass Rate","100%"],["Pending Carry-Forward","7"],
    ],
  },

  "RPT-M001": {
    tableTitle: "Fleet Status by Zone — June 2025",
    columns: ["Zone","Total","Active","Delayed","Maintenance","GPS Active","Health %"],
    rows: [
      ["NR (North)","312","298","9","5","291","95.8%"],
      ["SR (South)","198","189","6","3","186","95.5%"],
      ["ER (East)","224","214","7","3","210","95.5%"],
      ["CR (Central)","187","178","6","3","175","95.2%"],
      ["WR (West)","156","149","4","3","146","95.5%"],
      ["SCR","143","136","5","2","133","95.1%"],
      ["SWR","127","125","4","2","100","98.4%"],
    ],
    summaryTitle: "Monthly Fleet KPIs",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Total Fleet","1,247"],["Active","1,089 (87.3%)"],
      ["Zone Count","12"],["Avg Health Score","95.6%"],
      ["Monthly Movements","94,800"],["New Wagons Added","6"],
    ],
  },

  "RPT-M002": {
    tableTitle: "AI Model Performance — June 2025",
    columns: ["AI Metric","June","May","Change","Trend","Confidence"],
    rows: [
      ["Delay Prediction Accuracy","91.2%","88.7%","+2.5%","↑ Improving","High"],
      ["Route Optimisation Savings","12 routes","9 routes","+3","↑ Improving","High"],
      ["Maintenance Forecasting","94.1%","91.3%","+2.8%","↑ Improving","High"],
      ["Anomaly Detection Rate","87.4%","83.9%","+3.5%","↑ Improving","Medium"],
      ["GPS Signal Recovery","96.3%","94.1%","+2.2%","↑ Improving","High"],
      ["Fuel Efficiency Score","88%","83.8%","+4.2%","↑ Improving","Medium"],
      ["False Alert Rate","3.2%","4.8%","-1.6%","↓ Better","High"],
    ],
    summaryTitle: "AI Engine Summary",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["AI Engine Uptime","100%"],["Active Models","7"],
      ["Alerts Generated","478"],["Auto-Resolved","368 (77%)"],
      ["Avg Model Accuracy","91.2%"],["Routes Optimised","12"],
    ],
  },

  "RPT-M003": {
    tableTitle: "Cargo Type Summary — June 2025",
    columns: ["Cargo Type","Loads","Total Weight","Top Route","Avg Load %","Incidents","Score"],
    rows: [
      ["Steel / Iron Ore","2,840","1,70,400 T","Delhi→Mumbai","96%","2","A+"],
      ["Coal","1,920","1,15,200 T","Howrah→Delhi","100%","0","A+"],
      ["Petroleum / Chemicals","1,340","60,300 T","Chennai→Hyd","98%","3","A"],
      ["Cement","1,180","56,640 T","Ahmedabad→Delhi","94%","1","A"],
      ["Grain / Food","980","44,100 T","Nagpur→Hyd","82%","0","B+"],
      ["Machinery","840","46,200 T","Kanpur→Kolkata","77%","1","B+"],
      ["Fertilizer","560","25,200 T","Bhopal→Delhi","75%","0","B"],
    ],
    summaryTitle: "Cargo KPIs",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Total Loads","10,260"],["Total Weight","5,18,040 T"],
      ["Overweight Alerts","7"],["Avg Load Efficiency","89%"],
      ["Top Cargo Type","Steel / Iron Ore"],["Revenue Score","A"],
    ],
  },

  "RPT-M004": {
    tableTitle: "Maintenance by Type — May 2025",
    columns: ["Type","Jobs","Avg Duration","Technicians","Pass Rate","Cost Level","Next Due"],
    rows: [
      ["Routine Check","68","1.8h","All","100%","Low","Monthly"],
      ["Wheel Inspection","42","2.5h","Suresh, Vijay","100%","Medium","Quarterly"],
      ["Brake Inspection","38","2.2h","Ramesh, Pradeep","100%","Medium","Monthly"],
      ["GPS Calibration","24","1.2h","Vijay, Arjun","100%","Low","Monthly"],
      ["Engine Service","18","4.5h","Arjun, Ravi","100%","High","Quarterly"],
      ["Axle Lubrication","31","1.5h","Anil, Ravi","100%","Low","Monthly"],
      ["Full Overhaul","7","8h","All","100%","Critical","Annual"],
    ],
    summaryTitle: "Maintenance KPIs",
    summaryColumns: ["Metric","Value"],
    summaryRows: [
      ["Total Jobs","228"],["Completed","168 (74%)"],
      ["Scheduled","60"],["Total Hours","686h"],
      ["Pass Rate","100%"],["Critical Jobs","7"],
    ],
  },
};

function getData(report) {
  return REPORT_DATA[report.id] || REPORT_DATA["RPT-D001"];
}

// ── Downloads ─────────────────────────────────────────────────────────────────
function downloadPDF(report) {
  const d = getData(report);
  const doc = new jsPDF();

  doc.setFillColor(13, 31, 60);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text("Indian Railways — Command Center", 14, 12);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(report.title, 14, 22);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(9);
  doc.text(`ID: ${report.id}  |  Period: ${report.date}  |  Generated: ${new Date().toLocaleString()}`, 14, 36);

  doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.setTextColor(59, 130, 246);  doc.text(`Wagons: ${report.wagons.toLocaleString()}`, 14, 46);
  doc.setTextColor(245, 158, 11);  doc.text(`Alerts: ${report.alerts}`, 70, 46);
  doc.setTextColor(34, 197, 94);   doc.text(`Status: ${report.status}`, 110, 46);

  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.setTextColor(241, 245, 249);
  doc.text(d.tableTitle, 14, 56);

  autoTable(doc, {
    startY: 60,
    head: [d.columns],
    body: d.rows,
    headStyles: { fillColor: [13,31,60], textColor: [96,165,250], fontStyle:"bold", fontSize:8 },
    bodyStyles: { textColor: [203,213,225], fontSize: 8, fillColor: [7,22,40] },
    alternateRowStyles: { fillColor: [13,31,60] },
    styles: { cellPadding: 2.5 },
  });

  const y1 = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(11); doc.setFont("helvetica","bold");
  doc.setTextColor(241, 245, 249);
  doc.text(d.summaryTitle, 14, y1);

  autoTable(doc, {
    startY: y1 + 4,
    head: [d.summaryColumns],
    body: d.summaryRows,
    headStyles: { fillColor: [37,99,235], textColor: [255,255,255], fontSize: 9 },
    bodyStyles: { textColor: [203,213,225], fontSize: 9, fillColor: [7,22,40] },
    alternateRowStyles: { fillColor: [13,31,60] },
  });

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(74,111,165);
    doc.text(`Ministry of Railways · Command Center · Page ${i} of ${pages}`, 14, 290);
  }

  doc.save(`${report.id}_${report.title.replace(/\s+/g,"_")}.pdf`);
}

function downloadExcel(report) {
  const d = getData(report);
  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet([
    [report.title],
    [`ID: ${report.id}   Period: ${report.date}   Generated: ${new Date().toLocaleString()}`],
    [],
    d.columns,
    ...d.rows,
  ]);
  ws1["!cols"] = d.columns.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, ws1, d.tableTitle.substring(0, 31));

  const ws2 = XLSX.utils.aoa_to_sheet([
    [d.summaryTitle], [],
    d.summaryColumns,
    ...d.summaryRows,
  ]);
  ws2["!cols"] = [{ wch: 32 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  XLSX.writeFile(wb, `${report.id}_${report.title.replace(/\s+/g,"_")}.xlsx`);
}

function downloadCSV(report) {
  const d = getData(report);
  const lines = [
    `# ${report.title}`,
    `# ID: ${report.id} | Period: ${report.date} | Generated: ${new Date().toLocaleString()}`,
    `# Wagons: ${report.wagons} | Alerts: ${report.alerts}`,
    "",
    d.columns.join(","),
    ...d.rows.map(r => r.map(v => `"${v}"`).join(",")),
    "",
    `# ${d.summaryTitle}`,
    d.summaryColumns.join(","),
    ...d.summaryRows.map(r => r.map(v => `"${v}"`).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type:"text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${report.id}_${report.title.replace(/\s+/g,"_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function bulkExport(format, tab) {
  const reports = REPORTS[tab];
  if (format === "CSV") {
    const lines = [];
    reports.forEach(r => {
      const d = getData(r);
      lines.push(`# ${r.title} (${r.id}) — ${r.date}`);
      lines.push(d.columns.join(","));
      d.rows.forEach(row => lines.push(row.map(v => `"${v}"`).join(",")));
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `All_${tab}_Reports.csv`; a.click();
    URL.revokeObjectURL(url);
  } else if (format === "Excel") {
    const wb = XLSX.utils.book_new();
    reports.forEach(r => {
      const d = getData(r);
      const ws = XLSX.utils.aoa_to_sheet([[r.title, r.date], [], d.columns, ...d.rows]);
      ws["!cols"] = d.columns.map(() => ({ wch: 16 }));
      XLSX.utils.book_append_sheet(wb, ws, r.id);
    });
    XLSX.writeFile(wb, `All_${tab}_Reports.xlsx`);
  } else {
    reports.forEach(r => downloadPDF(r));
  }
}

// ── Status colour helper ──────────────────────────────────────────────────────
const sColor = v => {
  const l = (v || "").toLowerCase();
  if (l.includes("on time") || l.includes("pass") || l.includes("complet") || l.includes("active") || l === "✓") return "#22c55e";
  if (l.includes("delay") || l.includes("partial") || l.includes("weak") || l.includes("medium") || l.includes("schedul")) return "#f59e0b";
  if (l.includes("maint") || l.includes("offline") || l.includes("inact") || l === "✗") return "#ef4444";
  if (l.includes("critical")) return "#ef4444";
  if (l.includes("high")) return "#f97316";
  return null;
};

// ── Report Preview Modal ──────────────────────────────────────────────────────
function ReportModal({ report, onClose }) {
  const d = getData(report);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background:"#0d1f3c", border:"1px solid #1a3356", borderRadius:"20px",
        width:"94vw", maxWidth:"960px", maxHeight:"90vh",
        display:"flex", flexDirection:"column", overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{
          padding:"18px 24px", borderBottom:"1px solid #1a3356", flexShrink:0,
          display:"flex", justifyContent:"space-between", alignItems:"center",
          background:"linear-gradient(135deg,#0d1f3c,#071628)",
        }}>
          <div>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:"16px" }}>{report.title}</div>
            <div style={{ color:"#4a6fa5", fontSize:"12px", marginTop:3 }}>
              {report.id} · {report.date} · Generated {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.15)", color:"#ef4444", border:"1px solid rgba(239,68,68,.3)" }}
              onClick={() => downloadPDF(report)}><FiDownload size={11} /> PDF</button>
            <button className="btn btn-sm" style={{ background:"rgba(34,197,94,.15)", color:"#22c55e", border:"1px solid rgba(34,197,94,.3)" }}
              onClick={() => downloadExcel(report)}><FiDownload size={11} /> Excel</button>
            <button className="btn btn-sm" style={{ background:"rgba(245,158,11,.15)", color:"#f59e0b", border:"1px solid rgba(245,158,11,.3)" }}
              onClick={() => downloadCSV(report)}><FiDownload size={11} /> CSV</button>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.08)", border:"none", borderRadius:8, padding:"6px 8px", cursor:"pointer", color:"#94a3b8", display:"flex" }}>
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div style={{ display:"flex", borderBottom:"1px solid #1a3356", flexShrink:0 }}>
          {[
            { label:"Wagons", val:report.wagons.toLocaleString(), color:"#3b82f6" },
            { label:"Alerts",  val:report.alerts,                  color:"#f59e0b" },
            { label:"Status",  val:report.status,                  color:"#22c55e" },
            { label:"Period",  val:report.date,                    color:"#8b5cf6" },
          ].map((k, i) => (
            <div key={i} style={{ flex:1, padding:"12px 20px", borderRight: i < 3 ? "1px solid #1a3356" : "none" }}>
              <div style={{ color:"#4a6fa5", fontSize:"11px", marginBottom:3 }}>{k.label}</div>
              <div style={{ color:k.color, fontWeight:700, fontSize:"17px" }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 24px" }}>
          {/* Main table */}
          <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:"13px", marginBottom:10 }}>{d.tableTitle}</div>
          <div className="table-wrap" style={{ marginBottom:24 }}>
            <table>
              <thead>
                <tr>{d.columns.map(c => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {d.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => {
                      const c = sColor(cell);
                      return (
                        <td key={j} style={{ color: j === 0 ? "#60a5fa" : c || "#cbd5e1", fontWeight: j === 0 ? 700 : 400 }}>
                          {c && j > 0
                            ? <span style={{ padding:"2px 9px", borderRadius:20, fontSize:11, fontWeight:700, background:`${c}22`, color:c, border:`1px solid ${c}44` }}>{cell}</span>
                            : cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary table */}
          <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:"13px", marginBottom:10 }}>{d.summaryTitle}</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>{d.summaryColumns.map(c => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {d.summaryRows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ color:"#f1f5f9", fontWeight:600 }}>{row[0]}</td>
                    {row.slice(1).map((cell, j) => (
                      <td key={j} style={{ color:"#3b82f6", fontWeight:600 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding:"12px 24px", borderTop:"1px solid #1a3356", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <span style={{ color:"#2a4a6e", fontSize:"11px" }}>Ministry of Railways · Indian Railways Command Center</span>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => downloadPDF(report)}><FiDownload size={11} /> Download PDF</button>
            <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const Reports = () => {
  const [tab, setTab]       = useState("Daily");
  const [preview, setPreview] = useState(null);
  const [generating, setGen]  = useState(null);
  const [toast, setToast]     = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleGenerate = r => {
    setGen(r.id);
    setTimeout(() => { setGen(null); setPreview(r); }, 900);
  };

  return (
    <DashboardLayout title="Reports" sub="Generate and export operational reports for all time periods">
      <ReportExportPanel role="admin" isOpen={exportOpen} onClose={() => setExportOpen(false)} />
      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard title="Daily Reports"   value={REPORTS.Daily.length}                 color="#3b82f6" icon={FiFileText} />
        <StatCard title="Weekly Reports"  value={REPORTS.Weekly.length}                color="#22c55e" icon={FiBarChart2} />
        <StatCard title="Monthly Reports" value={REPORTS.Monthly.length}               color="#8b5cf6" icon={FiActivity} />
        <StatCard title="Total Reports"   value={Object.values(REPORTS).flat().length} color="#f59e0b" icon={FiCheckCircle} />
      </div>

      {toast && (
        <div style={{ background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.3)", borderRadius:10, padding:"11px 18px", marginBottom:16, color:"#22c55e", fontSize:13, fontWeight:600 }}>
          ✓ {toast}
        </div>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", gap:6 }}>
          {["Daily","Weekly","Monthly"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab===t?"btn-primary":"btn-outline"}`}>
              <FiCalendar size={12} /> {t}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {["PDF","Excel","CSV"].map(fmt => (
            <button key={fmt} className="btn btn-ghost btn-sm" onClick={() => { bulkExport(fmt, tab); showToast(`All ${tab} reports exported as ${fmt}`); }}>
              <FiDownload size={12} /> Export All {fmt}
            </button>
          ))}
          <button className="btn btn-primary btn-sm" onClick={() => setExportOpen(true)}>
            <FiDownload size={12} /> Export Centre
          </button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:24 }}>
        {REPORTS[tab].map(r => (
          <div key={r.id} className="card" style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:"14px", marginBottom:4 }}>{r.title}</div>
                <div style={{ color:"#4a6fa5", fontSize:"12px" }}>{r.id} · {r.date}</div>
              </div>
              <span className="badge badge-active">{r.status}</span>
            </div>
            <div style={{ display:"flex", gap:20 }}>
              <div>
                <div style={{ color:"#64748b", fontSize:"11px" }}>Wagons</div>
                <div style={{ color:"#3b82f6", fontWeight:700, fontSize:"16px" }}>{r.wagons.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color:"#64748b", fontSize:"11px" }}>Alerts</div>
                <div style={{ color:"#f59e0b", fontWeight:700, fontSize:"16px" }}>{r.alerts}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex:1, justifyContent:"center" }} onClick={() => handleGenerate(r)}>
                {generating === r.id
                  ? <><span style={{ display:"inline-block", width:10, height:10, border:"2px solid #fff", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .7s linear infinite", marginRight:6 }} />Generating…</>
                  : <><FiEye size={11} /> Generate & View</>}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { downloadPDF(r);   showToast(`${r.id} saved as PDF`);   }}><FiDownload size={11} /> PDF</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { downloadExcel(r); showToast(`${r.id} saved as Excel`); }}><FiDownload size={11} /> XLS</button>
              <button className="btn btn-ghost btn-sm" onClick={() => { downloadCSV(r);   showToast(`${r.id} saved as CSV`);   }}><FiDownload size={11} /> CSV</button>
            </div>
          </div>
        ))}
      </div>

      {preview && <ReportModal report={preview} onClose={() => setPreview(null)} />}
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </DashboardLayout>
  );
};

export default Reports;
