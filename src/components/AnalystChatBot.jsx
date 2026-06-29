import { useState, useRef, useEffect } from "react";
import { FiX, FiSend, FiCpu, FiMinus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { askGroq } from "../utils/groqService";

// ── Analytics data (mirrors AnalyticsDashboard & AnalyticsPerformance) ──────
const KPI = {
  totalWagons: 1247, activeWagons: 1089, delayedWagons: 47, maintenance: 28,
  onTimeRate: "95.7%", totalMovements: "28,432", avgSpeed: "76 km/h", avgDelay: "48 min",
  gpsCoverage: "89%", fleetUtil: "87.3%", cargoEfficiency: "80%", maintRate: "97.2%",
  alertRate: "2.1%",
};

const ZONE_PERF = [
  { zone: "North Railway", onTime: "96.1%", pct: 96, color: "#22c55e" },
  { zone: "South Railway", onTime: "95.2%", pct: 95, color: "#22c55e" },
  { zone: "East Railway",  onTime: "94.8%", pct: 95, color: "#f59e0b" },
  { zone: "West Railway",  onTime: "93.4%", pct: 93, color: "#f59e0b" },
];

const ALERT_SUMMARY = [
  { type: "Critical", count: 23, color: "#ef4444" },
  { type: "Warning",  count: 54, color: "#f59e0b" },
  { type: "Resolved", count: 156, color: "#22c55e" },
];

const MONTHLY = [
  { month: "Feb", wagons: 3450, cargo: 8900, alerts: 128 },
  { month: "Mar", wagons: 3700, cargo: 9200, alerts: 156 },
  { month: "Apr", wagons: 3550, cargo: 8700, alerts: 134 },
  { month: "May", wagons: 3900, cargo: 9800, alerts: 119 },
  { month: "Jun", wagons: 4100, cargo: 10200, alerts: 108 },
  { month: "Jul", wagons: 4300, cargo: 10800, alerts: 97  },
];

// ── Card helpers ─────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, color = "#f1f5f9" }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #0f2040" }}>
    <span style={{ color: "#64748b", fontSize: 12 }}>{label}</span>
    <span style={{ color, fontWeight: 700, fontSize: 12 }}>{value}</span>
  </div>
);

const DataCard = ({ children }) => (
  <div style={{ background: "#071628", border: "1px solid #1a3356", borderRadius: 10, padding: "10px 12px", marginBottom: 6 }}>
    {children}
  </div>
);

