import { useState, useRef, useEffect, useCallback } from "react";
import { FiX, FiSend, FiCpu, FiMinus } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useSearch } from "../context/SearchContext";
import { useOperatorData } from "../context/OperatorDataContext";
import { askGroq } from "../utils/groqService";

const ROUTES = [
  { name:"New Delhi → Mumbai",    wagons:["WGN-1042"], dist:"1,384 km", status:"Active",  delay:"-"      },
  { name:"Kolkata → Chennai",     wagons:["WGN-2187"], dist:"1,659 km", status:"Delayed", delay:"28 min" },
  { name:"Mumbai → Hyderabad",    wagons:["WGN-3301"], dist:"711 km",   status:"Active",  delay:"-"      },
  { name:"Chennai → Delhi",       wagons:["WGN-4056"], dist:"2,175 km", status:"Halted",  delay:"--"     },
  { name:"Hyderabad → Kolkata",   wagons:["WGN-5774"], dist:"1,195 km", status:"Active",  delay:"-"      },
  { name:"Delhi → Bengaluru",     wagons:["WGN-6613"], dist:"2,058 km", status:"Delayed", delay:"47 min" },
  { name:"Mumbai → Kolkata",      wagons:["WGN-7890"], dist:"1,968 km", status:"Active",  delay:"-"      },
  { name:"Bengaluru → Delhi",     wagons:["WGN-8421"], dist:"2,058 km", status:"Active",  delay:"-"      },
];

// ─── Severity helpers ────────────────────────────────────────────────────────
const SEV_COLOR  = { Critical:"#ef4444", High:"#f97316", Medium:"#f59e0b", Low:"#22c55e" };
const SEV_BADGE  = { Critical:"badge-critical", High:"badge-high", Medium:"badge-medium", Low:"badge-low" };

// ─── Rich card renderers ─────────────────────────────────────────────────────

const WagonCard = ({ w }) => (
  <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
      <span style={{ color:"#60a5fa", fontWeight:700, fontSize:13 }}>{w.id}</span>
      <span className={`badge badge-${w.status==="On Time"?"ontime":w.status==="Delayed"?"delayed":w.status==="Maintenance"?"maint":"high"}`} style={{ fontSize:10 }}>{w.status}</span>
    </div>
    <div style={{ color:"#94a3b8", fontSize:11, marginBottom:2 }}>📍 {w.location} → {w.route.split("→")[1]?.trim()}</div>
    <div style={{ display:"flex", gap:12, marginTop:4, flexWrap:"wrap" }}>
      <span style={{ color:"#64748b", fontSize:11 }}>⚡ {w.speed} km/h</span>
      <span style={{ color:"#64748b", fontSize:11 }}>📦 Load: {typeof w.load === "number" ? `${w.load}%` : w.load}</span>
      <span style={{ color:"#64748b", fontSize:11 }}>⏱ ETA: {w.eta}</span>
      <span style={{ color: w.gps==="Active"?"#22c55e":"#ef4444", fontSize:11 }}>
        {w.gps==="Active" ? "📡 GPS Active" : "⚠️ GPS Offline"}
      </span>
    </div>
  </div>
);

