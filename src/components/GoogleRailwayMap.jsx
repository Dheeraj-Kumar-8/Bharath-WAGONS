import { useEffect, useMemo, useRef, useState } from "react";
import { FiAlertTriangle, FiMaximize2, FiZoomIn, FiZoomOut } from "react-icons/fi";

const DEFAULT_CENTER = { lat: 22.5937, lng: 78.9629 };
const DEFAULT_ZOOM = 4;
const MIN_ZOOM = 3;
const MAX_ZOOM = 8;
const SCRIPT_ID = "google-maps-js";

const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#07111f" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6e87a8" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#07111f" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#173a63" }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#07111f" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#10243f" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#031425" }] },
];

function isValidLatLng(point) {
  return point && Number.isFinite(point.lat) && Number.isFinite(point.lng);
}

function createMarkerIcon(google, color, selected) {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: 1,
    strokeColor: selected ? "#f8fafc" : "#08111f",
    strokeWeight: selected ? 3 : 2,
    scale: selected ? 7 : 4,
  };
}

function createMarkerContent(color, selected) {
  const outer = document.createElement("div");
  outer.style.width = selected ? "16px" : "10px";
  outer.style.height = selected ? "16px" : "10px";
  outer.style.borderRadius = "50%";
  outer.style.background = color;
  outer.style.border = `${selected ? 2 : 1}px solid ${selected ? "#f8fafc" : "#08111f"}`;
  outer.style.boxShadow = `0 0 ${selected ? "10px" : "5px"} ${color}`;
  outer.style.transform = selected ? "translate(-50%, -50%) scale(1.05)" : "translate(-50%, -50%)";
  outer.style.boxSizing = "border-box";
  outer.style.position = "relative";

  const inner = document.createElement("div");
  inner.style.width = selected ? "6px" : "4px";
  inner.style.height = selected ? "6px" : "4px";
  inner.style.borderRadius = "50%";
  inner.style.background = "#e2e8f0";
  inner.style.position = "absolute";
  inner.style.left = "50%";
  inner.style.top = "50%";
  inner.style.transform = "translate(-50%, -50%)";

  outer.appendChild(inner);
  return outer;
}

function resolveGoogleMapKey() {
  return fetch("/api/config/google-maps")
    .then(response => response.json().then(data => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
      if (!ok || !data?.success || !data?.apiKey) {
        throw new Error(data?.message || "Google Maps API key is missing");
      }
      return data.apiKey;
    });
}

