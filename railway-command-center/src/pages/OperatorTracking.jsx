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

// All stations across all zones with real coordinates
const ALL_STATIONS = {
  // NR — North Railway
  "New Delhi":      { lat:28.64, lng:77.21, major:true  },
  "Kanpur Jn.":     { lat:26.46, lng:80.35, major:false },
  "Lucknow":        { lat:26.85, lng:80.95, major:true  },
  "Allahabad Jn.":  { lat:25.44, lng:81.84, major:false },
  "Varanasi Jn.":   { lat:25.32, lng:82.97, major:false },
  "Patna":          { lat:25.61, lng:85.14, major:true  },
  "Ambala Cantt.":  { lat:30.38, lng:76.82, major:false },
  "Ambala City":    { lat:30.38, lng:76.78, major:false },
  "Amritsar":       { lat:31.64, lng:74.87, major:true  },
  "Chandigarh":     { lat:30.74, lng:76.79, major:false },
  "Moradabad":      { lat:28.84, lng:78.78, major:false },
  "Aligarh":        { lat:27.88, lng:78.08, major:false },
  // SR — South Railway
  "Chennai Central":        { lat:13.08, lng:80.27, major:true  },
  "Ernakulam":              { lat:9.98,  lng:76.28, major:true  },
  "Coimbatore":             { lat:11.00, lng:76.97, major:true  },
  "Salem Jn.":              { lat:11.67, lng:78.15, major:false },
  "Shoranur Jn.":           { lat:10.76, lng:76.27, major:false },
  "Madurai":                { lat:9.93,  lng:78.12, major:true  },
  "Tirunelveli":            { lat:8.73,  lng:77.70, major:false },
  "Palakkad Jn.":           { lat:10.78, lng:76.65, major:false },
  "Thiruvananthapuram":     { lat:8.50,  lng:76.95, major:true  },
  "Trichy":                 { lat:10.81, lng:78.69, major:false },
  "Erode Jn.":              { lat:11.34, lng:77.72, major:false },
  // ER — East Railway
  "Howrah":         { lat:22.58, lng:88.36, major:true  },
  "Asansol Jn.":    { lat:23.68, lng:86.98, major:false },
  "Durgapur":       { lat:23.49, lng:87.32, major:false },
  "Dhanbad Jn.":    { lat:23.80, lng:86.43, major:false },
  "Dhanbad":        { lat:23.80, lng:86.43, major:false },
  "Barddhaman Jn.": { lat:23.23, lng:87.86, major:false },
  "Patna Jn.":      { lat:25.61, lng:85.14, major:false },
  "Jasidih Jn.":    { lat:24.52, lng:86.65, major:false },
  "Bhagalpur":      { lat:25.25, lng:87.01, major:false },
  "Muzaffarpur":    { lat:26.12, lng:85.39, major:false },
  // WR — West Railway
  "Mumbai Central": { lat:18.97, lng:72.82, major:true  },
  "Ahmedabad":      { lat:23.02, lng:72.57, major:true  },
  "Surat":          { lat:21.19, lng:72.84, major:true  },
  "Vadodara Jn.":   { lat:22.30, lng:73.18, major:false },
  "Anand Jn.":      { lat:22.56, lng:72.96, major:false },
  "Rajkot":         { lat:22.30, lng:70.80, major:true  },
  "Bharuch":        { lat:21.71, lng:72.99, major:false },
  "Bhavnagar":      { lat:21.76, lng:72.15, major:false },
  "Surendranagar":  { lat:22.73, lng:71.64, major:false },
  // NER — North East Railway
  "Guwahati":       { lat:26.14, lng:91.74, major:true  },
  "Alipurduar Jn.": { lat:26.49, lng:89.53, major:false },
  "Tinsukia Jn.":   { lat:27.49, lng:95.36, major:false },
  "Lumding Jn.":    { lat:25.75, lng:93.17, major:false },
  "New Jalpaiguri": { lat:26.71, lng:88.36, major:false },
  "Badarpur Jn.":   { lat:24.87, lng:92.59, major:false },
  "Agartala":       { lat:23.84, lng:91.28, major:false },
  "Dibrugarh":      { lat:27.47, lng:94.91, major:false },
  // NWR — North Western Railway
  "Jaipur Jn.":     { lat:26.92, lng:75.78, major:true  },
  "Alwar":          { lat:27.56, lng:76.63, major:false },
  "Jodhpur":        { lat:26.28, lng:73.02, major:true  },
  "Pali":           { lat:25.77, lng:73.33, major:false },
  "Bikaner":        { lat:28.02, lng:73.31, major:true  },
  "Sikar":          { lat:27.61, lng:75.14, major:false },
  "Ajmer":          { lat:26.45, lng:74.64, major:false },
  "Jaipur":         { lat:26.92, lng:75.78, major:true  },
  "Delhi":          { lat:28.64, lng:77.21, major:true  },
  // SER — South Eastern Railway
  "Kharagpur":      { lat:22.33, lng:87.32, major:true  },
  "Balasore":       { lat:21.49, lng:86.93, major:false },
  "Bhubaneswar":    { lat:20.30, lng:85.82, major:true  },
  "Rourkela":       { lat:22.22, lng:84.86, major:false },
  "Jharsuguda Jn.": { lat:21.85, lng:84.01, major:false },
  "Bokaro":         { lat:23.67, lng:86.15, major:false },
  "Bilaspur":       { lat:22.09, lng:82.14, major:false },
  "Raipur Jn.":     { lat:21.25, lng:81.63, major:false },
  // SWR — South Western Railway
  "Bengaluru":      { lat:12.97, lng:77.59, major:true  },
  "Tumkur":         { lat:13.34, lng:77.10, major:false },
  "Hubli":          { lat:15.36, lng:75.12, major:true  },
  "Dharwad":        { lat:15.46, lng:75.00, major:false },
  "Mysuru":         { lat:12.30, lng:76.64, major:true  },
  "Krishnarajapete":{ lat:12.66, lng:76.50, major:false },
  "Hassan Jn.":     { lat:13.00, lng:76.10, major:false },
  "Mangaluru":      { lat:12.87, lng:74.88, major:true  },
  "Belagavi":       { lat:15.85, lng:74.50, major:false },
  "Mumbai":         { lat:18.97, lng:72.82, major:true  },
};