// ── AI engine ─────────────────────────────────────────────────────────────────
function getAnalystAIResponse(input, zone) {
  const q = input.toLowerCase().trim();

  // KPI / Overview
  if (q.includes("kpi") || q.includes("overview") || q.includes("summar") || q.includes("dashboard") || q === "all") {
    return {
      text: `📊 **Analytics KPI Summary${zone ? ` — Zone ${zone}` : ""}:**`,
      cards: [
        <DataCard key="kpi">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["🚆 Total Wagons",   KPI.totalWagons,    "#3b82f6"],
              ["✅ Active Wagons",  KPI.activeWagons,   "#22c55e"],
              ["⚠️ Delayed",        KPI.delayedWagons,  "#f59e0b"],
              ["🔧 Maintenance",    KPI.maintenance,    "#ef4444"],
              ["📈 On-Time Rate",   KPI.onTimeRate,     "#22c55e"],
              ["🚦 Total Movements",KPI.totalMovements, "#3b82f6"],
              ["⚡ Avg Speed",      KPI.avgSpeed,       "#a855f7"],
              ["⏱ Avg Delay",      KPI.avgDelay,       "#f59e0b"],
            ].map(([label, value, color]) => (
              <div key={label} style={{ background: "#0a1628", borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ color: "#64748b", fontSize: 11 }}>{label}</div>
                <div style={{ color, fontSize: 18, fontWeight: 800 }}>{value}</div>
              </div>
            ))}
          </div>
        </DataCard>,
      ],
      chips: ["Zone performance", "Alert summary", "Monthly trend", "System health"],
    };
  }

  // On-time / performance
  if (q.includes("on-time") || q.includes("on time") || q.includes("performance") || q.includes("punctual")) {
    return {
      text: `📈 **On-Time Performance — All Zones:**\nOverall: **${KPI.onTimeRate}**`,
      cards: ZONE_PERF.map(z => (
        <DataCard key={z.zone}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: "#f1f5f9", fontWeight: 600, fontSize: 13 }}>{z.zone}</span>
            <span style={{ color: z.color, fontWeight: 800, fontSize: 14 }}>{z.onTime}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: "#1a3356" }}>
            <div style={{ height: 6, borderRadius: 3, width: `${z.pct}%`, background: z.color }} />
          </div>
        </DataCard>
      )),
      chips: ["KPI summary", "Alert summary", "Monthly trend"],
    };
  }

  // Zone performance
  if (q.includes("zone") || q.includes("region") || q.includes("north") || q.includes("south") || q.includes("east") || q.includes("west")) {
    const hit = ZONE_PERF.find(z => q.includes(z.zone.split(" ")[0].toLowerCase()));
    const list = hit ? [hit] : ZONE_PERF;
    return {
      text: hit ? `📍 **${hit.zone} Analytics:**` : `📍 **Zone Analytics Overview:**`,
      cards: list.map(z => (
        <DataCard key={z.zone}>
          <InfoRow label="Zone"       value={z.zone}   color="#f1f5f9" />
          <InfoRow label="On-Time %"  value={z.onTime} color={z.color} />
          <div style={{ height: 6, borderRadius: 3, background: "#1a3356", marginTop: 6 }}>
            <div style={{ height: 6, borderRadius: 3, width: `${z.pct}%`, background: z.color }} />
          </div>
        </DataCard>
      )),
      chips: ["On-time performance", "Alert summary", "KPI summary"],
    };
  }

  // Alerts
  if (q.includes("alert") || q.includes("critical") || q.includes("warning") || q.includes("incident")) {
    const total = ALERT_SUMMARY.reduce((s, a) => s + a.count, 0);
    return {
      text: `🚨 **Alert Analytics — ${total} total alerts:**`,
      cards: [
        <DataCard key="alerts">
          {ALERT_SUMMARY.map(a => (
            <div key={a.type} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #0f2040" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: a.color, display: "inline-block" }} />
                <span style={{ color: "#94a3b8", fontSize: 12 }}>{a.type}</span>
              </div>
              <span style={{ color: a.color, fontWeight: 700, fontSize: 14 }}>{a.count}</span>
            </div>
          ))}
          <div style={{ marginTop: 8, color: "#64748b", fontSize: 11 }}>Alert Rate: <strong style={{ color: "#f59e0b" }}>{KPI.alertRate}</strong></div>
        </DataCard>,
      ],
      chips: ["Zone performance", "KPI summary", "Monthly trend"],
    };
  }

  // Monthly trend
  if (q.includes("month") || q.includes("trend") || q.includes("historica") || q.includes("report") || q.includes("growth")) {
    return {
      text: `📅 **Monthly Performance Trend (Feb–Jul):**`,
      cards: [
        <DataCard key="monthly">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, marginBottom: 6 }}>
            {["Month", "Wagons", "Cargo (T)", "Alerts"].map(h => (
              <span key={h} style={{ color: "#4a6fa5", fontSize: 10, fontWeight: 700 }}>{h}</span>
            ))}
          </div>
          {MONTHLY.map(r => (
            <div key={r.month} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 4, padding: "4px 0", borderBottom: "1px solid #0f2040" }}>
              <span style={{ color: "#f1f5f9", fontSize: 11, fontWeight: 600 }}>{r.month}</span>
              <span style={{ color: "#3b82f6", fontSize: 11 }}>{r.wagons.toLocaleString()}</span>
              <span style={{ color: "#22c55e", fontSize: 11 }}>{r.cargo.toLocaleString()}</span>
              <span style={{ color: "#ef4444", fontSize: 11 }}>{r.alerts}</span>
            </div>
          ))}
        </DataCard>,
      ],
      chips: ["KPI summary", "On-time performance", "Alert summary"],
    };
  }

  // System health / GPS
  if (q.includes("health") || q.includes("gps") || q.includes("fleet") || q.includes("efficiency") || q.includes("utilization") || q.includes("utilisation")) {
    return {
      text: `🖥 **System Health Indicators:**`,
      cards: [
        <DataCard key="health">
          {[
            ["GPS Coverage",      KPI.gpsCoverage, "#22c55e", 89],
            ["Fleet Utilisation", KPI.fleetUtil,   "#3b82f6", 87],
            ["Cargo Efficiency",  KPI.cargoEfficiency, "#a855f7", 80],
            ["Maintenance Rate",  KPI.maintRate,   "#f59e0b", 97],
          ].map(([label, val, color, pct]) => (
            <div key={label} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "#94a3b8", fontSize: 12 }}>{label}</span>
                <span style={{ color, fontSize: 12, fontWeight: 700 }}>{val}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#1a3356" }}>
                <div style={{ height: 6, borderRadius: 3, width: `${pct}%`, background: color }} />
              </div>
            </div>
          ))}
        </DataCard>,
      ],
      chips: ["KPI summary", "Zone performance", "Alert summary"],
    };
  }

  // Delay analysis
  if (q.includes("delay") || q.includes("late") || q.includes("behind schedule")) {
    return {
      text: `⚠️ **Delay Analytics:**\n• **${KPI.delayedWagons}** wagons currently delayed\n• Average delay: **${KPI.avgDelay}**\n• On-time rate: **${KPI.onTimeRate}**`,
      cards: [
        <DataCard key="delay">
          <InfoRow label="Delayed Wagons"   value={KPI.delayedWagons} color="#f59e0b" />
          <InfoRow label="Average Delay"    value={KPI.avgDelay}      color="#f59e0b" />
          <InfoRow label="Overall On-Time"  value={KPI.onTimeRate}    color="#22c55e" />
          <InfoRow label="Worst Zone"       value="West Railway 93.4%" color="#f59e0b" />
        </DataCard>,
      ],
      chips: ["Zone performance", "Alert summary", "KPI summary"],
    };
  }

  // Speed / movement
  if (q.includes("speed") || q.includes("movement") || q.includes("km/h") || q.includes("velocity")) {
    return {
      text: `⚡ **Fleet Speed & Movement Analytics:**`,
      cards: [
        <DataCard key="speed">
          <InfoRow label="Average Speed"     value={KPI.avgSpeed}       color="#a855f7" />
          <InfoRow label="Total Movements"   value={KPI.totalMovements} color="#3b82f6" />
          <InfoRow label="Active Wagons"     value={KPI.activeWagons}   color="#22c55e" />
          <InfoRow label="Peak Hour Avg"     value="82 km/h (22:00)"    color="#a855f7" />
          <InfoRow label="Off-Peak Hour Avg" value="68 km/h (06:00)"    color="#64748b" />
        </DataCard>,
      ],
      chips: ["On-time performance", "Monthly trend", "KPI summary"],
    };
  }

  // Help / greeting
  if (q.includes("help") || q.includes("what can") || q === "hi" || q === "hello" || q.length < 4) {
    return {
      text: `👋 Hi! I'm your **Analytics AI Assistant**. I can answer:`,
      cards: [
        <DataCard key="help">
          {[
            ["📊", "KPI Summary",        '"KPI summary" or "dashboard overview"'],
            ["📈", "On-Time Performance", '"On-time rate" or "performance"'],
            ["📍", "Zone Analytics",      '"North Railway" or "zone performance"'],
            ["🚨", "Alert Analytics",     '"Alert summary" or "critical alerts"'],
            ["📅", "Monthly Trends",      '"Monthly trend" or "growth report"'],
            ["🖥", "System Health",       '"GPS coverage" or "fleet utilisation"'],
            ["⚠️", "Delay Analysis",      '"Delay analytics" or "delayed wagons"'],
            ["⚡", "Speed & Movement",    '"Average speed" or "total movements"'],
          ].map(([icon, label, example]) => (
            <div key={label} style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "flex-start" }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              <div>
                <span style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600 }}>{label}</span>
                <span style={{ color: "#4a6fa5", fontSize: 11 }}> — {example}</span>
              </div>
            </div>
          ))}
        </DataCard>,
      ],
      chips: ["KPI summary", "Zone performance", "Alert summary", "Monthly trend"],
    };
  }

  return {
    text: `🤔 Didn't recognise that. Try asking about KPIs, zone performance, alerts, or monthly trends.`,
    cards: [],
    chips: ["KPI summary", "Zone performance", "Alert summary", "Monthly trend"],
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
const AnalystChatBot = () => {
  const { analyst } = useAuth();
  const zone = analyst?.zone || "";

  const [open,     setOpen]     = useState(false);
  const [min,      setMin]      = useState(false);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [messages, setMessages] = useState([{
    role: "ai",
    text: `👋 Hi ${analyst?.name?.split(" ")[0] || "Analyst"}! I'm your **Analytics AI Assistant**. I have access to KPIs, zone performance, alerts, and trend data for Zone ${zone}.`,
    cards: [],
    chips: ["KPI summary", "Zone performance", "Alert summary", "Monthly trend"],
  }]);
  const endRef = useRef(null);

  useEffect(() => {
    if (open && !min) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, min]);

const groqHistory = useRef([]);

  const send = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    setMessages(p => [...p, { role:"user", text:trimmed, cards:[], chips:[] }]);
    setInput("");
    setTyping(true);
    const local = getAnalystAIResponse(trimmed, zone);
    if (!local.text.includes("Didn't recognise") && !local.text.includes("didn't recognise")) {
      await new Promise(r => setTimeout(r, 420));
      groqHistory.current.push({ role:"user", content:trimmed });
      groqHistory.current.push({ role:"assistant", content:local.text.replace(/[*][*](.*?)[*][*]/g,"$1") });
      setMessages(p => [...p, { role:"ai", ...local }]);
      setTyping(false);
    } else {
      groqHistory.current.push({ role:"user", content:trimmed });
      try {
        const reply = await askGroq(groqHistory.current);
        groqHistory.current.push({ role:"assistant", content:reply });
        setMessages(p => [...p, { role:"ai", text:reply, cards:[], chips:["KPI summary","Zone performance","Alert summary"] }]);
      } catch {
        setMessages(p => [...p, { role:"ai", text:"Unable to reach AI service. Please check your connection.", cards:[], chips:["KPI summary","Alert summary"] }]);
      } finally {
        setTyping(false);
      }
    }
  };

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="Analytics AI Assistant"
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 9998,
            width: 52, height: 52, borderRadius: "50%", border: "none",
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            boxShadow: "0 0 0 3px rgba(168,85,247,.25), 0 4px 20px rgba(124,58,237,.5)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            transition: "transform .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >
          <FiCpu color="#fff" size={22} />
          <span style={{ position: "absolute", top: 2, right: 2, width: 14, height: 14, background: "#22c55e", borderRadius: "50%", border: "2px solid #020817" }} />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 380, borderRadius: 20,
          background: "#0d1f3c", border: "1px solid #1e3a5f",
          boxShadow: "0 8px 48px rgba(0,0,0,.7)",
          display: "flex", flexDirection: "column",
          maxHeight: min ? 52 : 560,
          transition: "max-height .3s ease",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "12px 16px",
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
            borderRadius: min ? 20 : "20px 20px 0 0",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <FiCpu color="#fff" size={16} />
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Analytics AI Assistant</span>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }} />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setMin(p => !p)} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 6, padding: "4px 7px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}>
                <FiMinus size={12} />
              </button>
              <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 6, padding: "4px 7px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center" }}>
                <FiX size={12} />
              </button>
            </div>
          </div>

          {!min && (
            <>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 6px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "94%" }}>
                    {m.role === "ai" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                        <FiCpu size={10} color="#a855f7" />
                        <span style={{ color: "#a855f7", fontSize: 10, fontWeight: 700 }}>AI · Analytics</span>
                      </div>
                    )}
                    {m.text && (
                      <div style={{
                        padding: "9px 13px",
                        borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                        background: m.role === "user" ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "#071628",
                        border: m.role === "user" ? "none" : "1px solid #1a3356",
                        color: "#e2e8f0", fontSize: 12.5, lineHeight: 1.6,
                        whiteSpace: "pre-wrap", wordBreak: "break-word",
                        marginBottom: m.cards?.length ? 6 : 0,
                      }}>
                        {m.text.replace(/\*\*(.*?)\*\*/g, "$1")}
                      </div>
                    )}
                    {m.cards?.length > 0 && <div style={{ marginTop: 2 }}>{m.cards}</div>}
                    {m.role === "ai" && m.chips?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                        {m.chips.map(chip => (
                          <button key={chip} onClick={() => send(chip)}
                            style={{ background: "rgba(168,85,247,.12)", border: "1px solid rgba(168,85,247,.25)", borderRadius: 20, padding: "3px 10px", color: "#c084fc", fontSize: 10, fontWeight: 600, cursor: "pointer" }}
                            onMouseEnter={e => e.currentTarget.style.background = "rgba(168,85,247,.28)"}
                            onMouseLeave={e => e.currentTarget.style.background = "rgba(168,85,247,.12)"}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {typing && (
                  <div style={{ alignSelf: "flex-start" }}>
                    <div style={{ padding: "10px 14px", background: "#071628", border: "1px solid #1a3356", borderRadius: "4px 16px 16px 16px", display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`, display: "inline-block" }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "10px 12px 14px", display: "flex", gap: 8, flexShrink: 0 }}>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Ask about KPIs, zones, alerts, trends…"
                  style={{
                    flex: 1, background: "#060e1e", border: "1px solid #1a3356", borderRadius: 12,
                    color: "#f1f5f9", fontSize: 13, padding: "9px 13px", outline: "none",
                  }}
                  onFocus={e => e.target.style.borderColor = "#7c3aed"}
                  onBlur={e  => e.target.style.borderColor = "#1a3356"}
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim()}
                  style={{
                    width: 38, height: 38, borderRadius: 12, border: "none",
                    background: input.trim() ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "#1a3356",
                    cursor: input.trim() ? "pointer" : "default",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
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

export default AnalystChatBot;
