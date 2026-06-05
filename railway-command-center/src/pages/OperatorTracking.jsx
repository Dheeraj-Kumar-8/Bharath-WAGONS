import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  FiMapPin, FiWifi, FiWifiOff, FiRefreshCw, FiNavigation,
  FiSearch, FiZoomIn, FiZoomOut, FiMaximize2, FiX,
  FiClock, FiActivity, FiPackage, FiAlertTriangle, FiChevronRight,
} from "react-icons/fi";
import OperatorLayout from "../components/OperatorLayout";
import { useOperatorData } from "../context/OperatorDataContext";

const MAP_LAT_MIN = 8,  MAP_LAT_MAX = 37;
const MAP_LNG_MIN = 68, MAP_LNG_MAX = 97;
const W = 800, H = 620;
const geo2svg = (lat, lng) => ({
  x: ((lng - MAP_LNG_MIN) / (MAP_LNG_MAX - MAP_LNG_MIN)) * W,
  y: H - ((lat - MAP_LAT_MIN) / (MAP_LAT_MAX - MAP_LAT_MIN)) * H,
});

const STATIONS = [
  { id:"DEL", name:"New Delhi",     lat:28.64, lng:77.21, major:true  },
  { id:"MUM", name:"Mumbai CST",    lat:18.94, lng:72.84, major:true  },
  { id:"CHN", name:"Chennai Ctrl",  lat:13.08, lng:80.27, major:true  },
  { id:"KOL", name:"Kolkata Hw",    lat:22.58, lng:88.36, major:true  },
  { id:"HYD", name:"Hyderabad",     lat:17.44, lng:78.50, major:true  },
  { id:"BLR", name:"Bengaluru",     lat:12.97, lng:77.59, major:true  },
  { id:"AGR", name:"Agra",          lat:27.18, lng:78.01, major:false },
  { id:"NGP", name:"Nagpur",        lat:21.15, lng:79.09, major:false },
  { id:"PUN", name:"Pune",          lat:18.52, lng:73.86, major:false },
  { id:"VIZ", name:"Vizag",         lat:17.69, lng:83.22, major:false },
  { id:"BHO", name:"Bhopal",        lat:23.26, lng:77.41, major:false },
  { id:"KOT", name:"Kota Jn.",      lat:25.18, lng:75.83, major:false },
  { id:"RAI", name:"Raipur",        lat:21.25, lng:81.63, major:false },
  { id:"WAR", name:"Wardha",        lat:20.75, lng:78.60, major:false },
  { id:"SEC", name:"Secunderabad",  lat:17.44, lng:78.50, major:false },
  { id:"BHB", name:"Bhubaneswar",   lat:20.30, lng:85.82, major:false },
];

const ROUTES = {
  "WGN-1042": { stations:["DEL","KOT","BHO","NGP","PUN","MUM"],  color:"#3b82f6" },
  "WGN-2187": { stations:["KOL","BHB","VIZ","CHN"],              color:"#f59e0b" },
  "WGN-3301": { stations:["MUM","PUN","HYD"],                    color:"#22c55e" },
  "WGN-4056": { stations:["CHN","NGP","BHO","AGR","DEL"],        color:"#ef4444" },
  "WGN-5774": { stations:["HYD","NGP","RAI","KOL"],              color:"#8b5cf6" },
  "WGN-6613": { stations:["DEL","AGR","BHO","HYD","BLR"],        color:"#f97316" },
  "WGN-7890": { stations:["MUM","NGP","WAR","RAI","KOL"],        color:"#06b6d4" },
  "WGN-8421": { stations:["BLR","SEC","HYD","NGP","BHO","AGR","DEL"], color:"#a855f7" },
};

