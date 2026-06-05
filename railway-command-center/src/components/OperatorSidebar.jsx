import { NavLink } from "react-router-dom";
import { FiGrid, FiTruck, FiMapPin, FiTool, FiAlertTriangle, FiBox, FiFileText } from "react-icons/fi";

const NAV = [
  { icon: FiGrid,          label: "Dashboard",       to: "/operator" },
  { icon: FiTruck,         label: "Assigned Wagons", to: "/operator/wagons" },
  { icon: FiMapPin,        label: "Live Tracking",   to: "/operator/tracking" },
  { icon: FiTool,          label: "Maintenance",     to: "/operator/maintenance" },
  { icon: FiAlertTriangle, label: "AI Alerts",       to: "/operator/alerts" },
  { icon: FiBox,           label: "Cargo Monitoring",to: "/operator/cargo" },
  { icon: FiFileText,      label: "Reports",         to: "/operator/reports" },
];

const OperatorSidebar = () => (
  <div style={{
    width: "256px", minWidth: "256px", height: "100vh",
    background: "var(--bg)", borderRight: "1px solid var(--border-color)",
    display: "flex", flexDirection: "column", overflow: "hidden",
  }}>
    <div style={{ padding: "20px 18px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "12px",
        background: "linear-gradient(135deg,#16a34a,#22c55e)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "20px", flexShrink: 0, boxShadow: "0 0 16px rgba(34,197,94,0.4)",
      }}>🚆</div>
      <div>
        <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "14px", lineHeight: 1.3 }}>Indian Railways</div>
        <div style={{ color: "#22c55e", fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>Operator Portal</div>
      </div>
    </div>

    <nav style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
      <div style={{ color: "#1e3a5f", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px", paddingLeft: "8px" }}>NAVIGATION</div>
      {NAV.map(({ icon: Icon, label, to }) => (
        <NavLink key={to} to={to} end={to === "/operator"}
          style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: "11px",
            padding: "10px 12px", marginBottom: "2px", borderRadius: "10px",
            textDecoration: "none", cursor: "pointer", transition: "all .18s",
            background: isActive ? "rgba(34,197,94,.15)" : "transparent",
            color: isActive ? "#22c55e" : "#5a7a9e",
            borderLeft: isActive ? "3px solid #22c55e" : "3px solid transparent",
            fontWeight: isActive ? 600 : 400, fontSize: "13px",
          })}>
          <Icon size={15} style={{ flexShrink: 0 }} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>

    <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border-color)", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <span className="dot dot-green" />
        <span style={{ color: "#22c55e", fontSize: "12px", fontWeight: 600 }}>On Duty</span>
      </div>
      <div style={{ color: "#2a4a6e", fontSize: "11px", marginBottom: "3px" }}>Operator · Shift A</div>
      <div style={{ color: "#1a3356", fontSize: "11px" }}>Ministry of Railways</div>
    </div>
  </div>
);

export default OperatorSidebar;