const AlertCard = ({ a }) => (
  <div style={{ background:"#071628", border:`1px solid #1a3356`, borderLeft:`3px solid ${SEV_COLOR[a.severity]}`, borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
      <span style={{ color:"#60a5fa", fontWeight:700, fontSize:12 }}>{a.wagon}</span>
      <span className={`badge ${SEV_BADGE[a.severity]}`} style={{ fontSize:10 }}>{a.severity}</span>
    </div>
    <div style={{ color:"#cbd5e1", fontSize:12, fontWeight:600, marginBottom:2 }}>{a.type}</div>
    <div style={{ color:"#64748b", fontSize:11 }}>{a.detail}</div>
    <div style={{ color:"#4a6fa5", fontSize:10, marginTop:4 }}>{a.id} · {a.time}</div>
  </div>
);

const MaintCard = ({ m }) => {
  const dateStr = m.scheduledDate || m.assigned || "—";
  return (
    <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
        <span style={{ color:"#60a5fa", fontWeight:700, fontSize:12 }}>{m.wagon}</span>
        <span className={`badge badge-${m.status==="Completed"?"completed":m.status==="In Progress"?"info":"pending"}`} style={{ fontSize:10 }}>{m.status}</span>
      </div>
      <div style={{ color:"#cbd5e1", fontSize:12, fontWeight:600 }}>{m.type}</div>
      <div style={{ color:"#64748b", fontSize:11, marginTop:2 }}>👷 {m.tech} · {dateStr}</div>
      <div style={{ color:"#4a6fa5", fontSize:11, marginTop:2, fontStyle:"italic" }}>{m.notes}</div>
    </div>
  );
};

const CargoCard = ({ c }) => {
  const loadPct = Math.round(c.weight / c.capacity * 100) || 0;
  const lc = loadPct >= 95 ? "#ef4444" : loadPct >= 80 ? "#f59e0b" : "#22c55e";
  const tc = c.temp > c.tempLimit ? "#ef4444" : "#22c55e";
  return (
    <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
        <span style={{ color:"#60a5fa", fontWeight:700, fontSize:12 }}>{c.wagon}</span>
        <span className={`badge badge-${c.status==="Normal"?"active":c.status==="Critical"?"critical":c.status==="Warning"?"medium":"inactive"}`} style={{ fontSize:10 }}>{c.status}</span>
      </div>
      <div style={{ color:"#cbd5e1", fontSize:12, fontWeight:600 }}>{c.type}</div>
      <div style={{ color:"#64748b", fontSize:11, marginTop:2 }}>{c.origin} → {c.destination}</div>
      <div style={{ display:"flex", gap:12, marginTop:4 }}>
        <span style={{ color:lc, fontSize:11 }}>⚖️ {c.weight}T / {c.capacity}T ({loadPct}%)</span>
        <span style={{ color:tc, fontSize:11 }}>🌡 {c.temp}°C / {c.tempLimit}°C</span>
      </div>
      <div style={{ color: c.seal==="SEALED"?"#22c55e":"#ef4444", fontSize:11, marginTop:2 }}>
        {c.seal==="SEALED" ? "✓ Sealed" : `⚠️ Seal: ${c.seal}`}
      </div>
    </div>
  );
};

const RouteCard = ({ r }) => (
  <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:3 }}>
      <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:12 }}>🛤 {r.name}</span>
      <span style={{ color: r.status==="Active"?"#22c55e":r.status==="Delayed"?"#f59e0b":"#ef4444", fontSize:11, fontWeight:600 }}>{r.status}</span>
    </div>
    <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
      <span style={{ color:"#64748b", fontSize:11 }}>📏 {r.dist}</span>
      <span style={{ color:"#64748b", fontSize:11 }}>🚆 {r.wagons.join(", ")}</span>
      {r.delay !== "-" && r.delay !== "--" && <span style={{ color:"#f59e0b", fontSize:11 }}>⏱ Delay: {r.delay}</span>}
    </div>
  </div>
);

// ─── AI engine: returns { text, cards, chips } ───────────────────────────────
function getAIResponse(input, WAGONS, CARGO, ALERTS, MAINTENANCE) {
  const q = input.toLowerCase().trim();

  // ── Wagon lookup by ID ──
  const wgnMatch = q.match(/wgn[-\s]?(\d+)/i);
  if (wgnMatch) {
    const raw = wgnMatch[1];
    // try exact padded match, then suffix match
    const id = `WGN-${raw.padStart(4, "0")}`;
    const idAlt = `WGN-${raw}`;
    const wagon = WAGONS.find(w => w.id === id || w.id === idAlt || w.id.endsWith(raw));
    if (wagon) {
      const cargo  = CARGO.find(c => c.wagon === wagon.id);
      const maint  = MAINTENANCE.filter(m => m.wagon === wagon.id);
      const alerts = ALERTS.filter(a => a.wagon === wagon.id);
      return {
        text: `Found **${wagon.id}** — here's the full profile:`,
        cards: [
          <WagonCard key="w" w={wagon} />,
          ...(cargo  ? [<CargoCard   key="c" c={cargo} />]    : []),
          ...(maint.length  ? maint.map(m  => <MaintCard  key={m.id}  m={m}  />) : []),
          ...(alerts.length ? alerts.map(a => <AlertCard  key={a.id}  a={a}  />) : []),
        ],
        chips: ["Delayed wagons", "Active alerts", "All cargo"],
      };
    }
    return { text:`❌ No wagon found matching **"${raw}"**. Try: WGN-1042, WGN-2187, WGN-3301, WGN-4056, WGN-5774, WGN-6613, WGN-7890, WGN-8421`, cards:[], chips:["Show all wagons","Delayed wagons"] };
  }

  // ── All wagons ──
  if ((q.includes("all wagon") || q.includes("show wagon") || q.includes("list wagon") || q === "wagons")) {
    return {
      text:`All **${WAGONS.length} assigned wagons:**`,
      cards: WAGONS.map(w => <WagonCard key={w.id} w={w} />),
      chips: ["Delayed wagons", "Active alerts", "Maintenance due"],
    };
  }

  // ── Delayed wagons ──
  if (q.includes("delay") || q.includes("late") || q.includes("behind")) {
    const delayed = WAGONS.filter(w => w.status === "Delayed");
    const routes  = ROUTES.filter(r => r.status === "Delayed");
    return {
      text: `⚠️ **${delayed.length} delayed wagon${delayed.length!==1?"s":""}** and **${routes.length} delayed route${routes.length!==1?"s":""}** currently:`,
      cards: [
        ...delayed.map(w => <WagonCard key={w.id} w={w} />),
        ...routes.map(r => <RouteCard key={r.name} r={r} />),
      ],
      chips: ["Active alerts", "Delay analysis", "All routes"],
    };
  }

  // ── Delay analysis ──
  if (q.includes("delay analysis") || q.includes("analyse delay") || q.includes("analyze delay") || q.includes("delay reason") || q.includes("why delay")) {
    const delayed = WAGONS.filter(w => w.status === "Delayed");
    const relAlerts = ALERTS.filter(a => delayed.some(d => d.id === a.wagon));
    return {
      text: `📊 **Delay Analysis** — ${delayed.length} wagons affected:\n\n• WGN-2187: Speed anomaly detected (142 km/h) — forced speed reduction\n• WGN-6613: GPS signal lost at Bhopal Jn., route recalculation underway\n\nRelated alerts triggering delays:`,
      cards: relAlerts.map(a => <AlertCard key={a.id} a={a} />),
      chips: ["Delayed wagons", "Active alerts", "AI recommendations"],
    };
  }

  // ── Maintenance ──
  if (q.includes("mainten") || q.includes("repair") || q.includes("service") || q.includes("overhaul") || q.includes("technician")) {
    const today = q.includes("today") || q.includes("due") || q.includes("pending");
    const items = today
      ? MAINTENANCE.filter(m => m.status !== "Completed")
      : MAINTENANCE;
    const label = today ? "pending/in-progress maintenance tasks" : "all maintenance tasks";
    return {
      text: `🔧 **${items.length} ${label}:**`,
      cards: items.map(m => <MaintCard key={m.id} m={m} />),
      chips: ["Critical maintenance", "Completed tasks", "Maintenance wagons"],
    };
  }

  // ── Critical maintenance ──
  if (q.includes("critical mainten") || q.includes("urgent mainten") || (q.includes("critical") && q.includes("mainten"))) {
    const items = MAINTENANCE.filter(m => m.priority === "Critical");
    return {
      text:`🚨 **${items.length} critical maintenance tasks:**`,
      cards: items.map(m => <MaintCard key={m.id} m={m} />),
      chips: ["Active alerts", "Delayed wagons", "AI recommendations"],
    };
  }

  // ── Alerts ──
  if (q.includes("alert") || q.includes("incident") || q.includes("critical") || q.includes("warning") || q.includes("anomaly")) {
    const filter = q.includes("critical") ? ALERTS.filter(a => a.severity==="Critical")
                 : q.includes("high")     ? ALERTS.filter(a => a.severity==="High")
                 : q.includes("medium")   ? ALERTS.filter(a => a.severity==="Medium")
                 : ALERTS;
    const label = q.includes("critical") ? "Critical" : q.includes("high") ? "High" : q.includes("medium") ? "Medium" : "Active";
    return {
      text: `🚨 **${filter.length} ${label} alert${filter.length!==1?"s":""}:**`,
      cards: filter.map(a => <AlertCard key={a.id} a={a} />),
      chips: ["Delay analysis", "Critical maintenance", "AI recommendations"],
    };
  }

  // ── Alert explanation for a specific alert ID ──
  const altMatch = q.match(/alt[-\s]?(\d+)/i);
  if (altMatch) {
    const altId = `ALT-${altMatch[1].padStart(3,"0")}`;
    const alert = ALERTS.find(a => a.id === altId);
    if (alert) {
      const wagon = WAGONS.find(w => w.id === alert.wagon);
      return {
        text: `Explanation for **${alert.id}**:`,
        cards: [
          <AlertCard key="a" a={alert} />,
          ...(wagon ? [<WagonCard key="w" w={wagon} />] : []),
        ],
        chips: ["Active alerts", "AI recommendations"],
      };
    }
  }

  // ── Cargo lookup for a specific wagon ──
  if ((q.includes("cargo") || q.includes("freight") || q.includes("load") || q.includes("weight") || q.includes("temperature") || q.includes("seal")) && wgnMatch) {
    const cargo = CARGO.find(c => c.wagon.endsWith(wgnMatch[1]));
    if (cargo) return { text:`📦 Cargo details for **${cargo.wagon}**:`, cards:[<CargoCard key="c" c={cargo}/>], chips:["All cargo","Critical cargo"] };
  }

  // ── All cargo ──
  if (q.includes("cargo") || q.includes("freight") || q.includes("shipment") || q.includes("load")) {
    const filter = q.includes("critical") ? CARGO.filter(c => c.status==="Critical")
                 : q.includes("warning")  ? CARGO.filter(c => c.status==="Warning")
                 : q.includes("normal")   ? CARGO.filter(c => c.status==="Normal")
                 : CARGO;
    const totalWeight = filter.reduce((s,c) => s+c.weight, 0).toFixed(1);
    return {
      text: `📦 **${filter.length} cargo entries** | Total weight: **${totalWeight}T**:`,
      cards: filter.map(c => <CargoCard key={c.wagon} c={c} />),
      chips: ["Critical cargo", "Temperature alerts", "Broken seals"],
    };
  }

  // ── Critical cargo ──
  if (q.includes("critical cargo") || q.includes("cargo critical")) {
    const items = CARGO.filter(c => c.status === "Critical");
    return { text:`🚨 **${items.length} critical cargo entries:**`, cards:items.map(c=><CargoCard key={c.wagon} c={c}/>), chips:["Active alerts","AI recommendations"] };
  }

  // ── Temperature alerts ──
  if (q.includes("temperatur") || q.includes("temp") || q.includes("heat") || q.includes("thermal")) {
    const overTemp = CARGO.filter(c => c.temp > c.tempLimit);
    return {
      text: overTemp.length
        ? `🌡 **${overTemp.length} cargo unit${overTemp.length!==1?"s":""} exceeding temperature limits:**`
        : "✅ All cargo units are within temperature limits.",
      cards: overTemp.map(c => <CargoCard key={c.wagon} c={c} />),
      chips: ["Critical cargo", "All cargo", "Active alerts"],
    };
  }

  // ── Broken / damaged seals ──
  if (q.includes("seal") || q.includes("broken") || q.includes("damaged") || q.includes("open cargo")) {
    const broken = CARGO.filter(c => c.seal !== "SEALED");
    return {
      text: `⚠️ **${broken.length} cargo unit${broken.length!==1?"s":""} with compromised seals:**`,
      cards: broken.map(c => <CargoCard key={c.wagon} c={c} />),
      chips: ["Critical cargo", "Active alerts"],
    };
  }

  // ── Routes ──
  if (q.includes("route") || q.includes("path") || q.includes("journey") || q.includes("corridor")) {
    const delayed = ROUTES.filter(r => r.status === "Delayed");
    return {
      text: `🛤 **${ROUTES.length} routes** | ${delayed.length} delayed:`,
      cards: ROUTES.map(r => <RouteCard key={r.name} r={r} />),
      chips: ["Delayed routes", "Delayed wagons", "All wagons"],
    };
  }

  // ── Station search ──
  const STATIONS = ["delhi","mumbai","kolkata","chennai","hyderabad","bengaluru","pune","nagpur","vizag","bhopal","raipur","kota","wardha","secunderabad","raipur"];
  const stationHit = STATIONS.find(s => q.includes(s));
  if ((q.includes("station") || stationHit)) {
    const city = stationHit || null;
    if (city) {
      const wagonsAt  = WAGONS.filter(w => w.location.toLowerCase().includes(city));
      const routesAt  = ROUTES.filter(r => r.name.toLowerCase().includes(city));
      const alertsAt  = ALERTS.filter(a => wagonsAt.some(w => w.id === a.wagon));
      const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
      return {
        text: `🏛 **${cityLabel}** — ${wagonsAt.length} wagon${wagonsAt.length!==1?"s":""} currently at this station:`,
        cards: [
          ...wagonsAt.map(w => <WagonCard key={w.id} w={w} />),
          ...routesAt.map(r => <RouteCard key={r.name} r={r} />),
          ...alertsAt.map(a => <AlertCard key={a.id} a={a} />),
        ],
        chips: ["All routes", "Delayed wagons"],
      };
    }
    const stationSummary = [
      {city:"New Delhi", wagons:1, routes:2}, {city:"Mumbai",    wagons:0, routes:2},
      {city:"Kolkata",   wagons:0, routes:1}, {city:"Chennai",   wagons:0, routes:1},
      {city:"Hyderabad", wagons:0, routes:1}, {city:"Bengaluru", wagons:0, routes:1},
      {city:"Pune Jn.",  wagons:1, routes:1}, {city:"Nagpur Yard",wagons:1,routes:1},
    ];
    return {
      text: `🏛 **Station Overview** — ${stationSummary.length} major stations in network:`,
      cards: stationSummary.map(s => (
        <div key={s.city} style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 12px", marginBottom:6 }}>
          <div style={{ color:"#60a5fa", fontWeight:700, fontSize:12 }}>📍 {s.city}</div>
          <div style={{ display:"flex", gap:12, marginTop:3 }}>
            <span style={{ color:"#64748b", fontSize:11 }}>🚆 {s.wagons} wagon(s) present</span>
            <span style={{ color:"#64748b", fontSize:11 }}>🛤 {s.routes} route(s)</span>
          </div>
        </div>
      )),
      chips: ["All routes", "All wagons"],
    };
  }

  // ── GPS / Tracking ──
  if (q.includes("gps") || q.includes("signal") || q.includes("track") || q.includes("offline")) {
    const offline = WAGONS.filter(w => w.gps === "Offline");
    const active  = WAGONS.filter(w => w.gps === "Active");
    return {
      text: `📡 **GPS Status** — ${active.length} active, ${offline.length} offline:`,
      cards: [
        ...offline.map(w => <WagonCard key={w.id} w={w} />),
        ...ALERTS.filter(a => a.type.includes("GPS")).map(a => <AlertCard key={a.id} a={a} />),
      ],
      chips: ["Active alerts", "Delayed wagons"],
    };
  }

  // ── AI Recommendations ──
  if (q.includes("recommend") || q.includes("suggest") || q.includes("advice") || q.includes("what should") || q.includes("action") || q.includes("next step") || q.includes("priority")) {
    const critical = ALERTS.filter(a => a.severity === "Critical");
    const critMaint = MAINTENANCE.filter(m => m.priority === "Critical" && m.status !== "Completed");
    const overTemp  = CARGO.filter(c => c.temp > c.tempLimit);
    const broken    = CARGO.filter(c => c.seal !== "SEALED");
    return {
      text: `🤖 **AI Recommendations** — ${critical.length + critMaint.length + overTemp.length + broken.length} priority actions:`,
      cards: [
        <div key="rec" style={{ background:"rgba(37,99,235,.06)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"12px", marginBottom:6 }}>
          <div style={{ color:"#60a5fa", fontWeight:700, fontSize:13, marginBottom:8 }}>Priority Actions</div>
          {critical.map(a => (
            <div key={a.id} style={{ color:"#ef4444", fontSize:12, marginBottom:4 }}>🚨 [{a.id}] {a.wagon}: {a.type} — Immediate action required</div>
          ))}
          {critMaint.map(m => (
            <div key={m.id} style={{ color:"#f97316", fontSize:12, marginBottom:4 }}>🔧 [{m.id}] {m.wagon}: {m.type} — Assign technician immediately</div>
          ))}
          {overTemp.map(c => (
            <div key={c.wagon} style={{ color:"#f59e0b", fontSize:12, marginBottom:4 }}>🌡 {c.wagon}: Cargo temp {c.temp}°C exceeds limit {c.tempLimit}°C</div>
          ))}
          {broken.map(c => (
            <div key={c.wagon} style={{ color:"#f59e0b", fontSize:12, marginBottom:4 }}>⚠️ {c.wagon}: Cargo seal {c.seal} — inspect immediately</div>
          ))}
        </div>,
      ],
      chips: ["Active alerts", "Critical maintenance", "Critical cargo"],
    };
  }

  // ── System summary / dashboard ──
  if (q.includes("summar") || q.includes("overview") || q.includes("dashboard") || q.includes("status") || q.includes("system") || q === "all") {
    const delayed  = WAGONS.filter(w => w.status === "Delayed").length;
    const maint    = WAGONS.filter(w => w.status === "Maintenance").length;
    const critical = ALERTS.filter(a => a.severity === "Critical").length;
    const pending  = MAINTENANCE.filter(m => m.status === "Pending").length;
    const critCargo= CARGO.filter(c => c.status === "Critical").length;
    return {
      text: "📊 **Operator Dashboard Summary:**",
      cards: [
        <div key="summary" style={{ background:"rgba(37,99,235,.06)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"12px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              ["🚆 Total Wagons",      WAGONS.length,  "#3b82f6"],
              ["✅ On Time",           WAGONS.filter(w=>w.status==="On Time").length, "#22c55e"],
              ["⚠️ Delayed",          delayed,         "#f59e0b"],
              ["🔧 In Maintenance",   maint,           "#ef4444"],
              ["🚨 Critical Alerts",  critical,        "#ef4444"],
              ["🔩 Pending Tasks",    pending,         "#f59e0b"],
              ["📦 Critical Cargo",   critCargo,       "#f97316"],
              ["📡 GPS Offline",      WAGONS.filter(w=>w.gps==="Offline").length, "#ef4444"],
            ].map(([label, value, color]) => (
              <div key={label} style={{ background:"#071628", borderRadius:8, padding:"8px 10px" }}>
                <div style={{ color:"#64748b", fontSize:11 }}>{label}</div>
                <div style={{ color, fontSize:20, fontWeight:800 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>,
      ],
      chips: ["Active alerts", "Delayed wagons", "AI recommendations"],
    };
  }

  // ── Help / greeting ──
  if (q.includes("help") || q.includes("what can") || q.includes("how") || q === "hi" || q === "hello" || q.length < 4) {
    return {
      text: "👋 Hi! I'm your **Operator AI Assistant**. I can answer:",
      cards: [
        <div key="help" style={{ background:"rgba(37,99,235,.06)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"12px" }}>
          {[
            ["🔍","Global Search","\"search WGN-1042\" or \"find delayed\""],
            ["🚆","Wagon lookup","\"Show WGN-1042\" or \"all wagons\""],
            ["⚠️","Delay info","\"Which wagons are delayed?\""],
            ["🚨","Alerts","\"Show active alerts\" or \"critical alerts\""],
            ["🔧","Maintenance","\"Maintenance due today\" or \"pending tasks\""],
            ["📦","Cargo","\"Show cargo\" or \"critical cargo\""],
            ["🛤","Routes","\"Show all routes\" or \"delayed routes\""],
            ["🏛","Stations","\"Delhi station\" or \"Pune station\""],
            ["📡","GPS/Tracking","\"GPS offline\" or \"tracking status\""],
            ["🤖","AI Advice","\"AI recommendations\" or \"priority actions\""],
            ["📊","Summary","\"Dashboard summary\" or \"system status\""],
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
      chips: ["Dashboard summary", "Active alerts", "Delayed wagons", "AI recommendations"],
    };
  }

  return null;
}

// ─── Chat Component ───────────────────────────────────────────────────────────
function buildOperatorContextSnapshot({ zone, stats, wagons, cargo, alerts, maintenance }) {
  return {
    zone,
    stats,
    wagons,
    cargo,
    alerts,
    maintenance,
  };
}

const SidebarChatBot = () => {
  const { operator } = useAuth();
  const opData = useOperatorData();
  const WAGONS      = opData?.wagons      || [];
  const CARGO       = opData?.cargo       || [];
  const ALERTS      = opData?.alerts      || [];
  const MAINTENANCE = opData?.maintenance || [];
  const stats       = opData?.stats       || {};
  const zone        = operator?.zone || "";
  const [open,     setOpen]     = useState(false);
  const [min,      setMin]      = useState(false);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "👋 Hi! I'm your **Operator AI Assistant**. I combine your live wagon data with Groq-powered responses for more natural answers.",
      cards: [],
      chips: ["Dashboard summary", "Active alerts", "Delayed wagons", "AI recommendations"],
    },
  ]);
  const endRef = useRef(null);
  const searchCtx = useSearch();
  const openSearch = searchCtx?.openSearch;

  useEffect(() => {
    if (open && !min) endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, open, min]);

  const groqHistory = useRef([]);

  const send = useCallback(async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed) return;
    const q = trimmed.toLowerCase();
    const isSearchIntent = q.startsWith("search ") || q.startsWith("find ") || q.startsWith("lookup ") || q.startsWith("look up ");
    if (isSearchIntent && openSearch) {
      const term = trimmed.replace(/^(search|find|lookup|look up)\s+/i, "");
      searchCtx.setQuery(term);
      openSearch();
      setMessages(p => [...p,
        { role:"user", text:trimmed, cards:[], chips:[] },
        { role:"ai", text:`Opening global search for "${term}"...`, cards:[], chips:["Dashboard summary","Active alerts"] },
      ]);
      setInput("");
      return;
    }
    setMessages(p => [...p, { role:"user", text:trimmed, cards:[], chips:[] }]);
    setInput("");
    setTyping(true);
    const local = getAIResponse(trimmed, WAGONS, CARGO, ALERTS, MAINTENANCE);
    if (local) {
      await new Promise(r => setTimeout(r, 500));
      groqHistory.current.push({ role:"user", content:trimmed });
      groqHistory.current.push({ role:"assistant", content:local.text });
      setMessages(p => [...p, { role:"ai", ...local }]);
      setTyping(false);
    } else {
      groqHistory.current.push({ role:"user", content:trimmed });
      try {
        const reply = await askGroq(groqHistory.current);
        groqHistory.current.push({ role:"assistant", content:reply });
        setMessages(p => [...p, { role:"ai", text:reply, cards:[], chips:["Dashboard summary","Active alerts","AI recommendations"] }]);
      } catch {
        setMessages(p => [...p, { role:"ai", text:"⚠️ Unable to reach AI service. Please check your connection and try again.", cards:[], chips:["Dashboard summary","Active alerts"] }]);
      } finally {
        setTyping(false);
      }
    }
  }, [input, WAGONS, CARGO, ALERTS, MAINTENANCE, openSearch, searchCtx]);

  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  if (!opData) return null;

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          title="AI Assistant"
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
              <span style={{ color:"#fff", fontWeight:700, fontSize:14 }}>Operator AI Assistant</span>
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
                        <span style={{ color:"#3b82f6", fontSize:10, fontWeight:700 }}>AI</span>
                      </div>
                    )}
                    {/* text bubble */}
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
                    {/* rich cards */}
                    {m.cards?.length > 0 && (
                      <div style={{ marginTop:2 }}>{m.cards}</div>
                    )}
                    {/* chips */}
                    {m.role==="ai" && m.chips?.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:6 }}>
                        {m.chips.map(chip => (
                          <button key={chip} onClick={() => send(chip)}
                            style={{ background:"rgba(59,130,246,.12)", border:"1px solid rgba(59,130,246,.25)", borderRadius:20, padding:"3px 10px", color:"#60a5fa", fontSize:10, fontWeight:600, cursor:"pointer", transition:"background .15s" }}
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
                  placeholder="Ask about wagons, alerts, cargo…"
                  style={{
                    flex:1, background:"#060e1e", border:"1px solid #1a3356", borderRadius:12,
                    color:"#f1f5f9", fontSize:13, padding:"9px 13px", outline:"none",
                    transition:"border-color .15s",
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
                    transition:"background .2s",
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

export default SidebarChatBot;
