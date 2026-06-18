import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

const StatCard = ({ title, value, color = "#3b82f6", icon: Icon, trend, trendUp = true, sub }) => (
  <div className="tile-hover" style={{
    background: "var(--card-bg,#0d1f3c)", border: `1px solid ${color}28`,
    borderRadius: "16px", padding: "20px", flex: 1,
    position: "relative", overflow: "hidden", minWidth: "130px",
  }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, ${color}, ${color}80)`, borderRadius: "16px 16px 0 0" }} />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
      <span style={{ color: "var(--text-muted,#64748b)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".5px" }}>{title}</span>
      {Icon && (
        <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon color={color} size={15} />
        </div>
      )}
    </div>
    <div style={{ color: "var(--text-strong,#f1f5f9)", fontSize: "28px", fontWeight: 800, lineHeight: 1, marginBottom: "8px" }}>{value}</div>
    {sub && <div style={{ color: "var(--text-muted,#64748b)", fontSize: "12px", marginBottom: "8px" }}>{sub}</div>}
    {trend && (
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        {trendUp ? <FiTrendingUp color="#22c55e" size={12} /> : <FiTrendingDown color="#ef4444" size={12} />}
        <span style={{ color: trendUp ? "#22c55e" : "#ef4444", fontSize: "11px", fontWeight: 600 }}>{trend}</span>
        <span style={{ color: "var(--text-muted,#4a6fa5)", fontSize: "11px" }}>vs last week</span>
      </div>
    )}
  </div>
);

export default StatCard;
