const ZONE_NAMES = {
  NR: "North Railway", SR: "South Railway", ER: "East Railway",
  WR: "West Railway",  CR: "Central Railway", NER: "North East Railway",
  NWR: "North Western Railway", SER: "South Eastern Railway",
  SWR: "South Western Railway", SCR: "South Central Railway",
};

const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const toDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

const titleCase = (value) =>
  String(value || "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()
    .replace(/\b\w/g, c => c.toUpperCase());

const deriveGpsStatus = ({ status, gpsLatitude, gpsLongitude, speed }) => {
  const hasCoords = Number.isFinite(gpsLatitude) && Number.isFinite(gpsLongitude) &&
    (Math.abs(gpsLatitude) > 0.0001 || Math.abs(gpsLongitude) > 0.0001);
  if (!hasCoords || status === "Maintenance") return "Inactive";
  if (status === "Delayed" || speed <= 10) return "Weak";
  return "Active";
};

const deriveLoadStatus = ({ currentLoad, capacity }) => {
  if (currentLoad <= 0) return "Empty";
  if (!capacity) return currentLoad > 0 ? "Loaded" : "Empty";
  const ratio = (currentLoad / capacity) * 100;
  if (ratio >= 85) return "Loaded";
  if (ratio >= 35) return "Partial";
  return "Light";
};

const deriveDelayMinutes = ({ status, speed, loadPercentage, temperature }) => {
  if (status !== "Delayed") return 0;
  const slowPenalty = Math.max(0, 40 - speed);
  const loadPenalty = loadPercentage >= 90 ? 35 : loadPercentage >= 75 ? 20 : 10;
  const tempPenalty = temperature >= 60 ? 25 : temperature >= 45 ? 10 : 0;
  return Math.max(15, slowPenalty + loadPenalty + tempPenalty);
};

const deriveHealthScore = ({ status, gpsStatus, temperature, loadPercentage, speed }) => {
  let score = 100;
  if (status === "Maintenance") score -= 42;
  if (status === "Delayed")     score -= 18;
  if (status === "Idle")        score -= 8;
  if (gpsStatus === "Weak")     score -= 10;
  if (gpsStatus === "Inactive") score -= 20;
  if (temperature >= 60)        score -= 18;
  else if (temperature >= 45)   score -= 8;
  if (loadPercentage >= 95)     score -= 16;
  else if (loadPercentage >= 85) score -= 6;
  if (speed >= 95)              score -= 4;
  return clamp(Math.round(score), 12, 100);
};

const deriveHealthLabel = (score) => {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Warning";
  return "Critical";
};

const deriveMaintenanceStatus = ({ status, health, temperature, loadPercentage, gpsStatus }) => {
  if (status === "Maintenance") return "Pending";
  if (health === "Critical" || temperature >= 60 || loadPercentage >= 95) return "Recommended";
  if (gpsStatus !== "Active") return "Inspection Due";
  return "Clear";
};

const deriveAlertReasons = ({ status, temperature, loadPercentage, gpsStatus, health, maintenanceStatus }) => {
  const reasons = [];
  if (status === "Delayed")          reasons.push("Delay");
  if (gpsStatus !== "Active")        reasons.push("GPS");
  if (temperature >= 60)             reasons.push("Temperature");
  if (loadPercentage >= 95)          reasons.push("Overload");
  if (maintenanceStatus !== "Clear") reasons.push("Maintenance");
  if (health === "Critical")         reasons.push("Health");
  return Array.from(new Set(reasons));
};

export const resolveSessionZone = ({ admin, analyst, operator } = {}) =>
  admin?.zone || analyst?.zone || operator?.zone || null;

export const normalizeWagonRecord = (rawWagon) => {
  const status       = titleCase(rawWagon.status || "Idle");
  const capacity     = toNumber(rawWagon.capacity);
  const currentLoad  = toNumber(rawWagon.currentLoad);
  const gpsLatitude  = Number.isFinite(Number(rawWagon.gpsLatitude))  ? Number(rawWagon.gpsLatitude)  : null;
  const gpsLongitude = Number.isFinite(Number(rawWagon.gpsLongitude)) ? Number(rawWagon.gpsLongitude) : null;
  const speed        = toNumber(rawWagon.speed);
  const temperature  = toNumber(rawWagon.temperature);
  const loadPercentage = capacity > 0 ? Math.min(100, Math.round((currentLoad / capacity) * 100)) : 0;
  const gpsStatus      = deriveGpsStatus({ status, gpsLatitude, gpsLongitude, speed });
  const loadStatus     = deriveLoadStatus({ currentLoad, capacity });
  const delayMinutes   = deriveDelayMinutes({ status, speed, loadPercentage, temperature });
  const healthScore    = deriveHealthScore({ status, gpsStatus, temperature, loadPercentage, speed });
  const wagonHealth    = deriveHealthLabel(healthScore);
  const maintenanceStatus = deriveMaintenanceStatus({ status, health: wagonHealth, temperature, loadPercentage, gpsStatus });
  const alertReasons   = deriveAlertReasons({ status, temperature, loadPercentage, gpsStatus, health: wagonHealth, maintenanceStatus });
  const zone     = rawWagon.zone || rawWagon.zoneCode || "NR";
  const zoneName = rawWagon.zoneName || ZONE_NAMES[zone] || `${zone} Railway`;
  const station  = rawWagon.currentStation || "Unknown";
  const destination = rawWagon.destination || rawWagon.destinationStation || "N/A";

  return {
    _id: rawWagon._id,
    id: rawWagon.wagonId,
    wagonId: rawWagon.wagonId,
    wagonNumber: rawWagon.wagonNumber || rawWagon.wagonId || "N/A",
    wagonType: rawWagon.wagonType || "Unknown",
    zone, zoneName,
    division: rawWagon.division || "",
    station,
    currentLocation: rawWagon.division || station || "Unknown",
    destination,
    route: station && destination ? `${station} -> ${destination}` : station || destination || "N/A",
    cargoType: rawWagon.cargoType || "Unassigned",
    capacity, currentLoad, loadPercentage, loadStatus,
    gpsLatitude, gpsLongitude, gpsStatus,
    speed, status,
    temperature,
    lastUpdated: rawWagon.lastUpdated || rawWagon.updatedAt || rawWagon.createdAt || null,
    wagonHealth, healthScore, maintenanceStatus,
    aiAlert: alertReasons.length > 0 ? "Yes" : "No",
    alertReasons,
    alertCount: alertReasons.length,
    delayStatus: status === "Delayed" ? "Delayed" : status === "Maintenance" ? "Maintenance" : "On Time",
    delayMinutes,
    isLoaded: currentLoad > 0,
  };
};

export const filterWagonsByDateRange = (wagons, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return wagons;
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
  const to   = dateTo   ? new Date(`${dateTo}T23:59:59.999`) : null;
  return wagons.filter(wagon => {
    const updated = toDate(wagon.lastUpdated);
    if (!updated) return false;
    if (from && updated < from) return false;
    if (to   && updated > to)   return false;
    return true;
  });
};

export const buildWagonSummary = (wagons) => {
  const total       = wagons.length;
  const active      = wagons.filter(w => !["Maintenance", "Idle"].includes(w.status)).length;
  const delayed     = wagons.filter(w => w.status === "Delayed").length;
  const maintenance = wagons.filter(w => w.status === "Maintenance").length;
  const alerts      = wagons.reduce((t, w) => t + w.alertCount, 0);
  return { total, active, delayed, maintenance, alerts };
};

export const getWagonFilterOptions = (wagons) => ({
  gpsStatuses:         Array.from(new Set(wagons.map(w => w.gpsStatus))).sort(),
  healthStatuses:      Array.from(new Set(wagons.map(w => w.wagonHealth))).sort(),
  maintenanceStatuses: Array.from(new Set(wagons.map(w => w.maintenanceStatus))).sort(),
  cargoTypes:          Array.from(new Set(wagons.map(w => w.cargoType))).sort(),
  stations:            Array.from(new Set(wagons.map(w => w.station))).sort(),
});