const WAGON_META = {
  "WGN-1042": { currentStationId:"KOT", completedStations:["DEL","KOT"], upcomingStations:["BHO","NGP","PUN","MUM"], delay:0,   weight:"52T", capacity:"60T" },
  "WGN-2187": { currentStationId:"VIZ", completedStations:["KOL","BHB","VIZ"], upcomingStations:["CHN"],            delay:42,  weight:"40T", capacity:"45T" },
  "WGN-3301": { currentStationId:"PUN", completedStations:["MUM","PUN"], upcomingStations:["HYD"],                  delay:0,   weight:"50T", capacity:"55T" },
  "WGN-4056": { currentStationId:"NGP", completedStations:["CHN","NGP"], upcomingStations:["BHO","AGR","DEL"],      delay:180, weight:"0T",  capacity:"60T" },
  "WGN-5774": { currentStationId:"RAI", completedStations:["HYD","NGP","RAI"], upcomingStations:["KOL"],            delay:0,   weight:"45T", capacity:"60T" },
  "WGN-6613": { currentStationId:"BHO", completedStations:["DEL","AGR","BHO"], upcomingStations:["HYD","BLR"],     delay:47,  weight:"53T", capacity:"60T" },
  "WGN-7890": { currentStationId:"WAR", completedStations:["MUM","NGP","WAR"], upcomingStations:["RAI","KOL"],     delay:0,   weight:"33T", capacity:"60T" },
  "WGN-8421": { currentStationId:"SEC", completedStations:["BLR","SEC"], upcomingStations:["HYD","NGP","BHO","AGR","DEL"], delay:0, weight:"38T", capacity:"60T" },
};

const STATUS_COLOR = { "On Time":"#22c55e", Delayed:"#f59e0b", Halted:"#ef4444", Maintenance:"#f97316" };
const STATUS_BADGE = { "On Time":"badge-ontime", Delayed:"badge-delayed", Halted:"badge-high", Maintenance:"badge-maint" };
const GPS_COLOR    = { Active:"#22c55e", Offline:"#ef4444", Weak:"#f59e0b" };
const speedColor  = s => s > 80 ? "#ef4444" : s > 50 ? "#f59e0b" : s > 0 ? "#22c55e" : "#64748b";
const healthColor = h => h >= 75 ? "#22c55e" : h >= 50 ? "#f59e0b" : "#ef4444";

const INDIA_POINTS = [
  [37.1,74.5],[36.9,76.9],[35.5,77.8],[34.5,76.5],[34.1,74.5],
  [32.7,74.6],[31.4,75.7],[30.2,77.6],[29.0,79.5],[28.0,80.5],
  [27.5,83.5],[26.9,87.0],[26.5,88.5],[25.6,89.5],[24.5,91.0],
  [23.6,92.5],[24.0,94.0],[25.5,95.5],[27.2,97.0],[28.2,96.0],
  [26.5,90.0],[22.0,88.5],[21.0,87.0],[20.0,86.5],[17.7,83.3],
  [14.8,80.2],[13.1,80.3],[11.1,79.8],[8.1,77.5],[8.5,76.9],
  [9.5,76.2],[10.8,76.1],[11.9,75.3],[12.8,74.8],[14.0,74.4],
  [15.5,73.9],[16.5,73.5],[17.4,73.3],[18.9,72.8],[20.2,72.6],
  [21.2,72.5],[22.3,68.8],[23.7,68.2],[24.9,68.3],[27.2,65.9],
  [28.5,69.5],[30.0,70.2],[31.5,71.0],[32.4,72.0],[34.5,71.5],[37.1,74.5],
].map(([lat, lng]) => geo2svg(lat, lng));
const indiaPath = "M " + INDIA_POINTS.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ") + " Z";

