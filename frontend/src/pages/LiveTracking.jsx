import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FiMapPin, FiWifi, FiWifiOff, FiRefreshCw, FiNavigation,
  FiSearch, FiX,
  FiClock, FiActivity, FiPackage, FiAlertTriangle, FiChevronRight,
} from "react-icons/fi";
import DashboardLayout from "../components/DashboardLayout";
import GoogleRailwayMap from "../components/GoogleRailwayMap";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

const ALL_STATIONS = {
  // NR — North Railway
  "New Delhi":       { lat:28.64, lng:77.21, major:true  },
  "Lucknow":         { lat:26.85, lng:80.95, major:true  },
  "Amritsar":        { lat:31.64, lng:74.87, major:true  },
  "Patna":           { lat:25.61, lng:85.14, major:true  },
  "Kanpur Jn.":      { lat:26.46, lng:80.35, major:false },
  "Allahabad Jn.":   { lat:25.44, lng:81.84, major:false },
  "Varanasi Jn.":    { lat:25.32, lng:82.97, major:false },
  "Ambala Cantt.":   { lat:30.38, lng:76.82, major:false },
  "Ambala City":     { lat:30.38, lng:76.78, major:false },
  "Chandigarh":      { lat:30.74, lng:76.79, major:false },
  "Moradabad":       { lat:28.84, lng:78.78, major:false },
  // SR — South Railway
  "Chennai Central": { lat:13.08, lng:80.27, major:true  },
  "Ernakulam":       { lat:9.98,  lng:76.28, major:true  },
  "Coimbatore":      { lat:11.00, lng:76.97, major:true  },
  "Madurai":         { lat:9.93,  lng:78.12, major:true  },
  "Thiruvananthapuram":{ lat:8.50, lng:76.95, major:true },
  "Trichy":          { lat:10.81, lng:78.69, major:false },
  "Salem Jn.":       { lat:11.67, lng:78.15, major:false },
  "Shoranur Jn.":    { lat:10.76, lng:76.27, major:false },
  "Tirunelveli":     { lat:8.73,  lng:77.70, major:false },
  "Palakkad Jn.":    { lat:10.78, lng:76.65, major:false },
  "Erode Jn.":       { lat:11.34, lng:77.72, major:false },
  // ER — East Railway
  "Howrah":          { lat:22.58, lng:88.36, major:true  },
  "Asansol Jn.":     { lat:23.68, lng:86.98, major:false },
  "Durgapur":        { lat:23.49, lng:87.32, major:false },
  "Dhanbad Jn.":     { lat:23.80, lng:86.43, major:false },
  "Barddhaman Jn.":  { lat:23.23, lng:87.86, major:false },
  "Patna Jn.":       { lat:25.61, lng:85.14, major:false },
  "Bhagalpur":       { lat:25.25, lng:87.01, major:false },
  "Jasidih Jn.":     { lat:24.52, lng:86.65, major:false },
  "Muzaffarpur":     { lat:26.12, lng:85.39, major:false },
  // WR — West Railway
  "Mumbai Central":  { lat:18.97, lng:72.82, major:true  },
  "Ahmedabad":       { lat:23.02, lng:72.57, major:true  },
  "Surat":           { lat:21.19, lng:72.84, major:true  },
  "Rajkot":          { lat:22.30, lng:70.80, major:true  },
  "Vadodara Jn.":    { lat:22.30, lng:73.18, major:false },
  "Anand Jn.":       { lat:22.56, lng:72.96, major:false },
  "Bharuch":         { lat:21.71, lng:72.99, major:false },
  "Bhavnagar":       { lat:21.76, lng:72.15, major:false },
  "Surendranagar":   { lat:22.73, lng:71.64, major:false },
  "Pune":            { lat:18.52, lng:73.86, major:true  },
  // NER — North East Railway
  "Guwahati":        { lat:26.14, lng:91.74, major:true  },
  "Tinsukia Jn.":    { lat:27.49, lng:95.36, major:false },
  "Dibrugarh":       { lat:27.47, lng:94.91, major:false },
  "New Jalpaiguri":  { lat:26.71, lng:88.36, major:false },
  "Alipurduar Jn.":  { lat:26.49, lng:89.53, major:false },
  "Agartala":        { lat:23.84, lng:91.28, major:false },
  "Lumding Jn.":     { lat:25.75, lng:93.17, major:false },
  "Badarpur Jn.":    { lat:24.87, lng:92.59, major:false },
  // NWR — North Western Railway
  "Jaipur Jn.":      { lat:26.92, lng:75.78, major:true  },
  "Jodhpur":         { lat:26.28, lng:73.02, major:true  },
  "Bikaner":         { lat:28.02, lng:73.31, major:true  },
  "Ajmer":           { lat:26.45, lng:74.64, major:false },
  "Alwar":           { lat:27.56, lng:76.63, major:false },
  "Pali":            { lat:25.77, lng:73.33, major:false },
  "Sikar":           { lat:27.61, lng:75.14, major:false },
  // SER — South Eastern Railway
  "Kharagpur":       { lat:22.33, lng:87.32, major:true  },
  "Bhubaneswar":     { lat:20.30, lng:85.82, major:true  },
  "Rourkela":        { lat:22.22, lng:84.86, major:false },
  "Raipur Jn.":      { lat:21.25, lng:81.63, major:false },
  "Bilaspur":        { lat:22.09, lng:82.14, major:false },
  "Balasore":        { lat:21.49, lng:86.93, major:false },
  "Jharsuguda Jn.":  { lat:21.85, lng:84.01, major:false },
  "Bokaro":          { lat:23.67, lng:86.15, major:false },
  // SWR — South Western Railway
  "Bengaluru":       { lat:12.97, lng:77.59, major:true  },
  "Hubli":           { lat:15.36, lng:75.12, major:true  },
  "Mysuru":          { lat:12.30, lng:76.64, major:true  },
  "Mangaluru":       { lat:12.87, lng:74.88, major:true  },
  "Tumkur":          { lat:13.34, lng:77.10, major:false },
  "Dharwad":         { lat:15.46, lng:75.00, major:false },
  "Hassan Jn.":      { lat:13.00, lng:76.10, major:false },
  "Krishnarajapete": { lat:12.66, lng:76.50, major:false },
  // Other major hubs
  "Hyderabad":       { lat:17.38, lng:78.47, major:true  },
  "Nagpur":          { lat:21.15, lng:79.09, major:true  },
  "Bhopal":          { lat:23.26, lng:77.40, major:true  },
  "Mumbai":          { lat:18.97, lng:72.82, major:true  },
  "Delhi":           { lat:28.64, lng:77.21, major:true  },
  "Kolkata":         { lat:22.57, lng:88.36, major:true  },
};

