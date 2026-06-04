import { useState, useRef, useEffect } from "react";
import { FiX, FiSend, FiCpu, FiMessageSquare, FiMinus } from "react-icons/fi";

// ── All website data the AI knows about ─────────────────────────────────────
const KB = {
  stats: {
    totalWagons: 1247, activeWagons: 1089, delayedWagons: 47,
    maintenanceReq: 28, stationsOnline: 124, gpsActive: 1041,
    aiAlerts: 18, cargoLoads: 3482,
  },
  wagons: [
    { id:"WGN-001", location:"New Delhi",    dest:"Mumbai CST",  speed:"87 km/h",  status:"On Time",    type:"Freight",   capacity:"60T", zone:"NR"  },
    { id:"WGN-002", location:"Chennai Ctrl", dest:"Hyderabad",   speed:"64 km/h",  status:"Delayed",    type:"Tank",      capacity:"45T", zone:"SR"  },
    { id:"WGN-003", location:"Howrah",       dest:"New Delhi",   speed:"92 km/h",  status:"On Time",    type:"Freight",   capacity:"60T", zone:"ER"  },
    { id:"WGN-004", location:"Pune Jn",      dest:"Mumbai CST",  speed:"0 km/h",   status:"Maintenance",type:"Flatbed",   capacity:"55T", zone:"CR"  },
    { id:"WGN-005", location:"Bengaluru",    dest:"Chennai",     speed:"78 km/h",  status:"On Time",    type:"Freight",  capacity:"60T", zone:"SWR" },
    { id:"WGN-006", location:"Ahmedabad",    dest:"New Delhi",   speed:"55 km/h",  status:"Delayed",    type:"Freight",   capacity:"60T", zone:"WR"  },
    { id:"WGN-007", location:"Lucknow",      dest:"Kolkata",     speed:"81 km/h",  status:"On Time",    type:"Freight",   capacity:"60T", zone:"NR"  },
    { id:"WGN-008", location:"Jaipur",       dest:"Mumbai",      speed:"0 km/h",   status:"Maintenance",type:"Tank",      capacity:"45T", zone:"NWR" },
    { id:"WGN-009", location:"Nagpur",       dest:"Hyderabad",   speed:"73 km/h",  status:"On Time",    type:"Freight",   capacity:"60T", zone:"SCR" },
    { id:"WGN-010", location:"Patna",        dest:"New Delhi",   speed:"68 km/h",  status:"Delayed",    type:"Flatbed",   capacity:"55T", zone:"ECR" },
    { id:"WGN-011", location:"Surat",        dest:"Ahmedabad",   speed:"90 km/h",  status:"On Time",    type:"Freight",   capacity:"60T", zone:"WR"  },
    { id:"WGN-012", location:"Coimbatore",   dest:"Bengaluru",   speed:"59 km/h",  status:"On Time",    type:"Freight",  capacity:"60T", zone:"SR"  },
    { id:"WGN-013", location:"Bhopal",       dest:"Delhi",       speed:"82 km/h",  status:"On Time",    type:"Freight",   capacity:"60T", zone:"WCR" },
    { id:"WGN-014", location:"Vizag",        dest:"Chennai",     speed:"0 km/h",   status:"Maintenance",type:"Tank",      capacity:"45T", zone:"ECoR"},
    { id:"WGN-015", location:"Kanpur",       dest:"Kolkata",     speed:"77 km/h",  status:"On Time",    type:"Flatbed",   capacity:"55T", zone:"NCR" },
  ],
  alerts: [
    { wagon:"WGN-101", type:"GPS Signal Lost",      priority:"Critical", time:"12:15 PM", status:"Active"   },
    { wagon:"WGN-234", type:"Route Deviation",      priority:"High",     time:"12:18 PM", status:"Active"   },
    { wagon:"WGN-876", type:"Door Open Detected",   priority:"High",     time:"12:20 PM", status:"Active"   },
    { wagon:"WGN-555", type:"Speed Limit Exceeded", priority:"Medium",   time:"12:22 PM", status:"Resolved" },
    { wagon:"WGN-789", type:"Cargo Overweight",     priority:"Low",      time:"12:25 PM", status:"Pending"  },
  ],
  stations: [
    { name:"Delhi",      arrivals:142, departures:138, zone:"NR"  },
    { name:"Mumbai",     arrivals:128, departures:131, zone:"CR"  },
    { name:"Chennai",    arrivals:96,  departures:99,  zone:"SR"  },
    { name:"Kolkata",    arrivals:112, departures:108, zone:"ER"  },
    { name:"Hyderabad",  arrivals:87,  departures:90,  zone:"SCR" },
    { name:"Bengaluru",  arrivals:78,  departures:74,  zone:"SWR" },
  ],
  routes: [
    { name:"Delhi → Mumbai",    wagons:14, status:"Active",  dist:"1,384 km", delay:"-"      },
    { name:"Chennai → Kolkata", wagons:9,  status:"Active",  dist:"1,659 km", delay:"-"      },
    { name:"Bengaluru → Pune",  wagons:6,  status:"Delayed", dist:"832 km",   delay:"47 min" },
    { name:"Ahmedabad → Delhi", wagons:11, status:"Active",  dist:"934 km",   delay:"-"      },
    { name:"Hyderabad → Mumbai",wagons:8,  status:"Active",  dist:"711 km",   delay:"-"      },
    { name:"Howrah → Delhi",    wagons:12, status:"Active",  dist:"1,442 km", delay:"-"      },
  ],
  health: {
    gpsActive: "1,041 (89%)", gpsOffline: "47 (4%)",
    stationsOnline: "124 (96%)", serverStatus: "OK",
    aiEngine: "Active", overallHealth: "94%",
  },
  predictions: [
    { label:"Delay Prediction",     value:"78%", detail:"23 wagons likely delayed tomorrow"  },
    { label:"Maintenance Forecast", value:"65%", detail:"18 wagons need service in 7 days"   },
    { label:"Fuel Efficiency",      value:"88%", detail:"Avg efficiency up 4.2% this week"   },
    { label:"Route Optimisation",   value:"92%", detail:"12 routes optimised by AI engine"   },
  ],
  cities: [
    { name:"Hyderabad",  active:87,  moving:72, delayed:9,  offline:6  },
    { name:"Delhi",      active:142, moving:128,delayed:11, offline:3  },
    { name:"Mumbai",     active:128, moving:115,delayed:8,  offline:5  },
    { name:"Chennai",    active:96,  moving:88, delayed:6,  offline:2  },
    { name:"Kolkata",    active:112, moving:102,delayed:7,  offline:3  },
    { name:"Bengaluru",  active:78,  moving:71, delayed:5,  offline:2  },
  ],
};