// Build station list for a wagon's route string ("A → B")
function parseRouteStations(route) {
  return route.split("→").map(s => s.trim());
}

// Get SVG coords for a location name
function getStationCoords(name) {
  const exact = ALL_STATIONS[name];
  if (exact) return geo2svg(exact.lat, exact.lng);
  // fuzzy match
  const key = Object.keys(ALL_STATIONS).find(k => k.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(k.toLowerCase()));
  if (key) return geo2svg(ALL_STATIONS[key].lat, ALL_STATIONS[key].lng);
  return null;
}

const STATUS_COLOR = { "On Time":"#22c55e", Delayed:"#f59e0b", Halted:"#ef4444", Maintenance:"#f97316" };
const STATUS_BADGE = { "On Time":"badge-ontime", Delayed:"badge-delayed", Halted:"badge-high", Maintenance:"badge-maint" };
const GPS_COLOR    = { Active:"#22c55e", Offline:"#ef4444", Weak:"#f59e0b" };
const speedColor   = s => s > 80 ? "#ef4444" : s > 50 ? "#f59e0b" : s > 0 ? "#22c55e" : "#64748b";
const healthColor  = h => h >= 75 ? "#22c55e" : h >= 50 ? "#f59e0b" : "#ef4444";

// Unique color per wagon index
const ROUTE_COLORS = ["#3b82f6","#f59e0b","#22c55e","#ef4444","#8b5cf6","#f97316","#06b6d4","#a855f7","#10b981","#ec4899"];

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
  const [zoom, setZoom]       = useState(1);
  const [pan, setPan]         = useState({ x:0, y:0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [hovered, setHovered] = useState(null);
  const MIN_ZOOM = 0.6, MAX_ZOOM = 5;

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * (e.deltaY < 0 ? 1.15 : 0.87))));
  }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive:false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const onMouseDown = e => { if (e.button !== 0) return; setDragging(true); setDragStart({ x:e.clientX - pan.x, y:e.clientY - pan.y }); };
  const onMouseMove = e => { if (!dragging) return; setPan({ x:e.clientX - dragStart.x, y:e.clientY - dragStart.y }); };
  const onMouseUp   = () => setDragging(false);
  const resetView   = () => { setZoom(1); setPan({ x:0, y:0 }); };

  // Build wagon positions and route paths from live wagon data
  const wagonData = useMemo(() => wagons.map((w, idx) => {
    const stations = parseRouteStations(w.route);
    const origin      = stations[0];
    const destination = stations[stations.length - 1];
    const current     = w.location;

    const originCoords      = getStationCoords(origin);
    const destCoords        = getStationCoords(destination);
    const currentCoords     = getStationCoords(current);

    // Position: use current location if found, else interpolate on route
    let pos = currentCoords;
    if (!pos && originCoords && destCoords) {
      // place halfway
      pos = { x:(originCoords.x + destCoords.x)/2, y:(originCoords.y + destCoords.y)/2 };
    }
    if (!pos) pos = { x: W/2, y: H/2 };

    // Slight jitter per wagon to avoid overlap
    const seed = w.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    pos = { x: pos.x + ((seed % 7) - 3) * 2, y: pos.y + ((seed % 5) - 2) * 2 };

    return {
      wagon: w,
      pos,
      originCoords,
      destCoords,
      currentCoords: currentCoords || pos,
      color: ROUTE_COLORS[idx % ROUTE_COLORS.length],
      origin,
      destination,
      current,
    };
  }), [wagons]);

  const highlightCoords = searchStation
    ? getStationCoords(searchStation)
    : null;

  // Collect stations to render for the selected wagon's route
  const selectedData = selected ? wagonData.find(d => d.wagon.id === selected.id) : null;

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", background:"#030d1f", overflow:"hidden", cursor:dragging?"grabbing":"grab", userSelect:"none" }}>
      {/* Controls */}
      <div style={{ position:"absolute", top:12, right:12, display:"flex", flexDirection:"column", gap:4, zIndex:10 }}>
        {[
          { icon:FiZoomIn,    onClick:()=>setZoom(z=>Math.min(MAX_ZOOM,z*1.3)), title:"Zoom In"  },
          { icon:FiZoomOut,   onClick:()=>setZoom(z=>Math.max(MIN_ZOOM,z/1.3)), title:"Zoom Out" },
          { icon:FiMaximize2, onClick:resetView,                                 title:"Reset"    },
        ].map(({ icon:Icon, onClick, title }) => (
          <button key={title} onClick={onClick} title={title} style={{ width:32, height:32, borderRadius:8, border:"1px solid #1a3356", background:"rgba(13,31,60,.92)", color:"#94a3b8", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon size={14}/>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div style={{ position:"absolute", bottom:10, left:10, background:"rgba(6,14,30,.9)", border:"1px solid #1a3356", borderRadius:8, padding:"8px 12px", zIndex:10 }}>
        {[["On Time","#22c55e"],["Delayed","#f59e0b"],["Maintenance","#f97316"],["GPS Offline","#64748b"]].map(([l,c]) => (
          <div key={l} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:c }}/><span style={{ color:"#94a3b8", fontSize:10 }}>{l}</span>
          </div>
        ))}
      </div>

      <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(6,14,30,.9)", border:"1px solid #1a3356", borderRadius:6, padding:"4px 8px", zIndex:10 }}>
        <span style={{ color:"#4a6fa5", fontSize:10 }}>{Math.round(zoom*100)}%</span>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`}
        style={{ width:"100%", height:"100%", display:"block",
          transform:`translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
          transformOrigin:"400px 310px",
          transition: dragging ? "none" : "transform .15s ease" }}
        onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%"   stopColor="#0a1f3c" stopOpacity="1"/>
            <stop offset="100%" stopColor="#020d1e" stopOpacity="1"/>
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <filter id="softglow"><feGaussianBlur stdDeviation="1.5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        <rect width={W} height={H} fill="url(#bgGlow)"/>
        <path d={indiaPath} fill="rgba(37,99,235,.06)" stroke="#1a3a60" strokeWidth="1.2"/>

        {/* Grid lines */}
        {[10,15,20,25,30,35].map(lat => { const {y} = geo2svg(lat,0); return <line key={lat} x1={0} y1={y} x2={W} y2={y} stroke="#0d2040" strokeWidth="0.5" strokeDasharray="4,8"/>; })}
        {[70,75,80,85,90,95].map(lng => { const {x} = geo2svg(0,lng); return <line key={lng} x1={x} y1={0} x2={x} y2={H} stroke="#0d2040" strokeWidth="0.5" strokeDasharray="4,8"/>; })}

        {/* Route lines origin → destination for each wagon */}
        {wagonData.map(({ wagon:w, originCoords, destCoords, currentCoords, color }) => {
          if (!originCoords || !destCoords) return null;
          const isSelected = selected?.id === w.id;
          const isHov      = hovered === w.id;
          return (
            <g key={`route-${w.id}`}>
              {/* full route (dim) */}
              <line x1={originCoords.x} y1={originCoords.y} x2={destCoords.x} y2={destCoords.y}
                stroke={color} strokeWidth={isSelected ? 2 : 1}
                strokeOpacity={isSelected ? 0.5 : isHov ? 0.35 : 0.15}
                strokeDasharray="6,5"/>
              {/* completed segment: origin → current */}
              {currentCoords && (
                <line x1={originCoords.x} y1={originCoords.y} x2={currentCoords.x} y2={currentCoords.y}
                  stroke={color} strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeOpacity={isSelected ? 0.9 : isHov ? 0.6 : 0.3}/>
              )}
            </g>
          );
        })}

        {/* Station dots for selected wagon's route */}
        {selectedData && (() => {
          const stations = parseRouteStations(selectedData.wagon.route);
          return stations.map((name, i) => {
            const coords = getStationCoords(name);
            if (!coords) return null;
            const isCurrent = name === selectedData.current || name.includes(selectedData.current) || selectedData.current.includes(name);
            const isOrigin  = i === 0;
            const isDest    = i === stations.length - 1;
            const color     = isCurrent ? "#f59e0b" : isOrigin ? "#22c55e" : isDest ? "#ef4444" : "#3b82f6";
            return (
              <g key={`st-${name}`}>
                {isCurrent && (
                  <circle cx={coords.x} cy={coords.y} r={14} fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4,3">
                    <animate attributeName="r" values="10;18;10" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="stroke-opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite"/>
                  </circle>
                )}
                <circle cx={coords.x} cy={coords.y} r={isCurrent ? 7 : 5} fill={color} filter={isCurrent ? "url(#softglow)" : "none"}/>
                <text x={coords.x+9} y={coords.y+4} fill={isCurrent ? "#f59e0b" : "#cbd5e1"} fontSize={isCurrent?"9":"8"} fontWeight={isCurrent?"700":"500"}>{name}</text>
              </g>
            );
          });
        })()}

        {/* Zone-level major stations (always visible) */}
        {Object.entries(ALL_STATIONS).filter(([,v]) => v.major).map(([name, st]) => {
          const { x, y } = geo2svg(st.lat, st.lng);
          const isHighlighted = searchStation && (name.toLowerCase().includes(searchStation.toLowerCase()) || searchStation.toLowerCase().includes(name.toLowerCase()));
          return (
            <g key={`maj-${name}`} style={{ cursor:"default" }}>
              {isHighlighted && <circle cx={x} cy={y} r={14} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.6"/>}
              <circle cx={x} cy={y} r={isHighlighted ? 5 : 4} fill={isHighlighted ? "#06b6d4" : "#2a4a6e"} stroke="#1a3a60" strokeWidth="1" fillOpacity={0.8}/>
              <text x={x+7} y={y+4} fill={isHighlighted ? "#06b6d4" : "#3a5a7c"} fontSize="8" fontWeight={isHighlighted?"700":"400"}>{name}</text>
            </g>
          );
        })}

        {/* Search highlight for non-major stations */}
        {highlightCoords && !Object.entries(ALL_STATIONS).filter(([,v])=>v.major).some(([n]) => n.toLowerCase().includes(searchStation.toLowerCase())) && (
          <g>
            <circle cx={highlightCoords.x} cy={highlightCoords.y} r={14} fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.6"/>
            <circle cx={highlightCoords.x} cy={highlightCoords.y} r={5} fill="#06b6d4"/>
            <text x={highlightCoords.x+9} y={highlightCoords.y+4} fill="#06b6d4" fontSize="9" fontWeight="700">{searchStation}</text>
          </g>
        )}

        {/* Wagon dots */}
        {wagonData.map(({ wagon:w, pos, color }) => {
          const isSelected = selected?.id === w.id;
          const isHov      = hovered === w.id;
          const col        = w.gps === "Offline" ? "#64748b" : STATUS_COLOR[w.status] || color;
          return (
            <g key={w.id} onClick={() => onSelectWagon(w)}
              onMouseEnter={() => { setHovered(w.id); setTooltip({ x:pos.x, y:pos.y, content:`${w.id} · ${w.status} · ${w.speed} km/h` }); }}
              onMouseLeave={() => { setHovered(null); setTooltip(null); }}
              style={{ cursor:"pointer" }}>
              {w.gps !== "Offline" && (
                <circle cx={pos.x} cy={pos.y} r={isSelected?18:12} fill="none" stroke={col} strokeWidth="1" strokeOpacity={isSelected?"0.5":"0.3"}>
                  <animate attributeName="r" values={isSelected?"14;22;14":"8;14;8"} dur="2.5s" repeatCount="indefinite"/>
                  <animate attributeName="stroke-opacity" values="0.4;0;0.4" dur="2.5s" repeatCount="indefinite"/>
                </circle>
              )}
              <circle cx={pos.x} cy={pos.y} r={isSelected?11:isHov?9:7} fill={col} fillOpacity={isSelected?0.25:0.15} stroke={col} strokeWidth={isSelected?2:1.5} style={{ transition:"all .2s" }}/>
              <circle cx={pos.x} cy={pos.y} r={isSelected?5:4} fill={col} filter="url(#glow)" style={{ transition:"all .2s" }}/>
              {(isSelected||isHov) && (
                <g>
                  <rect x={pos.x+10} y={pos.y-10} width={60} height={16} rx={4} fill="rgba(6,14,30,.92)" stroke={col} strokeWidth="0.8"/>
                  <text x={pos.x+14} y={pos.y+1} fill={col} fontSize="8" fontWeight="700">{w.id}</text>
                </g>
              )}
            </g>
          );
        })}

        {tooltip && (
          <g>
            <rect x={tooltip.x+12} y={tooltip.y-18} rx={5} ry={5} width={tooltip.content.length*5.5+16} height={18} fill="rgba(13,31,60,.97)" stroke="#2a4a6e" strokeWidth="0.8"/>
            <text x={tooltip.x+20} y={tooltip.y-5} fill="#e2e8f0" fontSize="9" fontWeight="600">{tooltip.content}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

function JourneyStrip({ wagon }) {
  if (!wagon) return null;
  const stations = parseRouteStations(wagon.route);
  const currentLower = wagon.location.toLowerCase();
  const currentIdx = stations.findIndex(s => s.toLowerCase().includes(currentLower) || currentLower.includes(s.toLowerCase()));
  return (
    <div style={{ overflowX:"auto", paddingBottom:4 }}>
      <div style={{ display:"flex", alignItems:"center", minWidth:"max-content" }}>
        {stations.map((name, i) => {
          const isCurrent  = i === currentIdx;
          const isCompleted = i < currentIdx;
          const isUpcoming  = i > currentIdx;
          const isLast      = i === stations.length - 1;
          const dotColor  = isCurrent ? "#f59e0b" : isCompleted ? "#22c55e" : "#1a3356";
          const textColor = isCurrent ? "#f59e0b" : isCompleted ? "#22c55e" : isUpcoming ? "#60a5fa" : "#4a6fa5";
          return (
            <div key={name+i} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <span style={{ color:textColor, fontSize:10, fontWeight:isCurrent?700:500, whiteSpace:"nowrap", maxWidth:80, textAlign:"center" }}>{name}</span>
                <div style={{ width:isCurrent?12:9, height:isCurrent?12:9, borderRadius:"50%", background:dotColor, border:`2px solid ${dotColor}`, boxShadow:isCurrent?`0 0 8px ${dotColor}`:"none", flexShrink:0 }}/>
                <span style={{ color:textColor, fontSize:9 }}>{isCurrent?"● NOW":isCompleted?"✓":isUpcoming?"→":""}</span>
              </div>
              {!isLast && <div style={{ width:36, height:2, background:`linear-gradient(90deg,${isCompleted?"#22c55e":"#1a3356"},#1a3356)`, margin:"0 2px", flexShrink:0, marginTop:14 }}/>}
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
      <div style={{ color:"#1a3356", fontSize:12, marginTop:6 }}>Click any wagon dot on the map or from the list</div>
    </div>
  );
  const statusCol = STATUS_COLOR[wagon.status] || "#3b82f6";
  const sc = speedColor(wagon.speed);
  const hc = healthColor(wagon.health);

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
          <span className={`badge ${STATUS_BADGE[wagon.status]||"badge-info"}`}>{wagon.status}</span>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#4a6fa5", cursor:"pointer" }}><FiX size={14}/></button>
        </div>
      </div>

      <div style={{ padding:"8px 16px", background:wagon.gps==="Active"?"rgba(34,197,94,.07)":"rgba(239,68,68,.07)", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        {wagon.gps==="Active" ? <FiWifi size={12} color="#22c55e"/> : <FiWifiOff size={12} color="#ef4444"/>}
        <span style={{ color:GPS_COLOR[wagon.gps], fontSize:12, fontWeight:600 }}>GPS {wagon.gps}</span>
        <span style={{ color:"#4a6fa5", fontSize:11, marginLeft:"auto" }}>Ping: {wagon.lastPing||"—"}</span>
      </div>

      <div style={{ padding:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, flexShrink:0 }}>
        {[
          { icon:FiMapPin,     label:"Location", value:wagon.location,        color:"#f1f5f9" },
          { icon:FiNavigation, label:"Route",    value:wagon.route,            color:"#f1f5f9" },
          { icon:FiActivity,   label:"Speed",    value:`${wagon.speed} km/h`,  color:sc        },
          { icon:FiClock,      label:"ETA",      value:wagon.eta,              color:wagon.status==="Delayed"?"#f59e0b":"#22c55e" },
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

      <div style={{ padding:"0 12px 10px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ color:"#64748b", fontSize:11 }}>Speed</span>
          <span style={{ color:sc, fontSize:12, fontWeight:700 }}>{wagon.speed} / 120 km/h</span>
        </div>
        <div className="progress-bg"><div className="progress-fill" style={{ width:`${Math.min(wagon.speed/120*100,100)}%`, background:sc }}/></div>
      </div>

      <div style={{ margin:"0 12px 10px", background:"#071628", border:"1px solid #1a3356", borderRadius:9, padding:"10px 12px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
          <FiPackage size={12} color="#4a6fa5"/>
          <span style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:.5 }}>Cargo</span>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[["Type",wagon.cargo||"—"],["Load",`${wagon.load}%`]].map(([l,v]) => (
            <div key={l}><div style={{ color:"#4a6fa5", fontSize:10 }}>{l}</div><div style={{ color:"#f1f5f9", fontSize:12, fontWeight:600, marginTop:2 }}>{v}</div></div>
          ))}
        </div>
        <div style={{ marginTop:10 }}>
          <div className="progress-bg"><div className="progress-fill" style={{ width:`${wagon.load}%`, background:wagon.load>85?"#ef4444":wagon.load>65?"#f59e0b":"#22c55e" }}/></div>
        </div>
      </div>

      <div style={{ margin:"0 12px 10px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ color:"#64748b", fontSize:11 }}>Wagon Health</span>
          <span style={{ color:hc, fontSize:12, fontWeight:700 }}>{wagon.health}%</span>
        </div>
        <div className="progress-bg"><div className="progress-fill" style={{ width:`${wagon.health}%`, background:hc }}/></div>
      </div>

      <div style={{ margin:"0 12px 12px", background:"#071628", border:"1px solid #1a3356", borderRadius:9, padding:"10px 12px" }}>
        <div style={{ color:"#64748b", fontSize:11, textTransform:"uppercase", letterSpacing:.5, marginBottom:10 }}>Route Progress</div>
        <JourneyStrip wagon={wagon}/>
      </div>
    </div>
  );
}

function WagonListItem({ wagon, selected, onClick }) {
  const col = wagon.gps==="Offline" ? "#64748b" : STATUS_COLOR[wagon.status]||"#3b82f6";
  const isActive = selected?.id === wagon.id;
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:9, cursor:"pointer", marginBottom:2, background:isActive?"rgba(37,99,235,.18)":"transparent", border:`1px solid ${isActive?"#2563eb":"transparent"}`, transition:"all .15s" }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background="rgba(37,99,235,.08)"; }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background="transparent"; }}>
      <div style={{ width:8, height:8, borderRadius:"50%", background:col, flexShrink:0, boxShadow:wagon.gps!=="Offline"?`0 0 6px ${col}`:"none" }}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:isActive?"#60a5fa":"#94a3b8", fontWeight:700, fontSize:12 }}>{wagon.id}</div>
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

export default function OperatorTracking() {
  const { wagons } = useOperatorData();
  const [selected,      setSelected]      = useState(null);
  const [searchWagon,   setSearchWagon]   = useState("");
  const [searchStation, setSearchStation] = useState("");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [refreshing,    setRefreshing]    = useState(false);
  const [lastRefresh,   setLastRefresh]   = useState(new Date());
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current && wagons.length > 0) {
      setSelected(wagons[0]);
      hasInitialized.current = true;
    }
  }, [wagons]);

  useEffect(() => {
    if (!selected) return;
    const live = wagons.find(w => w.id === selected.id);
    if (live) setSelected(live);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wagons, selected?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => { setLastRefresh(new Date()); setRefreshing(false); }, 800);
  };

  const filteredList = useMemo(() => wagons.filter(w => {
    const matchSearch = w.id.toLowerCase().includes(searchWagon.toLowerCase()) ||
      w.location.toLowerCase().includes(searchWagon.toLowerCase()) ||
      w.route.toLowerCase().includes(searchWagon.toLowerCase());
    const matchStatus = filterStatus === "All"
      || (filterStatus === "Active"  && w.gps === "Active")
      || (filterStatus === "Offline" && w.gps === "Offline")
      || (filterStatus === "Delayed" && w.status === "Delayed")
      || (filterStatus === "On Time" && w.status === "On Time");
    return matchSearch && matchStatus;
  }), [wagons, searchWagon, filterStatus]);

  const gpsActive = wagons.filter(w => w.gps === "Active").length;
  const avgSpeed  = Math.round(wagons.filter(w => w.gps === "Active").reduce((s,w) => s+w.speed, 0) / (gpsActive||1));

  // Build unique stations from this zone's wagons for the station network table
  const zoneStations = useMemo(() => {
    const names = new Set();
    wagons.forEach(w => parseRouteStations(w.route).forEach(s => names.add(s)));
    return [...names].map(name => ({
      name,
      wagonsHere:  wagons.filter(w => w.location.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(w.location.toLowerCase())).length,
      hasDelay:    wagons.some(w => (w.location.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(w.location.toLowerCase())) && w.status === "Delayed"),
    })).filter(s => s.wagonsHere > 0 || ALL_STATIONS[s.name]?.major);
  }, [wagons]);

  return (
    <OperatorLayout title="Live Tracking" sub="Real-time GPS tracking · Interactive Railway Map" moduleKey="tracking">
      {/* Stats bar */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
        {[
          { label:"GPS Active", value:gpsActive,                                         color:"#22c55e", dot:true  },
          { label:"On Time",    value:wagons.filter(w=>w.status==="On Time").length,      color:"#22c55e"            },
          { label:"Delayed",    value:wagons.filter(w=>w.status==="Delayed").length,      color:"#f59e0b"            },
          { label:"Offline",    value:wagons.filter(w=>w.gps==="Offline").length,         color:"#ef4444"            },
          { label:"Avg Speed",  value:`${avgSpeed} km/h`,                                color:"#3b82f6"            },
        ].map(({ label, value, color, dot }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:8, background:"#0d1f3c", border:`1px solid ${color}20`, borderRadius:10, padding:"8px 16px" }}>
            {dot && <span className="dot dot-green"/>}
            <span style={{ color:"#64748b", fontSize:12 }}>{label}</span>
            <span style={{ color, fontWeight:800, fontSize:16 }}>{value}</span>
          </div>
        ))}
        <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color:"#4a6fa5", fontSize:11 }}>Refreshed {lastRefresh.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>
            <FiRefreshCw size={12} style={{ animation:refreshing?"spin 1s linear infinite":"none" }}/> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <div className="search-box" style={{ flex:1, minWidth:180 }}>
          <FiSearch size={13} color="#4a6fa5"/>
          <input placeholder="Search wagon ID, route…" value={searchWagon} onChange={e=>setSearchWagon(e.target.value)}/>
          {searchWagon && <button onClick={()=>setSearchWagon("")} style={{ background:"none",border:"none",color:"#4a6fa5",cursor:"pointer",padding:0 }}><FiX size={12}/></button>}
        </div>
        <div className="search-box" style={{ flex:1, minWidth:160 }}>
          <FiMapPin size={13} color="#4a6fa5"/>
          <input placeholder="Highlight station…" value={searchStation} onChange={e=>setSearchStation(e.target.value)}/>
          {searchStation && <button onClick={()=>setSearchStation("")} style={{ background:"none",border:"none",color:"#4a6fa5",cursor:"pointer",padding:0 }}><FiX size={12}/></button>}
        </div>
        <select className="form-select" style={{ width:"auto", padding:"8px 12px", fontSize:12 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          {["All","Active","Offline","Delayed","On Time"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Map + Detail */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:14, marginBottom:14, height:520 }}>
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
            <span className="dot dot-green" style={{ animation:"pulse 2s infinite" }}/>
            <span style={{ color:"#22c55e", fontSize:12, fontWeight:600 }}>NavIC Live</span>
            <span style={{ color:"#4a6fa5", fontSize:11 }}>· {gpsActive} active · scroll to zoom · drag to pan</span>
          </div>
          <div style={{ height:"calc(100% - 41px)" }}>
            <RailwayMap wagons={filteredList} selected={selected} onSelectWagon={w => setSelected(wagons.find(x=>x.id===w.id)||w)} searchStation={searchStation}/>
          </div>
        </div>
        <div className="card" style={{ padding:0, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"10px 14px", borderBottom:"1px solid #1a3356", flexShrink:0 }}>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>Wagon Detail</div>
          </div>
          <div style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
            <DetailPanel wagon={selected} onClose={()=>setSelected(null)}/>
          </div>
        </div>
      </div>

      {/* Fleet list + Station network */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <div className="card" style={{ padding:0 }}>
          <div style={{ padding:"12px 16px", borderBottom:"1px solid #1a3356", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ color:"#f1f5f9", fontWeight:700, fontSize:13 }}>Fleet ({filteredList.length})</div>
            <span style={{ color:"#4a6fa5", fontSize:11 }}>Click to select</span>
          </div>
          <div style={{ padding:"8px", maxHeight:260, overflowY:"auto" }}>
            {filteredList.length === 0
              ? <div style={{ textAlign:"center", padding:32, color:"#4a6fa5", fontSize:12 }}>No wagons match filter</div>
              : filteredList.map(w => <WagonListItem key={w.id} wagon={w} selected={selected} onClick={()=>setSelected(wagons.find(x=>x.id===w.id)||w)}/>)
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
                  {["Station","Status","Wagons"].map(h => (
                    <th key={h} style={{ color:"#4a6fa5", fontSize:10, fontWeight:700, textTransform:"uppercase", padding:"8px 14px", textAlign:h==="Station"?"left":"center", borderBottom:"1px solid #1a3356" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zoneStations.map(st => (
                  <tr key={st.name} onClick={()=>setSearchStation(st.name)} style={{ cursor:"pointer", borderBottom:"1px solid rgba(26,51,86,.4)" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(37,99,235,.05)"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <td style={{ padding:"9px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <FiMapPin size={11} color="#3b82f6"/>
                        <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:12 }}>{st.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:"9px 14px", textAlign:"center" }}>
                      {st.hasDelay
                        ? <span className="badge badge-delayed" style={{ fontSize:9 }}>Delay</span>
                        : <span className="badge badge-active"  style={{ fontSize:9 }}>Active</span>}
                    </td>
                    <td style={{ padding:"9px 14px", textAlign:"center" }}>
                      <span style={{ color:st.wagonsHere>0?"#60a5fa":"#4a6fa5", fontWeight:700, fontSize:12 }}>{st.wagonsHere}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin  { from { transform:rotate(0deg);   } to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }
      `}</style>
    </OperatorLayout>
  );
}