const STATUS_COLOR = { Running:"#22c55e", Delayed:"#f59e0b", Halted:"#ef4444", Maintenance:"#f97316" };
const STATUS_BADGE = { Running:"badge-active", Delayed:"badge-delayed", Halted:"badge-high", Maintenance:"badge-maint" };
const GPS_COLOR = { Active:"#22c55e", Offline:"#ef4444", Weak:"#f59e0b" };
const ZONE_COLORS  = { NR:"#3b82f6", SR:"#22c55e", ER:"#f59e0b", WR:"#a855f7", NER:"#06b6d4", NWR:"#f97316", SER:"#10b981", SWR:"#ec4899" };

const speedColor  = s => s > 80 ? "#ef4444" : s > 50 ? "#f59e0b" : s > 0 ? "#22c55e" : "#64748b";

function getLatLng(name) {
  if (!name) return null;
  const exact = ALL_STATIONS[name];
  if (exact) return { lat: exact.lat, lng: exact.lng };
  const key = Object.keys(ALL_STATIONS).find(k =>
    k.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(k.toLowerCase())
  );
  return key ? { lat: ALL_STATIONS[key].lat, lng: ALL_STATIONS[key].lng } : null;
}

// ── Detail Panel ──────────────────────────────────────────────────────────────
function DetailPanel({ wagon, onClose }) {
  if (!wagon) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
      <FiMapPin size={36} color="#1a3356" style={{ marginBottom:12 }}/>
      <div style={{ color:"#2a4a6e", fontSize:14, fontWeight:600 }}>Select a wagon</div>
      <div style={{ color:"#1a3356", fontSize:12, marginTop:6 }}>Click any wagon dot on the map or from the list below</div>
    </div>
  );
  const statusCol = STATUS_COLOR[wagon.status] || "#3b82f6";
  const sc        = speedColor(wagon.speed);
  const zoneCol   = ZONE_COLORS[wagon.zone] || "#3b82f6";
  const loadPct   = wagon.capacity ? Math.round((wagon.load / wagon.capacity) * 100) : wagon.load;
  const loadBar   = Math.min(loadPct, 100);
  const gpsCoords = (wagon.gpsLatitude != null && wagon.gpsLongitude != null)
    ? `${wagon.gpsLatitude.toFixed(4)}, ${wagon.gpsLongitude.toFixed(4)}`
    : "N/A";
  const lastUpdatedStr = wagon.lastUpdated
    ? new Date(wagon.lastUpdated).toLocaleString()
    : "N/A";

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, height:"100%", overflowY:"auto", overflowX:"hidden" }}>

      {/* Header */}
      <div style={{ padding:"14px 16px", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`${statusCol}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🚆</div>
          <div>
            <div style={{ color:"#60a5fa", fontWeight:800, fontSize:15 }}>{wagon.id}</div>
            <div style={{ display:"flex", gap:6, alignItems:"center", marginTop:2 }}>
              <span style={{ background:`${zoneCol}20`, color:zoneCol, border:`1px solid ${zoneCol}50`, borderRadius:10, padding:"1px 7px", fontSize:10, fontWeight:700 }}>Zone {wagon.zone}</span>
              <span style={{ color:"#4a6fa5", fontSize:11 }}>{wagon.type}</span>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span className={`badge ${STATUS_BADGE[wagon.status]||"badge-info"}`}>{wagon.status}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#4a6fa5", cursor:"pointer" }}><FiX size={14}/></button>
        </div>
      </div>

      {/* GPS status bar */}
      <div style={{ padding:"8px 16px", background:wagon.gps==="Active"?"rgba(34,197,94,.07)":"rgba(239,68,68,.07)", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        {wagon.gps==="Active" ? <FiWifi size={12} color="#22c55e"/> : <FiWifiOff size={12} color="#ef4444"/>}
        <span style={{ color:GPS_COLOR[wagon.gps], fontSize:12, fontWeight:600 }}>GPS {wagon.gps}</span>
        <span style={{ color:"#4a6fa5", fontSize:11, marginLeft:"auto" }}>{gpsCoords}</span>
      </div>

      {/* Location & Destination */}
      <div style={{ padding:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, flexShrink:0 }}>
        {[
          { icon:FiMapPin,     label:"Current Station", value:wagon.location,          color:"#f1f5f9" },
          { icon:FiNavigation, label:"Destination",     value:wagon.destination,       color:"#f1f5f9" },
          { icon:FiActivity,   label:"Speed",           value:`${wagon.speed} km/h`,   color:sc        },
          { icon:FiClock,      label:"Last Updated",    value:lastUpdatedStr,          color:"#94a3b8" },
        ].map(({ icon:Icon, label, value, color }) => (
          <div key={label} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:9, padding:"10px 12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
              <Icon size={11} color="#4a6fa5"/>
              <span style={{ color:"#4a6fa5", fontSize:10, textTransform:"uppercase", letterSpacing:.5 }}>{label}</span>
            </div>
            <div style={{ color, fontWeight:700, fontSize:12, lineHeight:1.3 }}>{value}</div>
          </div>
        ))}
      </div>

      {wagon.status === "Delayed" && (
        <div style={{ margin:"0 12px 8px", background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.3)", borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
          <FiAlertTriangle size={12} color="#f59e0b"/>
          <span style={{ color:"#f59e0b", fontSize:12, fontWeight:600 }}>Running behind schedule</span>
        </div>
      )}

      {/* Speed bar */}
      <div style={{ padding:"0 12px 10px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ color:"#64748b", fontSize:11 }}>Speed</span>
          <span style={{ color:sc, fontSize:12, fontWeight:700 }}>{wagon.speed} / 120 km/h</span>
        </div>
        <div className="progress-bg"><div className="progress-fill" style={{ width:`${Math.min(wagon.speed/120*100,100)}%`, background:sc }}/></div>
      </div>

      {/* Cargo */}
      <div style={{ margin:"0 12px 10px", background:"#071628", border:"1px solid #1a3356", borderRadius:9, padding:"10px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
          <FiPackage size={12} color="#4a6fa5"/>
          <span style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:.5 }}>Cargo</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            ["Type",     wagon.cargo || "N/A"],
            ["Load",     wagon.capacity != null ? `${wagon.load} / ${wagon.capacity} t` : `${wagon.load} t`],
            ["Capacity", wagon.capacity != null ? `${wagon.capacity} t` : "N/A"],
            ["Fill",     wagon.capacity != null ? `${loadPct}%` : "N/A"],
          ].map(([l,v]) => (
            <div key={l}><div style={{ color:"#4a6fa5", fontSize:10 }}>{l}</div><div style={{ color:"#f1f5f9", fontSize:12, fontWeight:600, marginTop:2 }}>{v}</div></div>
          ))}
        </div>
        <div style={{ marginTop:10 }}>
          <div className="progress-bg"><div className="progress-fill" style={{ width:`${loadBar}%`, background:loadBar>85?"#ef4444":loadBar>65?"#f59e0b":"#22c55e" }}/></div>
        </div>
      </div>

      {/* Temperature */}
      <div style={{ margin:"0 12px 10px", background:"#071628", border:"1px solid #1a3356", borderRadius:9, padding:"10px 12px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          <div>
            <div style={{ color:"#4a6fa5", fontSize:10, textTransform:"uppercase", letterSpacing:.5 }}>Temperature</div>
            <div style={{ color: wagon.temperature != null ? (wagon.temperature > 60 ? "#ef4444" : wagon.temperature > 40 ? "#f59e0b" : "#22c55e") : "#64748b", fontSize:12, fontWeight:700, marginTop:4 }}>
              {wagon.temperature != null ? `${wagon.temperature} °C` : "N/A"}
            </div>
          </div>
          <div>
            <div style={{ color:"#4a6fa5", fontSize:10, textTransform:"uppercase", letterSpacing:.5 }}>Wagon Health</div>
            <div style={{ color:"#64748b", fontSize:12, fontWeight:700, marginTop:4 }}>N/A</div>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Wagon List Item ───────────────────────────────────────────────────────────
function WagonListItem({ wagon, selected, onClick }) {
  const col      = wagon.gps==="Offline" ? "#64748b" : STATUS_COLOR[wagon.status]||"#3b82f6";
  const isActive = selected?.id === wagon.id;
  const zoneCol  = ZONE_COLORS[wagon.zone] || "#3b82f6";
  const rowRef   = useRef(null);

  useEffect(() => {
    if (isActive) rowRef.current?.scrollIntoView({ behavior:"smooth", block:"nearest" });
  }, [isActive]);

  return (
    <div ref={rowRef} onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, cursor:"pointer", marginBottom:2, background:isActive?"rgba(37,99,235,.18)":"transparent", border:`1px solid ${isActive?"#2563eb":"transparent"}`, transition:"all .15s" }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background="rgba(37,99,235,.08)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background="transparent"; }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:col, flexShrink:0, boxShadow:wagon.gps!=="Offline"?`0 0 6px ${col}`:"none" }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ color:isActive?"#60a5fa":"#94a3b8", fontWeight:700, fontSize:12 }}>{wagon.id}</span>
          <span style={{ background:`${zoneCol}20`, color:zoneCol, borderRadius:8, padding:"0px 5px", fontSize:9, fontWeight:700 }}>{wagon.zone}</span>
        </div>
        <div style={{ color:"#4a6fa5", fontSize:10, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{wagon.location}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
        <span className={`badge ${STATUS_BADGE[wagon.status]||"badge-info"}`} style={{ fontSize:9, padding:"1px 6px" }}>{wagon.status}</span>
        <span style={{ color:"#4a6fa5", fontSize:10 }}>{wagon.speed} km/h</span>
      </div>
      <FiChevronRight size={12} color={isActive?"#3b82f6":"#1e3a5f"}/>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const LiveTracking = () => {
  const [selected,      setSelected]      = useState(null);
  const [searchWagon,   setSearchWagon]   = useState("");
  const [searchStation, setSearchStation] = useState("");
  const [filterZone,    setFilterZone]    = useState("All");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [refreshing,    setRefreshing]    = useState(false);
  const [refreshMsg,    setRefreshMsg]    = useState(null);
  const [lastRefresh,   setLastRefresh]   = useState(new Date());
  const [wagons,        setWagons]        = useState([]);
  const [allWagons,     setAllWagons]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [focusWagon,    setFocusWagon]    = useState(null);
  const { admin } = useAuth();

  const fetchWagons = useCallback(() => {
    setLoading(true);
    return api.getWagons()
      .then(res => {
        const mapped = (res.data || []).map(w => ({
          _id:          w._id,
          id:           w.wagonId,
          zone:         w.zone              || "—",
          route:        w.destination       || "",
          location:     w.currentStation    || "Unknown",
          destination:  w.destination       || "N/A",
          status:       w.status            || "On Time",
          gps:          (w.gpsLatitude || w.gpsLongitude) ? "Active" : "Offline",
          gpsLatitude:  w.gpsLatitude       ?? null,
          gpsLongitude: w.gpsLongitude      ?? null,
          speed:        w.speed             ?? 0,
          temperature:  w.temperature       ?? null,
          health:       null,
          cargo:        w.cargoType         || "—",
          load:         w.currentLoad       ?? 0,
          capacity:     w.capacity          ?? null,
          lastUpdated:  w.lastUpdated        || null,
          eta:          null,
          type:         w.wagonType         || "—",
          lastPing:     null,
        }));
        setAllWagons(mapped);
        const rows = mapped.filter(w => w.zone === admin?.zone);
        setWagons(rows);
        if (rows.length > 0) setSelected(rows[0]);
      })
      .catch(err => console.error("[LiveTracking] API fetch failed:", err.message))
      .finally(() => setLoading(false));
  }, [admin?.zone]);

  useEffect(() => { fetchWagons(); }, [fetchWagons]);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshMsg(null);
    fetchWagons()
      .then(() => { setLastRefresh(new Date()); setRefreshMsg("success"); })
      .catch(() => setRefreshMsg("error"))
      .finally(() => { setRefreshing(false); setTimeout(() => setRefreshMsg(null), 2500); });
  };

  const filteredList = useMemo(() => wagons.filter(w => {
    const matchSearch = w.id.toLowerCase().includes(searchWagon.toLowerCase()) ||
      w.location.toLowerCase().includes(searchWagon.toLowerCase()) ||
      w.route.toLowerCase().includes(searchWagon.toLowerCase());
    const matchZone   = filterZone   === "All" || w.zone   === filterZone;
    const matchStatus = filterStatus === "All" || w.status === filterStatus;
    return matchSearch && matchZone && matchStatus;
  }), [searchWagon, filterZone, filterStatus, wagons]);

  useEffect(() => {
    if (filteredList.length === 1) {
      setSelected(filteredList[0]);
      setFocusWagon(filteredList[0]);
    } else {
      setFocusWagon(null);
    }
  }, [filteredList]);

  if (loading) return (
    <DashboardLayout>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:400 }}>
        <div style={{ textAlign:"center" }}>
          <FiRefreshCw size={28} color="#3b82f6" style={{ animation:"spin .9s linear infinite", marginBottom:12 }}/>
          <div style={{ color:"#4a6fa5", fontSize:14, fontWeight:600 }}>Loading live wagons…</div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ color:"#f1f5f9", fontWeight:800, fontSize:20 }}>Live Tracking</div>
          <div style={{ color:"#4a6fa5", fontSize:12 }}>Real-time wagon positions across all zones</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"#4a6fa5", fontSize:11 }}>Updated: {lastRefresh.toLocaleTimeString()}</span>
          {refreshMsg === "success" && (
            <span style={{ color:"#22c55e", fontSize:11, fontWeight:600, animation:"pulse .4s ease" }}>✓ Live data refreshed successfully</span>
          )}
          {refreshMsg === "error" && (
            <span style={{ color:"#ef4444", fontSize:11, fontWeight:600 }}>⚠ Failed to refresh live data</span>
          )}
          <button onClick={handleRefresh} style={{ display:"flex", alignItems:"center", gap:6, background:"#071628", border:"1px solid #1a3356", borderRadius:8, color:"#60a5fa", padding:"6px 14px", cursor:"pointer", fontSize:12 }}>
            <FiRefreshCw size={13} style={{ animation: refreshing ? "spin .7s linear infinite" : "none" }}/>
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap" }}>
        <div style={{ position:"relative", flex:1, minWidth:160 }}>
          <FiSearch size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#4a6fa5" }}/>
          <input value={searchWagon} onChange={e=>setSearchWagon(e.target.value)} placeholder="Search wagon / location…"
            style={{ width:"100%", paddingLeft:30, padding:"7px 10px 7px 30px", background:"#071628", border:"1px solid #1a3356", borderRadius:8, color:"#f1f5f9", fontSize:12, outline:"none", boxSizing:"border-box" }}/>
        </div>
        <div style={{ position:"relative", flex:1, minWidth:140 }}>
          <FiSearch size={13} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#4a6fa5" }}/>
          <input value={searchStation} onChange={e=>setSearchStation(e.target.value)} placeholder="Highlight station…"
            style={{ width:"100%", paddingLeft:30, padding:"7px 10px 7px 30px", background:"#071628", border:"1px solid #1a3356", borderRadius:8, color:"#f1f5f9", fontSize:12, outline:"none", boxSizing:"border-box" }}/>
        </div>
        {[["filterZone",filterZone,setFilterZone,["All",...Object.keys(ZONE_COLORS)]],["filterStatus",filterStatus,setFilterStatus,["All","On Time","Delayed","Maintenance"]]].map(([key,val,setter,opts]) => (
          <select key={key} value={val} onChange={e=>setter(e.target.value)}
            style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:8, color:"#f1f5f9", padding:"7px 10px", fontSize:12, cursor:"pointer", outline:"none" }}>
            {opts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {/* Map + Detail panel */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:14, height:480 }}>
        <div className="card" style={{ padding:0, overflow:"hidden", position:"relative" }}>
          <GoogleRailwayMap
            wagons={filteredList}
            selected={selected}
            onSelectWagon={setSelected}
            searchStation={searchStation}
            focusWagon={focusWagon}
            getStationCoords={getLatLng}
            zoneColors={ZONE_COLORS}
            statusColors={STATUS_COLOR}
          />
        </div>
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <DetailPanel wagon={selected} onClose={()=>setSelected(null)}/>
        </div>
      </div>

      {/* Fleet list + Zone summary */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>Fleet ({filteredList.length})</div>
            <span style={{ color:"#4a6fa5", fontSize:11 }}>Click to select</span>
          </div>
          <div style={{ padding:"8px", maxHeight:280, overflowY:"auto" }}>
            {filteredList.length === 0
              ? <div style={{ textAlign:"center", padding:32, color:"#4a6fa5", fontSize:12 }}>No wagons match filter</div>
              : filteredList.map(w => <WagonListItem key={w.id} wagon={w} selected={selected} onClick={()=>{ setSelected(w); setFocusWagon(w); }}/>)
            }
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #1a3356" }}>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>Zone Summary</div>
          </div>
          <div style={{ maxHeight:280, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["Zone","Total","Running","Loading","Unloading","Delayed","Maint.","Idle"].map(h => (
                    <th key={h} style={{ color:"#4a6fa5", fontSize:10, fontWeight:700, textTransform:"uppercase", padding:"8px 14px", textAlign:h==="Zone"?"left":"center", borderBottom:"1px solid #1a3356" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const zoneData  = allWagons.filter(w => w.zone === admin?.zone);
                  const zc        = ZONE_COLORS[admin?.zone] || "#3b82f6";
                  const running   = zoneData.filter(w => w.status === "Running").length;
                  const loading   = zoneData.filter(w => w.status === "Loading").length;
                  const unloading = zoneData.filter(w => w.status === "Unloading").length;
                  const delayed   = zoneData.filter(w => w.status === "Delayed").length;
                  const maint     = zoneData.filter(w => w.status === "Maintenance").length;
                  const idle      = zoneData.filter(w => w.status === "Idle").length;
                  return (
                    <tr style={{ borderBottom:"1px solid rgba(26,51,86,.4)" }}>
                      <td style={{ padding:"9px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:zc }}/>
                          <span style={{ color:zc, fontWeight:700, fontSize:12 }}>{admin?.zone}</span>
                        </div>
                      </td>
                      <td style={{ padding:"9px 14px", textAlign:"center" }}><span style={{ color:"#f1f5f9", fontWeight:700, fontSize:12 }}>{zoneData.length}</span></td>
                      <td style={{ padding:"9px 14px", textAlign:"center" }}><span style={{ color:"#22c55e", fontWeight:600, fontSize:12 }}>{running}</span></td>
                      <td style={{ padding:"9px 14px", textAlign:"center" }}><span style={{ color:"#3b82f6", fontWeight:600, fontSize:12 }}>{loading}</span></td>
                      <td style={{ padding:"9px 14px", textAlign:"center" }}><span style={{ color:"#06b6d4", fontWeight:600, fontSize:12 }}>{unloading}</span></td>
                      <td style={{ padding:"9px 14px", textAlign:"center" }}><span style={{ color:"#f59e0b", fontWeight:600, fontSize:12 }}>{delayed}</span></td>
                      <td style={{ padding:"9px 14px", textAlign:"center" }}><span style={{ color:"#f97316", fontWeight:600, fontSize:12 }}>{maint}</span></td>
                      <td style={{ padding:"9px 14px", textAlign:"center" }}><span style={{ color:"#64748b", fontWeight:600, fontSize:12 }}>{idle}</span></td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin  { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
      `}</style>
    </DashboardLayout>
  );
};

export default LiveTracking;
