import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

// ── Geographically accurate fleet data per zone ───────────────────────────────
const SEED_WAGONS = [
  // ── NR: North Railway ─ Delhi, UP, Bihar, Uttarakhand, HP, Punjab, Haryana ──
  { id:"WGN-NR01", route:"New Delhi → Lucknow",      location:"Kanpur Jn.",       status:"On Time",    speed:81, load:78, type:"Freight",   cargo:"Steel Coils",    gps:"Active",  health:88, eta:"14:30", zone:"NR" },
  { id:"WGN-NR02", route:"Amritsar → New Delhi",     location:"Ambala Cantt.",    status:"On Time",    speed:76, load:65, type:"Container", cargo:"Textiles",       gps:"Active",  health:82, eta:"11:45", zone:"NR" },
  { id:"WGN-NR03", route:"New Delhi → Varanasi",     location:"Allahabad Jn.",    status:"Delayed",    speed:49, load:71, type:"Tank",      cargo:"Petroleum",      gps:"Active",  health:59, eta:"20:00", zone:"NR" },
  { id:"WGN-NR04", route:"Lucknow → Patna",          location:"Varanasi Jn.",     status:"On Time",    speed:74, load:83, type:"Flatbed",   cargo:"Auto Parts",     gps:"Active",  health:77, eta:"16:20", zone:"NR" },
  { id:"WGN-NR05", route:"Chandigarh → New Delhi",   location:"Ambala City",      status:"Maintenance",speed:0,  load:0,  type:"Freight",   cargo:"—",              gps:"Offline", health:31, eta:"—",     zone:"NR" },

  // ── SR: South Railway ─ Tamil Nadu, Kerala, Puducherry, parts of AP ──────────
  { id:"WGN-SR01", route:"Chennai Central → Ernakulam",  location:"Shoranur Jn.",  status:"On Time",    speed:79, load:82, type:"Container", cargo:"Electronics",    gps:"Active",  health:91, eta:"13:30", zone:"SR" },
  { id:"WGN-SR02", route:"Coimbatore → Chennai",         location:"Salem Jn.",     status:"Delayed",    speed:46, load:68, type:"Tank",      cargo:"Chemical Drums", gps:"Active",  health:55, eta:"19:00", zone:"SR" },
  { id:"WGN-SR03", route:"Madurai → Thiruvananthapuram", location:"Tirunelveli",   status:"On Time",    speed:72, load:76, type:"Freight",   cargo:"Granite",        gps:"Active",  health:84, eta:"17:45", zone:"SR" },
  { id:"WGN-SR04", route:"Ernakulam → Chennai",          location:"Palakkad Jn.",  status:"On Time",    speed:83, load:59, type:"Flatbed",   cargo:"Cashews",        gps:"Active",  health:79, eta:"10:30", zone:"SR" },
  { id:"WGN-SR05", route:"Trichy → Coimbatore",          location:"Erode Jn.",     status:"Maintenance",speed:0,  load:0,  type:"Freight",   cargo:"—",              gps:"Offline", health:27, eta:"—",     zone:"SR" },

  // ── ER: East Railway ─ West Bengal, Bihar, Jharkhand ─────────────────────────
  { id:"WGN-ER01", route:"Howrah → Patna",           location:"Asansol Jn.",      status:"On Time",    speed:85, load:74, type:"Freight",   cargo:"Steel Billets",  gps:"Active",  health:86, eta:"15:00", zone:"ER" },
  { id:"WGN-ER02", route:"Dhanbad → Howrah",         location:"Durgapur",         status:"Delayed",    speed:52, load:88, type:"Tank",      cargo:"Coal",           gps:"Active",  health:44, eta:"18:45", zone:"ER" },
  { id:"WGN-ER03", route:"Patna → Kolkata",          location:"Jasidih Jn.",      status:"On Time",    speed:78, load:62, type:"Container", cargo:"Jute Products",  gps:"Active",  health:80, eta:"21:15", zone:"ER" },
  { id:"WGN-ER04", route:"Muzaffarpur → Howrah",     location:"Bhagalpur",        status:"On Time",    speed:69, load:55, type:"Flatbed",   cargo:"Rice",           gps:"Active",  health:74, eta:"19:00", zone:"ER" },
  { id:"WGN-ER05", route:"Howrah → Dhanbad",         location:"Barddhaman Jn.",   status:"Maintenance",speed:0,  load:0,  type:"Freight",   cargo:"—",              gps:"Offline", health:33, eta:"—",     zone:"ER" },

  // ── WR: West Railway ─ Gujarat, parts of Maharashtra, MP, Rajasthan ──────────
  { id:"WGN-WR01", route:"Mumbai Central → Ahmedabad", location:"Surat",          status:"On Time",    speed:87, load:80, type:"Container", cargo:"Textiles",       gps:"Active",  health:92, eta:"12:00", zone:"WR" },
  { id:"WGN-WR02", route:"Ahmedabad → Vadodara",       location:"Anand Jn.",      status:"On Time",    speed:74, load:66, type:"Freight",   cargo:"Chemicals",      gps:"Active",  health:78, eta:"09:30", zone:"WR" },
  { id:"WGN-WR03", route:"Mumbai → Rajkot",            location:"Vadodara Jn.",   status:"Delayed",    speed:51, load:73, type:"Tank",      cargo:"Petroleum",      gps:"Active",  health:61, eta:"21:30", zone:"WR" },
  { id:"WGN-WR04", route:"Surat → Bhavnagar",          location:"Bharuch",        status:"On Time",    speed:77, load:58, type:"Flatbed",   cargo:"Marble Slabs",   gps:"Active",  health:83, eta:"15:45", zone:"WR" },
  { id:"WGN-WR05", route:"Rajkot → Ahmedabad",         location:"Surendranagar",  status:"Maintenance",speed:0,  load:0,  type:"Freight",   cargo:"—",              gps:"Offline", health:29, eta:"—",     zone:"WR" },

  // ── NER: North East Railway ─ Assam, NE States ───────────────────────────────
  { id:"WGN-NE01", route:"Guwahati → New Jalpaiguri", location:"Alipurduar Jn.",  status:"On Time",    speed:72, load:78, type:"Freight",   cargo:"Tea",            gps:"Active",  health:85, eta:"15:00", zone:"NER" },
  { id:"WGN-NE02", route:"Dibrugarh → Guwahati",      location:"Tinsukia Jn.",    status:"Delayed",    speed:48, load:62, type:"Container", cargo:"Timber",         gps:"Active",  health:58, eta:"19:30", zone:"NER" },
  { id:"WGN-NE03", route:"Lumding → New Jalpaiguri",  location:"Lumding Jn.",     status:"Maintenance",speed:0,  load:0,  type:"Flatbed",   cargo:"—",              gps:"Offline", health:29, eta:"—",     zone:"NER" },
  { id:"WGN-NE04", route:"Agartala → Guwahati",       location:"Badarpur Jn.",    status:"On Time",    speed:65, load:55, type:"Freight",   cargo:"Bamboo Products",gps:"Active",  health:71, eta:"22:00", zone:"NER" },

  // ── NWR: North Western Railway ─ Rajasthan, parts of Gujarat & Haryana ────────
  { id:"WGN-NW01", route:"Jaipur → Delhi",            location:"Alwar",           status:"On Time",    speed:81, load:74, type:"Freight",   cargo:"Marble",         gps:"Active",  health:91, eta:"13:45", zone:"NWR" },
  { id:"WGN-NW02", route:"Jodhpur → Ahmedabad",       location:"Pali",            status:"Delayed",    speed:55, load:83, type:"Tank",      cargo:"Petroleum",      gps:"Active",  health:67, eta:"21:00", zone:"NWR" },
  { id:"WGN-NW03", route:"Bikaner → Jaipur",          location:"Sikar",           status:"On Time",    speed:76, load:59, type:"Container", cargo:"Handicrafts",    gps:"Active",  health:82, eta:"11:20", zone:"NWR" },
  { id:"WGN-NW04", route:"Ajmer → Delhi",             location:"Jaipur Jn.",      status:"On Time",    speed:83, load:68, type:"Flatbed",   cargo:"Salt",           gps:"Active",  health:87, eta:"10:00", zone:"NWR" },

  // ── SER: South Eastern Railway ─ Odisha, Jharkhand, Chhattisgarh, WB ─────────
  { id:"WGN-SE01", route:"Kharagpur → Bhubaneswar",   location:"Balasore",        status:"On Time",    speed:79, load:86, type:"Freight",   cargo:"Iron Ore",       gps:"Active",  health:87, eta:"14:00", zone:"SER" },
  { id:"WGN-SE02", route:"Rourkela → Howrah",         location:"Jharsuguda Jn.",  status:"Delayed",    speed:41, load:70, type:"Tank",      cargo:"Steel Billets",  gps:"Active",  health:53, eta:"20:15", zone:"SER" },
  { id:"WGN-SE03", route:"Bokaro → Howrah",           location:"Dhanbad Jn.",     status:"On Time",    speed:88, load:93, type:"Flatbed",   cargo:"Coal",           gps:"Active",  health:76, eta:"10:30", zone:"SER" },
  { id:"WGN-SE04", route:"Bilaspur → Bhubaneswar",    location:"Raipur Jn.",      status:"On Time",    speed:73, load:81, type:"Freight",   cargo:"Limestone",      gps:"Active",  health:80, eta:"18:00", zone:"SER" },

  // ── SWR: South Western Railway ─ Karnataka ────────────────────────────────────
  { id:"WGN-SW01", route:"Bengaluru → Hubli",         location:"Tumkur",          status:"On Time",    speed:82, load:71, type:"Container", cargo:"Electronics",    gps:"Active",  health:90, eta:"12:50", zone:"SWR" },
  { id:"WGN-SW02", route:"Hubli → Mumbai",            location:"Dharwad",         status:"Delayed",    speed:50, load:77, type:"Freight",   cargo:"Cotton",         gps:"Active",  health:61, eta:"22:45", zone:"SWR" },
  { id:"WGN-SW03", route:"Mysuru → Chennai",          location:"Krishnarajapete", status:"Maintenance",speed:0,  load:0,  type:"Tank",      cargo:"—",              gps:"Offline", health:35, eta:"—",     zone:"SWR" },
  { id:"WGN-SW04", route:"Bengaluru → Mangaluru",     location:"Hassan Jn.",      status:"On Time",    speed:68, load:63, type:"Flatbed",   cargo:"Coffee Beans",   gps:"Active",  health:85, eta:"16:30", zone:"SWR" },
];

const SEED_CARGO = [
  // NR
  { id:"CGO-NR01", wagon:"WGN-NR01", type:"Steel Coils",     weight:58.0, capacity:72, temp:28, tempLimit:40, status:"Normal",   destination:"Lucknow",          origin:"New Delhi",       seal:"SEALED", zone:"NR" },
  { id:"CGO-NR02", wagon:"WGN-NR02", type:"Textiles",        weight:44.0, capacity:60, temp:27, tempLimit:40, status:"Normal",   destination:"New Delhi",         origin:"Amritsar",        seal:"SEALED", zone:"NR" },
  { id:"CGO-NR03", wagon:"WGN-NR03", type:"Petroleum",       weight:52.0, capacity:65, temp:34, tempLimit:40, status:"Warning",  destination:"Varanasi",          origin:"New Delhi",       seal:"SEALED", zone:"NR" },
  { id:"CGO-NR04", wagon:"WGN-NR04", type:"Auto Parts",      weight:61.0, capacity:75, temp:29, tempLimit:45, status:"Normal",   destination:"Patna",             origin:"Lucknow",         seal:"SEALED", zone:"NR" },
  { id:"CGO-NR05", wagon:"WGN-NR05", type:"General Cargo",   weight:0,    capacity:65, temp:22, tempLimit:35, status:"Empty",    destination:"New Delhi",         origin:"Chandigarh",      seal:"OPEN",   zone:"NR" },
  // SR
  { id:"CGO-SR01", wagon:"WGN-SR01", type:"Electronics",     weight:55.0, capacity:68, temp:26, tempLimit:38, status:"Normal",   destination:"Ernakulam",         origin:"Chennai",         seal:"SEALED", zone:"SR" },
  { id:"CGO-SR02", wagon:"WGN-SR02", type:"Chemical Drums",  weight:45.0, capacity:60, temp:18, tempLimit:25, status:"Warning",  destination:"Chennai",           origin:"Coimbatore",      seal:"SEALED", zone:"SR" },
  { id:"CGO-SR03", wagon:"WGN-SR03", type:"Granite",         weight:70.0, capacity:80, temp:30, tempLimit:50, status:"Normal",   destination:"Thiruvananthapuram", origin:"Madurai",         seal:"SEALED", zone:"SR" },
  { id:"CGO-SR04", wagon:"WGN-SR04", type:"Cashews",         weight:38.0, capacity:55, temp:24, tempLimit:32, status:"Normal",   destination:"Chennai",           origin:"Ernakulam",       seal:"SEALED", zone:"SR" },
  { id:"CGO-SR05", wagon:"WGN-SR05", type:"General Cargo",   weight:0,    capacity:60, temp:22, tempLimit:35, status:"Empty",    destination:"Coimbatore",        origin:"Trichy",          seal:"OPEN",   zone:"SR" },
  // ER
  { id:"CGO-ER01", wagon:"WGN-ER01", type:"Steel Billets",   weight:70.0, capacity:80, temp:29, tempLimit:45, status:"Normal",   destination:"Patna",             origin:"Howrah",          seal:"SEALED", zone:"ER" },
  { id:"CGO-ER02", wagon:"WGN-ER02", type:"Coal",            weight:82.0, capacity:85, temp:36, tempLimit:50, status:"Critical", destination:"Howrah",            origin:"Dhanbad",         seal:"SEALED", zone:"ER" },
  { id:"CGO-ER03", wagon:"WGN-ER03", type:"Jute Products",   weight:48.0, capacity:65, temp:27, tempLimit:40, status:"Normal",   destination:"Kolkata",           origin:"Patna",           seal:"SEALED", zone:"ER" },
  { id:"CGO-ER04", wagon:"WGN-ER04", type:"Rice",            weight:42.0, capacity:70, temp:25, tempLimit:35, status:"Normal",   destination:"Howrah",            origin:"Muzaffarpur",     seal:"SEALED", zone:"ER" },
  { id:"CGO-ER05", wagon:"WGN-ER05", type:"General Cargo",   weight:0,    capacity:65, temp:22, tempLimit:35, status:"Empty",    destination:"Dhanbad",           origin:"Howrah",          seal:"OPEN",   zone:"ER" },
  // WR
  { id:"CGO-WR01", wagon:"WGN-WR01", type:"Textiles",        weight:62.0, capacity:75, temp:28, tempLimit:40, status:"Normal",   destination:"Ahmedabad",         origin:"Mumbai",          seal:"SEALED", zone:"WR" },
  { id:"CGO-WR02", wagon:"WGN-WR02", type:"Chemicals",       weight:50.0, capacity:65, temp:31, tempLimit:40, status:"Normal",   destination:"Vadodara",          origin:"Ahmedabad",       seal:"SEALED", zone:"WR" },
  { id:"CGO-WR03", wagon:"WGN-WR03", type:"Petroleum",       weight:55.0, capacity:65, temp:38, tempLimit:40, status:"Warning",  destination:"Rajkot",            origin:"Mumbai",          seal:"SEALED", zone:"WR" },
  { id:"CGO-WR04", wagon:"WGN-WR04", type:"Marble Slabs",    weight:68.0, capacity:80, temp:30, tempLimit:50, status:"Normal",   destination:"Bhavnagar",         origin:"Surat",           seal:"SEALED", zone:"WR" },
  { id:"CGO-WR05", wagon:"WGN-WR05", type:"General Cargo",   weight:0,    capacity:70, temp:22, tempLimit:35, status:"Empty",    destination:"Ahmedabad",         origin:"Rajkot",          seal:"OPEN",   zone:"WR" },
  // NER
  { id:"CGO-NE01", wagon:"WGN-NE01", type:"Tea",             weight:42.0, capacity:55, temp:24, tempLimit:35, status:"Normal",   destination:"New Jalpaiguri",    origin:"Guwahati",        seal:"SEALED", zone:"NER" },
  { id:"CGO-NE02", wagon:"WGN-NE02", type:"Timber",          weight:51.0, capacity:70, temp:26, tempLimit:40, status:"Warning",  destination:"Guwahati",          origin:"Dibrugarh",       seal:"SEALED", zone:"NER" },
  { id:"CGO-NE03", wagon:"WGN-NE03", type:"General Cargo",   weight:0,    capacity:60, temp:22, tempLimit:35, status:"Empty",    destination:"New Jalpaiguri",    origin:"Lumding",         seal:"OPEN",   zone:"NER" },
  { id:"CGO-NE04", wagon:"WGN-NE04", type:"Bamboo Products", weight:36.0, capacity:50, temp:25, tempLimit:38, status:"Normal",   destination:"Guwahati",          origin:"Agartala",        seal:"SEALED", zone:"NER" },
  // NWR
  { id:"CGO-NW01", wagon:"WGN-NW01", type:"Marble",          weight:68.0, capacity:80, temp:30, tempLimit:45, status:"Normal",   destination:"Delhi",             origin:"Jaipur",          seal:"SEALED", zone:"NWR" },
  { id:"CGO-NW02", wagon:"WGN-NW02", type:"Petroleum",       weight:55.0, capacity:65, temp:38, tempLimit:40, status:"Warning",  destination:"Ahmedabad",         origin:"Jodhpur",         seal:"SEALED", zone:"NWR" },
  { id:"CGO-NW03", wagon:"WGN-NW03", type:"Handicrafts",     weight:38.5, capacity:55, temp:27, tempLimit:40, status:"Normal",   destination:"Jaipur",            origin:"Bikaner",         seal:"SEALED", zone:"NWR" },
  { id:"CGO-NW04", wagon:"WGN-NW04", type:"Salt",            weight:72.0, capacity:85, temp:29, tempLimit:50, status:"Normal",   destination:"Delhi",             origin:"Ajmer",           seal:"SEALED", zone:"NWR" },
  // SER
  { id:"CGO-SE01", wagon:"WGN-SE01", type:"Iron Ore",        weight:74.0, capacity:85, temp:32, tempLimit:50, status:"Normal",   destination:"Bhubaneswar",       origin:"Kharagpur",       seal:"SEALED", zone:"SER" },
  { id:"CGO-SE02", wagon:"WGN-SE02", type:"Steel Billets",   weight:60.0, capacity:75, temp:29, tempLimit:45, status:"Warning",  destination:"Howrah",            origin:"Rourkela",        seal:"SEALED", zone:"SER" },
  { id:"CGO-SE03", wagon:"WGN-SE03", type:"Coal",            weight:80.0, capacity:90, temp:35, tempLimit:50, status:"Critical", destination:"Howrah",            origin:"Bokaro",          seal:"SEALED", zone:"SER" },
  { id:"CGO-SE04", wagon:"WGN-SE04", type:"Limestone",       weight:65.0, capacity:78, temp:28, tempLimit:45, status:"Normal",   destination:"Bhubaneswar",       origin:"Bilaspur",        seal:"SEALED", zone:"SER" },
  // SWR
  { id:"CGO-SW01", wagon:"WGN-SW01", type:"Electronics",     weight:44.0, capacity:60, temp:26, tempLimit:40, status:"Normal",   destination:"Hubli",             origin:"Bengaluru",       seal:"SEALED", zone:"SWR" },
  { id:"CGO-SW02", wagon:"WGN-SW02", type:"Cotton",          weight:58.0, capacity:72, temp:28, tempLimit:40, status:"Normal",   destination:"Mumbai",            origin:"Hubli",           seal:"SEALED", zone:"SWR" },
  { id:"CGO-SW03", wagon:"WGN-SW03", type:"General Cargo",   weight:0,    capacity:65, temp:22, tempLimit:35, status:"Empty",    destination:"Chennai",           origin:"Mysuru",          seal:"OPEN",   zone:"SWR" },
  { id:"CGO-SW04", wagon:"WGN-SW04", type:"Coffee Beans",    weight:32.0, capacity:45, temp:22, tempLimit:30, status:"Normal",   destination:"Mangaluru",         origin:"Bengaluru",       seal:"SEALED", zone:"SWR" },
];

