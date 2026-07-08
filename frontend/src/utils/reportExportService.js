import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { drawPDFHeader, drawPDFFooter } from "./pdfHeader";
import {
  buildStationActivityRows,
  buildStatusTrendRows,
  buildMonthlyTrendRows,
  buildWagonSummary,
  buildWagonExportRows,
  filterWagonsByDateRange,
  formatDateLabel,
  formatDateTimeLabel,
  formatDuration,
  getZoneName,
  WAGON_REPORT_COLUMNS,
} from "./wagonUtils";

export const ROLE_REPORTS = {
  admin: [
    "daily_operations_summary",
    "daily_cargo_report",
    "daily_delay_analysis",
    "daily_maintenance_log",
    "daily_gps_status_report",
    "weekly_operations_summary",
    "weekly_performance_report",
    "weekly_alert_analysis",
    "weekly_maintenance_summary",
    "monthly_fleet_report",
    "monthly_ai_analytics_report",
    "monthly_cargo_summary",
    "monthly_maintenance_report",
    "wagons_report",
  ],
  analyst: [
    "daily_operations_summary",
    "daily_cargo_report",
    "daily_delay_analysis",
    "daily_maintenance_log",
    "daily_gps_status_report",
    "weekly_operations_summary",
    "weekly_performance_report",
    "weekly_alert_analysis",
    "weekly_maintenance_summary",
    "monthly_fleet_report",
    "monthly_ai_analytics_report",
    "monthly_cargo_summary",
    "monthly_maintenance_report",
    "wagons_report",
  ],
  operator: [
    "daily_operations_summary",
    "daily_cargo_report",
    "daily_delay_analysis",
    "daily_maintenance_log",
    "daily_gps_status_report",
    "wagons_report",
  ],
};

export function canAccessReport(role, key) {
  return (ROLE_REPORTS[role] || []).includes(key);
}