// ── AI response engine ───────────────────────────────────────────────────────
function getAIResponse(input) {
  const q = input.toLowerCase().trim();

  // Specific wagon lookup
  const wgnMatch = q.match(/wgn[- ]?(\d+)/i);
  if (wgnMatch) {
    const id = `WGN-${wgnMatch[1].padStart(3,"0")}`;
    const w = KB.wagons.find(x => x.id === id);
    if (w) return `🚆 **${w.id}**\n• Location: ${w.location}\n• Destination: ${w.dest}\n• Speed: ${w.speed}\n• Status: ${w.status}\n• Type: ${w.type} | Capacity: ${w.capacity}\n• Zone: ${w.zone}`;
    return `❌ Wagon **${id}** not found in the system. Try WGN-001 through WGN-015 for active wagons.`;
  }

  // Delayed wagons
  if (q.includes("delay") || q.includes("late")) {
    const delayed = KB.wagons.filter(w => w.status === "Delayed");
    return `⚠️ **${KB.stats.delayedWagons} wagons delayed** across the network.\n\nTracked delayed wagons:\n${delayed.map(w => `• ${w.id} — ${w.location} → ${w.dest} (${w.speed})`).join("\n")}\n\nRoute Bengaluru → Pune has a 47-min delay.`;
  }

  // Maintenance
  if (q.includes("mainten")) {
    const maint = KB.wagons.filter(w => w.status === "Maintenance");
    return `🔧 **${KB.stats.maintenanceReq} wagons** require maintenance.\n\nCurrently in maintenance:\n${maint.map(w => `• ${w.id} — at ${w.location} (Zone ${w.zone})`).join("\n")}\n\n📊 Forecast: 18 more wagons need service within 7 days.`;
  }

  // Alerts
  if (q.includes("alert") || q.includes("critical") || q.includes("warning")) {
    const active = KB.alerts.filter(a => a.status === "Active");
    return `🚨 **${KB.stats.aiAlerts} AI Alerts** total. ${active.length} currently active:\n\n${KB.alerts.map(a => `• ${a.wagon} — ${a.type} [${a.priority}] @ ${a.time} → ${a.status}`).join("\n")}`;
  }

  // GPS / tracking
  if (q.includes("gps") || q.includes("signal") || q.includes("track")) {
    return `📡 **GPS Status:**\n• Active: ${KB.health.gpsActive}\n• Offline: ${KB.health.gpsOffline}\n• NavIC GPS is active and tracking 1,041 wagons live across India.\n\n⚠️ WGN-101 had a GPS signal loss at 12:15 PM (now reconnected).`;
  }

  // Stations
  if (q.includes("station")) {
    const cityMatch = KB.stations.find(s => q.includes(s.name.toLowerCase()));
    if (cityMatch) {
      return `🏛️ **${cityMatch.name} Station** (Zone ${cityMatch.zone})\n• Arrivals: ${cityMatch.arrivals}\n• Departures: ${cityMatch.departures}`;
    }
    return `🏛️ **${KB.stats.stationsOnline} stations online.**\n\nTop stations:\n${KB.stations.map(s => `• ${s.name} (${s.zone}) — ${s.arrivals} arrivals, ${s.departures} departures`).join("\n")}`;
  }

  // Routes
  if (q.includes("route") || q.includes("path") || q.includes("journey")) {
    const activeRoutes = KB.routes.filter(r => r.status === "Active").length;
    return `🛤️ **${activeRoutes} active routes** out of ${KB.routes.length} total.\n\n${KB.routes.map(r => `• ${r.name} — ${r.wagons} wagons | ${r.dist} | ${r.status}${r.delay !== "-" ? ` | Delay: ${r.delay}` : ""}`).join("\n")}`;
  }

  // City / location query
  const cityMatch = KB.cities.find(c => q.includes(c.name.toLowerCase()));
  if (cityMatch) {
    return `📍 **${cityMatch.name} Overview:**\n• Active Routes: ${cityMatch.active}\n• Moving Wagons: ${cityMatch.moving}\n• Delayed Routes: ${cityMatch.delayed}\n• Offline GPS: ${cityMatch.offline}`;
  }

  // System health
  if (q.includes("health") || q.includes("system") || q.includes("server") || q.includes("status")) {
    return `💚 **System Health: ${KB.health.overallHealth}**\n• GPS Active: ${KB.health.gpsActive}\n• GPS Offline: ${KB.health.gpsOffline}\n• Stations Online: ${KB.health.stationsOnline}\n• Server: ${KB.health.serverStatus}\n• AI Engine: ${KB.health.aiEngine}`;
  }

  // Predictions / insights
  if (q.includes("user") || q.includes("role") || q.includes("admin") || q.includes("operator") || q.includes("analyst") || q.includes("zone") || q.includes("region")) {
    return `👥 **Zone-based User Management:**\n• Each zone has its own dedicated Admin\n• Admins can only view/manage users in their own zone\n• Roles: Admin, Operator, Analyst\n• Admins cannot edit other Admins or create new Admins\n\nZones: NR, CR, SR, ER, WR, SCR, NCR, NWR, ECR, SWR, ECoR, WCR`;
  }

  if (q.includes("predict") || q.includes("insight") || q.includes("forecast") || q.includes("ai")) {
    return `🤖 **AI Predictive Insights:**\n${KB.predictions.map(p => `• ${p.label}: **${p.value}** — ${p.detail}`).join("\n")}`;
  }

  // Cargo
  if (q.includes("cargo") || q.includes("freight") || q.includes("load")) {
    const freightWagons = KB.wagons.filter(w => w.type === "Freight").length;
    return `📦 **Cargo Overview:**\n• Total Cargo Loads: ${KB.stats.cargoLoads.toLocaleString()}\n• Freight Wagons tracked: ${freightWagons}\n• Trend: +6.4% this week\n\n⚠️ Alert: WGN-789 detected with cargo overweight (Pending review).`;
  }

  // Speed
  if (q.includes("speed") || q.includes("fast") || q.includes("slow")) {
    const sorted = [...KB.wagons].filter(w => parseInt(w.speed) > 0).sort((a,b) => parseInt(b.speed) - parseInt(a.speed));
    return `⚡ **Wagon Speed Report:**\n• Fastest: ${sorted[0].id} at ${sorted[0].speed}\n• Average speed: ~76 km/h\n\nTop 3 fastest:\n${sorted.slice(0,3).map(w => `• ${w.id} — ${w.speed} (${w.location})`).join("\n")}`;
  }

  // Summary / overview / all data
  if (q.includes("summar") || q.includes("overview") || q.includes("all") || q.includes("data") || q.includes("report") || q.includes("total") || q.includes("dashboard")) {
    return `📊 **System Summary — Indian Railways Command Center**\n\n🚆 Wagons: ${KB.stats.totalWagons.toLocaleString()} total | ${KB.stats.activeWagons.toLocaleString()} active | ${KB.stats.delayedWagons} delayed | ${KB.stats.maintenanceReq} in maintenance\n📡 GPS: ${KB.stats.gpsActive.toLocaleString()} active\n🏛️ Stations: ${KB.stats.stationsOnline} online\n🚨 Alerts: ${KB.stats.aiAlerts} active\n📦 Cargo: ${KB.stats.cargoLoads.toLocaleString()} loads\n💚 System Health: ${KB.health.overallHealth}\n\nType a specific query like "delayed wagons", "alerts", "WGN-001", or a city name for details.`;
  }

  // Help
  if (q.includes("help") || q.includes("what can") || q.includes("how") || q === "hi" || q === "hello" || q.length < 4) {
    return `👋 Hi! I'm the **Railway AI Assistant**. I can tell you about:\n\n• 🚆 Any wagon (e.g. "WGN-001")\n• ⚠️ Delayed or maintenance wagons\n• 🚨 AI alerts & incidents\n• 📡 GPS & signal status\n• 🏛️ Stations (e.g. "Delhi station")\n• 🛤️ Routes & distances\n• 📍 City overviews (e.g. "Mumbai")\n• 📦 Cargo & freight\n• 🤖 Predictive insights\n• 💚 System health\n• 📊 Full dashboard summary\n\nJust ask me anything!`;
  }

  return `🤔 I didn't quite catch that. Try asking about:\n• A specific wagon: "WGN-003"\n• "delayed wagons" or "alerts"\n• "system health" or "summary"\n• A city: "Delhi" or "Mumbai"\n\nType "help" to see all I can do!`;
}

