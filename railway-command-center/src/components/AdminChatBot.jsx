import { useState, useRef, useEffect } from "react";
import { FiX, FiSend, FiCpu, FiMinus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import {
  ALL_WAGONS, ZONE_STATS, ZONE_ALERTS, ZONE_HEALTH,
  ZONE_PREDICTIONS, ZONE_LOGS, ZONE_CITIES,
} from "../data/zoneData";

const SEV_COLOR = { Critical:"#ef4444", High:"#f97316", Medium:"#f59e0b", Low:"#22c55e" };

// ── Card renderers ────────────────────────────────────────────────────────────
const WagonCard = ({ w }) => (
  <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
      <span style={{ color:"#60a5fa", fontWeight:700, fontSize:13 }}>{w.id}</span>
      <span className={`badge badge-${w.status==="On Time"?"ontime":w.status==="Delayed"?"delayed":w.status==="Maintenance"?"maint":"high"}`} style={{ fontSize:10 }}>{w.status}</span>
    </div>
    <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
      <span style={{ color:"#64748b", fontSize:11 }}>📍 {w.location} → {w.dest}</span>
      <span style={{ color:"#64748b", fontSize:11 }}>⚡ {w.speed} km/h</span>
      <span style={{ color:"#64748b", fontSize:11 }}>📦 {w.capacity}</span>
    </div>
  </div>
);

const AlertCard = ({ a }) => (
  <div style={{ background:"#071628", border:"1px solid #1a3356", borderLeft:`3px solid ${SEV_COLOR[a.priority]||"#f59e0b"}`, borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
      <span style={{ color:"#60a5fa", fontWeight:700, fontSize:12 }}>{a.wagon}</span>
      <span className={`badge badge-${a.priority==="Critical"?"critical":a.priority==="High"?"high":a.priority==="Medium"?"medium":"low"}`} style={{ fontSize:10 }}>{a.priority}</span>
    </div>
    <div style={{ color:"#cbd5e1", fontSize:12, fontWeight:600 }}>{a.type}</div>
    <div style={{ display:"flex", gap:10, marginTop:3 }}>
      <span style={{ color:"#4a6fa5", fontSize:11 }}>{a.time}</span>
      <span style={{ color: a.status==="Active"?"#ef4444":a.status==="Pending"?"#f59e0b":"#22c55e", fontSize:11 }}>{a.status}</span>
    </div>
  </div>
);

const StatCard = ({ label, value, color }) => (
  <div style={{ background:"#071628", borderRadius:8, padding:"8px 10px" }}>
    <div style={{ color:"#64748b", fontSize:11 }}>{label}</div>
    <div style={{ color, fontSize:20, fontWeight:800 }}>{value}</div>
  </div>
);

// ── AI engine ─────────────────────────────────────────────────────────────────
function getAdminAIResponse(input, zone, wagons, stats, alerts, health, predictions, logs, cities) {
  const q = input.toLowerCase().trim();

  // Wagon by ID
  const wgnMatch = q.match(/wgn[-\s]?([a-z0-9]+)/i);
  if (wgnMatch) {
    const raw = wgnMatch[1].toUpperCase();
    const wagon = wagons.find(w => w.id.includes(raw));
    if (wagon) {
      const wAlerts = alerts.filter(a => a.wagon === wagon.id);
      return {
        text: `Found **${wagon.id}** in Zone ${zone}:`,
        cards: [<WagonCard key="w" w={wagon} />, ...wAlerts.map(a => <AlertCard key={a.wagon+a.type} a={a} />)],
        chips: ["All wagons", "Active alerts", "Zone summary"],
      };
    }
    return { text: `No wagon matching "${raw}" found in Zone ${zone}.`, cards:[], chips:["All wagons","Zone summary"] };
  }

  // All wagons
  if (q.includes("all wagon") || q.includes("show wagon") || q.includes("list wagon") || q === "wagons") {
    return {
      text: `All **${wagons.length} wagons** in Zone ${zone}:`,
      cards: wagons.map(w => <WagonCard key={w.id} w={w} />),
      chips: ["Delayed wagons", "Maintenance wagons", "Active alerts"],
    };
  }

  // Delayed wagons
  if (q.includes("delay") || q.includes("late") || q.includes("behind")) {
    const delayed = wagons.filter(w => w.status === "Delayed");
    return {
      text: `⚠️ **${delayed.length} delayed wagon${delayed.length!==1?"s":""}** in Zone ${zone}:`,
      cards: delayed.map(w => <WagonCard key={w.id} w={w} />),
      chips: ["Active alerts", "AI recommendations", "Zone summary"],
    };
  }

  // Maintenance wagons
  if (q.includes("mainten") || q.includes("repair") || q.includes("service")) {
    const maint = wagons.filter(w => w.status === "Maintenance");
    return {
      text: `🔧 **${maint.length} wagon${maint.length!==1?"s":""} in maintenance** in Zone ${zone}:`,
      cards: maint.map(w => <WagonCard key={w.id} w={w} />),
      chips: ["Active alerts", "Zone summary", "Predictive insights"],
    };
  }

  // Alerts
  if (q.includes("alert") || q.includes("incident") || q.includes("critical") || q.includes("warning") || q.includes("anomaly")) {
    const filtered = q.includes("critical") ? alerts.filter(a => a.priority==="Critical")
                   : q.includes("high")     ? alerts.filter(a => a.priority==="High")
                   : alerts;
    const label = q.includes("critical") ? "Critical" : q.includes("high") ? "High" : "Active";
    return {
      text: `🚨 **${filtered.length} ${label} alert${filtered.length!==1?"s":""}** in Zone ${zone}:`,
      cards: filtered.map(a => <AlertCard key={a.wagon+a.type} a={a} />),
      chips: ["AI recommendations", "Delayed wagons", "Zone summary"],
    };
  }

  // System health
  if (q.includes("health") || q.includes("gps") || q.includes("system") || q.includes("server") || q.includes("online")) {
    return {
      text: `🖥 **System Health** — Zone ${zone}:`,
      cards: [
        <div key="health" style={{ background:"rgba(37,99,235,.06)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:12 }}>
          {health.map(h => (
            <div key={h.label} style={{ marginBottom:10 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ color:"#94a3b8", fontSize:12 }}>{h.label}</span>
                <span style={{ color:h.color, fontSize:12, fontWeight:700 }}>{h.val}</span>
              </div>
              <div style={{ height:6, borderRadius:3, background:"#1a3356" }}>
                <div style={{ height:6, borderRadius:3, width:`${h.pct}%`, background:h.color }} />
              </div>
            </div>
          ))}
        </div>,
      ],
      chips: ["Zone summary", "Active alerts", "Predictive insights"],
    };
  }

  // Predictive insights
  if (q.includes("predict") || q.includes("forecast") || q.includes("insight") || q.includes("ai") || q.includes("recommend") || q.includes("suggest")) {
    return {
      text: `🤖 **AI Predictive Insights** — Zone ${zone}:`,
      cards: [
        <div key="pred" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {predictions.map(p => (
            <div key={p.label} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:12 }}>
              <div style={{ color:"#94a3b8", fontSize:11, marginBottom:4 }}>{p.label}</div>
              <div style={{ color:p.color, fontSize:22, fontWeight:800, marginBottom:4 }}>{p.value}%</div>
              <div style={{ height:5, borderRadius:3, background:"#1a3356", marginBottom:4 }}>
                <div style={{ height:5, borderRadius:3, width:`${p.value}%`, background:p.color }} />
              </div>
              <div style={{ color:"#4a6fa5", fontSize:11 }}>{p.detail}</div>
            </div>
          ))}
        </div>,
      ],
      chips: ["Active alerts", "Zone summary", "System health"],
    };
  }

  // System logs
  if (q.includes("log") || q.includes("recent") || q.includes("event") || q.includes("activit")) {
    return {
      text: `📋 **Recent System Logs** — Zone ${zone}:`,
      cards: [
        <div key="logs" style={{ display:"flex", flexDirection:"column", gap:4 }}>
          {logs.map((l, i) => (
            <div key={i} style={{ display:"flex", gap:10, padding:"7px 10px", background:"#071628", borderRadius:8, borderLeft:`3px solid ${l.color}` }}>
              <span style={{ color:"#4a6fa5", fontSize:11, flexShrink:0 }}>{l.time}</span>
              <span style={{ color:"#94a3b8", fontSize:12 }}>{l.msg}</span>
            </div>
          ))}
        </div>,
      ],
      chips: ["Active alerts", "Zone summary", "System health"],
    };
  }

  // Cities / hubs
  if (q.includes("city") || q.includes("hub") || q.includes("station") || q.includes("location")) {
    return {
      text: `📍 **Zone ${zone} Hub Overview:**`,
      cards: cities.map(c => (
        <div key={c.name} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
          <div style={{ color:"#60a5fa", fontWeight:700, fontSize:13, marginBottom:6 }}>📍 {c.name}</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
            <span style={{ color:"#64748b", fontSize:11 }}>Active Routes: <strong style={{ color:"#22c55e" }}>{c.active}</strong></span>
            <span style={{ color:"#64748b", fontSize:11 }}>Moving: <strong style={{ color:"#3b82f6" }}>{c.moving}</strong></span>
            <span style={{ color:"#64748b", fontSize:11 }}>Delayed: <strong style={{ color:"#f59e0b" }}>{c.delayed}</strong></span>
            <span style={{ color:"#64748b", fontSize:11 }}>GPS Offline: <strong style={{ color:"#ef4444" }}>{c.offline}</strong></span>
          </div>
        </div>
      )),
      chips: ["All wagons", "Active alerts", "Zone summary"],
    };
  }

  // Zone summary / dashboard
  if (q.includes("summar") || q.includes("overview") || q.includes("dashboard") || q.includes("status") || q === "all") {
    return {
      text: `📊 **Zone ${zone} Dashboard Summary:**`,
      cards: [
        <div key="summary" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            ["🚆 Total Wagons",   stats.total,    "#3b82f6"],
            ["✅ Active",         stats.active,   "#22c55e"],
            ["⚠️ Delayed",        stats.delayed,  "#f59e0b"],
            ["🔧 Maintenance",    stats.maint,    "#ef4444"],
            ["🏛 Stations",       stats.stations, "#8b5cf6"],
            ["📡 GPS Active",     stats.gps,      "#06b6d4"],
            ["🚨 AI Alerts",      stats.alerts,   "#f97316"],
            ["📦 Cargo Loads",    stats.cargo,    "#10b981"],
          ].map(([label, value, color]) => (
            <StatCard key={label} label={label} value={value} color={color} />
          ))}
        </div>,
      ],
      chips: ["Active alerts", "Delayed wagons", "AI recommendations", "System health"],
    };
  }

  // Help / greeting
  if (q.includes("help") || q.includes("what can") || q === "hi" || q === "hello" || q.length < 4) {
    return {
      text: `👋 Hi! I'm your **Zone ${zone} Admin AI Assistant**. I can answer:`,
      cards: [
        <div key="help" style={{ background:"rgba(37,99,235,.06)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:12 }}>
          {[
            ["🚆","Wagons",         '"All wagons" or "WGN-N01"'],
            ["⚠️","Delayed wagons", '"Delayed wagons"'],
            ["🔧","Maintenance",    '"Maintenance wagons"'],
            ["🚨","Alerts",         '"Active alerts" or "Critical alerts"'],
            ["📡","System health",  '"System health" or "GPS status"'],
            ["🤖","AI insights",    '"Predictive insights" or "AI recommendations"'],
            ["📋","System logs",    '"Recent logs" or "Recent activity"'],
            ["📍","Zone hubs",      '"Zone hubs" or "Station overview"'],
            ["📊","Summary",        '"Zone summary" or "Dashboard status"'],
          ].map(([icon, label, example]) => (
            <div key={label} style={{ display:"flex", gap:8, marginBottom:6, alignItems:"flex-start" }}>
              <span style={{ fontSize:13 }}>{icon}</span>
              <div>
                <span style={{ color:"#f1f5f9", fontSize:12, fontWeight:600 }}>{label}</span>
                <span style={{ color:"#4a6fa5", fontSize:11 }}> — {example}</span>
              </div>
            </div>
          ))}
        </div>,
      ],
      chips: ["Zone summary", "Active alerts", "AI recommendations", "System health"],
    };
  }

  return {
    text: `🤔 Didn't recognise that. Try asking about wagons, alerts, maintenance, or the zone summary.`,
    cards: [],
    chips: ["Zone summary", "Active alerts", "All wagons", "AI recommendations"],
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
const AdminChatBot = () => {
  const { admin } = useAuth();
  const zone = admin?.zone || "NR";

  const wagons      = ALL_WAGONS.filter(w => w.zone === zone);
  const stats       = ZONE_STATS[zone]       || {};
  const alerts      = ZONE_ALERTS[zone]      || [];
  const health      = ZONE_HEALTH[zone]      || [];
  const predictions = ZONE_PREDICTIONS[zone] || [];
  const logs        = ZONE_LOGS[zone]        || [];
  const cities      = ZONE_CITIES[zone]      || [];

  const [open,     setOpen]     = useState(false);
  const [min,      setMin]      = useState(false);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [messages, setMessages] = useState([{
    role:"ai",
    text:`👋 Hi ${admin?.name?.split(" ")[0] || "Admin"}! I'm your **Zone ${zone} AI Assistant**. I have live access to your zone's wagons, alerts, health, and predictive data.`,
    cards:[],
    chips:["Zone summary","Active alerts","Delayed wagons","AI recommendations"],
  }]);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && !min) endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, open, min]);

  const send = (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    setMessages(p => [...p, { role:"user", text:trimmed, cards:[], chips:[] }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const resp = getAdminAIResponse(trimmed, zone, wagons, stats, alerts, health, predictions, logs, cities);
      setMessages(p => [...p, { role:"ai", ...resp }]);
      setTyping(false);
    }, 450);
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Admin AI Assistant"
          style={{
            position:"fixed", bottom:24, right:24, zIndex:9998,
            width:52, height:52, borderRadius:"50%", border:"none",
            background:"linear-gradient(135deg,#1d4ed8,#3b82f6)",
            boxShadow:"0 0 0 3px rgba(59,130,246,.25), 0 4px 20px rgba(37,99,235,.5)",
            cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
            transition:"transform .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform="scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
        >
          <FiCpu color="#fff" size={22} />
          <span style={{ position:"absolute", top:2, right:2, width:14, height:14, background:"#22c55e", borderRadius:"50%", border:"2px solid #020817" }} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position:"fixed", bottom:24, right:24, zIndex:9999,
          width:380, borderRadius:20,
          background:"#0d1f3c", border:"1px solid #1e3a5f",
          boxShadow:"0 8px 48px rgba(0,0,0,.7)",
          display:"flex", flexDirection:"column",
          maxHeight: min ? 52 : 560,
          transition:"max-height .3s ease",
          overflow:"hidden",
        }}>
          {/* Header */}
          <div style={{
            padding:"12px 16px",
            background:"linear-gradient(135deg,#1d4ed8,#2563eb)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexShrink:0,
            borderRadius: min ? 20 : "20px 20px 0 0",
          }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <FiCpu color="#fff" size={16} />
              <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>Zone {zone} AI Assistant</span>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#22c55e", boxShadow:"0 0 6px #22c55e" }} />
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={() => setMin(p => !p)} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:6, padding:"4px 7px", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center" }}>
                <FiMinus size={12} />
              </button>
              <button onClick={() => setOpen(false)} style={{ background:"rgba(255,255,255,.15)", border:"none", borderRadius:6, padding:"4px 7px", cursor:"pointer", color:"#fff", display:"flex", alignItems:"center" }}>
                <FiX size={12} />
              </button>
            </div>
          </div>

          {!min && (
            <>
              {/* Messages */}
              <div style={{ flex:1, overflowY:"auto", padding:"12px 12px 6px", display:"flex", flexDirection:"column", gap:10 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.role==="user" ? "flex-end" : "flex-start", maxWidth:"94%" }}>
                    {m.role === "ai" && (
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                        <FiCpu size={10} color="#3b82f6" />
                        <span style={{ color:"#3b82f6", fontSize:10, fontWeight:700 }}>AI · Zone {zone}</span>
                      </div>
                    )}
                    {m.text && (
                      <div style={{
                        padding:"9px 13px",
                        borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                        background: m.role==="user" ? "linear-gradient(135deg,#1d4ed8,#2563eb)" : "#071628",
                        border: m.role==="user" ? "none" : "1px solid #1a3356",
                        color:"#e2e8f0", fontSize:12.5, lineHeight:1.6,
                        whiteSpace:"pre-wrap", wordBreak:"break-word",
                        marginBottom: m.cards?.length ? 6 : 0,
                      }}>
                        {m.text.replace(/\*\*(.*?)\*\*/g, "$1")}
                      </div>
                    )}
                    {m.cards?.length > 0 && <div style={{ marginTop:2 }}>{m.cards}</div>}
                    {m.role==="ai" && m.chips?.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:6 }}>
                        {m.chips.map(chip => (
                          <button key={chip} onClick={() => send(chip)}
                            style={{ background:"rgba(59,130,246,.12)", border:"1px solid rgba(59,130,246,.25)", borderRadius:20, padding:"3px 10px", color:"#60a5fa", fontSize:10, fontWeight:600, cursor:"pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background="rgba(59,130,246,.28)"}
                            onMouseLeave={e => e.currentTarget.style.background="rgba(59,130,246,.12)"}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {typing && (
                  <div style={{ alignSelf:"flex-start" }}>
                    <div style={{ padding:"10px 14px", background:"#071628", border:"1px solid #1a3356", borderRadius:"4px 16px 16px 16px", display:"flex", gap:4, alignItems:"center" }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:"#3b82f6", animation:`bounce 1.2s ${i*0.2}s infinite ease-in-out`, display:"inline-block" }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div style={{ padding:"10px 12px 14px", display:"flex", gap:8, flexShrink:0 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about wagons, alerts, zone status…"
                  style={{
                    flex:1, background:"#060e1e", border:"1px solid #1a3356", borderRadius:12,
                    color:"#f1f5f9", fontSize:13, padding:"9px 13px", outline:"none",
                  }}
                  onFocus={e => e.target.style.borderColor="#2563eb"}
                  onBlur={e  => e.target.style.borderColor="#1a3356"}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim()}
                  style={{
                    width:38, height:38, borderRadius:12, border:"none",
                    background: input.trim() ? "linear-gradient(135deg,#1d4ed8,#3b82f6)" : "#1a3356",
                    cursor: input.trim() ? "pointer" : "default",
                    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
                  }}
                >
                  <FiSend color="#fff" size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%,80%,100% { transform:scale(0.6); opacity:0.5 }
          40%          { transform:scale(1);   opacity:1   }
        }
      `}</style>
    </>
  );
};

export default AdminChatBot;