export function buildFileName(label, ext) {
  const now = new Date();
  const ymd = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}_${String(now.getDate()).padStart(2, "0")}`;
  return `${label.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_-]/g, "")}_${ymd}.${ext}`;
}

const todayLabel = () => formatDateLabel(new Date());

const currentWeekLabel = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 6);
  return `${formatDateLabel(start, { day: "2-digit", month: "short" })} - ${formatDateLabel(end, { day: "2-digit", month: "short", year: "numeric" })}`;
};

const currentMonthLabel = () =>
  new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

const createReport = (definition, zone, date, wagons, alerts, tableTitle, columns, rows, summaryTitle, summaryRows) => ({
  ...definition,
  title: definition.label,
  zone,
  zoneName: getZoneName(zone),
  date,
  wagons,
  alerts,
  status: "Ready",
  tableTitle,
  columns,
  rows,
  summaryTitle,
  summaryRows,
});

const percent = (value) => `${value}%`;

const safeRows = (rows, columnsLength) =>
  rows.length ? rows : [Array.from({ length: columnsLength }, (_, index) => (index === 0 ? "No data available" : ""))];

const sortByLastUpdated = (wagons) =>
  [...wagons].sort((left, right) => new Date(right.lastUpdated || 0) - new Date(left.lastUpdated || 0));

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const buildDailyOperationsSummary = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const rows = safeRows(
    sortByLastUpdated(wagons).slice(0, 10).map((wagon) => ([
      wagon.wagonId,
      wagon.wagonNumber,
      wagon.currentLocation,
      wagon.destination,
      `${wagon.speed} km/h`,
      wagon.status,
      wagon.gpsStatus,
    ])),
    7
  );

  return createReport(
    definition,
    zone,
    todayLabel(),
    summary.total,
    summary.alerts,
    "Wagon Operations Overview",
    ["Wagon ID", "Wagon Number", "Current Location", "Destination", "Speed", "Status", "GPS"],
    rows,
    "Daily Operations Summary",
    [
      ["Zone", getZoneName(zone)],
      ["Total Wagons", formatNumber(summary.total)],
      ["Active Wagons", formatNumber(summary.active)],
      ["Delayed Wagons", formatNumber(summary.delayed)],
      ["Maintenance", formatNumber(summary.maintenance)],
      ["GPS Active", formatNumber(summary.gpsActive)],
      ["AI Alerts", formatNumber(summary.alerts)],
      ["Average Speed", `${summary.avgSpeed} km/h`],
    ]
  );
};

const buildDailyCargoReport = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const cargoWagons = sortByLastUpdated(wagons.filter((wagon) => wagon.isLoaded)).slice(0, 10);
  const rows = safeRows(
    cargoWagons.map((wagon) => ([
      wagon.wagonId,
      wagon.wagonNumber,
      wagon.cargoType,
      `${wagon.currentLoad} T`,
      `${wagon.capacity} T`,
      wagon.loadStatus,
      wagon.destination,
    ])),
    7
  );
  const cargoAlerts = wagons.filter((wagon) => wagon.alertReasons.some((reason) => ["Overload", "Temperature"].includes(reason))).length;

  return createReport(
    definition,
    zone,
    todayLabel(),
    summary.loaded + summary.partial,
    cargoAlerts,
    "Cargo Load Details",
    ["Wagon ID", "Wagon Number", "Cargo Type", "Current Load", "Capacity", "Load Status", "Destination"],
    rows,
    "Cargo Summary",
    [
      ["Zone", getZoneName(zone)],
      ["Loaded Wagons", formatNumber(summary.loaded)],
      ["Partially Loaded", formatNumber(summary.partial)],
      ["Empty Wagons", formatNumber(summary.empty)],
      ["Total Cargo Load", `${formatNumber(summary.totalLoad)} T`],
      ["Load Efficiency", percent(summary.loadEfficiency)],
      ["Top Cargo Type", summary.topCargoTypes[0]?.[0] || "N/A"],
      ["Cargo Alerts", formatNumber(cargoAlerts)],
    ]
  );
};

const buildDailyDelayAnalysis = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const delayedWagons = sortByLastUpdated(wagons.filter((wagon) => wagon.delayStatus === "Delayed"));
  const rows = safeRows(
    delayedWagons.slice(0, 10).map((wagon) => ([
      wagon.wagonId,
      wagon.route,
      wagon.delayTime,
      wagon.alertReasons.join(", ") || "Delay",
      wagon.currentLocation,
      `${wagon.speed} km/h`,
    ])),
    6
  );
  const averageDelay = delayedWagons.length
    ? Math.round(delayedWagons.reduce((total, wagon) => total + wagon.delayMinutes, 0) / delayedWagons.length)
    : 0;

  return createReport(
    definition,
    zone,
    todayLabel(),
    summary.delayed,
    summary.alerts,
    "Daily Delay Analysis",
    ["Wagon ID", "Route", "Delay Time", "Reason", "Current Location", "Speed"],
    rows,
    "Delay Statistics",
    [
      ["Zone", getZoneName(zone)],
      ["Total Delayed", formatNumber(summary.delayed)],
      ["Average Delay", formatDuration(averageDelay)],
      ["Critical Delays", formatNumber(delayedWagons.filter((wagon) => wagon.wagonHealth === "Critical").length)],
      ["High Priority", formatNumber(delayedWagons.filter((wagon) => wagon.alertReasons.includes("GPS") || wagon.alertReasons.includes("Temperature")).length)],
      ["Most Affected Location", summary.topLocations[0]?.[0] || "N/A"],
    ]
  );
};

const buildDailyMaintenanceLog = (definition, wagons, zone) => {
  const flaggedWagons = sortByLastUpdated(wagons.filter((wagon) => wagon.maintenanceStatus !== "Clear"));
  const rows = safeRows(
    flaggedWagons.slice(0, 10).map((wagon) => ([
      wagon.wagonId,
      wagon.station,
      wagon.status,
      wagon.maintenanceStatus,
      wagon.wagonHealth,
      `${wagon.temperature} C`,
      formatDateTimeLabel(wagon.lastUpdated),
    ])),
    7
  );

  return createReport(
    definition,
    zone,
    todayLabel(),
    flaggedWagons.length,
    flaggedWagons.filter((wagon) => wagon.wagonHealth === "Critical").length,
    "Maintenance Activity Log",
    ["Wagon ID", "Station", "Status", "Maintenance Status", "Health", "Temperature", "Last Updated"],
    rows,
    "Maintenance Summary",
    [
      ["Zone", getZoneName(zone)],
      ["Pending Maintenance", formatNumber(flaggedWagons.filter((wagon) => wagon.maintenanceStatus === "Pending").length)],
      ["Inspection Due", formatNumber(flaggedWagons.filter((wagon) => wagon.maintenanceStatus === "Inspection Due").length)],
      ["Recommended", formatNumber(flaggedWagons.filter((wagon) => wagon.maintenanceStatus === "Recommended").length)],
      ["Critical Wagons", formatNumber(flaggedWagons.filter((wagon) => wagon.wagonHealth === "Critical").length)],
      ["Warning Health", formatNumber(flaggedWagons.filter((wagon) => wagon.wagonHealth === "Warning").length)],
      ["Average Temperature", `${buildWagonSummary(flaggedWagons).avgTemperature || 0} C`],
    ]
  );
};

const buildDailyGpsStatusReport = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const rows = safeRows(
    sortByLastUpdated(wagons).slice(0, 10).map((wagon) => ([
      wagon.wagonId,
      wagon.gpsStatus,
      wagon.gpsLatitude ?? "N/A",
      wagon.gpsLongitude ?? "N/A",
      wagon.station,
      `${wagon.speed} km/h`,
      formatDateTimeLabel(wagon.lastUpdated),
    ])),
    7
  );

  return createReport(
    definition,
    zone,
    todayLabel(),
    summary.gpsActive,
    summary.gpsWeak + summary.gpsInactive,
    "GPS Device Status",
    ["Wagon ID", "GPS Status", "Latitude", "Longitude", "Station", "Speed", "Last Updated"],
    rows,
    "GPS Coverage Summary",
    [
      ["Zone", getZoneName(zone)],
      ["GPS Active", formatNumber(summary.gpsActive)],
      ["GPS Weak", formatNumber(summary.gpsWeak)],
      ["GPS Inactive", formatNumber(summary.gpsInactive)],
      ["Coverage", percent(summary.gpsCoverage)],
      ["Tracked Wagons", formatNumber(summary.total)],
      ["Last Synchronised", summary.latestUpdated ? formatDateTimeLabel(summary.latestUpdated) : "N/A"],
    ]
  );
};

const buildWeeklyOperationsSummary = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const rows = safeRows(
    buildStationActivityRows(wagons).map((station) => {
      const stationWagons = wagons.filter((wagon) => wagon.station === station.station);
      const stationSummary = buildWagonSummary(stationWagons);
      return [
        station.station,
        stationWagons.length,
        stationSummary.active,
        stationSummary.delayed,
        stationSummary.maintenance,
        stationSummary.alerts,
        `${stationSummary.avgSpeed} km/h`,
      ];
    }),
    7
  );

  return createReport(
    definition,
    zone,
    currentWeekLabel(),
    summary.total,
    summary.alerts,
    "Weekly Station Operations",
    ["Station", "Wagons", "Active", "Delayed", "Maintenance", "Alerts", "Avg Speed"],
    rows,
    "Weekly Operations KPIs",
    [
      ["Zone", getZoneName(zone)],
      ["Total Wagons", formatNumber(summary.total)],
      ["On-Time Rate", percent(summary.onTimeRate)],
      ["GPS Coverage", percent(summary.gpsCoverage)],
      ["Active Stations", formatNumber(summary.topStations.length)],
      ["Average Speed", `${summary.avgSpeed} km/h`],
      ["AI Alerts", formatNumber(summary.alerts)],
    ]
  );
};

const buildWeeklyPerformanceReport = (definition, wagons, zone) => {
  const rows = safeRows(
    buildWagonSummary(wagons).topLocations.map(([location, count]) => {
      const locationWagons = wagons.filter((wagon) => wagon.currentLocation === location);
      const locationSummary = buildWagonSummary(locationWagons);
      return [
        location,
        count,
        percent(locationSummary.onTimeRate),
        `${locationSummary.avgSpeed} km/h`,
        formatNumber(locationSummary.gpsActive),
        percent(locationSummary.avgHealthScore),
        formatNumber(locationSummary.alerts),
      ];
    }),
    7
  );
  const summary = buildWagonSummary(wagons);

  return createReport(
    definition,
    zone,
    currentWeekLabel(),
    summary.total,
    summary.alerts,
    "Weekly Performance by Current Location",
    ["Current Location", "Wagons", "On-Time %", "Avg Speed", "GPS Active", "Health Score", "Alerts"],
    rows,
    "Weekly Performance Highlights",
    [
      ["Zone", getZoneName(zone)],
      ["Average Health Score", percent(summary.avgHealthScore)],
      ["Healthy Wagons", formatNumber(summary.healthy)],
      ["Warning Wagons", formatNumber(summary.warning)],
      ["Critical Wagons", formatNumber(summary.critical)],
      ["Top Location", summary.topLocations[0]?.[0] || "N/A"],
      ["Average Temperature", `${summary.avgTemperature} C`],
    ]
  );
};

const buildWeeklyAlertAnalysis = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const rows = safeRows(
    summary.topAlerts.map(([alertType, count]) => {
      const affectedWagons = wagons.filter((wagon) => wagon.alertReasons.includes(alertType));
      return [
        alertType,
        count,
        affectedWagons.length,
        affectedWagons.filter((wagon) => wagon.wagonHealth === "Critical").length,
        affectedWagons.filter((wagon) => wagon.wagonHealth === "Warning").length,
        affectedWagons.filter((wagon) => wagon.wagonHealth === "Healthy").length,
        percent(summary.alerts ? Math.round((count / summary.alerts) * 100) : 0),
      ];
    }),
    7
  );

  return createReport(
    definition,
    zone,
    currentWeekLabel(),
    summary.total,
    summary.alerts,
    "Weekly Alert Breakdown",
    ["Alert Type", "Count", "Affected Wagons", "Critical", "Warning", "Healthy", "Share"],
    rows,
    "Alert Resolution Stats",
    [
      ["Zone", getZoneName(zone)],
      ["Total Alert Signals", formatNumber(summary.alerts)],
      ["Critical Wagons", formatNumber(summary.critical)],
      ["Top Alert", summary.topAlerts[0]?.[0] || "N/A"],
      ["Delayed Wagons", formatNumber(summary.delayed)],
      ["Maintenance Flags", formatNumber(summary.maintenance)],
      ["GPS Weak / Inactive", formatNumber(summary.gpsWeak + summary.gpsInactive)],
    ]
  );
};

const buildWeeklyMaintenanceSummary = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const rows = safeRows(
    Object.entries(summary.maintenanceDistribution).map(([maintenanceStatus, count]) => {
      const filtered = wagons.filter((wagon) => wagon.maintenanceStatus === maintenanceStatus);
      const filteredSummary = buildWagonSummary(filtered);
      return [
        maintenanceStatus,
        count,
        filteredSummary.critical,
        filteredSummary.warning,
        filtered.filter((wagon) => wagon.status === "Maintenance").length,
        `${filteredSummary.avgTemperature} C`,
        percent(summary.total ? Math.round((count / summary.total) * 100) : 0),
      ];
    }),
    7
  );

  return createReport(
    definition,
    zone,
    currentWeekLabel(),
    summary.maintenance + summary.warning + summary.critical,
    summary.critical,
    "Weekly Maintenance Distribution",
    ["Maintenance Status", "Wagons", "Critical", "Warning", "In Maintenance", "Avg Temp", "Share"],
    rows,
    "Weekly Maintenance KPIs",
    [
      ["Zone", getZoneName(zone)],
      ["Pending", formatNumber(wagons.filter((wagon) => wagon.maintenanceStatus === "Pending").length)],
      ["Recommended", formatNumber(wagons.filter((wagon) => wagon.maintenanceStatus === "Recommended").length)],
      ["Inspection Due", formatNumber(wagons.filter((wagon) => wagon.maintenanceStatus === "Inspection Due").length)],
      ["Maintenance Status Clear", formatNumber(wagons.filter((wagon) => wagon.maintenanceStatus === "Clear").length)],
      ["Critical Health", formatNumber(summary.critical)],
      ["Average Health", percent(summary.avgHealthScore)],
    ]
  );
};

const buildMonthlyFleetReport = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const rows = safeRows(
    Object.entries(summary.statusDistribution).map(([status, count]) => {
      const filtered = wagons.filter((wagon) => wagon.status === status);
      const filteredSummary = buildWagonSummary(filtered);
      return [
        status,
        count,
        percent(summary.total ? Math.round((count / summary.total) * 100) : 0),
        `${filteredSummary.avgSpeed} km/h`,
        `${filteredSummary.avgTemperature} C`,
        filteredSummary.gpsActive,
        percent(filteredSummary.avgHealthScore),
      ];
    }),
    7
  );

  return createReport(
    definition,
    zone,
    currentMonthLabel(),
    summary.total,
    summary.alerts,
    "Monthly Fleet Status",
    ["Status", "Wagons", "Share", "Avg Speed", "Avg Temp", "GPS Active", "Health Score"],
    rows,
    "Monthly Fleet KPIs",
    [
      ["Zone", getZoneName(zone)],
      ["Total Fleet", formatNumber(summary.total)],
      ["On-Time Rate", percent(summary.onTimeRate)],
      ["GPS Coverage", percent(summary.gpsCoverage)],
      ["Average Health", percent(summary.avgHealthScore)],
      ["Total Cargo Load", `${formatNumber(summary.totalLoad)} T`],
      ["Last Updated", summary.latestUpdated ? formatDateTimeLabel(summary.latestUpdated) : "N/A"],
    ]
  );
};

const buildMonthlyAiAnalyticsReport = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const rows = safeRows(
    summary.topAlerts.map(([alertType, count]) => {
      const affected = wagons.filter((wagon) => wagon.alertReasons.includes(alertType));
      const averageDelay = affected.length
        ? Math.round(affected.reduce((total, wagon) => total + wagon.delayMinutes, 0) / affected.length)
        : 0;
      return [
        alertType,
        count,
        percent(summary.total ? Math.round((affected.length / summary.total) * 100) : 0),
        averageDelay ? formatDuration(averageDelay) : "0m",
        percent(buildWagonSummary(affected).avgHealthScore),
        affected[0]?.station || "N/A",
      ];
    }),
    6
  );

  return createReport(
    definition,
    zone,
    currentMonthLabel(),
    summary.total,
    summary.alerts,
    "Monthly AI Alert Insights",
    ["Signal", "Count", "Affected Share", "Avg Delay", "Avg Health", "Top Station"],
    rows,
    "AI Engine Summary",
    [
      ["Zone", getZoneName(zone)],
      ["Alert Signals", formatNumber(summary.alerts)],
      ["Top Signal", summary.topAlerts[0]?.[0] || "N/A"],
      ["Healthy Wagons", formatNumber(summary.healthy)],
      ["Critical Wagons", formatNumber(summary.critical)],
      ["Average Temperature", `${summary.avgTemperature} C`],
      ["Average Health Score", percent(summary.avgHealthScore)],
    ]
  );
};

const buildMonthlyCargoSummary = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const rows = safeRows(
    summary.topCargoTypes.map(([cargoType, count]) => {
      const filtered = wagons.filter((wagon) => wagon.cargoType === cargoType);
      const filteredSummary = buildWagonSummary(filtered);
      return [
        cargoType,
        count,
        `${formatNumber(filteredSummary.totalLoad)} T`,
        percent(filteredSummary.loadEfficiency),
        formatNumber(filtered.filter((wagon) => wagon.delayStatus === "Delayed").length),
        formatNumber(filtered.filter((wagon) => wagon.aiAlert === "Yes").length),
      ];
    }),
    6
  );

  return createReport(
    definition,
    zone,
    currentMonthLabel(),
    summary.loaded + summary.partial,
    wagons.filter((wagon) => wagon.aiAlert === "Yes" && ["Overload", "Temperature"].some((reason) => wagon.alertReasons.includes(reason))).length,
    "Monthly Cargo Type Summary",
    ["Cargo Type", "Wagons", "Total Load", "Load Efficiency", "Delayed", "AI Alerts"],
    rows,
    "Cargo KPIs",
    [
      ["Zone", getZoneName(zone)],
      ["Loaded Wagons", formatNumber(summary.loaded)],
      ["Partial Wagons", formatNumber(summary.partial)],
      ["Total Load", `${formatNumber(summary.totalLoad)} T`],
      ["Load Efficiency", percent(summary.loadEfficiency)],
      ["Top Cargo", summary.topCargoTypes[0]?.[0] || "N/A"],
      ["Cargo Alerts", formatNumber(wagons.filter((wagon) => wagon.alertReasons.some((reason) => ["Overload", "Temperature"].includes(reason))).length)],
    ]
  );
};

const buildMonthlyMaintenanceReport = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const groups = {
    Pending: wagons.filter((wagon) => wagon.maintenanceStatus === "Pending"),
    Recommended: wagons.filter((wagon) => wagon.maintenanceStatus === "Recommended"),
    "Inspection Due": wagons.filter((wagon) => wagon.maintenanceStatus === "Inspection Due"),
    Clear: wagons.filter((wagon) => wagon.maintenanceStatus === "Clear"),
  };

  const rows = safeRows(
    Object.entries(groups).map(([group, items]) => {
      const groupSummary = buildWagonSummary(items);
      return [
        group,
        items.length,
        percent(summary.total ? Math.round((items.length / summary.total) * 100) : 0),
        percent(groupSummary.avgHealthScore),
        `${groupSummary.avgTemperature} C`,
        formatNumber(items.filter((wagon) => wagon.aiAlert === "Yes").length),
      ];
    }),
    6
  );

  return createReport(
    definition,
    zone,
    currentMonthLabel(),
    summary.maintenance + summary.warning + summary.critical,
    summary.critical,
    "Monthly Maintenance Categories",
    ["Maintenance Group", "Wagons", "Share", "Health Score", "Avg Temp", "AI Alerts"],
    rows,
    "Maintenance KPIs",
    [
      ["Zone", getZoneName(zone)],
      ["Pending Maintenance", formatNumber(groups.Pending.length)],
      ["Recommended Action", formatNumber(groups.Recommended.length)],
      ["Inspection Due", formatNumber(groups["Inspection Due"].length)],
      ["Clear", formatNumber(groups.Clear.length)],
      ["Critical Health", formatNumber(summary.critical)],
      ["Average Health Score", percent(summary.avgHealthScore)],
    ]
  );
};

const buildWagonsReport = (definition, wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  const rows = safeRows(
    sortByLastUpdated(wagons).map((wagon) => [
      wagon.wagonId,
      wagon.wagonNumber,
      wagon.zone,
      wagon.division,
      wagon.station,
      wagon.destination,
      wagon.gpsLatitude ?? "N/A",
      wagon.gpsLongitude ?? "N/A",
      wagon.gpsStatus,
      wagon.speed,
      wagon.cargoType,
      wagon.currentLoad,
      wagon.wagonHealth,
      wagon.temperature,
      wagon.aiAlert,
      formatDateTimeLabel(wagon.lastUpdated),
    ]),
    16
  );

  return createReport(
    definition,
    zone,
    todayLabel(),
    summary.total,
    summary.alerts,
    "Wagon Report",
    ["Wagon ID", "Wagon Number", "Zone", "Division", "Current Station", "Destination", "Latitude", "Longitude", "GPS Status", "Current Speed", "Cargo Type", "Cargo Weight", "Health Status", "Temperature", "Alert Status", "Last Updated"],
    rows,
    "Wagon Report Summary",
    [
      ["Zone", getZoneName(zone)],
      ["Total Wagons", formatNumber(summary.total)],
      ["Active Wagons", formatNumber(summary.active)],
      ["Delayed Wagons", formatNumber(summary.delayed)],
      ["Maintenance Wagons", formatNumber(summary.maintenance)],
      ["GPS Active", formatNumber(summary.gpsActive)],
      ["GPS Weak", formatNumber(summary.gpsWeak)],
      ["GPS Inactive", formatNumber(summary.gpsInactive)],
      ["Healthy Wagons", formatNumber(summary.healthy)],
      ["Warning Wagons", formatNumber(summary.warning)],
      ["Critical Wagons", formatNumber(summary.critical)],
      ["Total Cargo Load", `${formatNumber(summary.totalLoad)} T`],
      ["Average Temperature", `${summary.avgTemperature} C`],
      ["Last Updated", summary.latestUpdated ? formatDateTimeLabel(summary.latestUpdated) : "N/A"],
    ]
  );
};

const REPORT_BUILDERS = {
  RPT_D001: buildDailyOperationsSummary,
  RPT_D002: buildDailyCargoReport,
  RPT_D003: buildDailyDelayAnalysis,
  RPT_D004: buildDailyMaintenanceLog,
  RPT_D005: buildDailyGpsStatusReport,
  RPT_W001: buildWeeklyOperationsSummary,
  RPT_W002: buildWeeklyPerformanceReport,
  RPT_W003: buildWeeklyAlertAnalysis,
  RPT_W004: buildWeeklyMaintenanceSummary,
  RPT_M001: buildMonthlyFleetReport,
  RPT_M002: buildMonthlyAiAnalyticsReport,
  RPT_M003: buildMonthlyCargoSummary,
  RPT_M004: buildMonthlyMaintenanceReport,
  RPT_WAGON: buildWagonsReport,
};

export const REPORT_DEFINITIONS = [
  { id: "RPT_D001", key: "daily_operations_summary", label: "Daily Operations Summary", period: "Daily", color: "#3b82f6" },
  { id: "RPT_D002", key: "daily_cargo_report", label: "Daily Cargo Report", period: "Daily", color: "#22c55e" },
  { id: "RPT_D003", key: "daily_delay_analysis", label: "Daily Delay Analysis", period: "Daily", color: "#f59e0b" },
  { id: "RPT_D004", key: "daily_maintenance_log", label: "Daily Maintenance Log", period: "Daily", color: "#ef4444" },
  { id: "RPT_D005", key: "daily_gps_status_report", label: "Daily GPS Status Report", period: "Daily", color: "#06b6d4" },
  { id: "RPT_W001", key: "weekly_operations_summary", label: "Weekly Operations Summary", period: "Weekly", color: "#3b82f6" },
  { id: "RPT_W002", key: "weekly_performance_report", label: "Weekly Performance Report", period: "Weekly", color: "#22c55e" },
  { id: "RPT_W003", key: "weekly_alert_analysis", label: "Weekly Alert Analysis", period: "Weekly", color: "#f59e0b" },
  { id: "RPT_W004", key: "weekly_maintenance_summary", label: "Weekly Maintenance Summary", period: "Weekly", color: "#ef4444" },
  { id: "RPT_M001", key: "monthly_fleet_report", label: "Monthly Fleet Report", period: "Monthly", color: "#3b82f6" },
  { id: "RPT_M002", key: "monthly_ai_analytics_report", label: "Monthly AI Analytics Report", period: "Monthly", color: "#8b5cf6" },
  { id: "RPT_M003", key: "monthly_cargo_summary", label: "Monthly Cargo Summary", period: "Monthly", color: "#22c55e" },
  { id: "RPT_M004", key: "monthly_maintenance_report", label: "Monthly Maintenance Report", period: "Monthly", color: "#ef4444" },
  { id: "RPT_WAGON", key: "wagons_report", label: "Wagons Report", period: "Wagons", color: "#6366f1" },
];

export function buildReportData(definition, wagons, options = {}) {
  const filteredWagons = filterWagonsByDateRange(wagons, options.dateFrom, options.dateTo);
  const zone = options.zone || filteredWagons[0]?.zone || wagons[0]?.zone || "NR";
  const builder = REPORT_BUILDERS[definition.id];

  if (!builder) {
    return createReport(
      definition,
      zone,
      todayLabel(),
      filteredWagons.length,
      buildWagonSummary(filteredWagons).alerts,
      "Report Data",
      ["Message"],
      [["No report builder configured"]],
      "Summary",
      [["Zone", getZoneName(zone)]]
    );
  }

  return builder(definition, filteredWagons, zone);
}

export function buildReportCollection(wagons, options = {}) {
  return REPORT_DEFINITIONS.reduce(
    (collection, definition) => {
      const report = buildReportData(definition, wagons, options);
      if (!collection[definition.period]) collection[definition.period] = [];
      collection[definition.period].push(report);
      collection.byId[definition.id] = report;
      return collection;
    },
    { Daily: [], Weekly: [], Monthly: [], Wagons: [], byId: {} }
  );
}

const hexToRgb = (hex) => [
  parseInt(hex.slice(1, 3), 16),
  parseInt(hex.slice(3, 5), 16),
  parseInt(hex.slice(5, 7), 16),
];

const exportDatasetPDF = async ({ title, subtitle, fileLabel, columns, rows, summaryTitle, summaryRows, accent = "#3b82f6" }) => {
  const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait" });
  const rgb = hexToRgb(accent);

  const headerSubtitle = `${title}  ·  ${subtitle}`;
  const startY = await drawPDFHeader(doc, headerSubtitle);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(241, 245, 249);
  doc.text("Report Table", 14, startY + 2);

  autoTable(doc, {
    startY: startY + 6,
    head: [columns],
    body: safeRows(rows, columns.length),
    headStyles: { fillColor: [13, 31, 60], textColor: rgb, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { textColor: [203, 213, 225], fontSize: 8, fillColor: [7, 22, 40] },
    alternateRowStyles: { fillColor: [13, 31, 60] },
    styles: { cellPadding: 2.5 },
  });

  const nextY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(241, 245, 249);
  doc.text(summaryTitle || "Summary", 14, nextY);

  autoTable(doc, {
    startY: nextY + 4,
    head: [["Metric", "Value"]],
    body: summaryRows,
    headStyles: { fillColor: rgb, textColor: [255, 255, 255], fontSize: 9 },
    bodyStyles: { textColor: [203, 213, 225], fontSize: 9, fillColor: [7, 22, 40] },
    alternateRowStyles: { fillColor: [13, 31, 60] },
  });

  drawPDFFooter(doc);
  doc.save(buildFileName(fileLabel, "pdf"));
};

const exportDatasetExcel = ({ title, subtitle, fileLabel, columns, rows, summaryRows }) => {
  const workbook = XLSX.utils.book_new();
  const tableSheet = XLSX.utils.aoa_to_sheet([
    [title],
    [subtitle],
    [],
    columns,
    ...safeRows(rows, columns.length),
  ]);
  tableSheet["!cols"] = columns.map(() => ({ wch: 20 }));
  XLSX.utils.book_append_sheet(workbook, tableSheet, "Report");

  const summarySheet = XLSX.utils.aoa_to_sheet([
    ["Metric", "Value"],
    ...summaryRows,
  ]);
  summarySheet["!cols"] = [{ wch: 28 }, { wch: 24 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

  XLSX.writeFile(workbook, buildFileName(fileLabel, "xlsx"));
};

const exportDatasetCSV = ({ title, subtitle, fileLabel, columns, rows, summaryRows }) => {
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const lines = [
    `# ${title}`,
    `# ${subtitle}`,
    "",
    columns.map(escape).join(","),
    ...safeRows(rows, columns.length).map((row) => row.map(escape).join(",")),
    "",
    "# Summary",
    "Metric,Value",
    ...summaryRows.map((row) => row.map(escape).join(",")),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = buildFileName(fileLabel, "csv");
  anchor.click();
  URL.revokeObjectURL(url);
};

