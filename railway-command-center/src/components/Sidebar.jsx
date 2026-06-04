import { NavLink } from "react-router-dom";
import {
  FiGrid, FiMapPin, FiTruck, FiMap, FiAlertTriangle,
  FiBox, FiBarChart2, FiCpu, FiHeart, FiTool,
  FiFileText, FiUsers, FiSettings,
} from "react-icons/fi";

const NAV = [
  { icon: FiGrid,          label: "Dashboard",          to: "/admin" },
  { icon: FiMapPin,        label: "Live Tracking",      to: "/live-tracking" },
  { icon: FiTruck,         label: "Wagons",             to: "/wagons" },
  { icon: FiMap,           label: "Stations",           to: "/stations" },
  { icon: FiAlertTriangle, label: "AI Alerts",          to: "/ai-alerts" },
  { icon: FiBox,           label: "Cargo Monitoring",   to: "/cargo-monitoring" },
  { icon: FiBarChart2,     label: "Analytics",          to: "/analytics" },
  { icon: FiCpu,           label: "Predictive Insights",to: "/predictive-insights" },
  { icon: FiHeart,         label: "Wagon Health",       to: "/wagon-health" },
  { icon: FiTool,          label: "Maintenance",        to: "/maintenance" },
  { icon: FiFileText,      label: "Reports",            to: "/reports" },
  { icon: FiUsers,         label: "Users & Roles",      to: "/users-roles" },
  { icon: FiSettings,      label: "Settings",           to: "/settings" },
];

const Sidebar = () => (
  <div style={{
    width: "256px", minWidth: "256px", height: "100vh",
    background: "#060e1e", borderRight: "1px solid #0f2040",
    display: "flex", flexDirection: "column", overflow: "hidden",
  }}>
    {/* Logo */}
    <div style={{ padding: "20px 18px", borderBottom: "1px solid #0f2040", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
      <div style={{
        width: "40px", height: "40px", borderRadius: "12px",
        background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "20px", flexShrink: 0, boxShadow: "0 0 16px rgba(59,130,246,.4)",
      }}>🚆</div>
      <div>
        <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "14px", lineHeight: 1.3 }}>Indian Railways</div>
        <div style={{ color: "#3b82f6", fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>Command Center</div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
      <div style={{ color: "#1e3a5f", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px", paddingLeft: "8px" }}>NAVIGATION</div>
      {NAV.map(({ icon: Icon, label, to }) => (
        <NavLink key={to} to={to} end={to === "/admin"}
          style={({ isActive }) => ({
            display: "flex", alignItems: "center", gap: "11px",
            padding: "10px 12px", marginBottom: "2px", borderRadius: "10px",
            textDecoration: "none", cursor: "pointer", transition: "all .18s",
            background: isActive ? "rgba(37,99,235,.18)" : "transparent",
            color: isActive ? "#60a5fa" : "#5a7a9e",
            borderLeft: isActive ? "3px solid #3b82f6" : "3px solid transparent",
            fontWeight: isActive ? 600 : 400, fontSize: "13px",
          })}>
          <Icon size={15} style={{ flexShrink: 0 }} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>

    {/* Footer */}
    <div style={{ padding: "14px 18px", borderTop: "1px solid #0f2040", flexShrink: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
        <span className="dot dot-green" />
        <span style={{ color: "#22c55e", fontSize: "12px", fontWeight: 600 }}>System Operational</span>
      </div>
      <div style={{ color: "#2a4a6e", fontSize: "11px", marginBottom: "3px" }}>v2.4.1 · NavIC GPS Active</div>
      <div style={{ color: "#1a3356", fontSize: "11px" }}>Ministry of Railways</div>
    </div>
  </div>
);

export default Sidebar;
