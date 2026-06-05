const OperatorStats = () => {
  const cards = [
    {
      title: "Assigned Wagons",
      value: "48",
      color: "#3B82F6",
    },
    {
      title: "Pending Tasks",
      value: "5",
      color: "#F59E0B",
    },
    {
      title: "Completed Today",
      value: "12",
      color: "#22C55E",
    },
    {
      title: "Critical Alerts",
      value: "3",
      color: "#EF4444",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        marginBottom: "25px",
      }}
    >
      {cards.map((card, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            background: "#111827",
            padding: "20px",
            borderRadius: "16px",
            borderLeft: `4px solid ${card.color}`,
          }}
        >
          <p
            style={{
              color: "#94A3B8",
              margin: 0,
            }}
          >
            {card.title}
          </p>

          <h2
            style={{
              color: "white",
              marginTop: "10px",
            }}
          >
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
};

export default OperatorStats;