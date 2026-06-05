const OperatorTasks = () => {
  const tasks = [
    "Inspect Wagon WGN-101",
    "Update GPS Status for WGN-102",
    "Verify Cargo Load - WGN-103",
    "Maintenance Check - WGN-104",
    "Review Route Deviation Alert",
  ];

  return (
    <div
      style={{
        background: "#111827",
        padding: "20px",
        borderRadius: "16px",
        color: "white",
      }}
    >
      <h2>Today's Tasks</h2>

      <div style={{ marginTop: "20px" }}>
        {tasks.map((task, index) => (
          <div
            key={index}
            style={{
              padding: "12px",
              marginBottom: "10px",
              background: "#1e293b",
              borderRadius: "10px",
            }}
          >
            ✅ {task}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperatorTasks;