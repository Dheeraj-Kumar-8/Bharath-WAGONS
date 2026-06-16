import { useState } from "react";
import { FiClock, FiCheckCircle, FiPlus, FiX, FiCalendar, FiAlertTriangle } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";

const UPCOMING = [
  { id:"MNT-001", wagon:"WGN-004", type:"Brake Inspection",   date:"2025-07-12", tech:"Ramesh Kumar",   priority:"Critical", status:"Scheduled" },
  { id:"MNT-002", wagon:"WGN-008", type:"Wheel Replacement",  date:"2025-07-13", tech:"Suresh Verma",   priority:"Critical", status:"Scheduled" },
  { id:"MNT-003", wagon:"WGN-014", type:"Engine Overhaul",    date:"2025-07-14", tech:"Pradeep Singh",  priority:"High",     status:"Scheduled" },
  { id:"MNT-004", wagon:"WGN-002", type:"Axle Lubrication",   date:"2025-07-15", tech:"Vijay Patel",    priority:"Medium",   status:"Scheduled" },
  { id:"MNT-005", wagon:"WGN-006", type:"GPS Replacement",    date:"2025-07-16", tech:"Arjun Sharma",   priority:"Medium",   status:"Scheduled" },
  { id:"MNT-006", wagon:"WGN-010", type:"Brake Fluid Change", date:"2025-07-17", tech:"Ravi Nair",      priority:"Low",      status:"Pending Approval" },
  { id:"MNT-007", wagon:"WGN-013", type:"Routine Check",      date:"2025-07-18", tech:"Anil Gupta",     priority:"Low",      status:"Pending Approval" },
];

const COMPLETED = [
  { id:"MNT-C01", wagon:"WGN-001", type:"Routine Check",      date:"2025-07-08", tech:"Ramesh Kumar",  result:"Passed",  notes:"All systems nominal"       },
  { id:"MNT-C02", wagon:"WGN-003", type:"Wheel Inspection",   date:"2025-07-07", tech:"Suresh Verma",  result:"Passed",  notes:"Wheels in good condition"  },
  { id:"MNT-C03", wagon:"WGN-005", type:"Brake Test",         date:"2025-07-06", tech:"Pradeep Singh", result:"Passed",  notes:"Brakes performing well"    },
  { id:"MNT-C04", wagon:"WGN-007", type:"GPS Calibration",    date:"2025-07-05", tech:"Vijay Patel",   result:"Passed",  notes:"Signal improved to Strong" },
  { id:"MNT-C05", wagon:"WGN-009", type:"Engine Service",     date:"2025-07-04", tech:"Arjun Sharma",  result:"Passed",  notes:"Oil and filter replaced"   },
  { id:"MNT-C06", wagon:"WGN-011", type:"Cargo Door Repair",  date:"2025-07-03", tech:"Ravi Nair",     result:"Passed",  notes:"Door sensor recalibrated"  },
];

const priorityClass = p => ({ Critical:"badge-critical",High:"badge-high",Medium:"badge-medium",Low:"badge-low" }[p]||"badge-info");
const statusClass   = s => ({ Scheduled:"badge-active","Pending Approval":"badge-medium" }[s]||"badge-info");

const TYPES = ["Routine Check","Wheel Inspection","Brake Inspection","Engine Overhaul","GPS Calibration","Axle Lubrication","Full Overhaul","Cargo Door Repair"];
const TECHS = ["Ramesh Kumar","Suresh Verma","Pradeep Singh","Vijay Patel","Arjun Sharma","Ravi Nair","Anil Gupta"];

