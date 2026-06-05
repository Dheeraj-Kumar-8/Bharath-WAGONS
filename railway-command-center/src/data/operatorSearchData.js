// ── Operator Search Data — single source of truth ───────────────────────────
// All Operator pages derive their display data from these arrays.
// The search index is built from these at runtime.

export const OP_WAGONS = [
  { id:"WGN-1042", route:"New Delhi → Mumbai",    location:"Kota Jn.",      status:"On Time",     eta:"14:30", speed:78,  load:"82%", type:"Freight",   gps:"Active",  zone:"NR" },
  { id:"WGN-2187", route:"Kolkata → Chennai",     location:"Vizag",          status:"Delayed",     eta:"18:45", speed:54,  load:"67%", type:"Tank",      gps:"Active",  zone:"ER" },
  { id:"WGN-3301", route:"Mumbai → Hyderabad",    location:"Pune Jn.",       status:"On Time",     eta:"12:10", speed:85,  load:"91%", type:"Flatbed",   gps:"Active",  zone:"CR" },
  { id:"WGN-4056", route:"Chennai → Delhi",       location:"Nagpur Yard",    status:"Maintenance", eta:"--",    speed:0,   load:"0%",  type:"Freight",   gps:"Offline", zone:"SCR" },
  { id:"WGN-5774", route:"Hyderabad → Kolkata",   location:"Raipur Jn.",     status:"On Time",     eta:"20:00", speed:91,  load:"74%", type:"Container", gps:"Active",  zone:"SCR" },
  { id:"WGN-6613", route:"Delhi → Bengaluru",     location:"Bhopal Jn.",     status:"Delayed",     eta:"22:15", speed:44,  load:"88%", type:"Freight",   gps:"Active",  zone:"WCR" },
  { id:"WGN-7890", route:"Mumbai → Kolkata",      location:"Wardha",         status:"On Time",     eta:"16:50", speed:80,  load:"55%", type:"Tank",      gps:"Active",  zone:"CR" },
  { id:"WGN-8421", route:"Bengaluru → Delhi",     location:"Secunderabad",   status:"On Time",     eta:"09:20", speed:76,  load:"63%", type:"Flatbed",   gps:"Active",  zone:"SCR" },
];

export const OP_CARGO = [
  { wagon:"WGN-1042", type:"Steel Coils",        weight:58.4, capacity:72,  temp:28, tempLimit:40, status:"Normal",   destination:"Mumbai",    origin:"New Delhi",  seal:"SEALED", id:"CGO-4421" },
  { wagon:"WGN-2187", type:"Chemical Drums",     weight:45.1, capacity:60,  temp:18, tempLimit:25, status:"Warning",  destination:"Chennai",   origin:"Kolkata",    seal:"SEALED", id:"CGO-4422" },
  { wagon:"WGN-3301", type:"Auto Parts",         weight:61.8, capacity:65,  temp:31, tempLimit:45, status:"Critical", destination:"Hyderabad", origin:"Mumbai",     seal:"BROKEN", id:"CGO-4423" },
  { wagon:"WGN-4056", type:"Food Grain",         weight:0,    capacity:80,  temp:22, tempLimit:30, status:"Empty",    destination:"Delhi",     origin:"Chennai",    seal:"OPEN",   id:"CGO-4424" },
  { wagon:"WGN-5774", type:"Coal",               weight:71.2, capacity:90,  temp:35, tempLimit:50, status:"Normal",   destination:"Kolkata",   origin:"Hyderabad",  seal:"SEALED", id:"CGO-4425" },
  { wagon:"WGN-6613", type:"Petroleum Products", weight:52.0, capacity:60,  temp:42, tempLimit:40, status:"Critical", destination:"Bengaluru", origin:"Delhi",      seal:"SEALED", id:"CGO-4426" },
  { wagon:"WGN-7890", type:"Cotton Bales",       weight:38.5, capacity:70,  temp:27, tempLimit:40, status:"Normal",   destination:"Kolkata",   origin:"Mumbai",     seal:"SEALED", id:"CGO-4427" },
  { wagon:"WGN-8421", type:"Machinery",          weight:63.0, capacity:75,  temp:29, tempLimit:45, status:"Normal",   destination:"Delhi",     origin:"Bengaluru",  seal:"SEALED", id:"CGO-4428" },
];

