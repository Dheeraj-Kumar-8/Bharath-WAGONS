import bg from "../assets/train-bg.jpg";
import { useNavigate } from "react-router-dom";
const LoginPage = () => {
    const navigate = useNavigate();
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
      {/* LOGIN CARD */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "430px",
          padding: "28px",
          borderRadius: "28px",
          background: "rgba(20,20,20,0.45)",
          border:
            "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(18px)",
          boxShadow:
            "0 0 40px rgba(0,217,255,0.15)",
          color: "white",
        }}
      >
        {/* BACK BUTTON */}
        <div
        onClick={() => navigate("/")}
          style={{
            marginBottom: "8px",
            color: "#D1D5DB",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          ← Back
        </div>
        {/* TOP ICON */}
        <div
          style={{
            width: "70px",
            height: "70px",
            margin: "0 auto 10px",
            borderRadius: "24px",
            background:
              "linear-gradient(135deg, #00D9FF, #2563EB)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "28px",
            boxShadow:
              "0 0 30px rgba(0,217,255,0.55)",
          }}
        >
          🚆
        </div>
        {/* TITLE */}
        <h1
            style={{
                textAlign: "center",
                fontSize: "38px",
                margin: 0,
                lineHeight: "1.1",
                fontWeight: "700",
  }}
>
  Welcome back

        </h1>
        {/* SUBTITLE */}
       <p
  style={{
    textAlign: "center",
    color: "#AEB6C5",
    fontSize: "16px",
    marginTop: "8px",
    marginBottom: "18px",
  }}
>
  Sign in to your secure account
</p>
        {/* EMAIL SECTION */}
        <div
          style={{
            marginBottom: "25px",
          }}
        >
          <label
            style={{
              fontSize: "16px",
              marginBottom: "12px",
              display: "block",
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            placeholder="you@railway.gov.in"
            autoComplete="off"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "18px",
              border:
                "1px solid rgba(255,255,255,0.1)",
              background:
                "rgba(0,0,0,0.35)",
              color: "white",
              fontSize: "18px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        {/* PASSWORD HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          <label
            style={{
              fontSize: "22px",
            }}
          >
            Password
          </label>
          <span
            style={{
              color: "#00D9FF",
              cursor: "pointer",
              fontSize: "18px",
            }}
          >
            Forgot password?
          </span>
        </div>
        {/* PASSWORD INPUT */}
        <input
          type="password"
          placeholder="Enter password"
          autoComplete="new-password"
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: "18px",
            border:
              "1px solid rgba(255,255,255,0.1)",
            background:
              "rgba(0,0,0,0.35)",
            color: "white",
            fontSize: "18px",
            outline: "none",
            marginBottom: "28px",
            boxSizing: "border-box",
          }}
        />
        {/* CHECKBOX */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "35px",
          }}
        >
          <input
            type="checkbox"
            style={{
              width: "18px",
              height: "18px",
            }}
          />
          <span
            style={{
              color: "#D1D5DB",
              fontSize: "18px",
            }}
          >
            Remember me for 30 days
          </span>
        </div>
        {/* LOGIN BUTTON */}
        <button
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            borderRadius: "20px",
            background:
              "linear-gradient(135deg, #1EA7FF, #2563EB)",
            color: "white",
            fontSize: "20px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow:
              "0 0 35px rgba(37,99,235,0.4)",
          }}
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
export default LoginPage;