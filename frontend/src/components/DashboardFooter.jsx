const COLS = [
  {
    heading: "Platform",
    items: ["🚂 2,400+ Wagons Tracked", "🗺 8 Railway Zones", "📍 NavIC GPS Active", "⚡ Real-Time Updates"],
  },
  {
    heading: "Intelligence",
    items: ["🤖 AI Predictive Alerts", "🧠 ML Anomaly Detection", "🔮 72h Failure Forecast", "📈 Zone Analytics"],
  },
  {
    heading: "Operations",
    items: ["📦 Cargo Intelligence", "🔧 Predictive Maintenance", "🚦 Route Optimisation", "📋 Auto Reports"],
  },
  {
    heading: "Security",
    items: ["🔒 RBAC Secured", "🛡 ISO 27001", "📝 Full Audit Logs", "🏛 Govt. of India"],
  },
];

const DashboardFooter = () => (
  <footer style={{
    borderTop: "1px solid rgba(30,58,100,.5)",
    background: "rgba(2,8,18,.95)",
    padding: "32px 28px 18px",
    flexShrink: 0,
    width: "100%",
  }}>
    {/* 4-column grid */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "24px",
      marginBottom: "24px",
    }}>
      {COLS.map(col => (
        <div key={col.heading}>
          <div style={{
            color: "#3b82f6", fontSize: 10, fontWeight: 700,
            letterSpacing: "1.5px", textTransform: "uppercase",
            marginBottom: 12,
          }}>
            {col.heading}
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 7 }}>
            {col.items.map(item => (
              <li key={item} style={{ color: "#2a4a6e", fontSize: 12, fontWeight: 500 }}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Bottom bar */}
    <div style={{
      borderTop: "1px solid rgba(20,45,80,.4)",
      paddingTop: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 7,
          background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13,
        }}><img src="/BW-iconic.png" style={{ width:"100%", height:"100%", objectFit:"contain" }} alt="BW" /></div>
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 12 }}>Bharath WAGONS</div>
          <div style={{ color: "#1e3a5f", fontSize: 10 }}>Ministry of Railways, Government of India</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {["🔒 @railway.gov.in only", "🛡 RBAC Secured", "⚡ 99.9% Uptime", "📡 NavIC GPS"].map(t => (
          <span key={t} style={{ color: "#1e3a5f", fontSize: 11, fontWeight: 600 }}>{t}</span>
        ))}
      </div>

      <div style={{ color: "#111e3a", fontSize: 10 }}>© 2025 · v2.4.1</div>
    </div>
  </footer>
);

export default DashboardFooter;
