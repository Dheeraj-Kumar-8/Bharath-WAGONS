const AssignedWagons = () => {
  const wagons = [
    {
      id: "WGN-101",
      route: "Hyderabad → Delhi",
      location: "Nagpur",
      status: "Moving",
    },
    {
      id: "WGN-102",
      route: "Mumbai → Chennai",
      location: "Pune",
      status: "Maintenance",
    },
    {
      id: "WGN-103",
      route: "Kolkata → Bengaluru",
      location: "Vizag",
      status: "Moving",
    },
    {
      id: "WGN-104",
      route: "Delhi → Hyderabad",
      location: "Bhopal",
      status: "Delayed",
    },
  ];

  return (
    <div
      style={{
        background: "#111827",
        padding: "20px",
        borderRadius: "16px",
        marginBottom: "25px",
      }}
    >
      <h2 style={{ color: "white" }}>
        Assigned Wagons
      </h2>

      <table
        style={{
          width: "100%",
          color: "white",
          marginTop: "20px",
        }}
      >
        <thead>
          <tr>
            <th align="left">Wagon ID</th>
            <th align="left">Route</th>
            <th align="left">Location</th>
            <th align="left">Status</th>
          </tr>
        </thead>

        <tbody>
          {wagons.map((wagon) => (
            <tr key={wagon.id}>
              <td>{wagon.id}</td>
              <td>{wagon.route}</td>
              <td>{wagon.location}</td>
              <td>{wagon.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedWagons;