import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import jwt from "jsonwebtoken";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(__dirname, "..", "..", "..", "data", "Wagon_Health_Dataset_500.csv");

// Indian Railway zone codes → CSV directional zone codes
const ZONE_MAP = {
  NR:  ["N", "NW", "NE", "NS"],   // Northern Railway
  SR:  ["S", "SE", "SW"],          // Southern Railway
  ER:  ["E", "ES"],                // Eastern Railway
  WR:  ["W", "WN"],                // Western Railway
  CR:  ["NS", "EW"],               // Central Railway
  SCR: ["S", "SW", "SE"],          // South Central Railway
  NER: ["NE", "NS"],               // North Eastern Railway
  NWR: ["NW", "WN"],               // North Western Railway
  SER: ["SE", "ES"],               // South Eastern Railway
  SWR: ["SW", "S"],                // South Western Railway
};

const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) return reject(new Error("CSV not found: " + filePath));
    const rows = [];
    let headers = null;
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });
    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const cols = trimmed.split(",").map((c) => c.trim());
      if (!headers) { headers = cols; return; }
      const row = {};
      headers.forEach((h, i) => { row[h] = cols[i] ?? ""; });
      rows.push(row);
    });
    rl.on("close", () => resolve(rows));
    rl.on("error", reject);
  });

const buildStats = (wagons) => {
  const total = wagons.length;
  if (total === 0) return {
    total: 0, healthy: 0, warning: 0, critical: 0,
    avgHealth: 0, avgTemp: 0, avgBattery: 0,
    metrics: { wheelGood: 0, brakeGood: 0, gpsActive: 0, battGood: 0, tempGood: 0, total: 0 },
    zones: [], wagons: [],
  };

  const healthy  = wagons.filter((w) => w.status === "Healthy").length;
  const warning  = wagons.filter((w) => w.status === "Warning").length;
  const critical = wagons.filter((w) => w.status === "Critical").length;
  const avgHealth  = Math.round(wagons.reduce((s, w) => s + w.health,   0) / total);
  const avgTemp    = Math.round(wagons.reduce((s, w) => s + w.temp,     0) / total);
  const avgBattery = Math.round(wagons.reduce((s, w) => s + w.battery,  0) / total);

  const metrics = {
    wheelGood: wagons.filter((w) => w.wheel === "Good").length,
    brakeGood: wagons.filter((w) => w.brake === "Good").length,
    gpsActive: wagons.filter((w) => w.gps   === "Active").length,
    battGood:  wagons.filter((w) => w.battery >= 70).length,
    tempGood:  wagons.filter((w) => w.temp   <  75).length,
    total,
  };

  const zoneMap = {};
  wagons.forEach((w) => {
    if (!zoneMap[w.zone]) zoneMap[w.zone] = { zone: w.zone, zoneName: w.zoneName, list: [] };
    zoneMap[w.zone].list.push(w);
  });

  const zones = Object.values(zoneMap).map(({ zone, zoneName, list }) => ({
    zone,
    zoneName,
    total:      list.length,
    healthy:    list.filter((w) => w.status === "Healthy").length,
    warning:    list.filter((w) => w.status === "Warning").length,
    critical:   list.filter((w) => w.status === "Critical").length,
    avgHealth:  Math.round(list.reduce((s, w) => s + w.health,  0) / list.length),
    avgTemp:    Math.round(list.reduce((s, w) => s + w.temp,    0) / list.length),
    avgBattery: Math.round(list.reduce((s, w) => s + w.battery, 0) / list.length),
  })).sort((a, b) => b.avgHealth - a.avgHealth);

  return { total, healthy, warning, critical, avgHealth, avgTemp, avgBattery, metrics, zones, wagons };
};

router.get("/", async (req, res) => {
  try {
    // Decode zone from JWT
    let userZone = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
        userZone = decoded.zone?.toUpperCase() || null;
      } catch { /* invalid/expired token — fall through to show all */ }
    }

    const rows = await parseCSV(CSV_PATH);

    const allWagons = rows.map((r) => ({
      id:        r["Wagon ID"],
      zone:      r["Zone"],
      zoneName:  r["Zone Name"],
      wagonType: r["Wagon Type"],
      temp:      parseInt(r["Temperature"]) || 0,
      wheel:     r["Wheel"],
      brake:     r["Brakes"],
      battery:   parseInt(r["Battery"]) || 0,
      gps:       r["GPS"],
      health:    parseInt(r["Health Score"]) || 0,
      status:    r["Status"],
    }));

    // Filter to only the CSV zones that belong to this user's railway zone
    let filtered = allWagons;
    if (userZone && ZONE_MAP[userZone]) {
      const csvZones = new Set(ZONE_MAP[userZone]);
      filtered = allWagons.filter((w) => csvZones.has(w.zone));
    }

    res.json({
      success: true,
      userZone: userZone || "All",
      data: buildStats(filtered),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