export const OP_ALERTS = [
  { id:"ALT-001", wagon:"WGN-2187", type:"Speed Anomaly",     severity:"Critical", time:"10:14 AM", detail:"Detected at 142 km/h on a 90 km/h restricted zone near Vizag." },
  { id:"ALT-002", wagon:"WGN-4056", type:"Brake Wear",        severity:"High",     time:"09:32 AM", detail:"Brake pad thickness below 8mm threshold on Axle 3 & 4." },
  { id:"ALT-003", wagon:"WGN-1042", type:"Route Deviation",   severity:"Medium",   time:"08:50 AM", detail:"Deviated 2.3 km from planned route near Kota Jn." },
  { id:"ALT-004", wagon:"WGN-6613", type:"GPS Signal Lost",   severity:"High",     time:"08:22 AM", detail:"GPS module unresponsive for 14 min. Last known: Bhopal Jn." },
  { id:"ALT-005", wagon:"WGN-8421", type:"Cargo Overload",    severity:"Critical", time:"07:58 AM", detail:"Cargo weight at 108% of rated capacity." },
  { id:"ALT-006", wagon:"WGN-5774", type:"Temperature Alert", severity:"Medium",   time:"07:30 AM", detail:"Axle bearing temp 78°C (threshold 70°C). Speed reduced." },
  { id:"ALT-007", wagon:"WGN-3301", type:"Engine Vibration",  severity:"Low",      time:"07:10 AM", detail:"Unusual vibration in coupling unit." },
];

export const OP_MAINTENANCE = [
  { id:"MNT-001", wagon:"WGN-4056", type:"Brake Inspection",    priority:"Critical", assigned:"01 Jul 2025", status:"In Progress", tech:"Ramesh Kumar",  notes:"Replace worn brake pads on all axles" },
  { id:"MNT-002", wagon:"WGN-2187", type:"Wheel Alignment",     priority:"High",     assigned:"02 Jul 2025", status:"Pending",     tech:"Sanjay Mishra", notes:"Wheel flange thickness below threshold" },
  { id:"MNT-003", wagon:"WGN-3301", type:"Routine Check",       priority:"Low",      assigned:"30 Jun 2025", status:"Completed",   tech:"Priya Singh",   notes:"Monthly routine — all clear" },
  { id:"MNT-004", wagon:"WGN-6613", type:"Coupler Replacement", priority:"High",     assigned:"02 Jul 2025", status:"Pending",     tech:"Anil Verma",    notes:"Coupler pin shows stress fractures" },
  { id:"MNT-005", wagon:"WGN-5774", type:"GPS Unit Repair",     priority:"Medium",   assigned:"01 Jul 2025", status:"In Progress", tech:"Deepa Nair",    notes:"GPS intermittent signal loss" },
  { id:"MNT-006", wagon:"WGN-1042", type:"Oil & Lubrication",   priority:"Low",      assigned:"03 Jul 2025", status:"Pending",     tech:"Suresh Patel",  notes:"Scheduled quarterly lubrication" },
  { id:"MNT-007", wagon:"WGN-7890", type:"Air Brake Test",      priority:"Medium",   assigned:"01 Jul 2025", status:"Completed",   tech:"Kavitha Rajan", notes:"Air brake pressure test — passed" },
  { id:"MNT-008", wagon:"WGN-8421", type:"Full Overhaul",       priority:"Critical", assigned:"03 Jul 2025", status:"Pending",     tech:"Mohan Das",     notes:"Periodic full overhaul — 50k km service" },
];

export const OP_ROUTES = [
  { name:"New Delhi → Mumbai",    wagons:["WGN-1042"], dist:"1,384 km", status:"Active",  delay:"-"      },
  { name:"Kolkata → Chennai",     wagons:["WGN-2187"], dist:"1,659 km", status:"Delayed", delay:"28 min" },
  { name:"Mumbai → Hyderabad",    wagons:["WGN-3301"], dist:"711 km",   status:"Active",  delay:"-"      },
  { name:"Chennai → Delhi",       wagons:["WGN-4056"], dist:"2,175 km", status:"Halted",  delay:"--"     },
  { name:"Hyderabad → Kolkata",   wagons:["WGN-5774"], dist:"1,195 km", status:"Active",  delay:"-"      },
  { name:"Delhi → Bengaluru",     wagons:["WGN-6613"], dist:"2,058 km", status:"Delayed", delay:"47 min" },
  { name:"Mumbai → Kolkata",      wagons:["WGN-7890"], dist:"1,968 km", status:"Active",  delay:"-"      },
  { name:"Bengaluru → Delhi",     wagons:["WGN-8421"], dist:"2,058 km", status:"Active",  delay:"-"      },
];