export function exportReportPDF(reportData) {
  exportDatasetPDF({
    title: reportData.title,
    subtitle: `${reportData.id} | Zone: ${reportData.zone} | Period: ${reportData.date} | Generated: ${new Date().toLocaleString("en-IN")}`,
    fileLabel: reportData.label,
    columns: reportData.columns,
    rows: reportData.rows,
    summaryTitle: reportData.summaryTitle,
    summaryRows: reportData.summaryRows,
    accent: reportData.color,
  });
}

export function exportReportExcel(reportData) {
  exportDatasetExcel({
    title: reportData.title,
    subtitle: `${reportData.id} | Zone: ${reportData.zone} | Period: ${reportData.date} | Generated: ${new Date().toLocaleString("en-IN")}`,
    fileLabel: reportData.label,
    columns: reportData.columns,
    rows: reportData.rows,
    summaryRows: reportData.summaryRows,
  });
}

export function exportReportCSV(reportData) {
  exportDatasetCSV({
    title: reportData.title,
    subtitle: `${reportData.id} | Zone: ${reportData.zone} | Period: ${reportData.date} | Generated: ${new Date().toLocaleString("en-IN")}`,
    fileLabel: reportData.label,
    columns: reportData.columns,
    rows: reportData.rows,
    summaryRows: reportData.summaryRows,
  });
}