const SEED_ALERTS = [
  // NR — North Railway
  { id:"ALT-NR01", wagon:"WGN-NR03", type:"Temperature Alert", severity:"High",     time:"09:15 AM", resolved:false, detail:"Petroleum cargo temp at 34°C, nearing 40°C limit near Allahabad Jn.",      zone:"NR" },
  { id:"ALT-NR02", wagon:"WGN-NR02", type:"Route Deviation",   severity:"Medium",   time:"08:50 AM", resolved:false, detail:"Deviated 1.8 km from planned route near Ambala Cantt. Driver alerted.",    zone:"NR" },
  { id:"ALT-NR03", wagon:"WGN-NR05", type:"GPS Signal Lost",   severity:"High",     time:"10:05 AM", resolved:false, detail:"GPS offline for 18 min. Last known location: Ambala City depot.",           zone:"NR" },
  // SR — South Railway
  { id:"ALT-SR01", wagon:"WGN-SR02", type:"Speed Anomaly",     severity:"High",     time:"10:20 AM", resolved:false, detail:"Speed drop to 46 km/h on express corridor near Salem Jn. Cause unknown.",   zone:"SR" },
  { id:"ALT-SR02", wagon:"WGN-SR02", type:"Temperature Alert", severity:"Critical", time:"09:40 AM", resolved:false, detail:"Chemical cargo temp at 18°C, dangerously close to lower safe limit of 15°C.",zone:"SR" },
  { id:"ALT-SR03", wagon:"WGN-SR05", type:"GPS Signal Lost",   severity:"Medium",   time:"11:00 AM", resolved:false, detail:"GPS offline at Erode Jn. depot. Maintenance wagon not moving.",              zone:"SR" },
  // ER — East Railway
  { id:"ALT-ER01", wagon:"WGN-ER02", type:"Cargo Overload",    severity:"Critical", time:"07:58 AM", resolved:false, detail:"Coal load at 96.5% near Durgapur — exceeds safe axle load threshold.",       zone:"ER" },
  { id:"ALT-ER02", wagon:"WGN-ER02", type:"Speed Anomaly",     severity:"High",     time:"10:14 AM", resolved:false, detail:"Detected speed reduction to 52 km/h on main line near Asansol.",              zone:"ER" },
  { id:"ALT-ER03", wagon:"WGN-ER05", type:"Brake Wear",        severity:"High",     time:"09:32 AM", resolved:false, detail:"Brake pad below 8mm on Axle 2 & 3 at Barddhaman Jn. depot.",                zone:"ER" },
  // WR — West Railway
  { id:"ALT-WR01", wagon:"WGN-WR03", type:"Temperature Alert", severity:"Critical", time:"08:05 AM", resolved:false, detail:"Petroleum cargo temp at 38°C near Vadodara Jn., limit is 40°C.",            zone:"WR" },
  { id:"ALT-WR02", wagon:"WGN-WR03", type:"Route Deviation",   severity:"Medium",   time:"09:30 AM", resolved:false, detail:"Minor deviation near Bharuch. Rerouting in progress.",                       zone:"WR" },
  { id:"ALT-WR03", wagon:"WGN-WR05", type:"GPS Signal Lost",   severity:"High",     time:"11:20 AM", resolved:false, detail:"GPS offline at Surendranagar depot. Maintenance scheduled.",                 zone:"WR" },
  // NER — North East Railway
  { id:"ALT-NE01", wagon:"WGN-NE01", type:"Route Deviation",   severity:"Medium",   time:"09:10 AM", resolved:false, detail:"Minor deviation near Alipurduar Jn. due to track work. Driver notified.",   zone:"NER" },
  { id:"ALT-NE02", wagon:"WGN-NE02", type:"Brake Wear",        severity:"High",     time:"10:45 AM", resolved:false, detail:"Brake pad wear on rear axles detected near Tinsukia Jn.",                   zone:"NER" },
  // NWR — North Western Railway
  { id:"ALT-NW01", wagon:"WGN-NW02", type:"Temperature Alert", severity:"Critical", time:"08:05 AM", resolved:false, detail:"Petroleum cargo temp at 38°C near Pali, approaching 40°C limit.",           zone:"NWR" },
  { id:"ALT-NW02", wagon:"WGN-NW01", type:"GPS Signal Lost",   severity:"High",     time:"11:20 AM", resolved:false, detail:"GPS intermittent near Alwar. Signal lost for 11 min.",                       zone:"NWR" },
  // SER — South Eastern Railway
  { id:"ALT-SE01", wagon:"WGN-SE02", type:"Speed Anomaly",     severity:"High",     time:"09:55 AM", resolved:false, detail:"Speed drop to 41 km/h near Jharsuguda Jn. Possible track defect.",           zone:"SER" },
  { id:"ALT-SE02", wagon:"WGN-SE03", type:"Cargo Overload",    severity:"Critical", time:"07:40 AM", resolved:false, detail:"Coal load at 104% of rated capacity on WGN-SE03 near Dhanbad Jn.",           zone:"SER" },
  // SWR — South Western Railway
  { id:"ALT-SW01", wagon:"WGN-SW02", type:"Engine Vibration",  severity:"Medium",   time:"10:30 AM", resolved:false, detail:"Coupling unit vibration near Dharwad. Inspection scheduled at next halt.",   zone:"SWR" },
  { id:"ALT-SW02", wagon:"WGN-SW01", type:"Route Deviation",   severity:"Low",      time:"11:00 AM", resolved:false, detail:"Minor deviation near Tumkur. Auto-corrected by driver.",                    zone:"SWR" },
];