export const OP_STATIONS = [
  { name:"New Delhi",    code:"NDLS", wagons:["WGN-1042"],                          zone:"NR",  status:"Active" },
  { name:"Mumbai CST",   code:"CSTM", wagons:[],                                    zone:"CR",  status:"Active" },
  { name:"Kolkata HWH",  code:"HWH",  wagons:[],                                    zone:"ER",  status:"Active" },
  { name:"Chennai Ctrl", code:"MAS",  wagons:[],                                    zone:"SR",  status:"Active" },
  { name:"Hyderabad",    code:"HYB",  wagons:[],                                    zone:"SCR", status:"Active" },
  { name:"Bengaluru",    code:"SBC",  wagons:[],                                    zone:"SWR", status:"Active" },
  { name:"Pune Jn.",     code:"PUNE", wagons:["WGN-3301"],                          zone:"CR",  status:"Active" },
  { name:"Nagpur Yard",  code:"NGP",  wagons:["WGN-4056"],                          zone:"CR",  status:"Active" },
  { name:"Raipur Jn.",   code:"R",    wagons:["WGN-5774"],                          zone:"SECR",status:"Active" },
  { name:"Bhopal Jn.",   code:"BPL",  wagons:["WGN-6613"],                          zone:"WCR", status:"Active" },
  { name:"Vizag",        code:"VSKP", wagons:["WGN-2187"],                          zone:"ECoR",status:"Active" },
  { name:"Kota Jn.",     code:"KOTA", wagons:["WGN-1042"],                          zone:"WCR", status:"Active" },
  { name:"Wardha",       code:"WR",   wagons:["WGN-7890"],                          zone:"CR",  status:"Active" },
  { name:"Secunderabad", code:"SC",   wagons:["WGN-8421"],                          zone:"SCR", status:"Active" },
];

export const OP_REPORTS = [
  { id:"RPT-D001", title:"Daily Wagon Movement Summary",   period:"03 Jul 2025",     type:"Daily",   wagons:48, size:"1.2 MB" },
  { id:"RPT-D002", title:"Daily Maintenance Log",          period:"03 Jul 2025",     type:"Daily",   wagons:8,  size:"0.8 MB" },
  { id:"RPT-D003", title:"Daily AI Alerts Summary",        period:"03 Jul 2025",     type:"Daily",   wagons:7,  size:"0.5 MB" },
  { id:"RPT-D004", title:"Daily Cargo Status Report",      period:"02 Jul 2025",     type:"Daily",   wagons:48, size:"1.4 MB" },
  { id:"RPT-D005", title:"Daily GPS Tracking Log",         period:"02 Jul 2025",     type:"Daily",   wagons:48, size:"2.1 MB" },
  { id:"RPT-W001", title:"Weekly Operations Summary",      period:"Week 26 · 2025",  type:"Weekly",  wagons:48, size:"4.8 MB" },
  { id:"RPT-W002", title:"Weekly Maintenance Report",      period:"Week 26 · 2025",  type:"Weekly",  wagons:12, size:"2.3 MB" },
  { id:"RPT-W003", title:"Weekly Cargo Analysis",          period:"Week 26 · 2025",  type:"Weekly",  wagons:48, size:"3.1 MB" },
  { id:"RPT-W004", title:"Weekly Alert Trend Report",      period:"Week 25 · 2025",  type:"Weekly",  wagons:48, size:"1.9 MB" },
  { id:"RPT-M001", title:"Monthly Performance Report",     period:"Jun 2025",        type:"Monthly", wagons:48, size:"12.4 MB" },
  { id:"RPT-M002", title:"Monthly Maintenance Overview",   period:"Jun 2025",        type:"Monthly", wagons:48, size:"8.2 MB" },
  { id:"RPT-M003", title:"Monthly Cargo Statistics",       period:"Jun 2025",        type:"Monthly", wagons:48, size:"9.7 MB" },
  { id:"RPT-M004", title:"Monthly AI Alert Analysis",      period:"May 2025",        type:"Monthly", wagons:48, size:"6.5 MB" },
  { id:"RPT-M005", title:"Monthly Compliance Report",      period:"May 2025",        type:"Monthly", wagons:48, size:"5.1 MB" },
];

