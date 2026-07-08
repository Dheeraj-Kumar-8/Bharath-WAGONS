import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../utils/api";
import { normalizeWagonRecord } from "../utils/wagonUtils";

const OperatorDataContext = createContext(null);

// ── Derive operator-shaped wagon from normalized record ───────────────────────
function toOperatorWagon(w) {
  return {
    id:       w.wagonId,
    route:    w.route,
    location: w.station,
    status:   w.status,
    speed:    w.speed,
    load:     w.loadPercentage,
    type:     w.wagonType,
    cargo:    w.cargoType,
    gps:      w.gpsStatus === "Active" ? "Active" : "Offline",
    health:   w.healthScore,
    eta:      "—",
    zone:     w.zone,
    _raw:     w,
  };
}

// ── Derive cargo record from normalized wagon ─────────────────────────────────
function toCargoRecord(w, idx) {
  const loadPct = w.loadPercentage;
  const cargoStatus =
    w.currentLoad <= 0 ? "Empty" :
    loadPct >= 95      ? "Critical" :
    loadPct >= 80      ? "Warning"  : "Normal";

  return {
    id:          `CGO-${w.zone}${String(idx + 1).padStart(2, "0")}`,
    wagon:       w.wagonId,
    type:        w.cargoType !== "Unassigned" ? w.cargoType : "General Cargo",
    weight:      w.currentLoad,
    capacity:    w.capacity || 1,
    temp:        w.temperature,
    tempLimit:   w.temperature >= 60 ? 60 : w.temperature >= 45 ? 50 : 40,
    status:      cargoStatus,
    destination: w.destination,
    origin:      w.station,
    seal:        w.currentLoad > 0 ? "SEALED" : "OPEN",
    zone:        w.zone,
  };
}

// ── Derive alert records from normalized wagon ────────────────────────────────
const REASON_TYPE = {
  GPS:         "GPS Signal Lost",
  Delay:       "Route Delay Detected",
  Temperature: "Temperature Alert",
  Overload:    "Cargo Overload",
  Maintenance: "Maintenance Required",
  Health:      "Wagon Health Critical",
};

function toAlertRecords(w, seqStart) {
  return w.alertReasons.map((reason, i) => ({
    id:       `ALT-${w.zone}${String(seqStart + i).padStart(2, "0")}`,
    wagon:    w.wagonId,
    type:     REASON_TYPE[reason] || `${reason} Alert`,
    severity: w.wagonHealth === "Critical" ? "Critical"
            : reason === "GPS" || reason === "Delay" ? "High"
            : reason === "Temperature" || reason === "Overload" ? "High"
            : "Medium",
    time:     w.lastUpdated
      ? new Date(w.lastUpdated).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
      : "N/A",
    resolved: false,
    detail:   buildAlertDetail(w, reason),
    zone:     w.zone,
  }));
}

function buildAlertDetail(w, reason) {
  switch (reason) {
    case "GPS":         return `GPS ${w.gpsStatus} on ${w.wagonId} at ${w.station}. Speed: ${w.speed} km/h.`;
    case "Delay":       return `${w.wagonId} delayed en route to ${w.destination}. Speed: ${w.speed} km/h.`;
    case "Temperature": return `Temperature ${w.temperature}°C on ${w.wagonId} at ${w.station}.`;
    case "Overload":    return `Load at ${w.loadPercentage}% capacity on ${w.wagonId}. Inspection needed.`;
    case "Maintenance": return `Maintenance status: ${w.maintenanceStatus} for ${w.wagonId} at ${w.station}.`;
    case "Health":      return `Health score ${w.healthScore}/100 — ${w.wagonId} needs attention at ${w.station}.`;
    default:            return `Alert on ${w.wagonId} at ${w.station}.`;
  }
}

// ── Derive maintenance records from normalized wagon ──────────────────────────
const MAINT_TYPES_BY_REASON = {
  GPS:         "GPS Unit Repair",
  Delay:       "Route Inspection",
  Temperature: "Temp Sensor Calibration",
  Overload:    "Axle Load Inspection",
  Maintenance: "Scheduled Maintenance",
  Health:      "Full Health Check",
};

