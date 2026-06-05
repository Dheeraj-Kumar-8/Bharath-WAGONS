import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/train-bg.jpg";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginOperator } = useAuth();

  const [tab,     setTab]     = useState("admin"); // "admin" | "operator"
  const [email,   setEmail]   = useState("");
  const [password,setPassword]= useState("");
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const switchTab = t => { setTab(t); setEmail(""); setPassword(""); setError(""); };

  const handleLogin = () => {
    setError("");
    const trimmedEmail    = email.trim();
    const trimmedPassword = password.trim();

    console.log("[LOGIN] Tab active:", tab);
    console.log("[LOGIN] Email entered:", trimmedEmail);
    console.log("[LOGIN] Password entered:", trimmedPassword);

    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === "admin") {
        const result = login(trimmedEmail, trimmedPassword);
        console.log("[LOGIN] Admin result:", result);
        if (result.success) {
          console.log("[LOGIN] Admin login SUCCESS → navigating to /admin");
          navigate("/admin");
        } else {
          console.error("[LOGIN] Admin login FAILED");
          setError("Invalid credentials. Check the Admin Credentials reference below.");
        }
      } else {
        const result = loginOperator(trimmedEmail, trimmedPassword);
        console.log("[LOGIN] Operator result:", result);
        if (result.success) {
          console.log("[LOGIN] Operator login SUCCESS → navigating to /operator");
          navigate("/operator");
        } else {
          console.error("[LOGIN] Operator login FAILED");
          setError("Invalid Operator Credentials");
        }
      }
    }, 400);
  };

  const handleKey = e => { if (e.key === "Enter") handleLogin(); };

  const isOperator = tab === "operator";

  // ── Fixed blue palette — identical for both tabs ──────────────────────────
  const CARD_BORDER  = "1px solid rgba(59,130,246,0.2)";
  const CARD_SHADOW  = "0 0 40px rgba(37,99,235,0.25)";
  const ICON_BG      = "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const ICON_SHADOW  = "0 0 28px rgba(59,130,246,0.5)";
  const INPUT_BORDER = "1px solid rgba(59,130,246,0.25)";
  const INPUT_FOCUS  = "#3b82f6";
  const BTN_BG       = "linear-gradient(135deg,#1d4ed8,#3b82f6)";
  const BTN_SHADOW   = "0 0 24px rgba(37,99,235,0.4)";

  return (
    <div style={{
      minHeight: "100vh",
      backgroundImage: `url(${bg})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      {/* Overlay */}
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.68)", backdropFilter:"blur(4px)" }} />

      {/* Card — identical dimensions, shadow, border, and background for both tabs */}
      <div style={{
        position:"relative", zIndex:2, width:"440px", padding:"32px",
        borderRadius:"28px", background:"rgba(13,31,60,0.82)",
        border: CARD_BORDER,
        backdropFilter:"blur(18px)",
        boxShadow: CARD_SHADOW,
        color:"white",
      }}>

        {/* Back */}
        <div onClick={() => navigate("/")} style={{ marginBottom:16, color:"#94a3b8", cursor:"pointer", fontSize:13 }}>
          ← Back
        </div>

        {/* Role Tabs */}
        <div style={{
          display:"flex", background:"rgba(0,0,0,0.3)",
          borderRadius:"14px", padding:"4px", marginBottom:"24px",
          border:"1px solid rgba(255,255,255,0.06)",
        }}>
          {[["admin","🏛 Admin"],["operator","🚆 Operator"]].map(([key, label]) => (
            <button key={key} onClick={() => switchTab(key)} style={{
              flex:1, padding:"9px 0", border:"none", borderRadius:"10px", cursor:"pointer",
              fontSize:"13px", fontWeight:700, transition:"all .2s",
              background: tab === key ? "#1d4ed8" : "transparent",
              color:       tab === key ? "#fff"    : "#64748b",
              boxShadow:   tab === key ? "0 2px 12px rgba(37,99,235,.4)" : "none",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Icon */}
        <div style={{
          width:64, height:64, margin:"0 auto 12px",
          borderRadius:20, background: ICON_BG,
          display:"flex", justifyContent:"center", alignItems:"center",
          fontSize:26, boxShadow: ICON_SHADOW,
        }}>
          {isOperator ? "🚆" : "🏛"}
        </div>

        {/* Heading */}
        <h1 style={{ textAlign:"center", fontSize:28, margin:0, fontWeight:700 }}>
          {isOperator ? "Operator Login" : "Welcome Back"}
        </h1>

        {/* Subtitle */}
        <p style={{ textAlign:"center", color:"#94a3b8", fontSize:14, marginTop:6, marginBottom:24 }}>
          {isOperator
            ? "Sign in to your Operator Portal"
            : "Sign in to your regional command center"}
        </p>

        {/* Email */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, color:"#94a3b8", fontWeight:600, display:"block", marginBottom:6 }}>
            EMAIL ADDRESS
          </label>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
            placeholder={isOperator ? "operator.nr@railways.gov.in" : "admin.nr@railways.gov.in"}
            style={{
              width:"100%", padding:"12px 14px", borderRadius:12,
              border: INPUT_BORDER,
              background:"rgba(0,0,0,0.35)", color:"white",
              fontSize:14, outline:"none", boxSizing:"border-box",
              transition:"border-color .2s",
            }}
            onFocus={e => e.target.style.borderColor = INPUT_FOCUS}
            onBlur={e  => e.target.style.borderColor = "rgba(59,130,246,0.25)"}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom:8 }}>
          <label style={{ fontSize:13, color:"#94a3b8", fontWeight:600, display:"block", marginBottom:6 }}>
            PASSWORD
          </label>
          <input
            type="password" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
            placeholder="Enter password"
            style={{
              width:"100%", padding:"12px 14px", borderRadius:12,
              border: INPUT_BORDER,
              background:"rgba(0,0,0,0.35)", color:"white",
              fontSize:14, outline:"none", boxSizing:"border-box",
              transition:"border-color .2s",
            }}
            onFocus={e => e.target.style.borderColor = INPUT_FOCUS}
            onBlur={e  => e.target.style.borderColor = "rgba(59,130,246,0.25)"}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.3)",
            borderRadius:10, padding:"10px 14px", color:"#ef4444",
            fontSize:13, marginBottom:14, marginTop:8,
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width:"100%", padding:"13px", border:"none", borderRadius:14,
            background: loading ? "rgba(255,255,255,.1)" : BTN_BG,
            color:"white", fontSize:16, fontWeight:700,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: BTN_SHADOW,
            marginTop:8,
            transition:"opacity .2s",
            opacity: loading ? .7 : 1,
          }}>
          {loading
            ? "Signing in…"
            : isOperator
              ? "Sign In as Operator →"
              : "Sign In →"}
        </button>

      </div>
    </div>
  );
};

export default LoginPage;
