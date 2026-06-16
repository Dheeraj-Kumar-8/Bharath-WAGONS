import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FiFileText, FiDownload, FiEye, FiCalendar,
  FiBarChart2, FiActivity, FiCheckCircle, FiX,
  FiAlertTriangle, FiTrendingUp, FiMap,
} from "react-icons/fi";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";
import ReportExportPanel from "../../components/ReportExportPanel";

// ── Report catalogue ────────────────────────────────────────────────────────
const REPORTS = {
  Daily: [
    { id: "RPT-AD001", title: "Daily Analytics Summary",  date: "2025-07-11", wagons: 1089, alerts: 18, zone: "All" },
    { id: "RPT-AD002", title: "Daily On-Time Report",     date: "2025-07-11", wagons: 1042, alerts: 4,  zone: "NR"  },
    { id: "RPT-AD003", title: "Daily Delay Analysis",     date: "2025-07-11", wagons: 47,   alerts: 12, zone: "ER"  },
    { id: "RPT-AD004", title: "Daily Zone Breakdown",     date: "2025-07-10", wagons: 1041, alerts: 8,  zone: "All" },
  ],
  Weekly: [
    { id: "RPT-AW001", title: "Weekly Performance Summary", date: "Jul 5–11", wagons: 7250, alerts: 124, zone: "All" },
    { id: "RPT-AW002", title: "Weekly Zone Comparison",     date: "Jul 5–11", wagons: 7250, alerts: 98,  zone: "All" },
    { id: "RPT-AW003", title: "Weekly Alert Analysis",      date: "Jul 5–11", wagons: 7250, alerts: 124, zone: "SR"  },
  ],
  Monthly: [
    { id: "RPT-AM001", title: "Monthly Fleet Analytics",     date: "June 2025", wagons: 31200, alerts: 478, zone: "All" },
    { id: "RPT-AM002", title: "Monthly Zone Performance",    date: "June 2025", wagons: 31200, alerts: 208, zone: "All" },
    { id: "RPT-AM003", title: "Monthly AI Insights Report",  date: "May 2025",  wagons: 29400, alerts: 512, zone: "WR"  },
  ],
};