const dayOffset = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

const SEED_MAINTENANCE = [
  // NR
  { id:"MNT-NR01", wagon:"WGN-NR03", type:"Temp Sensor Calibration", priority:"High",     scheduledDate:dayOffset(0),  tech:"Ravi Shankar",       status:"In Progress", notes:"Petroleum cargo sensor drifting near Allahabad",        zone:"NR" },
  { id:"MNT-NR02", wagon:"WGN-NR05", type:"GPS Unit Repair",         priority:"Medium",   scheduledDate:dayOffset(1),  tech:"Suresh Patel",       status:"Pending",     notes:"GPS offline at Ambala City depot",                      zone:"NR" },
  { id:"MNT-NR03", wagon:"WGN-NR01", type:"Oil & Lubrication",       priority:"Low",      scheduledDate:dayOffset(4),  tech:"Deepak Yadav",       status:"Upcoming",    notes:"Quarterly lubrication schedule — Delhi yard",           zone:"NR" },
  { id:"MNT-NR04", wagon:"WGN-NR05", type:"Brake Inspection",        priority:"Critical", scheduledDate:dayOffset(-1), tech:"Ramesh Kumar",       status:"Overdue",     notes:"Chandigarh depot — full brake system check required",   zone:"NR" },
  // SR
  { id:"MNT-SR01", wagon:"WGN-SR02", type:"Axle Bearing Service",    priority:"Critical", scheduledDate:dayOffset(0),  tech:"Arun Natarajan",     status:"In Progress", notes:"Chemical wagon bearing temp high near Salem Jn.",       zone:"SR" },
  { id:"MNT-SR02", wagon:"WGN-SR05", type:"Full Overhaul",           priority:"Critical", scheduledDate:dayOffset(2),  tech:"Venkatesh Iyer",     status:"Upcoming",    notes:"50k km service overhaul — Trichy depot",                zone:"SR" },
  { id:"MNT-SR03", wagon:"WGN-SR01", type:"Routine Check",           priority:"Low",      scheduledDate:dayOffset(-3), tech:"Priya Menon",        status:"Completed",   notes:"Monthly routine check — Chennai yard — all clear",      zone:"SR" },
  { id:"MNT-SR04", wagon:"WGN-SR03", type:"Wheel Alignment",         priority:"Medium",   scheduledDate:dayOffset(1),  tech:"Suresh Nadar",       status:"Pending",     notes:"Wheel flange check — granite wagon Madurai run",        zone:"SR" },
  // ER
  { id:"MNT-ER01", wagon:"WGN-ER02", type:"Wheel Alignment",         priority:"High",     scheduledDate:dayOffset(-1), tech:"Sanjay Mishra",      status:"Overdue",     notes:"Wheel flange below threshold — Dhanbad coal wagon",     zone:"ER" },
  { id:"MNT-ER02", wagon:"WGN-ER05", type:"Brake Inspection",        priority:"Critical", scheduledDate:dayOffset(0),  tech:"Ramesh Kumar",       status:"In Progress", notes:"Brake pad replacement at Barddhaman Jn.",               zone:"ER" },
  { id:"MNT-ER03", wagon:"WGN-ER01", type:"Routine Check",           priority:"Low",      scheduledDate:dayOffset(-4), tech:"Priya Singh",        status:"Completed",   notes:"Monthly routine — Howrah yard — passed",                zone:"ER" },
  { id:"MNT-ER04", wagon:"WGN-ER03", type:"Coupler Inspection",      priority:"Medium",   scheduledDate:dayOffset(2),  tech:"Tapan Roy",          status:"Upcoming",    notes:"Coupler pin check — Patna to Kolkata jute run",         zone:"ER" },
  // WR
  { id:"MNT-WR01", wagon:"WGN-WR03", type:"Temp Sensor Calibration", priority:"High",     scheduledDate:dayOffset(0),  tech:"Mahesh Patel",       status:"In Progress", notes:"Petroleum sensor calibration — Vadodara Jn.",           zone:"WR" },
  { id:"MNT-WR02", wagon:"WGN-WR05", type:"Brake Inspection",        priority:"Critical", scheduledDate:dayOffset(-1), tech:"Dinesh Shah",        status:"Overdue",     notes:"Full brake check at Surendranagar depot overdue",       zone:"WR" },
  { id:"MNT-WR03", wagon:"WGN-WR01", type:"Routine Check",           priority:"Low",      scheduledDate:dayOffset(-4), tech:"Kavitha Rajan",      status:"Completed",   notes:"Monthly routine — Mumbai Central yard — passed",        zone:"WR" },
  { id:"MNT-WR04", wagon:"WGN-WR02", type:"Air Brake Test",          priority:"Medium",   scheduledDate:dayOffset(3),  tech:"Nilesh Joshi",       status:"Upcoming",    notes:"Air brake test due — Ahmedabad to Vadodara run",        zone:"WR" },
  // NER
  { id:"MNT-NE01", wagon:"WGN-NE03", type:"Brake Inspection",        priority:"Critical", scheduledDate:dayOffset(-2), tech:"Bikash Das",         status:"Overdue",     notes:"Full brake inspection at Lumding depot",                zone:"NER" },
  { id:"MNT-NE02", wagon:"WGN-NE01", type:"Routine Check",           priority:"Low",      scheduledDate:dayOffset(2),  tech:"Ranju Bora",         status:"Upcoming",    notes:"Monthly routine check — Guwahati yard",                zone:"NER" },
  { id:"MNT-NE03", wagon:"WGN-NE02", type:"Wheel Alignment",         priority:"High",     scheduledDate:dayOffset(1),  tech:"Pranab Kalita",      status:"Pending",     notes:"Wheel flange check — Tinsukia Jn. timber wagon",       zone:"NER" },
  // NWR
  { id:"MNT-NW01", wagon:"WGN-NW02", type:"Coupler Replacement",     priority:"High",     scheduledDate:dayOffset(1),  tech:"Mahesh Sharma",      status:"Pending",     notes:"Coupler stress detected near Pali — Jodhpur run",       zone:"NWR" },
  { id:"MNT-NW02", wagon:"WGN-NW01", type:"GPS Unit Repair",         priority:"Medium",   scheduledDate:dayOffset(0),  tech:"Savita Kumari",      status:"In Progress", notes:"GPS intermittent near Alwar",                          zone:"NWR" },
  { id:"MNT-NW03", wagon:"WGN-NW03", type:"Routine Check",           priority:"Low",      scheduledDate:dayOffset(-3), tech:"Anil Bohra",         status:"Completed",   notes:"Monthly routine — Bikaner depot — all clear",          zone:"NWR" },
  // SER
  { id:"MNT-SE01", wagon:"WGN-SE02", type:"Wheel Alignment",         priority:"High",     scheduledDate:dayOffset(-1), tech:"Tapan Roy",          status:"Overdue",     notes:"Wheel flange below threshold — Jharsuguda Jn.",         zone:"SER" },
  { id:"MNT-SE02", wagon:"WGN-SE03", type:"Air Brake Test",          priority:"Critical", scheduledDate:dayOffset(0),  tech:"Prasanna Reddy",     status:"In Progress", notes:"Brake pressure test after overload alert — Dhanbad",    zone:"SER" },
  { id:"MNT-SE03", wagon:"WGN-SE01", type:"Routine Check",           priority:"Low",      scheduledDate:dayOffset(-5), tech:"Suresh Rao",         status:"Completed",   notes:"Monthly routine — Kharagpur depot — passed",           zone:"SER" },
  // SWR
  { id:"MNT-SW01", wagon:"WGN-SW03", type:"Full Overhaul",           priority:"Critical", scheduledDate:dayOffset(2),  tech:"Venkat Rao",         status:"Upcoming",    notes:"50k km service overhaul — Mysuru depot",               zone:"SWR" },
  { id:"MNT-SW02", wagon:"WGN-SW02", type:"Engine Vibration Check",  priority:"Medium",   scheduledDate:dayOffset(1),  tech:"Deepa Krishnamurthy",status:"Pending",     notes:"Vibration in coupling unit near Dharwad",              zone:"SWR" },
  { id:"MNT-SW03", wagon:"WGN-SW01", type:"Routine Check",           priority:"Low",      scheduledDate:dayOffset(-3), tech:"Ravi Kumar",         status:"Completed",   notes:"Monthly routine — KSR Bengaluru yard — passed",        zone:"SWR" },
];

