import { NavLink } from "react-router-dom";
import { FiGrid, FiTruck, FiMapPin, FiTool, FiAlertTriangle, FiBox, FiFileText, FiLock } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { icon: FiGrid,          label: "Dashboard",        to: "/operator",             key: null          },
  { icon: FiTruck,         label: "Assigned Wagons",  to: "/operator/wagons",      key: "wagons"      },
  { icon: FiMapPin,        label: "Live Tracking",    to: "/operator/tracking",    key: "tracking"    },
  { icon: FiTool,          label: "Maintenance",      to: "/operator/maintenance", key: "maintenance" },
  { icon: FiAlertTriangle, label: "AI Alerts",        to: "/operator/alerts",      key: "alerts"      },
  { icon: FiBox,           label: "Cargo Monitoring", to: "/operator/cargo",       key: "cargo"       },
  { icon: FiFileText,      label: "Reports",          to: "/operator/reports",     key: "reports"     },
];

const OperatorSidebar = () => {
  const { hasPermission, operator } = useAuth();

  return (
    <div style={{
      width: "256px", minWidth: "256px", height: "100vh",
      background: "var(--bg)", borderRight: "1px solid var(--border-color)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Logo */}
      <div style={{ padding: "20px 18px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
        <div style={{
          width: "40px", height: "40px", borderRadius: "12px",
          background: "linear-gradient(135deg,var(--accent-dark),var(--accent))",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px", flexShrink: 0, boxShadow: "0 0 16px var(--accent-glow)",
        }}>🚆</div>
        <div>
          <div style={{ color: "var(--text-strong,#f1f5f9)", fontWeight: 700, fontSize: "14px", lineHeight: 1.3 }}>Indian Railways</div>
          <div style={{ color: "var(--accent)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.8px", textTransform: "uppercase" }}>Operator Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
        <div style={{ color: "var(--nav-label,#1e3a5f)", fontSize: "10px", fontWeight: 700, letterSpacing: "2px", marginBottom: "10px", paddingLeft: "8px" }}>NAVIGATION</div>
        {NAV.map(({ icon: Icon, label, to, key }) => {
          const locked = key !== null && !hasPermission(key);
          return (
            <NavLink key={to} to={to} end={to === "/operator"}
              onClick={e => locked && e.preventDefault()}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: "11px",
                padding: "10px 12px", marginBottom: "2px", borderRadius: "10px",
                textDecoration: "none",
                cursor: locked ? "not-allowed" : "pointer",
                transition: "all var(--transition)",
                background: isActive && !locked ? "rgba(37,99,235,.18)" : "transparent",
                color: locked ? "#2a4a6e" : isActive ? "var(--accent)" : "var(--nav-item,#5a7a9e)",
                borderLeft: isActive && !locked ? "3px solid var(--accent)" : "3px solid transparent",
                fontWeight: isActive && !locked ? 600 : 400, fontSize: "13px",
                opacity: locked ? 0.45 : 1,
              })}>
              <Icon size={15} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {locked && <FiLock size={10} style={{ flexShrink: 0 }} />}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid var(--border-color)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span className="dot dot-green" />
          <span style={{ color: "#22c55e", fontSize: "12px", fontWeight: 600 }}>On Duty</span>
        </div>
        <div style={{ color: "var(--nav-footer-sub,#2a4a6e)", fontSize: "11px", marginBottom: "3px" }}>Operator · {operator?.shift || "Shift A"}</div>
        <div style={{ color: "var(--nav-footer-dim,#1a3356)", fontSize: "11px" }}>{operator?.region || "Ministry of Railways"}</div>
      </div>
    </div>
  );
};

export default OperatorSidebar;