// ── Report data builder ──────────────────────────────────────────────────────
const REPORT_DATA = {
  "RPT-AD001": {
    title: "Daily Analytics Summary — 2025-07-11",
    columns: ["Metric", "Value"],
    rows: [
      ["Total Active Wagons", "1,089"], ["On-Time",           "1,042 (95.7%)"],
      ["Delayed",             "47"],    ["In Maintenance",    "28"],
      ["Critical Alerts",     "5"],     ["Warnings",          "13"],
      ["Resolved Alerts",     "24"],    ["Avg Speed",         "76 km/h"],
      ["GPS Coverage",        "89%"],   ["Fleet Utilisation", "87.3%"],
    ],
  },
  "RPT-AD002": {
    title: "Daily On-Time Report — 2025-07-11 (NR Zone)",
    columns: ["Day", "Active", "On-Time", "Delayed", "On-Time %"],
    rows: [
      ["Monday",    "312", "303", "9",  "97.1%"],
      ["Tuesday",   "308", "298", "10", "96.8%"],
      ["Wednesday", "315", "302", "13", "95.9%"],
      ["Thursday",  "320", "311", "9",  "97.2%"],
      ["Friday",    "318", "307", "11", "96.5%"],
      ["Saturday",  "325", "316", "9",  "97.2%"],
      ["Sunday",    "310", "299", "11", "96.5%"],
    ],
  },
  "RPT-AD003": {
    title: "Daily Delay Analysis — 2025-07-11 (ER Zone)",
    columns: ["Route", "Wagons", "Delayed", "Avg Delay", "Cause"],
    rows: [
      ["HWH–BBS",   "45", "6",  "52 min", "Signal failure"],
      ["HWH–RNC",   "38", "4",  "41 min", "Track maintenance"],
      ["BBS–VSKP",  "42", "5",  "38 min", "Freight priority"],
      ["RNC–DHN",   "28", "3",  "44 min", "Weather delay"],
    ],
  },
  "RPT-AD004": {
    title: "Daily Zone Breakdown — 2025-07-10",
    columns: ["Zone", "Wagons", "On-Time", "Delayed", "Maint", "On-Time %"],
    rows: [
      ["NR",  "312", "300", "7",  "5",  "96.2%"],
      ["SR",  "198", "188", "6",  "4",  "94.9%"],
      ["ER",  "224", "212", "8",  "4",  "94.6%"],
      ["WR",  "178", "166", "8",  "4",  "93.3%"],
      ["NER", "156", "149", "5",  "2",  "95.5%"],
      ["NWR", "143", "136", "4",  "3",  "95.1%"],
      ["SER", "127", "122", "4",  "1",  "96.1%"],
      ["SWR", "100",  "97", "2",  "1",  "97.0%"],
    ],
  },
  "RPT-AW001": {
    title: "Weekly Performance Summary — Jul 5–11",
    columns: ["Metric", "Value"],
    rows: [
      ["Total Movements",  "22,274"], ["Best Day",        "Thu (96.2%)"],
      ["Avg Daily Active", "1,055"],  ["Total Alerts",    "124"],
      ["On-Time Rate",     "95.2%"],  ["Maintenance Jobs","199"],
      ["Critical Alerts",  "23"],     ["Resolved",        "96 (77%)"],
      ["Avg Speed",        "76 km/h"],["GPS Coverage",    "89%"],
    ],
  },
  "RPT-AW002": {
    title: "Weekly Zone Comparison — Jul 5–11",
    columns: ["Zone", "Region",               "Wagons", "On-Time %", "Delayed", "Alerts", "Score"],
    rows: [
      ["NR",  "North Railway",         "312", "96.2%", "7",  "28", "A+"],
      ["SR",  "South Railway",         "198", "95.4%", "6",  "18", "A" ],
      ["ER",  "East Railway",          "224", "95.5%", "8",  "22", "A" ],
      ["WR",  "West Railway",          "178", "95.5%", "8",  "14", "A" ],
      ["NER", "North East Railway",    "156", "95.5%", "5",  "12", "A-"],
      ["NWR", "North Western Railway", "143", "95.1%", "4",  "10", "B+"],
      ["SER", "South Eastern Railway", "127", "96.1%", "3",  "8",  "A" ],
      ["SWR", "South Western Railway", "100", "97.0%", "2",  "5",  "A+"],
    ],
  },
  "RPT-AW003": {
    title: "Weekly Alert Analysis — Jul 5–11 (SR Zone)",
    columns: ["Alert Type", "Total", "Critical", "Warning", "Resolved", "Rate"],
    rows: [
      ["GPS Signal Lost",  "8",  "3", "3", "7",  "87%"],
      ["Route Deviation",  "5",  "1", "3", "4",  "80%"],
      ["Brake Warning",    "3",  "1", "1", "3",  "100%"],
      ["Cargo Alert",      "2",  "0", "2", "2",  "100%"],
    ],
  },
  "RPT-AM001": {
    title: "Monthly Fleet Analytics — June 2025",
    columns: ["Metric", "Value"],
    rows: [
      ["Total Fleet",         "1,247"],  ["Active",           "1,089 (87.3%)"],
      ["Monthly Movements",   "94,800"], ["Avg Health Score", "95.6%"],
      ["Total Alerts",        "478"],    ["Resolved",         "368 (77%)"],
      ["New Wagons Added",    "6"],      ["Zones Covered",    "8"],
      ["Avg On-Time Rate",    "95.7%"],  ["Avg Speed",        "76 km/h"],
    ],
  },
  "RPT-AM002": {
    title: "Monthly Zone Performance — June 2025",
    columns: ["Zone", "Region",               "Wagons", "On-Time %", "Avg Speed", "Alerts", "Grade"],
    rows: [
      ["NR",  "North Railway",         "312", "96.2%", "79 km/h", "102", "A+"],
      ["SR",  "South Railway",         "198", "95.4%", "74 km/h", "72",  "A" ],
      ["ER",  "East Railway",          "224", "95.5%", "76 km/h", "88",  "A" ],
      ["WR",  "West Railway",          "178", "95.5%", "77 km/h", "58",  "A" ],
      ["NER", "North East Railway",    "156", "95.5%", "72 km/h", "48",  "A-"],
      ["NWR", "North Western Railway", "143", "95.1%", "71 km/h", "42",  "B+"],
      ["SER", "South Eastern Railway", "127", "96.1%", "75 km/h", "38",  "A" ],
      ["SWR", "South Western Railway", "100", "97.0%", "81 km/h", "30",  "A+"],
    ],
  },
  "RPT-AM003": {
    title: "Monthly AI Insights Report — May 2025 (WR Zone)",
    columns: ["Insight", "Finding", "Priority", "Action"],
    rows: [
      ["GPS Failures",   "Spiked 40% Thu afternoons", "Critical", "Investigate tower schedule"],
      ["Delay Pattern",  "DEL-ADI route +18 min Fri",  "Warning",  "Review freight priority"  ],
      ["Efficiency",     "Utilisation up 6.2% post shift adj", "Info", "Apply to ER zone"    ],
      ["Maintenance",    "12 wagons bearing degradation",      "High",  "Schedule preventive"  ],
    ],
  },
};

// ── PDF export ───────────────────────────────────────────────────────────────
function exportPDF(report) {
  const data = REPORT_DATA[report.id] || REPORT_DATA["RPT-AD001"];
  const doc  = new jsPDF({ orientation: data.columns.length > 5 ? "landscape" : "portrait" });

  doc.setFillColor(13, 31, 60);
  doc.rect(0, 0, doc.internal.pageSize.width, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text("Indian Railways — Analytics Command Center", 14, 13);
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.text(data.title, 14, 23);

  doc.setDrawColor(168, 85, 247); doc.setLineWidth(0.8);
  doc.line(14, 34, doc.internal.pageSize.width - 14, 34);
  doc.setTextColor(100, 116, 139); doc.setFontSize(8);
  doc.text(`Report ID: ${report.id}   |   Period: ${report.date}   |   Generated: ${new Date().toLocaleString("en-IN")}`, 14, 40);

  autoTable(doc, {
    startY: 46,
    head: [data.columns],
    body: data.rows,
    headStyles: { fillColor: [13, 31, 60], textColor: [168, 85, 247], fontStyle: "bold", fontSize: 8 },
    bodyStyles: { textColor: [203, 213, 225], fontSize: 8, fillColor: [7, 22, 40] },
    alternateRowStyles: { fillColor: [13, 31, 60] },
    styles: { cellPadding: 2.5 },
    columnStyles: { 0: { textColor: [96, 165, 250], fontStyle: "bold" } },
  });

  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i); doc.setFontSize(7.5); doc.setTextColor(74, 111, 165);
    doc.text(`Ministry of Railways · Analytics Center · Confidential · Page ${i}/${pages}`, 14, doc.internal.pageSize.height - 8);
  }
  doc.save(`${report.id}_${report.date.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
}

// ── Excel export ─────────────────────────────────────────────────────────────
function exportExcel(report) {
  const data = REPORT_DATA[report.id] || REPORT_DATA["RPT-AD001"];
  const wb   = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet([
    ["Indian Railways — Analytics Command Center"],
    [data.title],
    [`Report ID: ${report.id}   |   Period: ${report.date}   |   Generated: ${new Date().toLocaleString("en-IN")}`],
    [],
    data.columns,
    ...data.rows,
  ]);
  ws1["!cols"] = data.columns.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, ws1, "Report");

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["Metric", "Value"],
    ["Report ID", report.id],
    ["Title", report.title],
    ["Period", report.date],
    ["Zone", report.zone],
    ["Total Wagons", report.wagons],
    ["Total Alerts", report.alerts],
    ["Generated", new Date().toLocaleString("en-IN")],
  ]);
  ws2["!cols"] = [{ wch: 24 }, { wch: 28 }];
  XLSX.utils.book_append_sheet(wb, ws2, "Summary");

  XLSX.writeFile(wb, `${report.id}_${report.date.replace(/[^a-zA-Z0-9]/g, "_")}.xlsx`);
}

// ── CSV export ────────────────────────────────────────────────────────────────
function exportCSV(report) {
  const data = REPORT_DATA[report.id] || REPORT_DATA["RPT-AD001"];
  const esc  = v => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [
    `# ${data.title}`,
    `# ID: ${report.id} | Period: ${report.date} | Generated: ${new Date().toLocaleString()}`,
    "",
    data.columns.map(esc).join(","),
    ...data.rows.map(r => r.map(esc).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  Object.assign(document.createElement("a"), { href: url, download: `${report.id}.csv` }).click();
  URL.revokeObjectURL(url);
}

// ── View / Generate Modal ─────────────────────────────────────────────────────
function ReportModal({ report, onClose }) {
  const data = REPORT_DATA[report.id] || REPORT_DATA["RPT-AD001"];
  const [generating, setGenerating] = useState(false);
  const [genDone,    setGenDone]    = useState(false);
  const [genFormat,  setGenFormat]  = useState("pdf");

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      if (genFormat === "pdf")   exportPDF(report);
      if (genFormat === "excel") exportExcel(report);
      if (genFormat === "csv")   exportCSV(report);
      setGenerating(false);
      setGenDone(true);
      setTimeout(() => setGenDone(false), 3000);
    }, 800);
  }, [genFormat, report]);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 20,
        width: "92vw", maxWidth: 720, maxHeight: "90vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 0 60px rgba(168,85,247,.25)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #1a3356", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,#0d1f3c,#071628)", flexShrink: 0 }}>
          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16 }}>{report.title}</div>
            <div style={{ color: "#4a6fa5", fontSize: 12, marginTop: 3 }}>{report.id} · {report.date} · Zone {report.zone}</div>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#94a3b8", display: "flex" }}>
            <FiX size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13, marginBottom: 14 }}>{data.title}</div>

          {/* Data table */}
          <div className="table-wrap" style={{ marginBottom: 20 }}>
            <table>
              <thead>
                <tr>{data.columns.map(c => <th key={c}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {data.rows.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ color: j === 0 ? "#60a5fa" : "#cbd5e1", fontWeight: j === 0 ? 600 : 400 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary pills */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Report ID",   val: report.id,    color: "#a855f7" },
              { label: "Period",      val: report.date,  color: "#3b82f6" },
              { label: "Zone",        val: report.zone,  color: "#22c55e" },
              { label: "Wagons",      val: report.wagons.toLocaleString(), color: "#3b82f6" },
              { label: "Alerts",      val: report.alerts, color: "#f59e0b" },
              { label: "Generated",   val: new Date().toLocaleDateString("en-IN"), color: "#64748b" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,.03)", border: "1px solid #1a3356", borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ color: "#64748b", fontSize: 11, marginBottom: 3 }}>{s.label}</div>
                <div style={{ color: s.color, fontWeight: 700, fontSize: 14 }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Generate section */}
          <div style={{ background: "rgba(168,85,247,.07)", border: "1px solid rgba(168,85,247,.2)", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>Generate & Download Report</div>
            {genDone && (
              <div style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 8, padding: "8px 12px", marginBottom: 12, color: "#22c55e", fontSize: 12, fontWeight: 600 }}>
                ✓ Report generated and downloaded successfully
              </div>
            )}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {["pdf", "excel", "csv"].map(f => (
                <button key={f} onClick={() => setGenFormat(f)} style={{
                  padding: "7px 16px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
                  border: `1px solid ${genFormat === f ? (f === "pdf" ? "#ef4444" : f === "excel" ? "#22c55e" : "#f59e0b") : "#1a3356"}`,
                  background: genFormat === f ? (f === "pdf" ? "rgba(239,68,68,.12)" : f === "excel" ? "rgba(34,197,94,.12)" : "rgba(245,158,11,.12)") : "transparent",
                  color: genFormat === f ? (f === "pdf" ? "#ef4444" : f === "excel" ? "#22c55e" : "#f59e0b") : "#64748b",
                }}>{f.toUpperCase()}</button>
              ))}
            </div>
            <button onClick={handleGenerate} disabled={generating} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "10px 20px", borderRadius: 10, border: "none",
              background: generating ? "rgba(168,85,247,.3)" : "linear-gradient(135deg,#7c3aed,#a855f7)",
              color: "#fff", fontSize: 13, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer",
            }}>
              {generating
                ? <><span style={{ width: 14, height: 14, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} /> Generating…</>
                : <><FiDownload size={14} /> Generate {genFormat.toUpperCase()} Report</>}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 24px", borderTop: "1px solid #1a3356", display: "flex", justifyContent: "flex-end", gap: 8, flexShrink: 0 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => exportCSV(report)}><FiDownload size={11} /> CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={() => exportExcel(report)}><FiDownload size={11} /> Excel</button>
          <button className="btn btn-primary btn-sm" onClick={() => exportPDF(report)}><FiDownload size={11} /> PDF</button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
const AnalyticsReports = () => {
  const [tab,        setTab]        = useState("Daily");
  const [preview,    setPreview]    = useState(null);
  const [loading,    setLoading]    = useState(null);
  const [toast,      setToast]      = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [zoneFilter, setZoneFilter] = useState("All");

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleView = r => {
    setLoading(r.id);
    setTimeout(() => { setLoading(null); setPreview(r); }, 600);
  };

  const filtered = REPORTS[tab].filter(r => zoneFilter === "All" || r.zone === zoneFilter || r.zone === "All");
  const allReports = Object.values(REPORTS).flat();

  return (
    <AnalyticsLayout title="Analytics Reports" sub="Generate, view and download analytics reports for all time periods and zones">

      <ReportExportPanel role="analyst" isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard title="Daily Reports"   value={REPORTS.Daily.length}   color="#3b82f6" icon={FiFileText}    />
        <StatCard title="Weekly Reports"  value={REPORTS.Weekly.length}  color="#22c55e" icon={FiBarChart2}   />
        <StatCard title="Monthly Reports" value={REPORTS.Monthly.length} color="#a855f7" icon={FiActivity}    />
        <StatCard title="Total Reports"   value={allReports.length}      color="#f59e0b" icon={FiCheckCircle} />
      </div>

      {toast && (
        <div style={{ background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 10, padding: "11px 18px", marginBottom: 16, color: "#22c55e", fontSize: 13, fontWeight: 600 }}>
          ✓ {toast}
        </div>
      )}

      {/* Controls bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        {/* Period tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {["Daily", "Weekly", "Monthly"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-outline"}`}
              style={tab === t ? { background: "rgba(168,85,247,.2)", color: "#a855f7", border: "1px solid #a855f7" } : {}}>
              <FiCalendar size={12} /> {t}
            </button>
          ))}
        </div>

        {/* Zone filter */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["All", "NR", "SR", "ER", "WR", "NER", "NWR", "SER", "SWR"].map(z => (
            <button key={z} onClick={() => setZoneFilter(z)} style={{
              padding: "5px 10px", borderRadius: 20, cursor: "pointer", fontSize: 11, fontWeight: 700,
              border: `1px solid ${zoneFilter === z ? "#a855f7" : "#1a3356"}`,
              background: zoneFilter === z ? "rgba(168,85,247,.15)" : "transparent",
              color: zoneFilter === z ? "#a855f7" : "#64748b",
            }}>{z}</button>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm"
            onClick={() => { REPORTS[tab].forEach(r => exportCSV(r)); showToast(`All ${tab} reports exported as CSV`); }}>
            <FiDownload size={12} /> Export All CSV
          </button>
          <button className="btn btn-ghost btn-sm"
            onClick={() => { REPORTS[tab].forEach(r => exportPDF(r)); showToast(`All ${tab} reports exported as PDF`); }}
            style={{ color: "#ef4444", borderColor: "rgba(239,68,68,.3)" }}>
            <FiDownload size={12} /> Export All PDF
          </button>
          <button className="btn btn-primary btn-sm"
            style={{ background: "rgba(168,85,247,.2)", color: "#a855f7", border: "1px solid #a855f7" }}
            onClick={() => setExportOpen(true)}>
            <FiDownload size={12} /> Export Centre
          </button>
        </div>
      </div>

      {/* Report cards grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "#4a6fa5" }}>
          <FiAlertTriangle size={28} style={{ marginBottom: 12, opacity: .4 }} />
          <div style={{ fontSize: 14 }}>No reports found for zone "{zoneFilter}" in {tab} period</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Card header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ color: "#4a6fa5", fontSize: 12 }}>{r.id} · {r.date}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="badge badge-active" style={{ fontSize: 10 }}>Ready</span>
                  {r.zone !== "All" && <span className="badge badge-info" style={{ fontSize: 10 }}>{r.zone}</span>}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 24 }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>Wagons</div>
                  <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 16 }}>{r.wagons.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>Alerts</div>
                  <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 16 }}>{r.alerts}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: 11 }}>Zone</div>
                  <div style={{ color: "#a855f7", fontWeight: 700, fontSize: 16 }}>{r.zone}</div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => handleView(r)}>
                  {loading === r.id
                    ? <><span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", marginRight: 6 }} />Loading…</>
                    : <><FiEye size={11} /> View / Generate</>}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { exportPDF(r); showToast(`${r.id} saved as PDF`); }}
                  style={{ color: "#ef4444", borderColor: "rgba(239,68,68,.3)" }}>
                  <FiDownload size={11} /> PDF
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { exportExcel(r); showToast(`${r.id} saved as Excel`); }}
                  style={{ color: "#22c55e", borderColor: "rgba(34,197,94,.3)" }}>
                  <FiTrendingUp size={11} /> Excel
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { exportCSV(r); showToast(`${r.id} saved as CSV`); }}>
                  <FiFileText size={11} /> CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All-zones summary table */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiMap size={16} color="#a855f7" /> All Zone Report Summary
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Zone</th><th>Region</th><th>Wagons</th><th>On-Time %</th><th>Avg Speed</th><th>Alerts</th><th>Grade</th></tr>
            </thead>
            <tbody>
              {[
                { zone: "NR",  region: "North Railway",         wagons: 312, onTime: "96.2%", speed: "79 km/h", alerts: 28, grade: "A+", c: "#3b82f6" },
                { zone: "SR",  region: "South Railway",         wagons: 198, onTime: "95.4%", speed: "74 km/h", alerts: 18, grade: "A",  c: "#22c55e" },
                { zone: "ER",  region: "East Railway",          wagons: 224, onTime: "95.5%", speed: "76 km/h", alerts: 22, grade: "A",  c: "#f59e0b" },
                { zone: "WR",  region: "West Railway",          wagons: 178, onTime: "95.5%", speed: "77 km/h", alerts: 14, grade: "A",  c: "#a855f7" },
                { zone: "NER", region: "North East Railway",    wagons: 156, onTime: "95.5%", speed: "72 km/h", alerts: 12, grade: "A-", c: "#06b6d4" },
                { zone: "NWR", region: "North Western Railway", wagons: 143, onTime: "95.1%", speed: "71 km/h", alerts: 10, grade: "B+", c: "#f97316" },
                { zone: "SER", region: "South Eastern Railway", wagons: 127, onTime: "96.1%", speed: "75 km/h", alerts: 8,  grade: "A",  c: "#22c55e" },
                { zone: "SWR", region: "South Western Railway", wagons: 100, onTime: "97.0%", speed: "81 km/h", alerts: 5,  grade: "A+", c: "#22c55e" },
              ].map(z => (
                <tr key={z.zone}>
                  <td><span className="badge badge-info" style={{ fontSize: 10 }}>{z.zone}</span></td>
                  <td style={{ color: "#f1f5f9", fontWeight: 600 }}>{z.region}</td>
                  <td style={{ color: "#3b82f6", fontWeight: 600 }}>{z.wagons}</td>
                  <td style={{ color: z.onTime >= "96" ? "#22c55e" : "#f59e0b", fontWeight: 700 }}>{z.onTime}</td>
                  <td style={{ color: "#a855f7" }}>{z.speed}</td>
                  <td style={{ color: "#f59e0b" }}>{z.alerts}</td>
                  <td><span style={{ background: `${z.c}20`, color: z.c, border: `1px solid ${z.c}40`, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{z.grade}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {preview && <ReportModal report={preview} onClose={() => setPreview(null)} />}
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </AnalyticsLayout>
  );
};

export default AnalyticsReports;
