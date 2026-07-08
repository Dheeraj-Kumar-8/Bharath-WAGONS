import Wagon from "../models/Wagon.js";
import Alert from "../models/Alert.js";

// ── Same derivation logic as the frontend wagonUtils ─────────────────────────

const REASON_LABEL = {
  GPS:         "GPS Signal Lost",
  Delay:       "Route Delay Detected",
  Temperature: "Temperature Alert",
  Overload:    "Cargo Overload",
  Maintenance: "Maintenance Required",
  Health:      "Wagon Health Critical",
};

function deriveGpsStatus({ status, gpsLatitude, gpsLongitude, speed }) {
  const hasCoords =
    isFinite(gpsLatitude) && isFinite(gpsLongitude) &&
    (Math.abs(gpsLatitude) > 0.0001 || Math.abs(gpsLongitude) > 0.0001);
  if (!hasCoords || status === "Maintenance") return "Inactive";
  if (status === "Delayed" || speed <= 10) return "Weak";
  return "Active";
}

function deriveHealthScore({ status, gpsStatus, temperature, loadPercentage, speed }) {
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
  return Math.min(100, Math.max(12, Math.round(score)));
}

function deriveHealthLabel(score) {
  if (score >= 80) return "Healthy";
  if (score >= 60) return "Warning";
  return "Critical";
}

function deriveMaintenanceStatus({ status, health, temperature, loadPercentage, gpsStatus }) {
  if (status === "Maintenance") return "Pending";
  if (health === "Critical" || temperature >= 60 || loadPercentage >= 95) return "Recommended";
  if (gpsStatus !== "Active") return "Inspection Due";
  return "Clear";
}

function deriveAlertReasons({ status, temperature, loadPercentage, gpsStatus, health, maintenanceStatus }) {
  const reasons = [];
  if (status === "Delayed")          reasons.push("Delay");
  if (gpsStatus !== "Active")        reasons.push("GPS");
  if (temperature >= 60)             reasons.push("Temperature");
  if (loadPercentage >= 95)          reasons.push("Overload");
  if (maintenanceStatus !== "Clear") reasons.push("Maintenance");
  if (health === "Critical")         reasons.push("Health");
  return [...new Set(reasons)];
}

function derivePriority(wagonHealth, gpsStatus, temperature, loadPercentage, maintenanceStatus, reason) {
  if (wagonHealth === "Critical") return "Critical";
  if (reason === "GPS" && gpsStatus === "Inactive") return "High";
  if (reason === "Temperature" && temperature >= 60) return "Critical";
  if (reason === "Overload" && loadPercentage >= 95) return "High";
  if (reason === "Maintenance" && maintenanceStatus === "Pending") return "Medium";
  if (wagonHealth === "Warning") return "High";
  return "Medium";
}

function deriveDesc(wagon, reason) {
  switch (reason) {
    case "GPS":
      return `GPS ${wagon.gpsStatus} on wagon ${wagon.wagonId} at ${wagon.currentStation}. Last known speed: ${wagon.speed} km/h.`;
    case "Delay":
      return `Wagon ${wagon.wagonId} is delayed on route to ${wagon.destination}. Current speed: ${wagon.speed} km/h.`;
    case "Temperature":
      return `Temperature ${wagon.temperature}°C exceeds safe threshold on wagon ${wagon.wagonId} at ${wagon.currentStation}.`;
    case "Overload":
      return `Cargo load at ${wagon.loadPercentage}% of capacity on wagon ${wagon.wagonId}. Inspection recommended.`;
    case "Maintenance":
      return `Maintenance status: ${wagon.maintenanceStatus} for wagon ${wagon.wagonId} at ${wagon.currentStation}.`;
    case "Health":
      return `Health score ${wagon.healthScore}/100 — wagon ${wagon.wagonId} requires immediate attention at ${wagon.currentStation}.`;
    default:
      return `Alert on wagon ${wagon.wagonId} at ${wagon.currentStation}.`;
  }
}

function enrichWagon(raw) {
  const capacity     = Number(raw.capacity)    || 0;
  const currentLoad  = Number(raw.currentLoad) || 0;
  const speed        = Number(raw.speed)       || 0;
  const temperature  = Number(raw.temperature) || 0;
  const loadPercentage = capacity > 0 ? Math.min(100, Math.round((currentLoad / capacity) * 100)) : 0;
  const gpsStatus    = deriveGpsStatus({ status: raw.status, gpsLatitude: raw.gpsLatitude, gpsLongitude: raw.gpsLongitude, speed });
  const healthScore  = deriveHealthScore({ status: raw.status, gpsStatus, temperature, loadPercentage, speed });
  const wagonHealth  = deriveHealthLabel(healthScore);
  const maintenanceStatus = deriveMaintenanceStatus({ status: raw.status, health: wagonHealth, temperature, loadPercentage, gpsStatus });
  return { ...raw.toObject?.() ?? raw, loadPercentage, gpsStatus, healthScore, wagonHealth, maintenanceStatus };
}