const SEED_TASKS = [
  { id:1, text:"Inspect wagon at first scheduled halt",    priority:"High",   done:false },
  { id:2, text:"Update GPS status for delayed wagons",     priority:"Medium", done:false },
  { id:3, text:"Verify cargo seal on all assigned wagons", priority:"Low",    done:true  },
  { id:4, text:"Follow up on overdue maintenance tickets", priority:"High",   done:false },
  { id:5, text:"File daily operations report",             priority:"Medium", done:true  },
];

const OperatorDataContext = createContext(null);

export function OperatorDataProvider({ children }) {
  const { operator } = useAuth();
  const zone = operator?.zone;

  const [wagons,         setWagons]      = useState(() => SEED_WAGONS.filter(w => w.zone === zone));
  const [cargo,          setCargo]       = useState(() => SEED_CARGO.filter(c => c.zone === zone));
  const [alerts,         setAlerts]      = useState(() => SEED_ALERTS.filter(a => a.zone === zone));
  const [maintenance,    setMaintenance] = useState(() => SEED_MAINTENANCE.filter(m => m.zone === zone));
  const [tasks,          setTasks]       = useState(SEED_TASKS);
  const [resolvedAlerts, setResolved]    = useState([]);
  const tickRef = useRef(0);

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

  const updateWagonStatus    = useCallback((id, status) => setWagons(ws => ws.map(w => w.id === id ? { ...w, status } : w)), []);
  const addAlert             = useCallback((alert) => setAlerts(prev => [alert, ...prev]), []);
  const resolveAlert         = useCallback((id) => {
    const now = new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
    setAlerts(prev => {
      const item = prev.find(a => a.id === id);
      if (item) setResolved(r => [{ ...item, resolvedAt: now }, ...r]);
      return prev.filter(a => a.id !== id);
    });
  }, []);
  const advanceMaintenance   = useCallback((id) => {
    const NEXT = { Overdue:"In Progress", Pending:"In Progress", "In Progress":"Completed" };
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: NEXT[m.status] || m.status } : m));
  }, []);
  const scheduleMaintenance  = useCallback((form) => {
    const id = `MNT-${String(Date.now()).slice(-4)}`;
    setMaintenance(prev => [{ id, status:"Upcoming", ...form }, ...prev]);
    return id;
  }, []);
  const updateMaintenance    = useCallback((id, changes) => setMaintenance(prev => prev.map(m => m.id === id ? { ...m, ...changes } : m)), []);
  const deleteMaintenance    = useCallback((id) => setMaintenance(prev => prev.filter(m => m.id !== id)), []);
  const toggleTask           = useCallback((id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t)), []);
  const updateCargo          = useCallback((wagonId, changes) => setCargo(prev => prev.map(c => c.wagon === wagonId ? { ...c, ...changes } : c)), []);

  const stats = {
    totalWagons:    wagons.length,
    onTime:         wagons.filter(w => w.status === "On Time").length,
    delayed:        wagons.filter(w => w.status === "Delayed").length,
    maintenance:    wagons.filter(w => w.status === "Maintenance").length,
    gpsActive:      wagons.filter(w => w.gps === "Active").length,
    gpsOffline:     wagons.filter(w => w.gps === "Offline").length,
    avgSpeed:       Math.round(wagons.filter(w => w.speed > 0).reduce((s, w) => s + w.speed, 0) / (wagons.filter(w => w.speed > 0).length || 1)),
    avgHealth:      wagons.length ? Math.round(wagons.reduce((s, w) => s + w.health, 0) / wagons.length) : 0,
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
      wagons, cargo, alerts, resolvedAlerts, maintenance, tasks, stats,
      updateWagonStatus, resolveAlert, addAlert,
      advanceMaintenance, scheduleMaintenance, updateMaintenance, deleteMaintenance,
      toggleTask, updateCargo,
    }}>
      {children}
    </OperatorDataContext.Provider>
  );
}

export const useOperatorData = () => useContext(OperatorDataContext);
