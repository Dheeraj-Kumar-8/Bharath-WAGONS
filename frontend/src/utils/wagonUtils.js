const ZONE_NAMES = {
  NR: "North Railway",
  SR: "South Railway",
  ER: "East Railway",
  WR: "West Railway",
  CR: "Central Railway",
  NER: "North East Railway",
  NWR: "North Western Railway",
  SER: "South Eastern Railway",
  SWR: "South Western Railway",
  SCR: "South Central Railway",
};

const toNumber = (value, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const titleCase = (value) =>
  String(value || "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const formatDateLabel = (value, options = {}) => {
  const date = value instanceof Date ? value : toDate(value);
  if (!date) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
};

export const formatDateTimeLabel = (value) => {
  const date = value instanceof Date ? value : toDate(value);
  if (!date) return "N/A";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDuration = (minutes) => {
  if (!minutes) return "0m";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}h ${mins}m`;
};

const deriveGpsStatus = ({ status, gpsLatitude, gpsLongitude, speed }) => {
  const hasCoords =
    Number.isFinite(gpsLatitude) &&
    Number.isFinite(gpsLongitude) &&
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
  if (status === "Delayed") score -= 18;
  if (status === "Idle") score -= 8;

  if (gpsStatus === "Weak") score -= 10;
  if (gpsStatus === "Inactive") score -= 20;

  if (temperature >= 60) score -= 18;
  else if (temperature >= 45) score -= 8;

  if (loadPercentage >= 95) score -= 16;
  else if (loadPercentage >= 85) score -= 6;

  if (speed >= 95) score -= 4;

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

  if (status === "Delayed") reasons.push("Delay");
  if (gpsStatus !== "Active") reasons.push("GPS");
  if (temperature >= 60) reasons.push("Temperature");
  if (loadPercentage >= 95) reasons.push("Overload");
  if (maintenanceStatus !== "Clear") reasons.push("Maintenance");
  if (health === "Critical") reasons.push("Health");

  return Array.from(new Set(reasons));
};

const buildRouteLabel = (station, destination) => {
  if (station && destination) return `${station} -> ${destination}`;
  return station || destination || "N/A";
};

export const resolveSessionZone = ({ admin, analyst, operator } = {}) =>
  admin?.zone || analyst?.zone || operator?.zone || null;

export const normalizeWagonRecord = (rawWagon) => {
  const status = titleCase(rawWagon.status || "Idle");
  const capacity = toNumber(rawWagon.capacity);
  const currentLoad = toNumber(rawWagon.currentLoad);
  const gpsLatitude = Number.isFinite(Number(rawWagon.gpsLatitude)) ? Number(rawWagon.gpsLatitude) : null;
  const gpsLongitude = Number.isFinite(Number(rawWagon.gpsLongitude)) ? Number(rawWagon.gpsLongitude) : null;
  const speed = toNumber(rawWagon.speed);
  const temperature = toNumber(rawWagon.temperature);
  const loadPercentage = capacity > 0 ? Math.min(100, Math.round((currentLoad / capacity) * 100)) : 0;
  const gpsStatus = deriveGpsStatus({ status, gpsLatitude, gpsLongitude, speed });
  const loadStatus = deriveLoadStatus({ currentLoad, capacity });
  const delayMinutes = deriveDelayMinutes({ status, speed, loadPercentage, temperature });
  const healthScore = deriveHealthScore({ status, gpsStatus, temperature, loadPercentage, speed });
  const wagonHealth = deriveHealthLabel(healthScore);
  const maintenanceStatus = deriveMaintenanceStatus({
    status,
    health: wagonHealth,
    temperature,
    loadPercentage,
    gpsStatus,
  });
  const alertReasons = deriveAlertReasons({
    status,
    temperature,
    loadPercentage,
    gpsStatus,
    health: wagonHealth,
    maintenanceStatus,
  });
  const aiAlert = alertReasons.length > 0 ? "Yes" : "No";
  const lastUpdated = rawWagon.lastUpdated || rawWagon.updatedAt || rawWagon.createdAt || null;
  const station = rawWagon.currentStation || "Unknown";
  const currentLocation = rawWagon.division || station || "Unknown";
  const destination = rawWagon.destination || rawWagon.destinationStation || "N/A";
  const zone = rawWagon.zone || rawWagon.zoneCode || "NR";
  const zoneName = rawWagon.zoneName || ZONE_NAMES[zone] || `${zone} Railway`;
  const wagonNumber = rawWagon.wagonNumber || rawWagon.wagonId || "N/A";
  const cargoType = rawWagon.cargoType || "Unassigned";
  const delayStatus = status === "Delayed" ? "Delayed" : status === "Maintenance" ? "Maintenance" : "On Time";

  return {
    _id: rawWagon._id,
    id: rawWagon.wagonId,
    wagonId: rawWagon.wagonId,
    wagonNumber,
    wagonType: rawWagon.wagonType || "Unknown",
    zone,
    zoneName,
    division: rawWagon.division || "",
    station,
    currentLocation,
    destination,
    route: buildRouteLabel(station, destination),
    cargoType,
    capacity,
    currentLoad,
    loadPercentage,
    loadStatus,
    gpsLatitude,
    gpsLongitude,
    gpsStatus,
    speed,
    status,
    rawStatus: rawWagon.status || "Idle",
    temperature,
    lastUpdated,
    wagonHealth,
    healthScore,
    maintenanceStatus,
    aiAlert,
    alertReasons,
    alertCount: alertReasons.length,
    delayStatus,
    delayMinutes,
    delayTime: formatDuration(delayMinutes),
    isLoaded: currentLoad > 0,
  };
};

const countBy = (wagons, selector) =>
  wagons.reduce((acc, wagon) => {
    const key = selector(wagon);
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

const topEntries = (map, limit = 6) =>
  Object.entries(map)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);

export const buildWagonSummary = (wagons) => {
  const active = wagons.filter((wagon) => !["Maintenance", "Idle"].includes(wagon.status)).length;
  const delayed = wagons.filter((wagon) => wagon.status === "Delayed").length;
  const maintenance = wagons.filter((wagon) => wagon.status === "Maintenance").length;
  const gpsActive = wagons.filter((wagon) => wagon.gpsStatus === "Active").length;
  const gpsWeak = wagons.filter((wagon) => wagon.gpsStatus === "Weak").length;
  const gpsInactive = wagons.filter((wagon) => wagon.gpsStatus === "Inactive").length;
  const alerts = wagons.reduce((total, wagon) => total + wagon.alertCount, 0);
  const loaded = wagons.filter((wagon) => wagon.loadStatus === "Loaded").length;
  const partial = wagons.filter((wagon) => wagon.loadStatus === "Partial").length;
  const empty = wagons.filter((wagon) => wagon.loadStatus === "Empty").length;
  const healthy = wagons.filter((wagon) => wagon.wagonHealth === "Healthy").length;
  const warning = wagons.filter((wagon) => wagon.wagonHealth === "Warning").length;
  const critical = wagons.filter((wagon) => wagon.wagonHealth === "Critical").length;
  const totalLoad = wagons.reduce((total, wagon) => total + wagon.currentLoad, 0);
  const totalCapacity = wagons.reduce((total, wagon) => total + wagon.capacity, 0);
  const activeSpeedWagons = wagons.filter((wagon) => wagon.speed > 0);
  const avgSpeed = activeSpeedWagons.length
    ? Math.round(activeSpeedWagons.reduce((total, wagon) => total + wagon.speed, 0) / activeSpeedWagons.length)
    : 0;
  const avgTemperature = wagons.length
    ? Math.round((wagons.reduce((total, wagon) => total + wagon.temperature, 0) / wagons.length) * 10) / 10
    : 0;
  const avgHealthScore = wagons.length
    ? Math.round(wagons.reduce((total, wagon) => total + wagon.healthScore, 0) / wagons.length)
    : 0;
  const onTimeRate = wagons.length ? Math.round(((wagons.length - delayed - maintenance) / wagons.length) * 1000) / 10 : 0;
  const gpsCoverage = wagons.length ? Math.round((gpsActive / wagons.length) * 1000) / 10 : 0;
  const loadEfficiency = totalCapacity ? Math.round((totalLoad / totalCapacity) * 1000) / 10 : 0;
  const stationDistribution = countBy(wagons, (wagon) => wagon.station);
  const locationDistribution = countBy(wagons, (wagon) => wagon.currentLocation);
  const cargoDistribution = countBy(
    wagons.filter((wagon) => wagon.cargoType && wagon.cargoType !== "Unassigned"),
    (wagon) => wagon.cargoType
  );
  const statusDistribution = countBy(wagons, (wagon) => wagon.status);
  const maintenanceDistribution = countBy(wagons, (wagon) => wagon.maintenanceStatus);
  const alertDistribution = countBy(
    wagons.flatMap((wagon) => wagon.alertReasons.map((reason) => ({ reason }))),
    (entry) => entry.reason
  );
  const latestUpdated = wagons
    .map((wagon) => toDate(wagon.lastUpdated))
    .filter(Boolean)
    .sort((a, b) => b - a)[0] || null;

  return {
    total: wagons.length,
    active,
    delayed,
    maintenance,
    gpsActive,
    gpsWeak,
    gpsInactive,
    alerts,
    loaded,
    partial,
    empty,
    healthy,
    warning,
    critical,
    totalLoad: Math.round(totalLoad * 10) / 10,
    totalCapacity,
    avgSpeed,
    avgTemperature,
    avgHealthScore,
    onTimeRate,
    gpsCoverage,
    loadEfficiency,
    latestUpdated,
    stationDistribution,
    locationDistribution,
    cargoDistribution,
    statusDistribution,
    maintenanceDistribution,
    alertDistribution,
    topStations: topEntries(stationDistribution),
    topLocations: topEntries(locationDistribution),
    topCargoTypes: topEntries(cargoDistribution),
    topAlerts: topEntries(alertDistribution),
  };
};

export const filterWagonsByDateRange = (wagons, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return wagons;
  const from = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
  const to = dateTo ? new Date(`${dateTo}T23:59:59.999`) : null;

  return wagons.filter((wagon) => {
    const updated = toDate(wagon.lastUpdated);
    if (!updated) return false;
    if (from && updated < from) return false;
    if (to && updated > to) return false;
    return true;
  });
};

export const getWagonFilterOptions = (wagons) => ({
  gpsStatuses: Array.from(new Set(wagons.map((wagon) => wagon.gpsStatus))).sort(),
  healthStatuses: Array.from(new Set(wagons.map((wagon) => wagon.wagonHealth))).sort(),
  maintenanceStatuses: Array.from(new Set(wagons.map((wagon) => wagon.maintenanceStatus))).sort(),
  cargoTypes: Array.from(new Set(wagons.map((wagon) => wagon.cargoType))).sort(),
  delayStatuses: Array.from(new Set(wagons.map((wagon) => wagon.delayStatus))).sort(),
  stations: Array.from(new Set(wagons.map((wagon) => wagon.station))).sort(),
  locations: Array.from(new Set(wagons.map((wagon) => wagon.currentLocation))).sort(),
});

const compareDates = (left, right) => {
  const leftDate = toDate(left);
  const rightDate = toDate(right);
  const leftValue = leftDate ? leftDate.getTime() : 0;
  const rightValue = rightDate ? rightDate.getTime() : 0;
  return leftValue - rightValue;
};

export const sortWagons = (wagons, sortConfig) => {
  if (!sortConfig?.key) return wagons;
  const { key, direction = "asc", type = "string" } = sortConfig;
  const multiplier = direction === "desc" ? -1 : 1;

  return [...wagons].sort((left, right) => {
    const leftValue = left[key];
    const rightValue = right[key];

    let result = 0;
    if (type === "number") {
      result = toNumber(leftValue) - toNumber(rightValue);
    } else if (type === "date") {
      result = compareDates(leftValue, rightValue);
    } else {
      result = String(leftValue ?? "").localeCompare(String(rightValue ?? ""), undefined, {
        numeric: true,
        sensitivity: "base",
      });
    }

    return result * multiplier;
  });
};

export const WAGON_REPORT_COLUMNS = [
  { key: "wagonId", label: "Wagon ID", type: "string", exportValue: (wagon) => wagon.wagonId },
  { key: "wagonNumber", label: "Wagon Number", type: "string", exportValue: (wagon) => wagon.wagonNumber },
  { key: "zone", label: "Zone", type: "string", exportValue: (wagon) => wagon.zone },
  { key: "currentLocation", label: "Current Location", type: "string", exportValue: (wagon) => wagon.currentLocation },
  { key: "station", label: "Station", type: "string", exportValue: (wagon) => wagon.station },
  { key: "gpsLatitude", label: "Latitude", type: "number", exportValue: (wagon) => wagon.gpsLatitude ?? "N/A" },
  { key: "gpsLongitude", label: "Longitude", type: "number", exportValue: (wagon) => wagon.gpsLongitude ?? "N/A" },
  { key: "speed", label: "Speed", type: "number", exportValue: (wagon) => wagon.speed },
  { key: "cargoType", label: "Cargo Type", type: "string", exportValue: (wagon) => wagon.cargoType },
  { key: "loadStatus", label: "Load Status", type: "string", exportValue: (wagon) => wagon.loadStatus },
  { key: "gpsStatus", label: "GPS Status", type: "string", exportValue: (wagon) => wagon.gpsStatus },
  { key: "wagonHealth", label: "Wagon Health", type: "string", exportValue: (wagon) => wagon.wagonHealth },
  { key: "temperature", label: "Temperature", type: "number", exportValue: (wagon) => wagon.temperature },
  { key: "delayStatus", label: "Delay Status", type: "string", exportValue: (wagon) => wagon.delayStatus },
  { key: "delayTime", label: "Delay Time", type: "string", exportValue: (wagon) => wagon.delayTime },
  { key: "maintenanceStatus", label: "Maintenance Status", type: "string", exportValue: (wagon) => wagon.maintenanceStatus },
  { key: "aiAlert", label: "AI Alert", type: "string", exportValue: (wagon) => wagon.aiAlert },
  { key: "lastUpdated", label: "Last Updated", type: "date", exportValue: (wagon) => formatDateTimeLabel(wagon.lastUpdated) },
];

export const buildWagonExportRows = (wagons, columns = WAGON_REPORT_COLUMNS) =>
  wagons.map((wagon) => columns.map((column) => column.exportValue(wagon)));

export const buildStationActivityRows = (wagons) => {
  const arrivals = countBy(wagons, (wagon) => wagon.station);
  const departures = countBy(wagons, (wagon) => wagon.destination);

  const stations = Array.from(new Set([...Object.keys(arrivals), ...Object.keys(departures)]));

  return stations
    .map((station) => ({
      station,
      arrivals: arrivals[station] || 0,
      departures: departures[station] || 0,
    }))
    .sort((left, right) => right.arrivals + right.departures - (left.arrivals + left.departures))
    .slice(0, 6);
};

export const buildStatusTrendRows = (wagons) => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      active: 0,
      delayed: 0,
      onTime: 0,
    };
  });

  const dayMap = new Map(days.map((entry) => [entry.key, entry]));

  wagons.forEach((wagon) => {
    const updated = toDate(wagon.lastUpdated);
    const key = updated ? updated.toISOString().slice(0, 10) : days[days.length - 1].key;
    const bucket = dayMap.get(key) || days[days.length - 1];
    bucket.active += 1;
    if (wagon.delayStatus === "Delayed") bucket.delayed += 1;
    if (wagon.delayStatus === "On Time") bucket.onTime += 1;
  });

  return days.map(({ label, active, delayed, onTime }) => ({ day: label, active, delayed, onTime }));
};

export const buildMonthlyTrendRows = (wagons) => {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return {
      key,
      month: date.toLocaleDateString("en-IN", { month: "short" }),
      wagons: 0,
      cargo: 0,
      alerts: 0,
    };
  });

  const monthMap = new Map(months.map((entry) => [entry.key, entry]));

  wagons.forEach((wagon) => {
    const updated = toDate(wagon.lastUpdated);
    const key = updated
      ? `${updated.getFullYear()}-${String(updated.getMonth() + 1).padStart(2, "0")}`
      : months[months.length - 1].key;
    const bucket = monthMap.get(key) || months[months.length - 1];
    bucket.wagons += 1;
    bucket.cargo += wagon.currentLoad;
    bucket.alerts += wagon.alertCount;
  });

  return months.map(({ month, wagons: totalWagons, cargo, alerts }) => ({
    month,
    wagons: totalWagons,
    cargo: Math.round(cargo),
    alerts,
  }));
};

export const buildAlertDistribution = (wagons) =>
  topEntries(
    countBy(
      wagons.flatMap((wagon) => wagon.alertReasons.map((reason) => ({ reason }))),
      (entry) => entry.reason
    ),
    4
  ).map(([name, value]) => ({ name: `${name} Alert`, value }));

export const buildZonePerformanceRow = (zone, wagons) => {
  const summary = buildWagonSummary(wagons);
  return {
    zone,
    region: ZONE_NAMES[zone] || `${zone} Railway`,
    wagons: summary.total,
    onTime: summary.total ? Math.round(((summary.total - summary.delayed - summary.maintenance) / summary.total) * 1000) / 10 : 0,
    delayed: summary.delayed,
    maint: summary.maintenance,
    perf: Math.max(0, Math.round((summary.onTimeRate + (summary.gpsCoverage || 0)) / 2)),
    avgSpeed: summary.avgSpeed,
    alerts: summary.alerts,
  };
};

export const getZoneName = (zone) => ZONE_NAMES[zone] || `${zone || "Unknown"} Railway`;
