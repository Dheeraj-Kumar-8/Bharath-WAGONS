import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/train-bg.jpg";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  const handleLogin = () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }
    const result = login(email, password);
    if (result.success) {
      navigate("/admin");
    } else {
      setError("Invalid credentials. Check the Admin Credentials reference below.");
    }
  };

  const handleKey = e => { if (e.key === "Enter") handleLogin(); };

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
      {/* overlay */}
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.68)", backdropFilter:"blur(4px)" }} />

      <div style={{ position:"relative", zIndex:2, width:"440px", padding:"32px", borderRadius:"28px", background:"rgba(13,31,60,0.82)", border:"1px solid rgba(59,130,246,0.2)", backdropFilter:"blur(18px)", boxShadow:"0 0 40px rgba(37,99,235,0.25)", color:"white" }}>

        {/* back */}
        <div onClick={() => navigate("/")} style={{ marginBottom:16, color:"#94a3b8", cursor:"pointer", fontSize:13 }}>← Back</div>

        {/* icon */}
        <div style={{ width:64, height:64, margin:"0 auto 12px", borderRadius:20, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", justifyContent:"center", alignItems:"center", fontSize:26, boxShadow:"0 0 28px rgba(59,130,246,0.5)" }}>🚆</div>

        <h1 style={{ textAlign:"center", fontSize:28, margin:0, fontWeight:700 }}>Welcome Back</h1>
        <p style={{ textAlign:"center", color:"#94a3b8", fontSize:14, marginTop:6, marginBottom:24 }}>Sign in to your regional command center</p>

        {/* email */}
        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, color:"#94a3b8", fontWeight:600, display:"block", marginBottom:6 }}>EMAIL ADDRESS</label>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
            placeholder="admin.nr@railways.gov.in"
            style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"1px solid rgba(59,130,246,0.25)", background:"rgba(0,0,0,0.35)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }}
          />
        </div>

        {/* password */}
        <div style={{ marginBottom:8 }}>
          <label style={{ fontSize:13, color:"#94a3b8", fontWeight:600, display:"block", marginBottom:6 }}>PASSWORD</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
            placeholder="Enter password"
            style={{ width:"100%", padding:"12px 14px", borderRadius:12, border:"1px solid rgba(59,130,246,0.25)", background:"rgba(0,0,0,0.35)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }}
          />
        </div>

        {/* error */}
        {error && (
          <div style={{ background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, padding:"10px 14px", color:"#ef4444", fontSize:13, marginBottom:14 }}>
            ⚠ {error}
          </div>
        )}

        {/* sign in button */}
        <button onClick={handleLogin} style={{ width:"100%", padding:"13px", border:"none", borderRadius:14, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", color:"white", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 0 24px rgba(37,99,235,0.4)", marginTop:8 }}>
          Sign In →
        </button>



      </div>
    </div>
  );
};

export default LoginPage;
