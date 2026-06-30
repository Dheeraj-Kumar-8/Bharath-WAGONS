/**
 * seedWagons.js
 *
 * One-time seed script — imports the 500-wagon CSV dataset into MongoDB.
 *
 * Usage (run from the backend/ directory):
 *   node src/scripts/seedWagons.js
 *
 * Safe to re-run: uses updateOne + upsert keyed on wagonId, so existing
 * records are updated rather than duplicated.
 */

import "dotenv/config";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
import connectDB from "../config/db.js";
import Wagon    from "../models/Wagon.js";
import mongoose from "mongoose";

// ── Resolve the CSV path relative to the project root ──────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// backend/src/scripts/ → up three levels → project root → data/
const CSV_PATH = path.resolve(
  __dirname, "..", "..", "..", "data",
  "Bharath_Wagons_Dataset_500_Zones_Updated.csv"
);

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Safely parse a float; returns 0 if the value is empty or NaN. */
const toFloat = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
};

/** Safely parse an int; returns 0 if the value is empty or NaN. */
const toInt = (val) => {
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
};

/**
 * Map a single CSV row object (keys = raw header strings) to the Wagon
 * schema fields.  All 17 CSV columns are accounted for here.
 */
const mapRow = (row) => ({
  wagonId:        (row["Wagon ID"]            || "").trim(),
  wagonNumber:    (row["Wagon Number"]         || "").trim(),
  wagonType:      (row["Wagon Type"]           || "").trim(),
  zone:           (row["Zone Code"]            || "").trim(),
  zoneName:       (row["Zone Name"]            || "").trim(),
  division:       (row["Division"]             || "").trim(),
  currentStation: (row["Current Station"]      || "").trim(),
  destination:    (row["Destination Station"]  || "").trim(),
  cargoType:      (row["Cargo Type"]           || "").trim(),
  capacity:       toInt  (row["Capacity (Tons)"]),
  currentLoad:    toFloat(row["Current Load (Tons)"]),
  status:         (row["Status"]               || "Idle").trim(),
  gpsLatitude:    toFloat(row["GPS Latitude"]),
  gpsLongitude:   toFloat(row["GPS Longitude"]),
  speed:          toInt  (row["Speed (km/h)"]),
  temperature:    toFloat(row["Temperature (°C)"]),
  lastUpdated:    row["Last Updated Timestamp"]
                    ? new Date(row["Last Updated Timestamp"].trim())
                    : new Date(),
});

// ── CSV parser (no external dependency) ─────────────────────────────────────

/**
 * Reads the CSV file line by line using Node's built-in readline.
 * Returns a Promise that resolves to an array of plain row objects
 * where every key is a raw header string from the first line.
 */
const parseCSV = (filePath) =>
  new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`CSV file not found at:\n  ${filePath}`));
    }

    const rows    = [];
    let   headers = null;

    const rl = readline.createInterface({
      input:     fs.createReadStream(filePath, { encoding: "utf8" }),
      crlfDelay: Infinity,
    });

    rl.on("line", (line) => {
      const trimmed = line.trim();
      if (!trimmed) return; // skip blank lines

      // Split on comma, preserving quoted fields
      const cols = trimmed.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
      const clean = cols.map((c) => c.replace(/^"|"$/g, "").trim());

      if (!headers) {
        headers = clean; // first non-blank line is the header row
        return;
      }

      const row = {};
      headers.forEach((h, i) => {
        row[h] = clean[i] !== undefined ? clean[i] : "";
      });
      rows.push(row);
    });

    rl.on("close", () => resolve(rows));
    rl.on("error", reject);
  });

// ── Main ─────────────────────────────────────────────────────────────────────

const seed = async () => {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log(  "║           Wagon Dataset Seed Script              ║");
  console.log(  "╚══════════════════════════════════════════════════╝\n");

  // 1. Connect to MongoDB Atlas (reuses db.js, includes the DNS fix)
  await connectDB();

  // 2. Parse the CSV
  console.log(`\n📂 Reading CSV from:\n   ${CSV_PATH}\n`);
  let rows;
  try {
    rows = await parseCSV(CSV_PATH);
  } catch (err) {
    console.error(`❌ Failed to read CSV: ${err.message}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  console.log(`📋 Total records read from CSV : ${rows.length}`);

  if (rows.length === 0) {
    console.warn("⚠️  No records found in CSV. Exiting.");
    await mongoose.disconnect();
    process.exit(0);
  }

  // 3. Map every row to the Wagon schema shape
  const documents = rows.map(mapRow);

  // 4. Validate that every mapped document has the two required fields
  const invalid = documents.filter((d) => !d.wagonId || !d.wagonType);
  if (invalid.length > 0) {
    console.warn(`⚠️  ${invalid.length} row(s) missing wagonId or wagonType — they will be skipped.`);
  }
  const valid = documents.filter((d) => d.wagonId && d.wagonType);
  console.log(`✅ Valid records ready to upsert : ${valid.length}`);

  // 5. Upsert in one batch — safe to re-run, will not create duplicates
  console.log("\n⏳ Upserting records into MongoDB...\n");

  let inserted   = 0;
  let updated    = 0;
  const failed   = [];

  // Use bulkWrite with upsert so the script is idempotent
  const ops = valid.map((doc) => ({
    updateOne: {
      filter:  { wagonId: doc.wagonId },
      update:  { $set: doc },
      upsert:  true,
    },
  }));

  try {
    const result = await Wagon.bulkWrite(ops, { ordered: false });
    inserted = result.upsertedCount  ?? 0;
    updated  = result.modifiedCount  ?? 0;
  } catch (err) {
    // bulkWrite with ordered:false collects per-document errors
    if (err.writeErrors) {
      err.writeErrors.forEach((we) => {
        failed.push({
          index:   we.index,
          wagonId: valid[we.index]?.wagonId ?? "unknown",
          error:   we.errmsg ?? we.err?.message ?? "unknown error",
        });
      });
      // Counts from the partial result
      inserted = err.result?.nUpserted  ?? 0;
      updated  = err.result?.nModified  ?? 0;
    } else {
      console.error(`❌ bulkWrite failed entirely: ${err.message}`);
      await mongoose.disconnect();
      process.exit(1);
    }
  }

  // 6. Summary report
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║                   Seed Summary                   ║");
  console.log("╠══════════════════════════════════════════════════╣");
  console.log(`║  CSV rows read          : ${String(rows.length).padEnd(22)}║`);
  console.log(`║  Valid rows processed   : ${String(valid.length).padEnd(22)}║`);
  console.log(`║  Newly inserted         : ${String(inserted).padEnd(22)}║`);
  console.log(`║  Updated (already exist): ${String(updated).padEnd(22)}║`);
  console.log(`║  Failed                 : ${String(failed.length).padEnd(22)}║`);
  console.log("╚══════════════════════════════════════════════════╝");

  if (failed.length > 0) {
    console.error("\n❌ Failed records:\n");
    failed.forEach(({ index, wagonId, error }) => {
      console.error(`   Row ${index + 1} | wagonId: ${wagonId}`);
      console.error(`   Reason : ${error}\n`);
    });
  } else {
    console.log("\n✅ All records seeded successfully — zero failures.\n");
  }

  await mongoose.disconnect();
  console.log("🔌 MongoDB connection closed.\n");
};

seed().catch((err) => {
  console.error("❌ Unexpected error:", err.message);
  mongoose.disconnect();
  process.exit(1);
});
