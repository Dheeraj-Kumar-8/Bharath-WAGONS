import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

// ── Master fleet data ─────────────────────────────────────────────────────────
const SEED_WAGONS = [
  { id:"WGN-1042", route:"New Delhi → Mumbai",  location:"Kota Jn.",     status:"On Time",    speed:78,  load:82, type:"Freight",   cargo:"Steel Coils",      gps:"Active",  health:88, eta:"14:30", heading:"SW", zone:"NR" },
  { id:"WGN-2187", route:"Kolkata → Chennai",   location:"Vizag",        status:"Delayed",    speed:54,  load:67, type:"Tank",      cargo:"Coal",              gps:"Active",  health:42, eta:"18:45", heading:"S",  zone:"ER" },
  { id:"WGN-3301", route:"Mumbai → Hyderabad",  location:"Pune Jn.",     status:"On Time",    speed:85,  load:91, type:"Flatbed",   cargo:"Auto Parts",        gps:"Active",  health:97, eta:"12:10", heading:"E",  zone:"CR" },
  { id:"WGN-4056", route:"Chennai → Delhi",     location:"Nagpur Yard",  status:"Maintenance",speed:0,   load:0,  type:"Freight",   cargo:"—",                 gps:"Offline", health:31, eta:"—",     heading:"—",  zone:"SCR"},
  { id:"WGN-5774", route:"Hyderabad → Kolkata", location:"Raipur Jn.",   status:"On Time",    speed:91,  load:74, type:"Container", cargo:"Cement",            gps:"Active",  health:78, eta:"20:00", heading:"NE", zone:"SCR"},
  { id:"WGN-6613", route:"Delhi → Bengaluru",   location:"Bhopal Jn.",   status:"Delayed",    speed:44,  load:88, type:"Freight",   cargo:"Textiles",          gps:"Active",  health:65, eta:"22:15", heading:"S",  zone:"WCR"},
  { id:"WGN-7890", route:"Mumbai → Kolkata",    location:"Wardha",       status:"On Time",    speed:80,  load:55, type:"Tank",      cargo:"Petroleum",         gps:"Active",  health:94, eta:"16:50", heading:"E",  zone:"CR" },
  { id:"WGN-8421", route:"Bengaluru → Delhi",   location:"Secunderabad", status:"On Time",    speed:76,  load:63, type:"Container", cargo:"Electronics",       gps:"Active",  health:72, eta:"09:20", heading:"N",  zone:"SCR"},
];

const SEED_CARGO = [
  { id:"CGO-4421", wagon:"WGN-1042", type:"Steel Coils",        weight:58.4, capacity:72,  temp:28, tempLimit:40, status:"Normal",   destination:"Mumbai",    origin:"New Delhi",  seal:"SEALED" },
  { id:"CGO-4422", wagon:"WGN-2187", type:"Chemical Drums",     weight:45.1, capacity:60,  temp:18, tempLimit:25, status:"Warning",  destination:"Chennai",   origin:"Kolkata",    seal:"SEALED" },
  { id:"CGO-4423", wagon:"WGN-3301", type:"Auto Parts",         weight:61.8, capacity:65,  temp:31, tempLimit:45, status:"Critical", destination:"Hyderabad", origin:"Mumbai",     seal:"BROKEN" },
  { id:"CGO-4424", wagon:"WGN-4056", type:"Food Grain",         weight:0,    capacity:80,  temp:22, tempLimit:30, status:"Empty",    destination:"Delhi",     origin:"Chennai",    seal:"OPEN"   },
  { id:"CGO-4425", wagon:"WGN-5774", type:"Coal",               weight:71.2, capacity:90,  temp:35, tempLimit:50, status:"Normal",   destination:"Kolkata",   origin:"Hyderabad",  seal:"SEALED" },
  { id:"CGO-4426", wagon:"WGN-6613", type:"Petroleum Products", weight:52.0, capacity:60,  temp:42, tempLimit:40, status:"Critical", destination:"Bengaluru", origin:"Delhi",      seal:"SEALED" },
  { id:"CGO-4427", wagon:"WGN-7890", type:"Cotton Bales",       weight:38.5, capacity:70,  temp:27, tempLimit:40, status:"Normal",   destination:"Kolkata",   origin:"Mumbai",     seal:"SEALED" },
  { id:"CGO-4428", wagon:"WGN-8421", type:"Machinery",          weight:63.0, capacity:75,  temp:29, tempLimit:45, status:"Normal",   destination:"Delhi",     origin:"Bengaluru",  seal:"SEALED" },
];