// ── Build flat search index ──────────────────────────────────────────────────
export function buildOperatorIndex() {
  const items = [];

  OP_WAGONS.forEach(w => items.push({
    type:    "Wagon",
    id:      w.id,
    title:   w.id,
    sub:     `${w.location} → ${w.route.split("→")[1]?.trim() || ""}`,
    meta:    `${w.type} · ${w.speed} km/h · Load ${w.load} · ${w.gps} GPS`,
    status:  w.status,
    keywords:`${w.id} ${w.route} ${w.location} ${w.type} ${w.status} ${w.zone}`.toLowerCase(),
    path:    "/operator/wagons",
    raw:     w,
  }));

  OP_CARGO.forEach(c => items.push({
    type:    "Cargo",
    id:      c.id,
    title:   `${c.id} — ${c.type}`,
    sub:     `${c.origin} → ${c.destination} · ${c.wagon}`,
    meta:    `${c.weight}T / ${c.capacity}T · ${c.temp}°C · Seal: ${c.seal} · ${c.status}`,
    status:  c.status,
    keywords:`${c.id} ${c.wagon} ${c.type} ${c.origin} ${c.destination} ${c.status} ${c.seal}`.toLowerCase(),
    path:    "/operator/cargo",
    raw:     c,
  }));

  OP_ALERTS.forEach(a => items.push({
    type:    "Alert",
    id:      a.id,
    title:   `${a.id} — ${a.type}`,
    sub:     `${a.wagon} · ${a.time}`,
    meta:    `${a.severity} · ${a.detail}`,
    status:  a.severity,
    keywords:`${a.id} ${a.wagon} ${a.type} ${a.severity} ${a.detail}`.toLowerCase(),
    path:    "/operator/alerts",
    raw:     a,
  }));

  OP_MAINTENANCE.forEach(m => items.push({
    type:    "Maintenance",
    id:      m.id,
    title:   `${m.id} — ${m.type}`,
    sub:     `${m.wagon} · ${m.tech}`,
    meta:    `${m.priority} · ${m.status} · ${m.assigned}`,
    status:  m.status,
    keywords:`${m.id} ${m.wagon} ${m.type} ${m.priority} ${m.status} ${m.tech} ${m.notes}`.toLowerCase(),
    path:    "/operator/maintenance",
    raw:     m,
  }));

  OP_ROUTES.forEach(r => items.push({
    type:    "Route",
    id:      r.name,
    title:   r.name,
    sub:     `${r.dist} · Wagons: ${r.wagons.join(", ")}`,
    meta:    `${r.status}${r.delay !== "-" && r.delay !== "--" ? ` · Delay: ${r.delay}` : ""}`,
    status:  r.status,
    keywords:`${r.name} ${r.wagons.join(" ")} ${r.status}`.toLowerCase(),
    path:    "/operator/tracking",
    raw:     r,
  }));

  OP_STATIONS.forEach(s => items.push({
    type:    "Station",
    id:      s.code,
    title:   s.name,
    sub:     `${s.code} · Zone ${s.zone}`,
    meta:    `${s.wagons.length} wagon(s) present · ${s.status}`,
    status:  s.status,
    keywords:`${s.name} ${s.code} ${s.zone} ${s.wagons.join(" ")}`.toLowerCase(),
    path:    "/operator/tracking",
    raw:     s,
  }));

  OP_REPORTS.forEach(r => items.push({
    type:    "Report",
    id:      r.id,
    title:   `${r.id} — ${r.title}`,
    sub:     `${r.period} · ${r.type}`,
    meta:    `${r.wagons} wagons · ${r.size}`,
    status:  "Ready",
    keywords:`${r.id} ${r.title} ${r.period} ${r.type}`.toLowerCase(),
    path:    "/operator/reports",
    raw:     r,
  }));

  return items;
}

export const OPERATOR_INDEX = buildOperatorIndex();