function toMaintenanceRecords(w, seqStart) {
  const needsMaint = w.maintenanceStatus !== "Clear";
  if (!needsMaint) return [];
  const reason = w.alertReasons[0] || "Maintenance";
  const today = new Date().toISOString().slice(0, 10);
  const priority =
    w.wagonHealth === "Critical" ? "Critical" :
    w.maintenanceStatus === "Pending" ? "High" : "Medium";
  return [{
    id:            `MNT-${w.zone}${String(seqStart).padStart(2, "0")}`,
    wagon:         w.wagonId,
    type:          MAINT_TYPES_BY_REASON[reason] || "Routine Check",
    priority,
    scheduledDate: today,
    tech:          "Assigned Technician",
    status:        w.status === "Maintenance" ? "In Progress" : "Pending",
    notes:         buildAlertDetail(w, reason),
    zone:          w.zone,
  }];
}

const SEED_TASKS = [
  { id: 1, text: "Inspect wagon at first scheduled halt",    priority: "High",   done: false },
  { id: 2, text: "Update GPS status for delayed wagons",     priority: "Medium", done: false },
  { id: 3, text: "Verify cargo seal on all assigned wagons", priority: "Low",    done: true  },
  { id: 4, text: "Follow up on overdue maintenance tickets", priority: "High",   done: false },
  { id: 5, text: "File daily operations report",             priority: "Medium", done: true  },
];