const SEED_ALERTS = [
  { id:"ALT-001", wagon:"WGN-2187", type:"Speed Anomaly",     severity:"Critical", time:"10:14 AM", resolved:false, detail:"Detected at 142 km/h on a 90 km/h restricted zone near Vizag. Immediate brake check required." },
  { id:"ALT-002", wagon:"WGN-4056", type:"Brake Wear",        severity:"High",     time:"09:32 AM", resolved:false, detail:"Brake pad thickness below 8mm threshold on Axle 3 & 4. Maintenance flagged." },
  { id:"ALT-003", wagon:"WGN-1042", type:"Route Deviation",   severity:"Medium",   time:"08:50 AM", resolved:false, detail:"Deviated 2.3 km from planned route near Kota Jn. Driver alerted via cabin display." },
  { id:"ALT-004", wagon:"WGN-6613", type:"GPS Signal Lost",   severity:"High",     time:"08:22 AM", resolved:false, detail:"GPS module unresponsive for 14 min. Last known location: Bhopal Jn." },
  { id:"ALT-005", wagon:"WGN-8421", type:"Cargo Overload",    severity:"Critical", time:"07:58 AM", resolved:false, detail:"Cargo weight at 108% of rated capacity. Immediate load redistribution advised." },
  { id:"ALT-006", wagon:"WGN-5774", type:"Temperature Alert", severity:"Medium",   time:"07:30 AM", resolved:false, detail:"Axle bearing temp reached 78°C (threshold: 70°C). Speed reduced." },
  { id:"ALT-007", wagon:"WGN-3301", type:"Engine Vibration",  severity:"Low",      time:"07:10 AM", resolved:false, detail:"Unusual vibration in coupling unit. Scheduled for inspection at next halt." },
];

const dayOffset = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0,10); };

const SEED_MAINTENANCE = [
  { id:"MNT-001", wagon:"WGN-4056", type:"Brake Inspection",    priority:"Critical", scheduledDate:dayOffset(-3), tech:"Ramesh Kumar",   status:"Overdue",     notes:"Replace worn brake pads on all axles" },
  { id:"MNT-002", wagon:"WGN-2187", type:"Wheel Alignment",     priority:"High",     scheduledDate:dayOffset(-1), tech:"Sanjay Mishra",  status:"Overdue",     notes:"Wheel flange thickness below threshold" },
  { id:"MNT-003", wagon:"WGN-3301", type:"Routine Check",       priority:"Low",      scheduledDate:dayOffset(-5), tech:"Priya Singh",    status:"Completed",   notes:"Monthly routine — all clear" },
  { id:"MNT-004", wagon:"WGN-6613", type:"Coupler Replacement", priority:"High",     scheduledDate:dayOffset(1),  tech:"Anil Verma",     status:"Pending",     notes:"Coupler pin shows stress fractures" },
  { id:"MNT-005", wagon:"WGN-5774", type:"GPS Unit Repair",     priority:"Medium",   scheduledDate:dayOffset(0),  tech:"Deepa Nair",     status:"In Progress", notes:"GPS intermittent signal loss" },
  { id:"MNT-006", wagon:"WGN-1042", type:"Oil & Lubrication",   priority:"Low",      scheduledDate:dayOffset(3),  tech:"Suresh Patel",   status:"Upcoming",    notes:"Scheduled quarterly lubrication" },
  { id:"MNT-007", wagon:"WGN-7890", type:"Air Brake Test",      priority:"Medium",   scheduledDate:dayOffset(-4), tech:"Kavitha Rajan",  status:"Completed",   notes:"Air brake pressure test — passed" },
  { id:"MNT-008", wagon:"WGN-8421", type:"Full Overhaul",       priority:"Critical", scheduledDate:dayOffset(2),  tech:"Mohan Das",      status:"Upcoming",    notes:"Periodic full overhaul — 50k km service" },
  { id:"MNT-009", wagon:"WGN-2187", type:"Axle Bearing Service",priority:"Critical", scheduledDate:dayOffset(0),  tech:"Ramesh Kumar",   status:"In Progress", notes:"Bearing temp 78°C — above threshold" },
  { id:"MNT-010", wagon:"WGN-4056", type:"Temp Sensor Check",   priority:"Medium",   scheduledDate:dayOffset(5),  tech:"Deepa Nair",     status:"Upcoming",    notes:"Sensor calibration required" },
];

const SEED_TASKS = [
  { id:1, text:"Inspect Wagon WGN-1042 at Kota Jn.",    priority:"High",   done:false },
  { id:2, text:"Update GPS status for WGN-2187",         priority:"Medium", done:false },
  { id:3, text:"Verify cargo load — WGN-3301",           priority:"Low",    done:true  },
  { id:4, text:"Brake inspection follow-up — WGN-4056",  priority:"High",   done:false },
  { id:5, text:"Route deviation review — WGN-5774",      priority:"Medium", done:true  },
];

// ── Context ───────────────────────────────────────────────────────────────────
const OperatorDataContext = createContext(null);