// ── POST /api/alerts/generate ─────────────────────────────────────────────────
// Derives alerts from all wagons (or a specific zone) and upserts them into MongoDB.
export const generateAlerts = async (req, res, next) => {
  try {
    const { zone } = req.query;
    const filter = zone ? { zone } : {};
    const wagons = await Wagon.find(filter);

    let seq = 1;
    const ops = [];

    for (const raw of wagons) {
      const wagon = enrichWagon(raw);
      const reasons = deriveAlertReasons({
        status: wagon.status,
        temperature: wagon.temperature,
        loadPercentage: wagon.loadPercentage,
        gpsStatus: wagon.gpsStatus,
        health: wagon.wagonHealth,
        maintenanceStatus: wagon.maintenanceStatus,
      });

      for (const reason of reasons) {
        const alertId = `ALT-${wagon.zone}-${wagon.wagonId}-${reason}`;
        const priority = derivePriority(
          wagon.wagonHealth, wagon.gpsStatus, wagon.temperature,
          wagon.loadPercentage, wagon.maintenanceStatus, reason
        );
        const status = wagon.status === "Maintenance" ? "Pending" : "Active";

        ops.push({
          updateOne: {
            filter: { alertId },
            update: {
              $set: {
                alertId,
                wagonId:  wagon.wagonId,
                wagonRef: raw._id,
                type:     REASON_LABEL[reason] || `${reason} Alert`,
                reason,
                priority,
                zone:     wagon.zone,
                desc:     deriveDesc(wagon, reason),
              },
              // Only set status/resolvedAt if the alert is new (don't overwrite manual resolutions)
              $setOnInsert: { status, resolvedAt: null, resolvedBy: null },
            },
            upsert: true,
          },
        });
        seq++;
      }
    }

    const result = ops.length > 0 ? await Alert.bulkWrite(ops) : { upsertedCount: 0, modifiedCount: 0 };

    console.log(`[generateAlerts] zone=${zone || "all"} wagons=${wagons.length} ops=${ops.length} upserted=${result.upsertedCount} modified=${result.modifiedCount}`);
    res.json({
      success: true,
      message: `Generated ${ops.length} alerts from ${wagons.length} wagons`,
      upserted: result.upsertedCount,
      modified: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/alerts ───────────────────────────────────────────────────────────
// Returns alerts for the requesting user's zone (from JWT) or ?zone= query param.
export const getAlerts = async (req, res, next) => {
  try {
    const zone     = req.query.zone || req.user?.zone || null;
    const priority = req.query.priority || null;
    const status   = req.query.status   || null;
    const wagonId  = req.query.wagonId  || null;

    const filter = {};
    if (zone)     filter.zone     = zone;
    if (priority) filter.priority = priority;
    if (status)   filter.status   = status;
    if (wagonId)  filter.wagonId  = wagonId;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    console.log(`[GET /api/alerts] zone=${zone || "all"} returned ${alerts.length}`);
    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/alerts/stats ─────────────────────────────────────────────────────
export const getAlertStats = async (req, res, next) => {
  try {
    const zone   = req.query.zone || req.user?.zone || null;
    const filter = zone ? { zone } : {};

    const [critical, high, medium, low, active, pending, resolved] = await Promise.all([
      Alert.countDocuments({ ...filter, priority: "Critical" }),
      Alert.countDocuments({ ...filter, priority: "High" }),
      Alert.countDocuments({ ...filter, priority: "Medium" }),
      Alert.countDocuments({ ...filter, priority: "Low" }),
      Alert.countDocuments({ ...filter, status: "Active" }),
      Alert.countDocuments({ ...filter, status: "Pending" }),
      Alert.countDocuments({ ...filter, status: "Resolved" }),
    ]);

    res.json({
      success: true,
      data: { critical, high, medium, low, active, pending, resolved, total: critical + high + medium + low },
    });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/alerts/:id/resolve ─────────────────────────────────────────────
export const resolveAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: "Resolved", resolvedAt: new Date(), resolvedBy: req.user?.email || "admin" },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// ── DELETE /api/alerts/:id ────────────────────────────────────────────────────
export const dismissAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: "Alert not found" });
    res.json({ success: true, message: "Alert dismissed" });
  } catch (error) {
    next(error);
  }
};