export function exportWagonReportPDF({ wagons, zone, filters = {}, title = "Wagon Report", columns = WAGON_REPORT_COLUMNS }) {
  const rows = buildWagonExportRows(wagons, columns);
  const appliedFilters = Object.entries(filters).filter(([, value]) => value && value !== "All");
  exportDatasetPDF({
    title,
    subtitle: `Zone: ${zone} | Generated: ${new Date().toLocaleString("en-IN")} | Rows: ${wagons.length}`,
    fileLabel: `${title}_${zone}`,
    columns: columns.map((column) => column.label),
    rows,
    summaryTitle: "Applied Filters",
    summaryRows: [
      ["Zone", getZoneName(zone)],
      ["Visible Rows", formatNumber(wagons.length)],
      ...appliedFilters.map(([key, value]) => [key, String(value)]),
    ],
    accent: "#3b82f6",
  });
}

export function exportWagonReportExcel({ wagons, zone, filters = {}, title = "Wagon Report", columns = WAGON_REPORT_COLUMNS }) {
  const rows = buildWagonExportRows(wagons, columns);
  const appliedFilters = Object.entries(filters).filter(([, value]) => value && value !== "All");
  exportDatasetExcel({
    title,
    subtitle: `Zone: ${zone} | Generated: ${new Date().toLocaleString("en-IN")} | Rows: ${wagons.length}`,
    fileLabel: `${title}_${zone}`,
    columns: columns.map((column) => column.label),
    rows,
    summaryRows: [
      ["Zone", getZoneName(zone)],
      ["Visible Rows", formatNumber(wagons.length)],
      ...appliedFilters.map(([key, value]) => [key, String(value)]),
    ],
  });
}

