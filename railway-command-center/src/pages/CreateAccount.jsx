import bg from "../assets/train-bg.jpg";
import { useNavigate } from "react-router-dom";
const CreateAccount = () => {
  const navigate = useNavigate();
  const handleCreateAccount = () => {
    alert("Account Created Successfully!");
    navigate("/login");
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        fontFamily: "Arial",
        margin: 0,
        padding: 0,
      }}
    >
      {/* DARK OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(4px)",
        }}
      />
      {/* CARD */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "430px",
          padding: "28px",
          borderRadius: "24px",
          background: "rgba(20,20,20,0.45)",
          border:
            "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(18px)",
          boxShadow:
            "0 0 30px rgba(0,217,255,0.15)",
          color: "white",
        }}
      >
        {/* BACK BUTTON */}
        <div
          onClick={() => navigate("/")}
          style={{
            marginBottom: "10px",
            color: "#D1D5DB",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back
        </div>
        {/* TITLE */}
        <h1
          style={{
            textAlign: "center",
            fontSize: "36px",
            margin: 0,
            fontWeight: "700",
          }}
        >
          Create account
        </h1>
        {/* SUBTITLE */}
        <p
          style={{
            textAlign: "center",
            color: "#AEB6C5",
            fontSize: "16px",
            marginTop: "10px",
            marginBottom: "22px",
          }}
        >
          Join the Indian Railways Command Center
        </p>
        {/* FULL NAME */}
        <label
          style={{
            fontSize: "16px",
          }}
        >
          Full Name
        </label>
        <input
          type="text"
          placeholder="Rajesh Kumar"
          autoComplete="off"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            marginBottom: "22px",
            borderRadius: "16px",
            border:
              "1px solid rgba(255,255,255,0.08)",
            background:
              "rgba(0,0,0,0.35)",
            color: "white",
            fontSize: "15px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {/* EMAIL */}
        <label
          style={{
            fontSize: "16px",
          }}
        >
          Email Address
        </label>
        <input
          type="email"
          placeholder="admin@railway.com"
          autoComplete="off"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            marginBottom: "22px",
            borderRadius: "16px",
            border:
              "1px solid rgba(255,255,255,0.08)",
            background:
              "rgba(0,0,0,0.35)",
            color: "white",
            fontSize: "15px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {/* PASSWORD */}
        <label
          style={{
            fontSize: "16px",
          }}
        >
          Password
        </label>
        <input
          type="password"
          placeholder="Enter password"
          autoComplete="new-password"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            marginBottom: "22px",
            borderRadius: "16px",
            border:
              "1px solid rgba(255,255,255,0.08)",
            background:
              "rgba(0,0,0,0.35)",
            color: "white",
            fontSize: "15px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {/* CONFIRM PASSWORD */}
        <label
          style={{
            fontSize: "16px",
          }}
        >
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Re-enter password"
          autoComplete="new-password"
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "10px",
            marginBottom: "26px",
            borderRadius: "16px",
            border:
              "1px solid rgba(255,255,255,0.08)",
            background:
              "rgba(0,0,0,0.35)",
            color: "white",
            fontSize: "15px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        {/* BUTTON */}
        <button
        onClick={handleCreateAccount}
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, #1EA7FF, #2563EB)",
            color: "white",
            fontSize: "18px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow:
              "0 0 30px rgba(37,99,235,0.35)",
          }}
        >
          Create Account
        </button>
      </div>
    </div>
  );
};
export default CreateAccount;