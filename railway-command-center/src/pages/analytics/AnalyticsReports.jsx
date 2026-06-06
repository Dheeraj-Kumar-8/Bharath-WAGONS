import { useState } from "react";
import { FiFileText, FiDownload, FiEye, FiCalendar, FiBarChart2, FiActivity, FiCheckCircle } from "react-icons/fi";
import AnalyticsLayout from "../../components/AnalyticsLayout";
import StatCard from "../../components/StatCard";
import ReportExportPanel from "../../components/ReportExportPanel";

const REPORTS = {
  Daily: [
    { id: "RPT-AD001", title: "Daily Analytics Summary",     date: "2025-07-11", wagons: 1089, alerts: 18 },
    { id: "RPT-AD002", title: "Daily On-Time Report",        date: "2025-07-11", wagons: 1042, alerts: 4  },
    { id: "RPT-AD003", title: "Daily Delay Analysis",        date: "2025-07-11", wagons: 47,   alerts: 12 },
    { id: "RPT-AD004", title: "Daily Zone Breakdown",        date: "2025-07-10", wagons: 1041, alerts: 8  },
  ],
  Weekly: [
    { id: "RPT-AW001", title: "Weekly Performance Summary",  date: "Jul 5–11",    wagons: 7250, alerts: 124 },
    { id: "RPT-AW002", title: "Weekly Zone Comparison",      date: "Jul 5–11",    wagons: 7250, alerts: 98  },
    { id: "RPT-AW003", title: "Weekly Alert Analysis",       date: "Jul 5–11",    wagons: 7250, alerts: 124 },
  ],
  Monthly: [
    { id: "RPT-AM001", title: "Monthly Fleet Analytics",     date: "June 2025",   wagons: 31200, alerts: 478 },
    { id: "RPT-AM002", title: "Monthly Zone Performance",    date: "June 2025",   wagons: 31200, alerts: 208 },
    { id: "RPT-AM003", title: "Monthly AI Insights Report",  date: "May 2025",    wagons: 29400, alerts: 512 },
  ],
};

const PREVIEW_DATA = {
  "RPT-AD001": {
    title: "Daily Analytics Summary — 2025-07-11",
    rows: [
      ["Total Active Wagons",  "1,089"], ["On-Time",          "1,042 (95.7%)"],
      ["Delayed",              "47"],    ["In Maintenance",   "28"],
      ["Critical Alerts",      "5"],     ["Warnings",         "13"],
      ["Resolved Alerts",      "24"],    ["Avg Speed",        "76 km/h"],
      ["GPS Coverage",         "89%"],   ["Fleet Utilisation","87.3%"],
    ],
  },
  "RPT-AW001": {
    title: "Weekly Performance Summary — Jul 5–11",
    rows: [
      ["Total Movements",      "22,274"], ["Best Day",         "Thu (96.2%)"],
      ["Avg Daily Active",     "1,055"],  ["Total Alerts",     "124"],
      ["On-Time Rate",         "95.2%"],  ["Maintenance Jobs", "199"],
      ["Critical Alerts",      "23"],     ["Resolved",         "96 (77%)"],
    ],
  },
  "RPT-AM001": {
    title: "Monthly Fleet Analytics — June 2025",
    rows: [
      ["Total Fleet",          "1,247"],  ["Active",           "1,089 (87.3%)"],
      ["Monthly Movements",    "94,800"], ["Avg Health Score", "95.6%"],
      ["Total Alerts",         "478"],    ["Resolved",         "368 (77%)"],
      ["New Wagons Added",     "6"],      ["Zones Covered",    "12"],
    ],
  },
};

function downloadCSV(r) {
  const d = PREVIEW_DATA[r.id] || PREVIEW_DATA["RPT-AD001"];
  const lines = [
    `# ${r.title}`,
    `# ID: ${r.id} | Period: ${r.date} | Generated: ${new Date().toLocaleString()}`,
    "",
    "Metric,Value",
    ...d.rows.map(row => `"${row[0]}","${row[1]}"`),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${r.id}_Analytics.csv`; a.click();
  URL.revokeObjectURL(url);
}

function ReportModal({ report, onClose }) {
  const d = PREVIEW_DATA[report.id] || PREVIEW_DATA["RPT-AD001"];
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "#0d1f3c", border: "1px solid #1a3356", borderRadius: 20, width: "90vw", maxWidth: 680, maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #1a3356", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,#0d1f3c,#071628)" }}>
          <div>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16 }}>{report.title}</div>
            <div style={{ color: "#4a6fa5", fontSize: 12, marginTop: 3 }}>{report.id} · {report.date}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm btn-ghost" onClick={() => downloadCSV(report)}><FiDownload size={11} /> CSV</button>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.08)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "#94a3b8" }}>✕</button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{d.title}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {d.rows.map(([label, val]) => (
              <div key={label} style={{ background: "rgba(255,255,255,.03)", border: "1px solid #1a3356", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>{label}</div>
                <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 16 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "12px 24px", borderTop: "1px solid #1a3356", display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className="btn btn-primary btn-sm" onClick={() => downloadCSV(report)}><FiDownload size={11} /> Download CSV</button>
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

const AnalyticsReports = () => {
  const [tab,     setTab]     = useState("Daily");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(null);
  const [toast,   setToast]   = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleView = r => {
    setLoading(r.id);
    setTimeout(() => { setLoading(null); setPreview(r); }, 800);
  };

  return (
    <AnalyticsLayout title="Analytics Reports" sub="Generate, view and download analytics reports for all time periods">

      <ReportExportPanel role="analyst" isOpen={exportOpen} onClose={() => setExportOpen(false)} />

      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <StatCard title="Daily Reports"   value={REPORTS.Daily.length}                 color="#3b82f6" icon={FiFileText} />
        <StatCard title="Weekly Reports"  value={REPORTS.Weekly.length}                color="#22c55e" icon={FiBarChart2} />
        <StatCard title="Monthly Reports" value={REPORTS.Monthly.length}               color="#a855f7" icon={FiActivity} />
        <StatCard title="Total Reports"   value={Object.values(REPORTS).flat().length} color="#f59e0b" icon={FiCheckCircle} />
      </div>

      {toast && (
        <div style={{ background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 10, padding: "11px 18px", marginBottom: 16, color: "#22c55e", fontSize: 13, fontWeight: 600 }}>
          ✓ {toast}
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {["Daily", "Weekly", "Monthly"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`btn btn-sm ${tab === t ? "btn-primary" : "btn-outline"}`}
              style={tab === t ? { background: "rgba(168,85,247,.2)", color: "#a855f7", border: "1px solid #a855f7" } : {}}>
              <FiCalendar size={12} /> {t}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => { REPORTS[tab].forEach(r => downloadCSV(r)); showToast(`All ${tab} reports exported as CSV`); }}>
          <FiDownload size={12} /> Export All CSV
        </button>
        <button className="btn btn-primary btn-sm" style={{ background:"rgba(168,85,247,.2)", color:"#a855f7", border:"1px solid #a855f7" }}
          onClick={() => setExportOpen(true)}>
          <FiDownload size={12} /> Export Centre
        </button>
      </div>

      {/* Report cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {REPORTS[tab].map(r => (
          <div key={r.id} className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.title}</div>
                <div style={{ color: "#4a6fa5", fontSize: 12 }}>{r.id} · {r.date}</div>
              </div>
              <span className="badge badge-active">Ready</span>
            </div>
            <div style={{ display: "flex", gap: 24 }}>
              <div>
                <div style={{ color: "#64748b", fontSize: 11 }}>Wagons</div>
                <div style={{ color: "#3b82f6", fontWeight: 700, fontSize: 16 }}>{r.wagons.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: "#64748b", fontSize: 11 }}>Alerts</div>
                <div style={{ color: "#f59e0b", fontWeight: 700, fontSize: 16 }}>{r.alerts}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: "center" }} onClick={() => handleView(r)}>
                {loading === r.id
                  ? <><span style={{ display: "inline-block", width: 10, height: 10, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin .7s linear infinite", marginRight: 6 }} />Loading…</>
                  : <><FiEye size={11} /> View Report</>}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { downloadCSV(r); showToast(`${r.id} saved as CSV`); }}>
                <FiDownload size={11} /> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {preview && <ReportModal report={preview} onClose={() => setPreview(null)} />}
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </AnalyticsLayout>
  );
};

export default AnalyticsReports;
