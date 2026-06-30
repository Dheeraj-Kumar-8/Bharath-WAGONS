import { useState, useEffect } from "react";
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX, FiFilter } from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import { FiTruck, FiActivity, FiAlertTriangle, FiTool } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const TYPES    = ["All", "BCN", "BOXN", "BTPN", "Covered", "Flat", "Hopper", "Tank"];
const STATUSES = ["All", "Running", "Loading", "Unloading", "Delayed", "Maintenance", "Idle"];

const statusClass = (s) => ({
  Running:     "badge-active",
  Loading:     "badge-info",
  Unloading:   "badge-medium",
  Delayed:     "badge-high",
  Maintenance: "badge-critical",
  Idle:        "badge-info",
}[s] || "badge-info");

const emptyForm = () => ({
  id: "", type: "BCN", location: "", dest: "",
  speed: "", status: "Idle", capacity: "", zone: "",
});

// ── Wagon Add / Edit Modal ────────────────────────────────────────────────────
const WagonModal = ({ wagon, onSave, onClose }) => {
  const [form, setForm] = useState(wagon || emptyForm());
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
          <div className="modal-title" style={{ margin:0 }}>{wagon ? "Edit Wagon" : "Add New Wagon"}</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#64748b", cursor:"pointer" }}><FiX size={18} /></button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          {[
            { label:"Wagon ID",    key:"id",       type:"text",   ph:"e.g. WG00001"   },
            { label:"Capacity",    key:"capacity", type:"number", ph:"e.g. 60"         },
            { label:"Location",    key:"location", type:"text",   ph:"Current station" },
            { label:"Destination", key:"dest",     type:"text",   ph:"Destination"     },
            { label:"Speed (km/h)",key:"speed",    type:"number", ph:"e.g. 80"         },
            { label:"Zone",        key:"zone",     type:"text",   ph:"e.g. NR"         },
          ].map(f => (
            <div className="form-group" key={f.key} style={{ margin:0 }}>
              <label className="form-label">{f.label}</label>
              <input
                className="form-input"
                type={f.type}
                placeholder={f.ph}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                disabled={f.key === "id" && !!wagon}
              />
            </div>
          ))}
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Type</label>
            <select className="form-select" value={form.type} onChange={e => set("type", e.target.value)}>
              {["BCN","BOXN","BTPN","Covered","Flat","Hopper","Tank"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin:0 }}>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={e => set("status", e.target.value)}>
              {["Running","Loading","Unloading","Delayed","Maintenance","Idle"].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:"flex", gap:"10px", marginTop:"20px" }}>
          <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={() => onSave(form)}>
            {wagon ? "Update Wagon" : "Add Wagon"}
          </button>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ── Delete Confirmation Modal ─────────────────────────────────────────────────
