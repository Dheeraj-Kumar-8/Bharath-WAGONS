import { useState, useMemo } from "react";
import {
  FiTool, FiCheckCircle, FiAlertTriangle, FiPlus,
  FiX, FiEye, FiPlay, FiCalendar, FiUser, FiActivity,
  FiFilter, FiEdit2, FiZap,
} from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";
import StatCard from "../components/StatCard";
import { useOperatorData } from "../context/OperatorDataContext";

const TECHNICIANS = [
  "Ramesh Kumar", "Sanjay Mishra", "Priya Singh", "Anil Verma",
  "Deepa Nair",   "Suresh Patel",  "Kavitha Rajan", "Mohan Das",
];

const MAINT_TYPES = [
  "Brake Inspection", "Wheel Alignment", "Routine Check", "Coupler Replacement",
  "GPS Unit Repair",  "Oil & Lubrication", "Air Brake Test", "Full Overhaul",
  "Axle Bearing Service", "Temperature Sensor Check",
];

const dayOffset = (n = 0) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const fmt = iso => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d} ${months[+m - 1]} ${y}`;
};

const PRIORITY_BADGE = { Critical:"badge-critical", High:"badge-high", Medium:"badge-medium", Low:"badge-low" };
const STATUS_META = {
  Upcoming:     { badge:"badge-info",      color:"#3b82f6", label:"Upcoming"    },
  Pending:      { badge:"badge-pending",   color:"#f59e0b", label:"Pending"     },
  "In Progress":{ badge:"badge-info",      color:"#06b6d4", label:"In Progress" },
  Completed:    { badge:"badge-completed", color:"#22c55e", label:"Completed"   },
  Overdue:      { badge:"badge-critical",  color:"#ef4444", label:"Overdue"     },
};
const HEALTH_COLOR = { Healthy:"#22c55e", Warning:"#f59e0b", Critical:"#ef4444" };

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position:"fixed", top:20, right:24, background:"#16a34a", color:"#fff", padding:"12px 20px", borderRadius:10, fontWeight:600, zIndex:9999, boxShadow:"0 4px 20px rgba(0,0,0,.4)", display:"flex", alignItems:"center", gap:8 }}>
      <FiCheckCircle size={14}/> {msg}
    </div>
  );
}

function ScheduleModal({ item, wagons, preWagon, onSave, onClose }) {
  const isEdit = !!item;
  const [form, setForm] = useState(isEdit ? {
    wagon: item.wagon, type: item.type, priority: item.priority,
    scheduledDate: item.scheduledDate, tech: item.tech, notes: item.notes,
  } : {
    wagon: preWagon || wagons[0]?.id || "", type: MAINT_TYPES[0], priority: "Medium",
    scheduledDate: dayOffset(1), tech: TECHNICIANS[0], notes: "",
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const selectedWagon = wagons.find(w => w.id === form.wagon);
  const valid = form.wagon && form.type && form.scheduledDate && form.tech;
  const hc = selectedWagon ? (selectedWagon.health >= 75 ? "Healthy" : selectedWagon.health >= 50 ? "Warning" : "Critical") : null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 560, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>{isEdit ? "Edit Maintenance Task" : "Schedule Maintenance"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>

        {selectedWagon && (
          <div style={{ display:"flex", alignItems:"center", gap:12, background:"rgba(59,130,246,.07)", border:"1px solid rgba(59,130,246,.18)", borderRadius:10, padding:"10px 14px", marginBottom:16 }}>
            <FiActivity size={13} color={HEALTH_COLOR[hc]}/>
            <div>
              <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{selectedWagon.id}</span>
              <span style={{ color:"#64748b", fontSize:12, marginLeft:8 }}>{selectedWagon.route}</span>
            </div>
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
              <div className="progress-bg" style={{ width:60 }}>
                <div className="progress-fill" style={{ width:`${selectedWagon.health}%`, background: HEALTH_COLOR[hc] }}/>
              </div>
              <span style={{ color: HEALTH_COLOR[hc], fontSize:12, fontWeight:700 }}>{selectedWagon.health}%</span>
            </div>
          </div>
        )}

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Wagon *</label>
            <select className="form-select" value={form.wagon} onChange={e => set("wagon", e.target.value)}>
              {wagons.map(w => <option key={w.id} value={w.id}>{w.id}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Maintenance Type *</label>
            <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {MAINT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Scheduled Date *</label>
            <input className="form-input" type="date" value={form.scheduledDate} onChange={e => set("scheduledDate", e.target.value)}/>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Priority *</label>
            <select className="form-select" value={form.priority} onChange={e => set("priority", e.target.value)}>
              {["Critical","High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0, gridColumn:"1 / -1" }}>
            <label className="form-label">Assign Technician *</label>
            <select className="form-select" value={form.tech} onChange={e => set("tech", e.target.value)}>
              {TECHNICIANS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0, gridColumn:"1 / -1" }}>
            <label className="form-label">Notes</label>
            <textarea className="form-input" rows={3} style={{ resize:"vertical" }}
              placeholder="Describe the maintenance task…"
              value={form.notes} onChange={e => set("notes", e.target.value)}/>
          </div>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}
            disabled={!valid}
            onClick={() => onSave(form)}>
            <FiCalendar size={13}/> {isEdit ? "Update Task" : "Schedule Maintenance"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function DetailModal({ item, wagons, onClose, onEdit, onAdvance }) {
  const wagon = wagons.find(w => w.id === item.wagon);
  const hc = wagon ? (wagon.health >= 75 ? "Healthy" : wagon.health >= 50 ? "Warning" : "Critical") : null;
  const sm = STATUS_META[item.status] || STATUS_META["Pending"];
  const canAdvance = item.status === "Pending" || item.status === "In Progress" || item.status === "Overdue";
  const nextLabel = item.status === "Completed" ? null : item.status === "In Progress" ? "Mark Complete" : "Start Work";

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth:520 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div className="modal-title" style={{ margin:0 }}>{item.id} — Details</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18}/></button>
        </div>

        <div style={{ background:`${sm.color}12`, border:`1px solid ${sm.color}35`, borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
          <span className={`badge ${sm.badge}`}>{item.status}</span>
          <span style={{ color:"#94a3b8", fontSize:13 }}>{item.type} · Scheduled {fmt(item.scheduledDate)}</span>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
          {[
            ["Wagon ID", item.wagon],
            ["Priority", null, <span className={`badge ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span>],
            ["Scheduled Date", fmt(item.scheduledDate)],
            ["Technician", item.tech],
          ].map(([l, v, n]) => (
            <div key={l} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:12 }}>
              <div style={{ color:"#4a6fa5", fontSize:11, marginBottom:4, textTransform:"uppercase" }}>{l}</div>
              <div style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{n || v}</div>
            </div>
          ))}
        </div>

        {item.notes && (
          <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:12, marginBottom:12 }}>
            <div style={{ color:"#4a6fa5", fontSize:11, marginBottom:4, textTransform:"uppercase" }}>Notes</div>
            <div style={{ color:"#cbd5e1", fontSize:13, lineHeight:1.6 }}>{item.notes}</div>
          </div>
        )}

        {wagon && hc && (
          <div style={{ background:"rgba(59,130,246,.06)", border:"1px solid rgba(59,130,246,.15)", borderRadius:10, padding:12, marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
            <FiActivity size={13} color={HEALTH_COLOR[hc]}/>
            <span style={{ color:"#94a3b8", fontSize:12 }}>Wagon Health</span>
            <div className="progress-bg" style={{ flex:1 }}>
              <div className="progress-fill" style={{ width:`${wagon.health}%`, background: HEALTH_COLOR[hc] }}/>
            </div>
            <span style={{ color: HEALTH_COLOR[hc], fontSize:12, fontWeight:700 }}>{wagon.health}%</span>
          </div>
        )}

        <div style={{ display:"flex", gap:10 }}>
          {canAdvance && nextLabel && (
            <button className={`btn ${item.status === "In Progress" ? "btn-success" : "btn-primary"}`}
              style={{ flex:1, justifyContent:"center" }} onClick={() => { onAdvance(item.id); onClose(); }}>
              {item.status === "In Progress" ? <FiCheckCircle size={13}/> : <FiPlay size={13}/>} {nextLabel}
            </button>
          )}
          {item.status !== "Completed" && (
            <button className="btn btn-outline" onClick={() => { onEdit(item); onClose(); }}>
              <FiEdit2 size={13}/> Edit
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function AlertBanner({ alerts, onDismiss }) {
  if (!alerts.length) return null;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{
          display:"flex", alignItems:"center", gap:12,
          background:`${a.color}0f`, border:`1px solid ${a.color}35`,
          borderLeft:`4px solid ${a.color}`, borderRadius:10, padding:"11px 14px",
        }}>
          <FiZap size={14} color={a.color} style={{ flexShrink:0 }}/>
          <span style={{ color:"#cbd5e1", fontSize:13, flex:1 }}>{a.msg}</span>
          <span className={`badge ${a.badge}`} style={{ fontSize:10 }}>{a.tag}</span>
          <button onClick={() => onDismiss(i)} style={{ background:"none", border:"none", color:"#4a6fa5", cursor:"pointer", flexShrink:0 }}><FiX size={12}/></button>
        </div>
      ))}
    </div>
  );
}

export default function OperatorMaintenance() {
  const { wagons, maintenance, advanceMaintenance, scheduleMaintenance, updateMaintenance } = useOperatorData();
  const [tab, setTab]           = useState("all");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleWagon, setScheduleWagon] = useState(null);
  const [editItem, setEditItem]   = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [priorityF, setPriorityF] = useState("All");
  const [toast, setToast]         = useState("");
  const [dismissedMsgs, setDismissedMsgs] = useState(new Set());

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2800); };

  const counts = useMemo(() => ({
    all:         maintenance.length,
    upcoming:    maintenance.filter(i => i.status === "Upcoming").length,
    pending:     maintenance.filter(i => i.status === "Pending" || i.status === "In Progress").length,
    completed:   maintenance.filter(i => i.status === "Completed").length,
    overdue:     maintenance.filter(i => i.status === "Overdue").length,
  }), [maintenance]);

  const autoAlerts = useMemo(() => {
    const raw = [];
    maintenance.forEach(i => {
      if (i.status === "Overdue")
        raw.push({ msg:`${i.id} — ${i.type} on ${i.wagon} is OVERDUE since ${fmt(i.scheduledDate)}. Immediate action required.`, color:"#ef4444", badge:"badge-critical", tag:"Overdue" });
      else if (i.priority === "Critical" && i.status !== "Completed")
        raw.push({ msg:`Critical maintenance: ${i.type} on ${i.wagon} scheduled for ${fmt(i.scheduledDate)} — assigned to ${i.tech}.`, color:"#f97316", badge:"badge-high", tag:"Critical" });
      else if (i.status === "Upcoming" && i.scheduledDate <= dayOffset(2))
        raw.push({ msg:`Upcoming in ≤2 days: ${i.type} on ${i.wagon} — ${fmt(i.scheduledDate)}.`, color:"#f59e0b", badge:"badge-medium", tag:"Due Soon" });
    });
    wagons.filter(w => w.health < 40).forEach(w => {
      if (!maintenance.find(i => i.wagon === w.id && i.status !== "Completed"))
        raw.push({ msg:`Wagon ${w.id} health at ${w.health}% (Critical). Schedule maintenance immediately.`, color:"#ef4444", badge:"badge-critical", tag:"Health Alert" });
    });
    return raw;
  }, [maintenance, wagons]);

  const visibleAlerts = autoAlerts.filter(a => !dismissedMsgs.has(a.msg));
  const dismissAlert = (idx) => setDismissedMsgs(s => new Set([...s, visibleAlerts[idx].msg]));

  const tabFiltered = useMemo(() => {
    let list = maintenance;
    if (tab === "upcoming")  list = list.filter(i => i.status === "Upcoming");
    if (tab === "pending")   list = list.filter(i => i.status === "Pending" || i.status === "In Progress");
    if (tab === "completed") list = list.filter(i => i.status === "Completed");
    if (tab === "overdue")   list = list.filter(i => i.status === "Overdue");
    if (priorityF !== "All") list = list.filter(i => i.priority === priorityF);
    return list.slice().sort((a, b) => {
      const order = { Overdue:0, "In Progress":1, Pending:2, Upcoming:3, Completed:4 };
      return (order[a.status] ?? 5) - (order[b.status] ?? 5);
    });
  }, [maintenance, tab, priorityF]);

  const handleSchedule = (form) => {
    const id = scheduleMaintenance(form);
    setScheduleOpen(false);
    showToast(`✓ Maintenance scheduled: ${id} for ${form.wagon} on ${fmt(form.scheduledDate)}`);
  };

  const handleEdit = (form) => {
    updateMaintenance(editItem.id, form);
    setEditItem(null);
    showToast(`✓ ${editItem.id} updated.`);
  };

  const handleAdvance = (id) => {
    const item = maintenance.find(i => i.id === id);
    if (!item) return;
    const NEXT = { Overdue:"In Progress", Pending:"In Progress", "In Progress":"Completed" };
    const next = NEXT[item.status] || item.status;
    advanceMaintenance(id);
    showToast(`✓ ${id}: ${item.status} → ${next}`);
  };

  const TABS = [
    { key:"all",       label:"All Tasks",   count: counts.all       },
    { key:"upcoming",  label:"Upcoming",    count: counts.upcoming   },
    { key:"pending",   label:"In Progress", count: counts.pending    },
    { key:"completed", label:"Completed",   count: counts.completed  },
    { key:"overdue",   label:"Overdue",     count: counts.overdue, alert: counts.overdue > 0 },
  ];

  return (
    <OperatorLayout title="Maintenance Management" sub="Schedule, track and resolve wagon maintenance tasks" moduleKey="maintenance">
      <Toast msg={toast}/>

      <div style={{ display:"flex", gap:14, marginBottom:20, flexWrap:"wrap" }}>
        <StatCard title="Total Tasks"  value={counts.all}       color="#3b82f6" icon={FiTool}         />
        <StatCard title="Upcoming"     value={counts.upcoming}  color="#3b82f6" icon={FiCalendar}      />
        <StatCard title="In Progress"  value={counts.pending}   color="#06b6d4" icon={FiActivity}      />
        <StatCard title="Completed"    value={counts.completed} color="#22c55e" icon={FiCheckCircle}   />
        <StatCard title="Overdue"      value={counts.overdue}   color="#ef4444" icon={FiAlertTriangle} trend={counts.overdue > 0 ? "Needs attention" : undefined} trendUp={false} />
      </div>

      <AlertBanner alerts={visibleAlerts} onDismiss={dismissAlert}/>

      {/* Fleet Health Strip */}
      <div className="card mb-20" style={{ padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:14 }}>Fleet Health Overview</div>
          <span style={{ color:"#64748b", fontSize:12 }}>Live from Wagon Data · {wagons.length} wagons</span>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {wagons.map(w => {
            const hc = w.health >= 75 ? "Healthy" : w.health >= 50 ? "Warning" : "Critical";
            return (
              <div key={w.id} style={{
                flex:"1 1 100px", background:"#071628", border:`1px solid ${HEALTH_COLOR[hc]}30`,
                borderRadius:10, padding:"10px 12px", cursor:"pointer", transition:"border-color .15s",
              }}
                onClick={() => { setScheduleWagon(w.id); setScheduleOpen(true); }}
                onMouseEnter={e => e.currentTarget.style.borderColor = HEALTH_COLOR[hc]}
                onMouseLeave={e => e.currentTarget.style.borderColor = `${HEALTH_COLOR[hc]}30`}
                title="Click to schedule maintenance for this wagon">
                <div style={{ color:"#60a5fa", fontWeight:700, fontSize:12, marginBottom:4 }}>{w.id}</div>
                <div className="progress-bg" style={{ marginBottom:4 }}>
                  <div className="progress-fill" style={{ width:`${w.health}%`, background: HEALTH_COLOR[hc] }}/>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color: HEALTH_COLOR[hc], fontSize:11, fontWeight:700 }}>{w.health}%</span>
                  <span className={`badge ${hc === "Healthy" ? "badge-active" : hc === "Warning" ? "badge-medium" : "badge-critical"}`} style={{ fontSize:9, padding:"1px 6px" }}>
                    {hc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs + Actions */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, marginBottom:16, flexWrap:"wrap" }}>
        <div style={{ display:"flex", gap:4, background:"rgba(0,0,0,.2)", borderRadius:12, padding:4, border:"1px solid #1a3356" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding:"8px 14px", border:"none", borderRadius:9, cursor:"pointer",
              fontSize:12, fontWeight:700, transition:"all .18s", position:"relative",
              background: tab === t.key ? "#1d4ed8" : "transparent",
              color:       tab === t.key ? "#fff"    : "#64748b",
              boxShadow:   tab === t.key ? "0 2px 12px rgba(37,99,235,.4)" : "none",
            }}>
              {t.label}
              <span style={{ marginLeft:6, opacity:.75 }}>({t.count})</span>
              {t.alert && t.count > 0 && (
                <span style={{ position:"absolute", top:2, right:2, width:7, height:7, background:"#ef4444", borderRadius:"50%" }}/>
              )}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <FiFilter size={13} color="#4a6fa5"/>
            <select className="form-select" style={{ width:"auto", padding:"7px 12px", fontSize:12 }} value={priorityF} onChange={e => setPriorityF(e.target.value)}>
              {["All","Critical","High","Medium","Low"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setScheduleOpen(true)}>
            <FiPlus size={13}/> Schedule Maintenance
          </button>
        </div>
      </div>

      {tab !== "completed" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task ID</th><th>Wagon</th><th>Health</th><th>Type</th>
                  <th>Priority</th><th>Scheduled</th><th>Technician</th>
                  <th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tabFiltered.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign:"center", color:"#4a6fa5", padding:40 }}>
                    <FiTool size={28} style={{ marginBottom:8, opacity:.3, display:"block", margin:"0 auto 8px" }}/>
                    No tasks in this category
                  </td></tr>
                ) : tabFiltered.map(item => {
                  const wagon = wagons.find(w => w.id === item.wagon);
                  const hc = wagon ? (wagon.health >= 75 ? "Healthy" : wagon.health >= 50 ? "Warning" : "Critical") : null;
                  const sm = STATUS_META[item.status] || STATUS_META["Pending"];
                  return (
                    <tr key={item.id}>
                      <td style={{ color:"#60a5fa", fontWeight:700 }}>{item.id}</td>
                      <td style={{ color:"#94a3b8", fontWeight:600 }}>{item.wagon}</td>
                      <td>
                        {wagon && hc ? (
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div className="progress-bg" style={{ width:48 }}>
                              <div className="progress-fill" style={{ width:`${wagon.health}%`, background: HEALTH_COLOR[hc] }}/>
                            </div>
                            <span style={{ color: HEALTH_COLOR[hc], fontSize:11, fontWeight:700 }}>{wagon.health}%</span>
                          </div>
                        ) : "—"}
                      </td>
                      <td style={{ fontSize:13 }}>
                        <span style={{ display:"flex", alignItems:"center", gap:6 }}><FiTool size={11} color="#4a6fa5"/>{item.type}</span>
                      </td>
                      <td><span className={`badge ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span></td>
                      <td style={{ color: item.status === "Overdue" ? "#ef4444" : "#64748b", fontSize:12, fontWeight: item.status === "Overdue" ? 600 : 400 }}>
                        {fmt(item.scheduledDate)}
                        {item.status === "Overdue" && <div style={{ color:"#ef4444", fontSize:10 }}>OVERDUE</div>}
                      </td>
                      <td style={{ color:"#94a3b8", fontSize:12 }}>
                        <span style={{ display:"flex", alignItems:"center", gap:5 }}><FiUser size={11} color="#4a6fa5"/>{item.tech}</span>
                      </td>
                      <td><span className={`badge ${sm.badge}`}>{item.status}</span></td>
                      <td>
                        <div style={{ display:"flex", gap:5 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setDetailItem(item)}><FiEye size={12}/></button>
                          {(item.status === "Pending" || item.status === "Overdue") && (
                            <button className="btn btn-primary btn-sm" onClick={() => handleAdvance(item.id)}><FiPlay size={11}/> Start</button>
                          )}
                          {item.status === "In Progress" && (
                            <button className="btn btn-success btn-sm" onClick={() => handleAdvance(item.id)}><FiCheckCircle size={11}/> Done</button>
                          )}
                          {item.status === "Upcoming" && (
                            <button className="btn btn-outline btn-sm" onClick={() => setEditItem(item)}><FiEdit2 size={11}/></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "completed" && (
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
            {[
              { label:"Completed Tasks",    value: tabFiltered.length, color:"#22c55e" },
              { label:"Critical Resolved",  value: tabFiltered.filter(i=>i.priority==="Critical").length, color:"#ef4444" },
              { label:"Technicians Active", value: [...new Set(tabFiltered.map(i=>i.tech))].length, color:"#3b82f6" },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign:"center", padding:16 }}>
                <div style={{ color: s.color, fontSize:28, fontWeight:800, marginBottom:4 }}>{s.value}</div>
                <div style={{ color:"#64748b", fontSize:12 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="section-title" style={{ marginBottom:16 }}>Completed Maintenance Log</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Task ID</th><th>Wagon</th><th>Type</th><th>Priority</th><th>Scheduled</th><th>Technician</th><th>Notes</th></tr>
                </thead>
                <tbody>
                  {tabFiltered.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign:"center", color:"#4a6fa5", padding:40 }}>No completed tasks yet.</td></tr>
                  ) : tabFiltered.map(item => (
                    <tr key={item.id}>
                      <td style={{ color:"#4a6fa5", fontWeight:700 }}>{item.id}</td>
                      <td style={{ color:"#64748b" }}>{item.wagon}</td>
                      <td style={{ fontSize:13 }}>{item.type}</td>
                      <td><span className={`badge ${PRIORITY_BADGE[item.priority]}`}>{item.priority}</span></td>
                      <td style={{ color:"#64748b", fontSize:12 }}>{fmt(item.scheduledDate)}</td>
                      <td style={{ color:"#64748b", fontSize:12 }}>{item.tech}</td>
                      <td style={{ color:"#4a6fa5", fontSize:12, maxWidth:200 }}>{item.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {scheduleOpen && <ScheduleModal wagons={wagons} preWagon={scheduleWagon} onSave={handleSchedule} onClose={() => { setScheduleOpen(false); setScheduleWagon(null); }}/>}
      {editItem     && <ScheduleModal wagons={wagons} item={editItem} onSave={handleEdit} onClose={() => setEditItem(null)}/>}
      {detailItem   && (
        <DetailModal
          wagons={wagons}
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onEdit={item => { setEditItem(item); setDetailItem(null); }}
          onAdvance={handleAdvance}
        />
      )}
    </OperatorLayout>
  );
}
