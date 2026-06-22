import { useOperatorData } from "../context/OperatorDataContext";

const OperatorStats = () => {
  const { stats } = useOperatorData();

  const cards = [
    { title: "Assigned Wagons", value: stats.totalWagons,    color: "#3B82F6" },
    { title: "Pending Tasks",   value: stats.tasksPending,   color: "#F59E0B" },
    { title: "Completed Today", value: stats.tasksDone,      color: "#22C55E" },
    { title: "Critical Alerts", value: stats.criticalAlerts, color: "#EF4444" },
  ];

  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "25px" }}>
      {cards.map((card, index) => (
        <div key={index} style={{
          flex: 1, background: "#111827", padding: "20px",
          borderRadius: "16px", borderLeft: `4px solid ${card.color}`,
        }}>
          <p style={{ color: "#94A3B8", margin: 0 }}>{card.title}</p>
          <h2 style={{ color: "white", marginTop: "10px" }}>{card.value}</h2>
        </div>
      ))}
    </div>
  );
};

export default OperatorStats;