const Maintenance = () => {
  const [upcoming, setUpcoming] = useState(UPCOMING);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ wagon:"", type:"Routine Check", date:"", tech:"Ramesh Kumar", priority:"Medium" });
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.wagon.trim() || !form.date) return;
    const newEntry = {
      id: `MNT-${String(upcoming.length + 1).padStart(3, "0")}`,
      wagon: form.wagon.trim().toUpperCase(),
      type: form.type,
      date: form.date,
      tech: form.tech,
      priority: form.priority,
      status: "Scheduled",
    };
    setUpcoming(p => [...p, newEntry]);
    setSaved(true);
    setTimeout(() => { setModal(false); setSaved(false); setForm({ wagon:"", type:"Routine Check", date:"", tech:"Ramesh Kumar", priority:"Medium" }); }, 1200);
  };

  return (
    <DashboardLayout title="Maintenance" sub="Schedule, track, and manage wagon maintenance operations">
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Scheduled"       value={upcoming.filter(m=>m.status==="Scheduled").length}         color="#3b82f6" icon={FiCalendar} />
        <StatCard title="Pending Approval"value={upcoming.filter(m=>m.status==="Pending Approval").length}  color="#f59e0b" icon={FiClock} />
        <StatCard title="Completed (7d)"  value={COMPLETED.length}                                          color="#22c55e" icon={FiCheckCircle} />
        <StatCard title="Critical"        value={upcoming.filter(m=>m.priority==="Critical").length}        color="#ef4444" icon={FiAlertTriangle} />
      </div>

      {/* Upcoming */}
      <div className="card mb-20">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
          <div className="section-title" style={{ margin:0 }}>Upcoming Maintenance Schedule</div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            <FiPlus size={13} /> Schedule
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Wagon</th><th>Type</th><th>Scheduled Date</th><th>Technician</th><th>Priority</th><th>Status</th></tr>
            </thead>
            <tbody>
              {upcoming.map(m => (
                <tr key={m.id}>
                  <td style={{ color:"#4a6fa5", fontWeight:600 }}>{m.id}</td>
                  <td style={{ color:"#60a5fa", fontWeight:700 }}>{m.wagon}</td>
                  <td style={{ color:"#f1f5f9" }}>{m.type}</td>
                  <td style={{ color:"#94a3b8" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <FiCalendar size={12} color="#4a6fa5" />{m.date}
                    </div>
                  </td>
                  <td>{m.tech}</td>
                  <td><span className={`badge ${priorityClass(m.priority)}`}>{m.priority}</span></td>
                  <td><span className={`badge ${statusClass(m.status)}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed */}
      <div className="card">
        <div className="section-title">Completed Maintenance (Last 7 Days)</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Wagon</th><th>Type</th><th>Date</th><th>Technician</th><th>Result</th><th>Notes</th></tr>
            </thead>
            <tbody>
              {COMPLETED.map(m => (
                <tr key={m.id}>
                  <td style={{ color:"#4a6fa5", fontWeight:600 }}>{m.id}</td>
                  <td style={{ color:"#60a5fa", fontWeight:700 }}>{m.wagon}</td>
                  <td>{m.type}</td>
                  <td style={{ color:"#94a3b8" }}>{m.date}</td>
                  <td>{m.tech}</td>
                  <td><span className="badge badge-active"><FiCheckCircle size={10} style={{ marginRight:4 }} />{m.result}</span></td>
                  <td style={{ color:"#64748b", fontSize:"12px" }}>{m.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <div className="modal-title" style={{ margin:0 }}>Schedule Maintenance</div>
              <button onClick={() => setModal(false)} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Wagon ID</label>
              <input className="form-input" placeholder="e.g. WGN-004" value={form.wagon} onChange={e => set("wagon",e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Maintenance Type</label>
              <select className="form-select" value={form.type} onChange={e => set("type",e.target.value)}>
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={e => set("date",e.target.value)} />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label className="form-label">Priority</label>
                <select className="form-select" value={form.priority} onChange={e => set("priority",e.target.value)}>
                  {["Low","Medium","High","Critical"].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop:"12px" }}>
              <label className="form-label">Technician</label>
              <select className="form-select" value={form.tech} onChange={e => set("tech",e.target.value)}>
                {TECHS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={handleSave}>
                {saved ? "✓ Scheduled!" : "Schedule"}
              </button>
              <button className="btn btn-outline" onClick={() => setModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Maintenance;