export default function GoogleRailwayMap({
  wagons = [],
  selected = null,
  searchStation = "",
  onSelectWagon,
  getStationCoords,
  zoneColors = {},
  statusColors = {},
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const [apiKey, setApiKey] = useState("");
  const [loadError, setLoadError] = useState("");
  const [scriptReady, setScriptReady] = useState(false);
  const [googleMapsApi, setGoogleMapsApi] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  useEffect(() => {
    let alive = true;
    resolveGoogleMapKey()
      .then(key => {
        if (alive) setApiKey(key);
      })
      .catch(error => {
        if (alive) setLoadError(error.message || "Google Maps failed to initialize");
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!apiKey || loadError) return;

    if (window.google?.maps) {
      setScriptReady(true);
      return;
    }

    const existingScript = document.getElementById(SCRIPT_ID);

    const handleLoad = () => setScriptReady(true);
    const handleError = () => setLoadError("Google Maps script could not be loaded");

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad);
      existingScript.addEventListener("error", handleError);
      return () => {
        existingScript.removeEventListener("load", handleLoad);
        existingScript.removeEventListener("error", handleError);
      };
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&loading=async&callback=__gmapsReady`;
    script.onload = handleLoad;
    script.onerror = handleError;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [apiKey, loadError]);

  useEffect(() => {
    if (!scriptReady || !mapContainerRef.current || mapRef.current || !googleMapsApi?.Map) return;

    mapRef.current = new googleMapsApi.Map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      disableDefaultUI: true,
      gestureHandling: "greedy",
      clickableIcons: false,
      mapId: "DEMO_MAP_ID",
      styles: MAP_STYLES,
      backgroundColor: "#030d1f",
    });

    const zoomListener = mapRef.current.addListener("zoom_changed", () => {
      const nextZoom = mapRef.current?.getZoom() || DEFAULT_ZOOM;
      setMapZoom(nextZoom);
    });

    setMapReady(true);
    setMapZoom(DEFAULT_ZOOM);

    return () => {
      zoomListener.remove();
    };
  }, [scriptReady, googleMapsApi]);

  useEffect(() => {
    if (!scriptReady || !window.google?.maps?.importLibrary) return;
    let alive = true;
    Promise.all([
      window.google.maps.importLibrary("maps"),
      window.google.maps.importLibrary("marker"),
    ])
      .then(([mapsLib, markerLib]) => {
        if (alive) setGoogleMapsApi({ Map: mapsLib.Map, AdvancedMarkerElement: markerLib.AdvancedMarkerElement });
      })
      .catch(() => { if (alive) setLoadError("Google Maps libraries failed to load"); });
    return () => { alive = false; };
  }, [scriptReady]);

  const wagonMarkers = useMemo(() => {
    return wagons.map((wagon, index) => {
      const stationNames = typeof wagon.route === "string"
        ? wagon.route.split("→").map(part => part.trim())
        : [];
      const origin = stationNames[0] || "";
      const destination = stationNames[stationNames.length - 1] || "";

      const livePosition = getStationCoords?.(wagon.location);
      const originPosition = getStationCoords?.(origin);
      const destinationPosition = getStationCoords?.(destination);

      // Keep each marker pinned to the resolved station coordinates while zooming.
      const position = livePosition || originPosition || destinationPosition || DEFAULT_CENTER;

      const markerColor = wagon.gps === "Offline"
        ? "#64748b"
        : statusColors[wagon.status] || ["#22c55e", "#f59e0b", "#f97316", "#3b82f6"][index % 4];

      return {
        wagon,
        position: isValidLatLng(position) ? position : DEFAULT_CENTER,
        selected: selected?.id === wagon.id,
        color: markerColor,
      };
    });
  }, [wagons, selected?.id, getStationCoords, statusColors]);

  const searchMarker = useMemo(() => {
    const coords = getStationCoords?.(searchStation);
    return isValidLatLng(coords) ? coords : null;
  }, [searchStation, getStationCoords]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.google?.maps || !googleMapsApi?.AdvancedMarkerElement) return;

    markersRef.current.forEach(marker => {
      if (typeof marker.setMap === "function") marker.setMap(null);
      else marker.map = null;
    });
    markersRef.current = [];

    wagonMarkers.forEach(markerData => {
      const marker = new googleMapsApi.AdvancedMarkerElement({
        map,
        position: markerData.position,
        title: `${markerData.wagon.id} · ${markerData.wagon.location}`,
        content: createMarkerContent(markerData.color, markerData.selected),
      });

      marker.addListener?.("click", () => {
        onSelectWagon?.(markerData.wagon);
      });

      markersRef.current.push(marker);
    });

    if (searchMarker) {
      const marker = new googleMapsApi.AdvancedMarkerElement({
        map,
        position: searchMarker,
        title: searchStation,
        content: createMarkerContent("#3b82f6", true),
      });

      markersRef.current.push(marker);
    }

    if (searchMarker) {
      map.panTo(searchMarker);
      const currentZoom = map.getZoom() || DEFAULT_ZOOM;
      if (currentZoom < 5) map.setZoom(5);
    }

    return () => {
      markersRef.current.forEach(marker => {
        if (typeof marker.setMap === "function") marker.setMap(null);
        else marker.map = null;
      });
      markersRef.current = [];
    };
  }, [wagonMarkers, searchMarker, searchStation, onSelectWagon, mapReady, googleMapsApi]);

  const resetView = () => {
    const map = mapRef.current;
    if (!map) return;
    map.panTo(DEFAULT_CENTER);
    map.setZoom(DEFAULT_ZOOM);
  };

  const adjustZoom = delta => {
    const map = mapRef.current;
    if (!map) return;
    const currentZoom = map.getZoom() || DEFAULT_ZOOM;
    map.setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, currentZoom + delta)));
  };

  const zoomPercent = Math.round((mapZoom / DEFAULT_ZOOM) * 100);

  return (
    <div style={{ position:"relative", width:"100%", height:"100%", background:"#030d1f", overflow:"hidden", userSelect:"none" }}>
      <div style={{ position:"absolute", top:12, right:12, display:"flex", flexDirection:"column", gap:4, zIndex:10 }}>
        {[
          { icon: FiZoomIn, onClick: () => adjustZoom(1), title: "Zoom In" },
          { icon: FiZoomOut, onClick: () => adjustZoom(-1), title: "Zoom Out" },
          { icon: FiMaximize2, onClick: resetView, title: "Reset" },
        ].map(({ icon: Icon, onClick, title }) => (
          <button
            key={title}
            onClick={onClick}
            title={title}
            style={{ width:32, height:32, borderRadius:8, border:"1px solid #1a3356", background:"rgba(13,31,60,.92)", color:"#94a3b8", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      <div style={{ position:"absolute", bottom:10, left:10, background:"rgba(6,14,30,.9)", border:"1px solid #1a3356", borderRadius:8, padding:"8px 12px", zIndex:10 }}>
        {[["On Time", "#22c55e"], ["Delayed", "#f59e0b"], ["Maintenance", "#f97316"], ["GPS Offline", "#64748b"]].map(([label, color]) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:color }} />
            <span style={{ color:"#94a3b8", fontSize:10 }}>{label}</span>
          </div>
        ))}

        <div style={{ borderTop:"1px solid #1a3356", marginTop:6, paddingTop:6 }}>
          {Object.entries(zoneColors).map(([zone, color]) => (
            <div key={zone} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:color }} />
              <span style={{ color:"#94a3b8", fontSize:10 }}>{zone}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:"absolute", bottom:10, right:10, background:"rgba(6,14,30,.9)", border:"1px solid #1a3356", borderRadius:6, padding:"4px 8px", zIndex:10 }}>
        <span style={{ color:"#4a6fa5", fontSize:10 }}>{zoomPercent}%</span>
      </div>

      <div ref={mapContainerRef} style={{ width:"100%", height:"100%" }} />

      {!apiKey && !loadError && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(3,13,31,.7)", zIndex:9 }}>
          <div style={{ color:"#94a3b8", fontSize:12 }}>Loading Google Maps...</div>
        </div>
      )}

      {loadError && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(3,13,31,.88)", zIndex:9, padding:16, textAlign:"center" }}>
          <div style={{ maxWidth:320, border:"1px solid #1a3356", borderRadius:12, background:"rgba(6,14,30,.92)", padding:16 }}>
            <FiAlertTriangle size={18} color="#f59e0b" />
            <div style={{ marginTop:10, color:"#f1f5f9", fontSize:13, fontWeight:700 }}>Google Maps unavailable</div>
            <div style={{ marginTop:6, color:"#94a3b8", fontSize:11, lineHeight:1.5 }}>{loadError}</div>
          </div>
        </div>
      )}
    </div>
  );
}