export function exportWagonReportCSV({ wagons, zone, filters = {}, title = "Wagon Report", columns = WAGON_REPORT_COLUMNS }) {
  const rows = buildWagonExportRows(wagons, columns);
  const appliedFilters = Object.entries(filters).filter(([, value]) => value && value !== "All");
  exportDatasetCSV({
    title,
    subtitle: `Zone: ${zone} | Generated: ${new Date().toLocaleString("en-IN")} | Rows: ${wagons.length}`,
    fileLabel: `${title}_${zone}`,
    columns: columns.map((column) => column.label),
    rows,
    summaryRows: [
      ["Zone", getZoneName(zone)],
      ["Visible Rows", formatNumber(wagons.length)],
      ...appliedFilters.map(([key, value]) => [key, String(value)]),
    ],
  });
}

export function bulkExportAll(format, role, wagons, options = {}) {
  REPORT_DEFINITIONS
    .filter((definition) => canAccessReport(role, definition.key))
    .forEach((definition) => {
      const report = buildReportData(definition, wagons, options);
      if (format === "pdf") exportReportPDF(report);
      if (format === "excel") exportReportExcel(report);
      if (format === "csv") exportReportCSV(report);
    });
}

const SCHEDULE_KEY = "rcc_scheduled_report";

export function getSchedule() {
  try {
    return JSON.parse(localStorage.getItem(SCHEDULE_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveSchedule(config) {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify({ ...config, savedAt: Date.now() }));
}

export function clearSchedule() {
  localStorage.removeItem(SCHEDULE_KEY);
}

export function checkAndRunSchedule(role, wagons, options = {}) {
  const schedule = getSchedule();
  if (!schedule || !schedule.enabled || schedule.role !== role || !wagons.length) return false;

  const [hours, minutes] = (schedule.time || "06:00").split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (Date.now() >= target.getTime() && (schedule.lastRun || 0) < target.getTime()) {
    bulkExportAll(schedule.format || "pdf", role, wagons, options);
    saveSchedule({ ...schedule, lastRun: Date.now() });
    return true;
  }

  return false;
}

export const buildAnalyticsSnapshot = (wagons, zone) => {
  const summary = buildWagonSummary(wagons);
  return {
    zone,
    zoneName: getZoneName(zone),
    summary,
    weekly: buildStatusTrendRows(wagons),
    monthly: buildMonthlyTrendRows(wagons),
    stations: buildStationActivityRows(wagons),
    alerts: summary.topAlerts.map(([name, value]) => ({ name, value })),
  };
};