// ── Chat Component ────────────────────────────────────────────────────────────
const SidebarChatBot = () => {
  const [open, setOpen]     = useState(false);
  const [minimized, setMin] = useState(false);
  const [input, setInput]   = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([
    { role:"ai", text:"👋 Hi! I'm your Railway AI Assistant. Ask me anything about wagons, alerts, routes, stations, or system health!" },
  ]);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && !minimized) endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, open, minimized]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setMessages(p => [...p, { role:"user", text: trimmed }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages(p => [...p, { role:"ai", text: getAIResponse(trimmed) }]);
      setTyping(false);
    }, 600);
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{
          position:"fixed", bottom:"24px", right:"24px", zIndex:9998,
          width:"52px", height:"52px", borderRadius:"50%", border:"none",
          background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",
          boxShadow:"0 0 0 3px rgba(59,130,246,.25), 0 4px 20px rgba(37,99,235,.5)",
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          transition:"transform .2s",
        }} title="AI Assistant">
          <FiCpu color="#fff" size={22} />
          <span style={{
            position:"absolute", top:2, right:2, width:14, height:14,
            background:"#22c55e", borderRadius:"50%", border:"2px solid #020817",
            fontSize:"8px", display:"flex", alignItems:"center", justifyContent:"center",
          }} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position:"fixed", bottom:"24px", right:"24px", zIndex:9999,
          width:"360px", borderRadius:"20px",
          background:"#0d1f3c", border:"1px solid #1e3a5f",
          boxShadow:"0 8px 40px rgba(0,0,0,.6)",
          display:"flex", flexDirection:"column",
          maxHeight: minimized ? "52px" : "520px",
          transition:"max-height .3s ease",
          overflow:"hidden",
        }}>
          {/* Header */}
          <div style={{
            padding:"14px 16px", background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
            display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0,
            borderRadius: minimized ? "20px" : "20px 20px 0 0",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <FiCpu color="#fff" size={16} />
              <span style={{ color:"#fff", fontWeight:700, fontSize:"14px" }}>Railway AI Assistant</span>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e" }} />
            </div>
            <div style={{ display:"flex", gap:"6px" }}>
              <button onClick={() => setMin(p => !p)} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:"6px", padding:"4px 6px", cursor:"pointer", color:"#fff", display:"flex" }}>
                <FiMinus size={13} />
              </button>
              <button onClick={() => setOpen(false)} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:"6px", padding:"4px 6px", cursor:"pointer", color:"#fff", display:"flex" }}>
                <FiX size={13} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div style={{ flex:1, overflowY:"auto", padding:"14px 14px 6px", display:"flex", flexDirection:"column", gap:"10px" }}>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth:"88%",
                  }}>
                    {m.role === "ai" && (
                      <div style={{ display:"flex", alignItems:"center", gap:"5px", marginBottom:"4px" }}>
                        <FiCpu size={10} color="#3b82f6" />
                        <span style={{ color:"#3b82f6", fontSize:"10px", fontWeight:700 }}>AI</span>
                      </div>
                    )}
                    <div style={{
                      padding:"10px 13px",
                      borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                      background: m.role === "user" ? "linear-gradient(135deg,#1d4ed8,#2563eb)" : "#071628",
                      border: m.role === "user" ? "none" : "1px solid #1a3356",
                      color: "#e2e8f0", fontSize:"12.5px", lineHeight:1.6,
                      whiteSpace:"pre-wrap", wordBreak:"break-word",
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div style={{ alignSelf:"flex-start" }}>
                    <div style={{ padding:"10px 14px", background:"#071628", border:"1px solid #1a3356", borderRadius:"4px 16px 16px 16px", display:"flex", gap:"4px", alignItems:"center" }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#3b82f6", animation:`bounce 1.2s ${i*0.2}s infinite ease-in-out`, display:"inline-block" }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Quick chips */}
              <div style={{ padding:"6px 14px", display:"flex", gap:"6px", flexWrap:"wrap" }}>
                {["Summary","Delayed","Alerts","System Health"].map(chip => (
                  <button key={chip} onClick={() => { setInput(chip); setTimeout(send,0); }}
                    style={{ background:"rgba(59,130,246,.12)", border:"1px solid rgba(59,130,246,.25)", borderRadius:"20px", padding:"3px 10px", color:"#60a5fa", fontSize:"11px", fontWeight:600, cursor:"pointer" }}
                    onMouseEnter={e => e.target.style.background="rgba(59,130,246,.25)"}
                    onMouseLeave={e => e.target.style.background="rgba(59,130,246,.12)"}>
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div style={{ padding:"10px 14px 14px", display:"flex", gap:"8px", flexShrink:0 }}>
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
                  placeholder="Ask about wagons, routes, alerts…"
                  style={{
                    flex:1, background:"#060e1e", border:"1px solid #1a3356", borderRadius:"12px",
                    color:"#f1f5f9", fontSize:"13px", padding:"9px 13px", outline:"none",
                  }}
                  onFocus={e => e.target.style.borderColor="#2563eb"}
                  onBlur={e => e.target.style.borderColor="#1a3356"}
                />
                <button onClick={send} disabled={!input.trim()} style={{
                  width:"38px", height:"38px", borderRadius:"12px", border:"none",
                  background: input.trim() ? "linear-gradient(135deg,#1d4ed8,#3b82f6)" : "#1a3356",
                  cursor: input.trim() ? "pointer" : "default",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  transition:"background .2s",
                }}>
                  <FiSend color="#fff" size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform: scale(0.6); opacity:0.5 }
          40% { transform: scale(1); opacity:1 }
        }
      `}</style>
    </>
  );
};

export default SidebarChatBot;