function RailwayMap({ wagons, selected, onSelectWagon, searchStation }) {
  const svgRef = useRef(null);
  const [zoom, setZoom]     = useState(1);
  const [pan, setPan]       = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [tooltip, setTooltip]   = useState(null);
  const [hovered, setHovered]   = useState(null);
  const MIN_ZOOM = 0.7, MAX_ZOOM = 4;

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor)));
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const onMouseDown = (e) => { if (e.button !== 0) return; setDragging(true); setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y }); };
  const onMouseMove = (e) => { if (!dragging) return; setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y }); };
  const onMouseUp   = () => setDragging(false);
  const resetView   = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const wagonPos = useMemo(() => wagons.map(w => {
    const meta = WAGON_META[w.id];
    const stId = meta?.currentStationId || "NGP";
    const st = STATIONS.find(s => s.id === stId);
    if (!st) return null;
    const jitter = w.id.charCodeAt(4) % 3;
    return { ...geo2svg(st.lat + jitter * 0.3, st.lng + jitter * 0.25), wagon: w };
  }).filter(Boolean), [wagons]);

  const highlightStation = searchStation
    ? STATIONS.find(s => s.name.toLowerCase().includes(searchStation.toLowerCase()))
    : null;

  const transform = `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`;

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", background:"#030d1f", overflow:"hidden", cursor: dragging ? "grabbing" : "grab", userSelect:"none" }}>
      <div style={{ position:"absolute", top:12, right:12, display:"flex", flexDirection:"column", gap:4, zIndex:10 }}>
        {[{ icon:FiZoomIn, onClick:()=>setZoom(z=>Math.min(MAX_ZOOM,z*1.3)), title:"Zoom In" },
          { icon:FiZoomOut, onClick:()=>setZoom(z=>Math.max(MIN_ZOOM,z/1.3)), title:"Zoom Out" },
          { icon:FiMaximize2, onClick:resetView, title:"Reset" },
        ].map(({ icon: Icon, onClick, title }) => (
          <button key={title} onClick={onClick} title={title} style={{ width:32, height:32, borderRadius:8, border:"1px solid #1a3356", background:"rgba(13,31,60,.92)", color:"#94a3b8", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon size={14}/>
          </button>
        ))}
      </div>
      <div style={{ position:"absolute", bottom:10, left:10, background:"rgba(6,14,30,.9)", border:"1px solid #1a3356", borderRadius:8, padding:"8px 12px", zIndex:10 }}>
        {[["On Time","#22c55e"],["Delayed","#f59e0b"],["Halted","#ef4444"],["Offline","#64748b"]].map(([l,c]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/><span style={{ color:"#94a3b8", fontSize:10 }}>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(6,14,30,.9)", border:"1px solid #1a3356", borderRadius:6, padding:"4px 8px", zIndex:10 }}>
        <span style={{ color:"#4a6fa5", fontSize:10 }}>{Math.round(zoom * 100)}%</span>
      </div>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{ width:"100%", height:"100%", display:"block", transform, transformOrigin:"400px 310px", transition: dragging ? "none" : "transform .15s ease" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#0a1f3c" stopOpacity="1"/>
            <stop offset="100%" stopColor="#020d1e" stopOpacity="1"/>
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="softglow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width={W} height={H} fill="url(#bgGlow)"/>
        <path d={indiaPath} fill="rgba(37,99,235,.06)" stroke="#1a3a60" strokeWidth="1.2"/>
        {[10,15,20,25,30,35].map(lat => { const { y } = geo2svg(lat, 0); return <line key={lat} x1={0} y1={y} x2={W} y2={y} stroke="#0d2040" strokeWidth="0.5" strokeDasharray="4,8"/>; })}
        {[70,75,80,85,90,95].map(lng => { const { x } = geo2svg(0, lng); return <line key={lng} x1={x} y1={0} x2={x} y2={H} stroke="#0d2040" strokeWidth="0.5" strokeDasharray="4,8"/>; })}

        {Object.entries(ROUTES).map(([wid, route]) => {
          const isSelected = selected?.id === wid;
          const isHovered  = hovered === wid;
          const pts = route.stations.map(sid => { const st = STATIONS.find(s => s.id === sid); return st ? geo2svg(st.lat, st.lng) : null; }).filter(Boolean);
          if (pts.length < 2) return null;
          const d = "M " + pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" L ");
          return <path key={wid} d={d} fill="none" stroke={route.color} strokeWidth={isSelected ? 2.5 : isHovered ? 2 : 1} strokeOpacity={isSelected ? 0.9 : isHovered ? 0.7 : 0.25} strokeDasharray={isSelected ? "none" : "6,5"} style={{ transition:"all .2s" }}/>;
        })}

        {STATIONS.map(st => {
          const { x, y } = geo2svg(st.lat, st.lng);
          const isHighlighted = highlightStation?.id === st.id;
          const meta = selected ? WAGON_META[selected.id] : null;
          const isOnRoute  = meta ? ROUTES[selected.id]?.stations.includes(st.id) : false;
          const isCompleted = meta?.completedStations?.includes(st.id);
          const isCurrent   = meta?.currentStationId === st.id;
          const isUpcoming  = meta?.upcomingStations?.includes(st.id);
          const stColor = isCurrent ? "#f59e0b" : isCompleted ? "#22c55e" : isUpcoming ? "#3b82f6" : isHighlighted ? "#06b6d4" : st.major ? "#4a7fa5" : "#1e3a5f";
          const r = isCurrent ? 7 : st.major ? 5 : 3.5;
          return (
            <g key={st.id} onMouseEnter={() => setTooltip({ x, y, content: st.name })} onMouseLeave={() => setTooltip(null)} style={{ cursor:"pointer" }}>
              {isHighlighted && <circle cx={x} cy={y} r={14} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="4,3"/>}
              {isCurrent && <circle cx={x} cy={y} r={14} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4,3"><animate attributeName="r" values="10;16;10" dur="2s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite"/></circle>}
              <circle cx={x} cy={y} r={r} fill={stColor} stroke={isOnRoute || isHighlighted ? stColor : "#0d1f3c"} strokeWidth={isOnRoute ? 1.5 : 1} fillOpacity={isOnRoute || isHighlighted ? 1 : 0.7} filter={isCurrent || isHighlighted ? "url(#softglow)" : "none"}/>
              {(st.major || isOnRoute || isHighlighted) && <text x={x + 8} y={y + 4} fill={isOnRoute || isHighlighted ? "#cbd5e1" : "#4a6fa5"} fontSize={isOnRoute ? "9" : "7.5"} fontWeight={isOnRoute ? "700" : "400"}>{st.name}</text>}
            </g>
          );
        })}

        {wagonPos.map(({ x, y, wagon: w }) => {
          const isSelected = selected?.id === w.id;
          const isHovered  = hovered === w.id;
          const col = w.gps === "Offline" ? "#64748b" : STATUS_COLOR[w.status] || "#3b82f6";
          return (
            <g key={w.id} onClick={() => onSelectWagon(w)}
              onMouseEnter={() => { setHovered(w.id); setTooltip({ x, y, content: `${w.id} · ${w.status} · ${w.speed} km/h` }); }}
              onMouseLeave={() => { setHovered(null); setTooltip(null); }}
              style={{ cursor:"pointer" }}>
              {w.gps !== "Offline" && <circle cx={x} cy={y} r={isSelected ? 18 : 12} fill="none" stroke={col} strokeWidth="1" strokeOpacity={isSelected ? "0.5" : "0.3"}><animate attributeName="r" values={isSelected ? "14;22;14" : "8;14;8"} dur="2.5s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/></circle>}
              <circle cx={x} cy={y} r={isSelected ? 11 : isHovered ? 9 : 7} fill={col} fillOpacity={isSelected ? 0.25 : 0.15} stroke={col} strokeWidth={isSelected ? 2 : 1.5} style={{ transition:"all .2s" }}/>
              <circle cx={x} cy={y} r={isSelected ? 5 : 4} fill={col} filter="url(#glow)" style={{ transition:"all .2s" }}/>
              {(isSelected || isHovered) && <g><rect x={x + 10} y={y - 10} width={54} height={16} rx={4} fill="rgba(6,14,30,.92)" stroke={col} strokeWidth="0.8"/><text x={x + 13} y={y + 1} fill={col} fontSize="8" fontWeight="700">{w.id}</text></g>}
            </g>
          );
        })}

        {tooltip && <g><rect x={tooltip.x + 12} y={tooltip.y - 18} rx={5} ry={5} width={tooltip.content.length * 5.5 + 16} height={18} fill="rgba(13,31,60,.97)" stroke="#2a4a6e" strokeWidth="0.8"/><text x={tooltip.x + 20} y={tooltip.y - 5} fill="#e2e8f0" fontSize="9" fontWeight="600">{tooltip.content}</text></g>}
      </svg>
    </div>
  );
}

function JourneyStrip({ wagon }) {
  if (!wagon) return null;
  const route = ROUTES[wagon.id];
  const meta  = WAGON_META[wagon.id];
  if (!route || !meta) return null;
  return (
    <div style={{ overflowX:"auto", paddingBottom:4 }}>
      <div style={{ display:"flex", alignItems:"center", minWidth:"max-content", gap:0 }}>
        {route.stations.map((sid, i) => {
          const st = STATIONS.find(s => s.id === sid);
          if (!st) return null;
          const isCompleted = meta.completedStations?.includes(sid);
          const isCurrent   = meta.currentStationId === sid;
          const isUpcoming  = meta.upcomingStations?.includes(sid);
          const isLast      = i === route.stations.length - 1;
          const dotColor  = isCurrent ? "#f59e0b" : isCompleted ? "#22c55e" : "#1a3356";
          const textColor = isCurrent ? "#f59e0b" : isCompleted ? "#22c55e" : isUpcoming ? "#60a5fa" : "#4a6fa5";
          return (
            <div key={sid} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <span style={{ color: textColor, fontSize:10, fontWeight: isCurrent ? 700 : 500, whiteSpace:"nowrap", maxWidth:72, textAlign:"center" }}>{st.name}</span>
                <div style={{ width: isCurrent ? 12 : 9, height: isCurrent ? 12 : 9, borderRadius:"50%", background: dotColor, border:`2px solid ${dotColor}`, boxShadow: isCurrent ? `0 0 8px ${dotColor}` : "none", flexShrink:0 }}/>
                <span style={{ color: textColor, fontSize:9 }}>{isCurrent ? "● NOW" : isCompleted ? "✓" : isUpcoming ? "→" : ""}</span>
              </div>
              {!isLast && <div style={{ width:40, height:2, background:`linear-gradient(90deg, ${isCompleted ? "#22c55e" : "#1a3356"}, #1a3356)`, margin:"0 2px", flexShrink:0, marginTop:14 }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailPanel({ wagon, onClose }) {
  if (!wagon) return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center" }}>
      <FiMapPin size={36} color="#1a3356" style={{ marginBottom:12 }}/>
      <div style={{ color:"#2a4a6e", fontSize:14, fontWeight:600 }}>Select a wagon</div>
      <div style={{ color:"#1a3356", fontSize:12, marginTop:6 }}>Click any wagon dot on the map or from the list below</div>
    </div>
  );

  const meta = WAGON_META[wagon.id] || {};
  const statusCol = STATUS_COLOR[wagon.status] || "#3b82f6";
  const sc = speedColor(wagon.speed);
  const hc = healthColor(wagon.health);
  const stationName = STATIONS.find(s => s.id === meta.currentStationId)?.name || wagon.location;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:0, height:"100%", overflowY:"auto", overflowX:"hidden" }}>
      <div style={{ padding:"14px 16px", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`${statusCol}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🚆</div>
          <div>
            <div style={{ color:"#60a5fa", fontWeight:800, fontSize:15 }}>{wagon.id}</div>
            <div style={{ color:"#4a6fa5", fontSize:11 }}>{wagon.type}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span className={`badge ${STATUS_BADGE[wagon.status] || "badge-info"}`}>{wagon.status}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#4a6fa5", cursor:"pointer" }}><FiX size={14}/></button>
        </div>
      </div>

      <div style={{ padding:"8px 16px", background: wagon.gps === "Active" ? "rgba(34,197,94,.07)" : "rgba(239,68,68,.07)", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        {wagon.gps === "Active" ? <FiWifi size={12} color="#22c55e"/> : <FiWifiOff size={12} color="#ef4444"/>}
        <span style={{ color: GPS_COLOR[wagon.gps], fontSize:12, fontWeight:600 }}>GPS {wagon.gps}</span>
        <span style={{ color:"#4a6fa5", fontSize:11, marginLeft:"auto" }}>Updated {wagon.lastPing || "—"}</span>
      </div>

      <div style={{ padding:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, flexShrink:0 }}>
        {[
          { icon:FiMapPin,     label:"Location", value: stationName,       color:"#f1f5f9" },
          { icon:FiNavigation, label:"Route",    value: wagon.route,        color:"#f1f5f9" },
          { icon:FiActivity,   label:"Speed",    value: `${wagon.speed} km/h`, color: sc },
          { icon:FiClock,      label:"ETA",      value: wagon.eta,          color: meta.delay > 0 ? "#f59e0b" : "#22c55e" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:9, padding:"10px 12px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
              <Icon size={11} color="#4a6fa5"/>
              <span style={{ color:"#4a6fa5", fontSize:10, textTransform:"uppercase", letterSpacing:.5 }}>{label}</span>
            </div>
            <div style={{ color, fontWeight:700, fontSize:12, lineHeight:1.3 }}>{value}</div>
          </div>
        ))}
      </div>

      {meta.delay > 0 && (
        <div style={{ margin:"0 12px 8px", background:"rgba(245,158,11,.1)", border:"1px solid rgba(245,158,11,.3)", borderRadius:8, padding:"8px 12px", display:"flex", alignItems:"center", gap:8 }}>
          <FiAlertTriangle size={12} color="#f59e0b"/>
          <span style={{ color:"#f59e0b", fontSize:12, fontWeight:600 }}>Delayed by {meta.delay} min</span>
        </div>
      )}

      <div style={{ padding:"0 12px 10px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ color:"#64748b", fontSize:11 }}>Speed</span>
          <span style={{ color: sc, fontSize:12, fontWeight:700 }}>{wagon.speed} / 120 km/h</span>
        </div>
        <div className="progress-bg"><div className="progress-fill" style={{ width:`${Math.min(wagon.speed / 120 * 100, 100)}%`, background: sc }}/></div>
      </div>

      <div style={{ margin:"0 12px 10px", background:"#071628", border:"1px solid #1a3356", borderRadius:9, padding:"10px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
          <FiPackage size={12} color="#4a6fa5"/>
          <span style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:.5 }}>Cargo Details</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[["Type", wagon.cargo || "—"], ["Weight", meta.weight || "—"], ["Capacity", meta.capacity || "—"]].map(([l, v]) => (
            <div key={l}><div style={{ color:"#4a6fa5", fontSize:10 }}>{l}</div><div style={{ color:"#f1f5f9", fontSize:12, fontWeight:600, marginTop:2 }}>{v}</div></div>
          ))}
        </div>
        <div style={{ marginTop:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
            <span style={{ color:"#64748b", fontSize:11 }}>Load</span>
            <span style={{ color: wagon.load > 85 ? "#ef4444" : "#94a3b8", fontSize:11, fontWeight:600 }}>{wagon.load}%</span>
          </div>
          <div className="progress-bg"><div className="progress-fill" style={{ width:`${wagon.load}%`, background: wagon.load > 85 ? "#ef4444" : wagon.load > 65 ? "#f59e0b" : "#22c55e" }}/></div>
        </div>
      </div>

      <div style={{ margin:"0 12px 10px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ color:"#64748b", fontSize:11 }}>Wagon Health</span>
          <span style={{ color: hc, fontSize:12, fontWeight:700 }}>{wagon.health}%</span>
        </div>
        <div className="progress-bg"><div className="progress-fill" style={{ width:`${wagon.health}%`, background: hc }}/></div>
      </div>

      <div style={{ margin:"0 12px 12px", background:"#071628", border:"1px solid #1a3356", borderRadius:9, padding:"10px 12px" }}>
        <div style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>Route Progress</div>
        <JourneyStrip wagon={wagon}/>
      </div>
    </div>
  );
}

function WagonListItem({ wagon, selected, onClick }) {
  const col = wagon.gps === "Offline" ? "#64748b" : STATUS_COLOR[wagon.status] || "#3b82f6";
  const isActive = selected?.id === wagon.id;
  const stationName = STATIONS.find(s => s.id === WAGON_META[wagon.id]?.currentStationId)?.name || wagon.location;
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, cursor:"pointer", marginBottom:2, background: isActive ? "rgba(37,99,235,.18)" : "transparent", border: `1px solid ${isActive ? "#2563eb" : "transparent"}`, transition:"all .15s" }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(37,99,235,.08)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:col, flexShrink:0, boxShadow: wagon.gps !== "Offline" ? `0 0 6px ${col}` : "none" }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color: isActive ? "#60a5fa" : "#94a3b8", fontWeight:700, fontSize:12 }}>{wagon.id}</div>
        <div style={{ color:"#4a6fa5", fontSize:10, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{stationName}</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:2 }}>
        <span className={`badge ${STATUS_BADGE[wagon.status] || "badge-info"}`} style={{ fontSize:9, padding:"1px 6px" }}>{wagon.status}</span>
        <span style={{ color:"#4a6fa5", fontSize:10 }}>{wagon.speed} km/h</span>
      </div>
      <FiChevronRight size={12} color={isActive ? "#3b82f6" : "#1e3a5f"}/>
    </div>
  );
}

export default function OperatorTracking() {
  const { wagons } = useOperatorData();
  const [selected, setSelected] = useState(null);
  const [searchWagon, setSearchWagon]     = useState("");
  const [searchStation, setSearchStation] = useState("");
  const [filterStatus, setFilterStatus]   = useState("All");
  const [refreshing, setRefreshing]       = useState(false);
  const [lastRefresh, setLastRefresh]     = useState(new Date());

  useEffect(() => {
    if (!selected && wagons.length > 0) setSelected(wagons[0]);
  }, [wagons]); // eslint-disable-line

  useEffect(() => {
    if (!selected) return;
    const live = wagons.find(w => w.id === selected.id);
    if (live) setSelected(live);
  }, [wagons]); // eslint-disable-line

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setLastRefresh(new Date()); setRefreshing(false); }, 800);
  };

  const handleSelectWagon = (w) => {
    const live = wagons.find(x => x.id === w.id) || w;
    setSelected(live);
  };

  const filteredList = useMemo(() => wagons.filter(w => {
    const stName = STATIONS.find(s => s.id === WAGON_META[w.id]?.currentStationId)?.name || w.location;
    const matchSearch = w.id.toLowerCase().includes(searchWagon.toLowerCase()) ||
      stName.toLowerCase().includes(searchWagon.toLowerCase()) ||
      w.route.toLowerCase().includes(searchWagon.toLowerCase());
    const matchStatus = filterStatus === "All"
      || (filterStatus === "Active"  && w.gps === "Active")
      || (filterStatus === "Offline" && w.gps === "Offline")
      || (filterStatus === "Delayed" && w.status === "Delayed")
      || (filterStatus === "On Time" && w.status === "On Time");
    return matchSearch && matchStatus;
  }), [wagons, searchWagon, filterStatus]);

  const gpsActive = wagons.filter(w => w.gps === "Active").length;
  const onTime    = wagons.filter(w => w.status === "On Time").length;
  const delayed   = wagons.filter(w => w.status === "Delayed").length;
  const avgSpeed  = Math.round(wagons.filter(w => w.gps === "Active").reduce((s, w) => s + w.speed, 0) / (gpsActive || 1));

  return (
    <OperatorLayout title="Live Tracking" sub="Real-time GPS tracking · Interactive Railway Map" moduleKey="tracking">
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        {[
          { label:"GPS Active", value: gpsActive,             color:"#22c55e", dot:true },
          { label:"On Time",    value: onTime,                color:"#22c55e" },
          { label:"Delayed",    value: delayed,               color:"#f59e0b" },
          { label:"Offline",    value: wagons.filter(w=>w.gps==="Offline").length, color:"#ef4444" },
          { label:"Avg Speed",  value: `${avgSpeed} km/h`,   color:"#3b82f6" },
        ].map(({ label, value, color, dot }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:8, background:"#0d1f3c", border:`1px solid ${color}20`, borderRadius:10, padding:"8px 16px" }}>
            {dot && <span className="dot dot-green"/>}
            <span style={{ color:"#64748b", fontSize:12 }}>{label}</span>
            <span style={{ color, fontWeight:800, fontSize:16 }}>{value}</span>
          </div>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:"#4a6fa5", fontSize:11 }}>Refreshed {lastRefresh.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" })}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>
            <FiRefreshCw size={12} style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}/> Refresh
          </button>
        </div>
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <div className="search-box" style={{ flex:1, minWidth:180 }}>
          <FiSearch size={13} color="#4a6fa5"/>
          <input placeholder="Search wagon ID or route…" value={searchWagon} onChange={e => setSearchWagon(e.target.value)}/>
          {searchWagon && <button onClick={() => setSearchWagon("")} style={{ background:"none", border:"none", color:"#4a6fa5", cursor:"pointer", padding:0 }}><FiX size={12}/></button>}
        </div>
        <div className="search-box" style={{ flex:1, minWidth:160 }}>
          <FiMapPin size={13} color="#4a6fa5"/>
          <input placeholder="Highlight station…" value={searchStation} onChange={e => setSearchStation(e.target.value)}/>
          {searchStation && <button onClick={() => setSearchStation("")} style={{ background:"none", border:"none", color:"#4a6fa5", cursor:"pointer", padding:0 }}><FiX size={12}/></button>}
        </div>
        <select className="form-select" style={{ width:"auto", padding:"8px 12px", fontSize:12 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          {["All","Active","Offline","Delayed","On Time"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:14, height:520 }}>
        <div className="card" style={{ padding:0, overflow:"hidden", position:"relative" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <span className="dot dot-green" style={{ animation:"pulse 2s infinite" }}/>
            <span style={{ color:"#22c55e", fontSize:12, fontWeight:600 }}>NavIC Live</span>
            <span style={{ color:"#4a6fa5", fontSize:11 }}>· {gpsActive} active signals · scroll to zoom · drag to pan</span>
          </div>
          <div style={{ height:"calc(100% - 41px)" }}>
            <RailwayMap wagons={filteredList} selected={selected} onSelectWagon={handleSelectWagon} searchStation={searchStation}/>
          </div>
        </div>
        <div className="card" style={{ padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid #1a3356", flexShrink:0 }}>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>Wagon Detail</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
            <DetailPanel wagon={selected} onClose={() => setSelected(null)}/>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>Fleet ({filteredList.length})</div>
            <span style={{ color:"#4a6fa5", fontSize:11 }}>Click to select</span>
          </div>
          <div style={{ padding:"8px", maxHeight:260, overflowY:"auto" }}>
            {filteredList.length === 0
              ? <div style={{ textAlign:"center", padding:32, color:"#4a6fa5", fontSize:12 }}>No wagons match filter</div>
              : filteredList.map(w => <WagonListItem key={w.id} wagon={w} selected={selected} onClick={() => handleSelectWagon(w)}/>)
            }
          </div>
        </div>

        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #1a3356" }}>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>Station Network</div>
          </div>
          <div style={{ maxHeight:260, overflowY:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  {["Station","Status","Wagons"].map(h => <th key={h} style={{ color:"#4a6fa5", fontSize:10, fontWeight:700, textTransform:"uppercase", padding:"8px 14px", textAlign: h==="Station" ? "left" : "center", borderBottom:"1px solid #1a3356" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {STATIONS.filter(s => s.major).map(st => {
                  const wagonsHere  = wagons.filter(w => WAGON_META[w.id]?.currentStationId === st.id).length;
                  const wagonsRoute = wagons.filter(w => ROUTES[w.id]?.stations.includes(st.id)).length;
                  const hasDelay    = wagons.some(w => WAGON_META[w.id]?.currentStationId === st.id && w.status === "Delayed");
                  return (
                    <tr key={st.id} onClick={() => setSearchStation(st.name)} style={{ cursor:"pointer", borderBottom:"1px solid rgba(26,51,86,.4)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(37,99,235,.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding:"9px 14px" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <FiMapPin size={11} color="#3b82f6"/>
                          <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:12 }}>{st.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:"9px 14px", textAlign:"center" }}>
                        {hasDelay ? <span className="badge badge-delayed" style={{ fontSize:9 }}>Delay</span> : <span className="badge badge-active" style={{ fontSize:9 }}>Active</span>}
                      </td>
                      <td style={{ padding:"9px 14px", textAlign:"center" }}>
                        <span style={{ color: wagonsHere > 0 ? "#60a5fa" : "#4a6fa5", fontWeight:700, fontSize:12 }}>{wagonsHere > 0 ? wagonsHere : wagonsRoute}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }`}</style>
    </OperatorLayout>
  );
}