export function OperatorDataProvider({ children }) {
  const { operator } = useAuth();
  const zone = operator?.zone;

  const [rawWagons,   setRawWagons]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [tasks,       setTasks]       = useState(SEED_TASKS);
  const [resolvedAlerts, setResolved] = useState([]);
  // Local overrides: wagonId → status
  const [statusOverrides, setStatusOverrides] = useState({});
  // Local resolved alert ids
  const [resolvedIds, setResolvedIds] = useState(new Set());
  // Local added maintenance tasks
  const [extraMaint, setExtraMaint]   = useState([]);
  const [maintOverrides, setMaintOverrides] = useState({});

  // ── Fetch real wagons from API ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    api.getWagons()
      .then(res => {
        const all = (res.data || []).map(normalizeWagonRecord);
        setRawWagons(zone ? all.filter(w => w.zone === zone) : all);
      })
      .catch(err => console.warn("[OperatorDataContext] fetch failed:", err.message))
      .finally(() => setLoading(false));
  }, [zone]);

  // ── Derive operator wagons (apply status overrides) ───────────────────────
  const wagons = useMemo(() =>
    rawWagons.map(w => {
      const overrideStatus = statusOverrides[w.wagonId];
      const effective = overrideStatus ? { ...w, status: overrideStatus } : w;
      return toOperatorWagon(effective);
    }),
  [rawWagons, statusOverrides]);

  // ── Derive cargo from real wagons ─────────────────────────────────────────
  const cargo = useMemo(() =>
    rawWagons.map((w, i) => toCargoRecord(w, i)),
  [rawWagons]);

  // ── Derive alerts from real wagons (apply resolved overrides) ────────────
  const alerts = useMemo(() => {
    const all = [];
    let seq = 1;
    rawWagons.forEach(w => {
      const records = toAlertRecords(w, seq);
      seq += records.length;
      records.forEach(a => {
        if (!resolvedIds.has(a.id)) all.push(a);
      });
    });
    return all;
  }, [rawWagons, resolvedIds]);

  // ── Derive maintenance from real wagons (apply overrides + extras) ────────
  const maintenance = useMemo(() => {
    const base = [];
    let seq = 1;
    rawWagons.forEach(w => {
      const records = toMaintenanceRecords(w, seq);
      seq += records.length || 1;
      records.forEach(m => {
        const override = maintOverrides[m.id];
        base.push(override ? { ...m, ...override } : m);
      });
    });
    return [...extraMaint, ...base];
  }, [rawWagons, maintOverrides, extraMaint]);

  // ── Stats derived from real data ──────────────────────────────────────────
  const stats = useMemo(() => ({
    totalWagons:    wagons.length,
    onTime:         wagons.filter(w => w.status === "On Time" || w.status === "Running").length,
    delayed:        wagons.filter(w => w.status === "Delayed").length,
    maintenance:    wagons.filter(w => w.status === "Maintenance").length,
    gpsActive:      wagons.filter(w => w.gps === "Active").length,
    gpsOffline:     wagons.filter(w => w.gps === "Offline").length,
    avgSpeed:       wagons.filter(w => w.speed > 0).length
      ? Math.round(wagons.filter(w => w.speed > 0).reduce((s, w) => s + w.speed, 0) / wagons.filter(w => w.speed > 0).length)
      : 0,
    avgHealth:      wagons.length
      ? Math.round(wagons.reduce((s, w) => s + w.health, 0) / wagons.length)
      : 0,
    activeAlerts:   alerts.length,
    criticalAlerts: alerts.filter(a => a.severity === "Critical").length,
    pendingMaint:   maintenance.filter(m => m.status === "Pending" || m.status === "Overdue").length,
    overdueMaint:   maintenance.filter(m => m.status === "Overdue").length,
    completedMaint: maintenance.filter(m => m.status === "Completed").length,
    criticalCargo:  cargo.filter(c => c.status === "Critical").length,
    tasksDone:      tasks.filter(t => t.done).length,
    tasksPending:   tasks.filter(t => !t.done).length,
    loading,
  }), [wagons, alerts, maintenance, cargo, tasks, loading]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const updateWagonStatus = useCallback((id, status) => {
    setStatusOverrides(prev => ({ ...prev, [id]: status }));
  }, []);

  const resolveAlert = useCallback((id) => {
    const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const item = alerts.find(a => a.id === id);
    if (item) setResolved(r => [{ ...item, resolvedAt: now }, ...r]);
    setResolvedIds(prev => new Set([...prev, id]));
  }, [alerts]);

  const addAlert = useCallback((alert) => {
    // No-op for real data — alerts are derived from wagons
  }, []);

  const advanceMaintenance = useCallback((id) => {
    const NEXT = { Overdue: "In Progress", Pending: "In Progress", "In Progress": "Completed" };
    setMaintOverrides(prev => {
      const current = maintenance.find(m => m.id === id);
      if (!current) return prev;
      return { ...prev, [id]: { status: NEXT[current.status] || current.status } };
    });
    setExtraMaint(prev => prev.map(m =>
      m.id === id ? { ...m, status: NEXT[m.status] || m.status } : m
    ));
  }, [maintenance]);

  const scheduleMaintenance = useCallback((form) => {
    const id = `MNT-${String(Date.now()).slice(-5)}`;
    setExtraMaint(prev => [{ id, status: "Upcoming", ...form }, ...prev]);
    return id;
  }, []);

  const updateMaintenance = useCallback((id, changes) => {
    setMaintOverrides(prev => ({ ...prev, [id]: { ...(prev[id] || {}), ...changes } }));
    setExtraMaint(prev => prev.map(m => m.id === id ? { ...m, ...changes } : m));
  }, []);

  const deleteMaintenance = useCallback((id) => {
    setExtraMaint(prev => prev.filter(m => m.id !== id));
    setMaintOverrides(prev => { const n = { ...prev }; delete n[id]; return n; });
  }, []);

  const toggleTask = useCallback((id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []);

  const updateCargo = useCallback(() => {
    // Cargo is derived from real wagons — no local override needed
  }, []);

  return (
    <OperatorDataContext.Provider value={{
      wagons, cargo, alerts, resolvedAlerts, maintenance, tasks, stats, loading,
      updateWagonStatus, resolveAlert, addAlert,
      advanceMaintenance, scheduleMaintenance, updateMaintenance, deleteMaintenance,
      toggleTask, updateCargo,
    }}>
      {children}
    </OperatorDataContext.Provider>
  );
}

export const useOperatorData = () => useContext(OperatorDataContext);
