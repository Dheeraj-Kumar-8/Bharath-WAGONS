import { useEffect, useMemo, useRef, useState } from "react";
import { FiAlertTriangle, FiMaximize2, FiZoomIn, FiZoomOut } from "react-icons/fi";

const DEFAULT_CENTER = [78.9629, 22.5937]; // [lng, lat] for MapTiler
const DEFAULT_ZOOM   = 4.5;
const MIN_ZOOM       = 3;
const MAX_ZOOM       = 14;
const MAPTILER_KEY   = "lMd5OHHmouwHWSMnr8rW";
const SCRIPT_ID      = "maptiler-sdk-js";
const STYLE_ID       = "maptiler-sdk-css";

function isValidLatLng(p) {
  return p && Number.isFinite(p.lat) && Number.isFinite(p.lng);
}

function loadMapTiler() {
  return new Promise((resolve, reject) => {
    if (window.maptilersdk) { resolve(); return; }

    // inject CSS
    if (!document.getElementById(STYLE_ID)) {
      const link  = document.createElement("link");
      link.id     = STYLE_ID;
      link.rel    = "stylesheet";
      link.href   = "https://cdn.maptiler.com/maptiler-sdk-js/latest/maptiler-sdk.css";
      document.head.appendChild(link);
    }

    if (document.getElementById(SCRIPT_ID)) {
      const wait = setInterval(() => {
        if (window.maptilersdk) { clearInterval(wait); resolve(); }
      }, 100);
      return;
    }

    const s    = document.createElement("script");
    s.id       = SCRIPT_ID;
    s.src      = "https://cdn.maptiler.com/maptiler-sdk-js/latest/maptiler-sdk.umd.min.js";
    s.async    = true;
    s.onload   = () => { if (window.maptilersdk) resolve(); else reject(new Error("MapTiler SDK not found after load")); };
    s.onerror  = () => reject(new Error("Failed to load MapTiler SDK script"));
    document.head.appendChild(s);
  });
}

