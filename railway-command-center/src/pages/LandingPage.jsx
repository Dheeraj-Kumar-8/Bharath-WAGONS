import bg from "../assets/train-bg.jpg";
import { useNavigate } from "react-router-dom";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
const LandingPage = () => {
    const navigate = useNavigate();
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Arial",
      }}
    >
      {/* DARK OVERLAY */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "rgba(0,0,0,0.62)",
          backdropFilter: "blur(3px)",
        }}
      />
      {/* MAIN CONTENT */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "560px",
          textAlign: "center",
          color: "white",
        }}
      >
        {/* TITLE */}
        <h1
          style={{
            fontSize: "68px",
            marginBottom: "10px",
            fontWeight: "700",
            lineHeight: "1.1",
          }}
        >
          Indian Railways
        </h1>
        {/* SUBTITLE */}
        <h2
          style={{
            color: "#41E5FF",
            letterSpacing: "7px",
            fontWeight: "700",
            fontSize: "30px",
            marginBottom: "28px",
          }}
        >
          COMMAND CENTER
        </h2>
        {/* DESCRIPTION */}
        <p
          style={{
            color: "#E5E7EB",
            fontSize: "22px",
            marginBottom: "42px",
          }}
        >
          GPS Wagon Tracking & AI Monitoring System
        </p>
         {/* BUTTON */}
        <button
        onClick={() => navigate("/login")}
          style={{
            width: "50%",
            margin: "0 auto",
            padding: "24px",
            border: "none",
            borderRadius: "22px",
            background:
              "linear-gradient(135deg, #1EA7FF, #2563EB)",
            color: "white",
            fontSize: "32px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "14px",
            boxShadow:
              "0 0 40px rgba(37,99,235,0.45)",
            transition: "0.3s",
          }}
        >
          <ShieldOutlinedIcon />
          Sign In
        </button>
        {/* CREATE ACCOUNT */}
        <p
          style={{
            marginTop: "34px",
            fontSize: "22px",
            color: "#D1D5DB",
          }}
        >
          Don't have an account?
          <span
          onClick={() => navigate("/create-account")}
            style={{
              color: "#00D9FF",
              marginLeft: "8px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            Create account
          </span>
        </p>
        {/* FOOTER */}
        <p
          style={{
            marginTop: "40px",
            color: "#E5E7EB",
            fontSize: "20px",
          }}
        >
          Ministry of Railways, Government of India
        </p>
      </div>
    </div>
  );
};
export default LandingPage;