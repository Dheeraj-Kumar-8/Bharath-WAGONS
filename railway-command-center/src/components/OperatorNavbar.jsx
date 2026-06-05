import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell, FiSearch, FiUser, FiX, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const OperatorNavbar = ({ title = "Operator Dashboard", sub = "Railway Operations Center", alertCount = 3 }) => {
  const navigate = useNavigate();
  const { operator, logoutOperator } = useAuth();

  const [search,     setSearch]     = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showConfirm,setShowConfirm]= useState(false);

  const handleLogout = () => {
    logoutOperator();
    navigate("/login");
  };

  const name  = operator?.name  || "Operator";
  const zone  = operator?.zone  || "—";
  const shift = operator?.shift || "";

  return (
    <>
      <div style={{
        height: "68px", background: "var(--bg)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "0 24px", flexShrink: 0,
      }}>
        {/* Title */}
        <div>
          <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "17px" }}>{title}</div>
          <div style={{ color: "#4a6fa5", fontSize: "12px" }}>{sub}</div>
        </div>

        {/* Right side controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

          {/* Search toggle */}
          {showSearch ? (
            <div className="search-box" style={{ width: "260px" }}>
              <FiSearch size={14} color="#4a6fa5" />
              <input
                autoFocus
                placeholder="Search wagons, routes…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <FiX size={14} color="#4a6fa5" style={{ cursor: "pointer" }}
                onClick={() => { setShowSearch(false); setSearch(""); }} />
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#4a6fa5", display: "flex", alignItems: "center" }}>
              <FiSearch size={17} />
            </button>
          )}

          {/* Notification bell */}
          <div style={{ position: "relative", cursor: "pointer" }}>
            <FiBell size={17} color="#94a3b8" />
            {alertCount > 0 && (
              <span style={{
                position: "absolute", top: "-6px", right: "-6px",
                background: "#ef4444", color: "#fff",
                fontSize: "9px", fontWeight: 700,
                width: "16px", height: "16px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{alertCount}</span>
            )}
          </div>

          {/* Operator profile chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "6px 12px",
            background: "rgba(34,197,94,.08)",
            border: "1px solid rgba(34,197,94,.2)",
            borderRadius: "10px",
          }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%",
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FiUser size={13} color="#fff" />
            </div>
            <div>
              <div style={{ color: "#f1f5f9", fontSize: "12px", fontWeight: 600 }}>{name}</div>
              <div style={{ color: "#22c55e", fontSize: "10px" }}>Operator · Zone {zone}{shift ? ` · ${shift}` : ""}</div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={() => setShowConfirm(true)}
            className="btn btn-sm"
            style={{
              background: "rgba(239,68,68,.1)",
              border: "1px solid rgba(239,68,68,.25)",
              color: "#ef4444",
              display: "flex", alignItems: "center", gap: "6px",
              borderRadius: "10px", padding: "7px 13px",
            }}>
            <FiLogOut size={13} /> Logout
          </button>
        </div>
      </div>

      {/* Logout confirmation modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-box" style={{ maxWidth: "360px", textAlign: "center" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: "36px", marginBottom: "12px" }}>🚪</div>
            <div className="modal-title" style={{ marginBottom: "8px" }}>Confirm Logout</div>
            <p style={{ color: "#64748b", fontSize: "13px", marginBottom: "24px" }}>
              You will be signed out of the Operator Portal and redirected to the Login page.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button className="btn btn-danger" onClick={handleLogout} style={{ flex: 1, justifyContent: "center" }}>
                <FiLogOut size={13} /> Logout
              </button>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)} style={{ flex: 1, justifyContent: "center" }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OperatorNavbar;