export default function MapTilerRailwayMap({
  wagons        = [],
  selected      = null,
  searchStation = "",
  onSelectWagon,
  getStationCoords,
  zoneColors    = {},
  statusColors  = {},
}) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef([]);
  const popupRef     = useRef(null);

  const [ready,     setReady]     = useState(false);
  const [mapReady,  setMapReady]  = useState(false);
  const [loadError, setLoadError] = useState("");
  const [mapZoom,   setMapZoom]   = useState(DEFAULT_ZOOM);

  // Load MapTiler SDK
  useEffect(() => {
    let alive = true;
    loadMapTiler()
      .then(() => { if (alive) setReady(true); })
      .catch(err => { if (alive) setLoadError(err.message); });
    return () => { alive = false; };
  }, []);

  // Init map
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;

    const sdk = window.maptilersdk;
    sdk.config.apiKey = MAPTILER_KEY;

    mapRef.current = new sdk.Map({
      container:   containerRef.current,
      style:       sdk.MapStyle.DATAVIZ.DARK,
      center:      DEFAULT_CENTER,
      zoom:        DEFAULT_ZOOM,
      minZoom:     MIN_ZOOM,
      maxZoom:     MAX_ZOOM,
      attributionControl: false,
      navigationControl:  false,
    });

    mapRef.current.on("zoom", () =>
      setMapZoom(mapRef.current.getZoom() ?? DEFAULT_ZOOM)
    );

    mapRef.current.on("load", () => setMapReady(true));
  }, [ready]);

  // Compute marker data
  const markerData = useMemo(() => wagons.map((w, i) => {
    const parts     = w.route?.split("→").map(s => s.trim()) ?? [];
    const livePos   = getStationCoords?.(w.location);
    const originPos = getStationCoords?.(parts[0] ?? "");
    const destPos   = getStationCoords?.(parts[parts.length - 1] ?? "");
    // Keep each marker pinned to the resolved station coordinates while zooming.
    const pos = livePos || originPos || destPos || { lat: 22.5937, lng: 78.9629 };
    const color = w.gps === "Offline"
      ? "#64748b"
      : statusColors[w.status] || ["#22c55e","#f59e0b","#f97316","#3b82f6"][i % 4];
    return { w, pos: isValidLatLng(pos) ? pos : { lat: 22.5937, lng: 78.9629 }, color, isSel: selected?.id === w.id };
  }), [wagons, selected?.id, getStationCoords, statusColors]);

  const searchPos = useMemo(() => {
    const c = getStationCoords?.(searchStation);
    return isValidLatLng(c) ? c : null;
  }, [searchStation, getStationCoords]);

  // Place / refresh markers
  useEffect(() => {
    if (!mapReady || !window.maptilersdk) return;
    const sdk = window.maptilersdk;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }

    markerData.forEach(({ w, pos, color, isSel }) => {
      const el = document.createElement("div");
      el.style.cssText = `
        width:${isSel ? 16 : 10}px;
        height:${isSel ? 16 : 10}px;
        border-radius:50%;
        background:${color};
        border:${isSel ? "2px solid #ffffff" : "1px solid #0a1628"};
        box-shadow:0 0 ${isSel ? 10 : 5}px ${color};
        cursor:pointer;
        transition:all .2s;
      `;

      const marker = new sdk.Marker({ element: el, anchor: "center" })
        .setLngLat([pos.lng, pos.lat])
        .addTo(mapRef.current);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectWagon?.(w);
        // show popup
        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new sdk.Popup({ offset: 10, closeButton: false })
          .setLngLat([pos.lng, pos.lat])
          .setHTML(`
            <div style="background:#071628;border:1px solid #1a3356;border-radius:8px;padding:8px 12px;font-family:sans-serif">
              <div style="color:#60a5fa;font-weight:700;font-size:12px">${w.id}</div>
              <div style="color:#94a3b8;font-size:10px;margin-top:2px">${w.location}</div>
              <div style="color:${color};font-size:10px;margin-top:2px">${w.status} · ${w.speed} km/h</div>
            </div>
          `)
          .addTo(mapRef.current);
      });

      markersRef.current.push(marker);
    });

    if (searchPos) {
      const el = document.createElement("div");
      el.style.cssText = `
        width:14px; height:14px; border-radius:50%;
        background:#06b6d4; border:2px solid #fff;
        box-shadow:0 0 10px #06b6d4; cursor:default;
      `;
      const marker = new sdk.Marker({ element: el, anchor: "center" })
        .setLngLat([searchPos.lng, searchPos.lat])
        .addTo(mapRef.current);
      markersRef.current.push(marker);
      mapRef.current.flyTo({ center: [searchPos.lng, searchPos.lat], zoom: 7, duration: 800 });
    }

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
    };
  }, [markerData, searchPos, searchStation, onSelectWagon, mapReady]);

  const resetView = () =>
    mapRef.current?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM, duration: 600 });

  const adjustZoom = d => {
    const map = mapRef.current;
    if (map) map.setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, (map.getZoom() ?? DEFAULT_ZOOM) + d)));
  };

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", background:"#0a1628", overflow:"hidden" }}>

      {/* Controls */}
      <div style={{ position:"absolute", top:12, right:12, display:"flex", flexDirection:"column", gap:4, zIndex:10 }}>
        {[
          { icon:FiZoomIn,    fn:()=>adjustZoom(1),  label:"Zoom In"  },
          { icon:FiZoomOut,   fn:()=>adjustZoom(-1), label:"Zoom Out" },
          { icon:FiMaximize2, fn:resetView,          label:"Reset"    },
        ].map(({ icon:Icon, fn, label }) => (
          <button key={label} onClick={fn} title={label}
            style={{ width:32, height:32, borderRadius:8, border:"1px solid #1a3356", background:"rgba(13,31,60,.92)", color:"#94a3b8", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
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
        <div style={{ borderTop:"1px solid #1a3356", marginTop:6, paddingTop:6 }}>
          {Object.entries(zoneColors).map(([z,c]) => (
            <div key={z} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:c }}/><span style={{ color:"#94a3b8", fontSize:10 }}>{z}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zoom % */}
      <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(6,14,30,.9)", border:"1px solid #1a3356", borderRadius:6, padding:"4px 8px", zIndex:10 }}>
        <span style={{ color:"#4a6fa5", fontSize:10 }}>{Math.round((mapZoom / DEFAULT_ZOOM) * 100)}%</span>
      </div>

      <div ref={containerRef} style={{ width:"100%", height:"100%" }}/>

      {!ready && !loadError && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(3,13,31,.85)", zIndex:9 }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ color:"#60a5fa", fontSize:13, fontWeight:600, marginBottom:6 }}>Loading Map…</div>
            <div style={{ color:"#4a6fa5", fontSize:11 }}>Connecting to MapTiler</div>
          </div>
        </div>
      )}

      {loadError && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(3,13,31,.92)", zIndex:9, padding:16, textAlign:"center" }}>
          <div style={{ maxWidth:360, border:"1px solid #1a3356", borderRadius:12, background:"rgba(6,14,30,.97)", padding:20 }}>
            <FiAlertTriangle size={20} color="#f59e0b"/>
            <div style={{ marginTop:10, color:"#f1f5f9", fontSize:13, fontWeight:700 }}>Map unavailable</div>
            <div style={{ marginTop:6, color:"#94a3b8", fontSize:11, lineHeight:1.6 }}>{loadError}</div>
          </div>
        </div>
      )}
    </div>
  );
}