const DeleteModal = ({ wagon, onConfirm, onClose }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="modal-box" style={{ maxWidth:380 }}>
      <div className="modal-title">Delete Wagon</div>
      <p style={{ color:"#94a3b8", marginBottom:"24px" }}>
        Are you sure you want to delete <strong style={{ color:"#60a5fa" }}>{wagon.id}</strong>? This action cannot be undone.
      </p>
      <div style={{ display:"flex", gap:"10px" }}>
        <button className="btn btn-danger" style={{ flex:1, justifyContent:"center" }} onClick={onConfirm}>Delete</button>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const Wagons = () => {
  const { admin } = useAuth();
  const zone = admin?.zone || "NR";

  const [data,         setData]   = useState([]);
  const [loading,      setLoading] = useState(true);
  const [query,        setQuery]  = useState("");
  const [typeFilter,   setType]   = useState("All");
  const [statusFilter, setSt]     = useState("All");
  const [addModal,     setAdd]    = useState(false);
  const [editTarget,   setEdit]   = useState(null);
  const [delTarget,    setDel]    = useState(null);

  // ── Load wagons from MongoDB — single source of truth ──────────────────────
  useEffect(() => {
    setLoading(true);
    api.getWagons()
      .then(res => {
        const rows = (res.data || []).filter(w => w.zone === zone).map(w => ({
          _id:      w._id,
          id:       w.wagonId,
          type:     w.wagonType      || "—",
          location: w.currentStation || "Unknown",
          dest:     w.destination    || "—",
          speed:    w.speed          ?? 0,
          capacity: w.capacity       ?? 0,
          zone:     w.zone           || "—",
          status:   w.status         || "Idle",
        }));
        setData(rows);
      })
      .catch(err => console.warn("[Wagons] API fetch failed:", err.message))
      .finally(() => setLoading(false));
  }, [zone]);

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filtered = data.filter(w =>
    (typeFilter   === "All" || w.type   === typeFilter)   &&
    (statusFilter === "All" || w.status === statusFilter) &&
    (`${w.id} ${w.location} ${w.dest} ${w.type}`.toLowerCase().includes(query.toLowerCase()))
  );

  // ── Summary counts ──────────────────────────────────────────────────────────
  const counts = {
    total:   data.length,
    running: data.filter(w => w.status === "Running").length,
    delayed: data.filter(w => w.status === "Delayed").length,
    maint:   data.filter(w => w.status === "Maintenance").length,
  };

  // ── Add ─────────────────────────────────────────────────────────────────────
  const handleAdd = async (form) => {
    setAdd(false);
    try {
      const res = await api.createWagon({
        wagonId:        form.id,
        wagonType:      form.type,
        currentStation: form.location,
        destination:    form.dest,
        speed:          Number(form.speed)    || 0,
        capacity:       Number(form.capacity) || 0,
        zone:           form.zone || zone,
        status:         form.status,
      });
      // Append the newly saved document (contains real _id from DB)
      const w = res.data;
      setData(p => [...p, {
        _id:      w._id,
        id:       w.wagonId,
        type:     w.wagonType      || "—",
        location: w.currentStation || "Unknown",
        dest:     w.destination    || "—",
        speed:    w.speed          ?? 0,
        capacity: w.capacity       ?? 0,
        zone:     w.zone           || "—",
        status:   w.status         || "Idle",
      }]);
    } catch (err) {
      console.error("[Wagons] MongoDB save failed:", err.message);
    }
  };

  // ── Edit ────────────────────────────────────────────────────────────────────
  const handleEdit = async (form) => {
    // Optimistic UI update
    setData(p => p.map(w => w.id === form.id ? { ...w, ...form } : w));
    setEdit(null);
    try {
      await api.updateWagon(form._id, {
        wagonType:      form.type,
        currentStation: form.location,
        destination:    form.dest,
        speed:          Number(form.speed)    || 0,
        capacity:       Number(form.capacity) || 0,
        zone:           form.zone,
        status:         form.status,
      });
    } catch (err) {
      console.error("[Wagons] MongoDB update failed:", err.message);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const { id, _id } = delTarget;
    setData(p => p.filter(w => w.id !== id));
    setDel(null);
    try {
      await api.deleteWagon(_id);
    } catch (err) {
      console.error("[Wagons] MongoDB delete failed:", err.message);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout title={`Wagons — Zone ${zone}`} sub={`Manage and monitor all wagons in ${admin?.region}`}>

      {/* Summary Cards */}
      <div style={{ display:"flex", gap:"14px", marginBottom:"20px", flexWrap:"wrap" }}>
        <StatCard title="Total Wagons" value={loading ? "…" : counts.total}   color="#3b82f6" icon={FiTruck}        />
        <StatCard title="Running"      value={loading ? "…" : counts.running} color="#22c55e" icon={FiActivity}     />
        <StatCard title="Delayed"      value={loading ? "…" : counts.delayed} color="#f59e0b" icon={FiAlertTriangle}/>
        <StatCard title="Maintenance"  value={loading ? "…" : counts.maint}   color="#ef4444" icon={FiTool}         />
      </div>

      {/* Toolbar */}
      <div style={{ display:"flex", gap:"12px", marginBottom:"16px", flexWrap:"wrap", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", background:"#060e1e", border:"1px solid #1a3356", borderRadius:"10px", padding:"8px 14px", flex:1, minWidth:"200px" }}>
          <FiSearch color="#3a5a7c" size={14} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by ID, location, route…"
            style={{ background:"transparent", border:"none", outline:"none", color:"#f1f5f9", fontSize:"13px", width:"100%" }}
          />
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
          <FiFilter color="#3a5a7c" size={14} />
          <select className="form-select" value={typeFilter} onChange={e => setType(e.target.value)} style={{ width:"auto", padding:"8px 12px" }}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <select className="form-select" value={statusFilter} onChange={e => setSt(e.target.value)} style={{ width:"auto", padding:"8px 12px" }}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setAdd(true)}>
          <FiPlus size={14} /> Add Wagon
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
          <div className="section-title" style={{ margin:0 }}>Wagon Fleet ({filtered.length})</div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Wagon ID</th><th>Type</th><th>Location</th><th>Destination</th>
                <th>Speed</th><th>Capacity</th><th>Zone</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={9} style={{ textAlign:"center", color:"#4a6fa5", padding:"30px" }}>Loading wagons…</td></tr>
              )}
              {!loading && filtered.map(w => (
                <tr key={w.id}>
                  <td style={{ color:"#60a5fa", fontWeight:700 }}>{w.id}</td>
                  <td style={{ color:"#94a3b8" }}>{w.type}</td>
                  <td>{w.location}</td>
                  <td>{w.dest}</td>
                  <td style={{ color:"#cbd5e1" }}>{w.speed} km/h</td>
                  <td style={{ color:"#64748b" }}>{w.capacity} T</td>
                  <td style={{ color:"#64748b" }}>{w.zone}</td>
                  <td><span className={`badge ${statusClass(w.status)}`}>{w.status}</span></td>
                  <td>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEdit(w)}><FiEdit2 size={12} /></button>
                      <button className="btn btn-sm" style={{ background:"rgba(239,68,68,.12)", color:"#ef4444" }} onClick={() => setDel(w)}><FiTrash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign:"center", color:"#4a6fa5", padding:"30px" }}>No wagons match your search</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {addModal    && <WagonModal                          onSave={handleAdd}    onClose={() => setAdd(false)}  />}
      {editTarget  && <WagonModal wagon={editTarget}       onSave={handleEdit}   onClose={() => setEdit(null)}  />}
      {delTarget   && <DeleteModal wagon={delTarget}       onConfirm={handleDelete} onClose={() => setDel(null)} />}
    </DashboardLayout>
  );
};

export default Wagons;