export function OperatorDataProvider({ children }) {
  const [wagons,      setWagons]      = useState(SEED_WAGONS);
  const [cargo,       setCargo]       = useState(SEED_CARGO);
  const [alerts,      setAlerts]      = useState(SEED_ALERTS);
  const [maintenance, setMaintenance] = useState(SEED_MAINTENANCE);
  const [tasks,       setTasks]       = useState(SEED_TASKS);
  const [resolvedAlerts, setResolved] = useState([]);
  const tickRef = useRef(0);

  // ── Live speed simulation every 4 s ──────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const now = new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
      setWagons(ws => ws.map(w => {
        if (w.gps !== "Active") return w;
        const delta = (Math.random() * 8 - 4) | 0;
        return { ...w, speed: Math.max(0, Math.min(120, w.speed + delta)), lastPing: now };
      }));
    }, 4000);
    return () => clearInterval(id);
  }, []);

  // ── Wagon mutations ───────────────────────────────────────────────────────
  const updateWagonStatus = useCallback((id, status) => {
    setWagons(ws => ws.map(w => w.id === id ? { ...w, status } : w));
  }, []);

  // ── Alert mutations ───────────────────────────────────────────────────────
  const resolveAlert = useCallback((id) => {
    const now = new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
    setAlerts(prev => {
      const item = prev.find(a => a.id === id);
      if (item) setResolved(r => [{ ...item, resolvedAt: now }, ...r]);
      return prev.filter(a => a.id !== id);
    });
  }, []);

  const addAlert = useCallback((alert) => {
    setAlerts(prev => [alert, ...prev]);
  }, []);

  // ── Maintenance mutations ─────────────────────────────────────────────────
  const advanceMaintenance = useCallback((id) => {
    const NEXT = { Overdue:"In Progress", Pending:"In Progress", "In Progress":"Completed" };
    setMaintenance(prev => prev.map(m =>
      m.id === id ? { ...m, status: NEXT[m.status] || m.status } : m
    ));
  }, []);

  const scheduleMaintenance = useCallback((form) => {
    const id = `MNT-${String(Date.now()).slice(-4)}`;
    setMaintenance(prev => [{ id, status:"Upcoming", ...form }, ...prev]);
    return id;
  }, []);

  const updateMaintenance = useCallback((id, changes) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, ...changes } : m));
  }, []);

  const deleteMaintenance = useCallback((id) => {
    setMaintenance(prev => prev.filter(m => m.id !== id));
  }, []);

  // ── Task mutations ────────────────────────────────────────────────────────
  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  // ── Cargo mutations ───────────────────────────────────────────────────────
  const updateCargo = useCallback((wagonId, changes) => {
    setCargo(prev => prev.map(c => c.wagon === wagonId ? { ...c, ...changes } : c));
  }, []);

  // ── Derived stats (recomputed each render from live state) ────────────────
  const stats = {
    totalWagons:    wagons.length,
    onTime:         wagons.filter(w => w.status === "On Time").length,
    delayed:        wagons.filter(w => w.status === "Delayed").length,
    maintenance:    wagons.filter(w => w.status === "Maintenance").length,
    gpsActive:      wagons.filter(w => w.gps === "Active").length,
    gpsOffline:     wagons.filter(w => w.gps === "Offline").length,
    avgSpeed:       Math.round(wagons.filter(w=>w.speed>0).reduce((s,w)=>s+w.speed,0) / (wagons.filter(w=>w.speed>0).length||1)),
    avgHealth:      Math.round(wagons.reduce((s,w)=>s+w.health,0) / wagons.length),
    activeAlerts:   alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === "Critical").length,
    pendingMaint:   maintenance.filter(m => m.status === "Pending" || m.status === "Overdue").length,
    overdueMaint:   maintenance.filter(m => m.status === "Overdue").length,
    completedMaint: maintenance.filter(m => m.status === "Completed").length,
    criticalCargo:  cargo.filter(c => c.status === "Critical").length,
    tasksDone:      tasks.filter(t => t.done).length,
    tasksPending:   tasks.filter(t => !t.done).length,
  };

  return (
    <OperatorDataContext.Provider value={{
      // state
      wagons, cargo, alerts, resolvedAlerts, maintenance, tasks,
      // computed
      stats,
      // mutations
      updateWagonStatus,
      resolveAlert, addAlert,
      advanceMaintenance, scheduleMaintenance, updateMaintenance, deleteMaintenance,
      toggleTask,
      updateCargo,
    }}>
      {children}
    </OperatorDataContext.Provider>
  );
}

export const useOperatorData = () => {
  const ctx = useContext(OperatorDataContext);
  if (!ctx) throw new Error("useOperatorData must be inside OperatorDataProvider");
  return ctx;
};
