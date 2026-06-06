import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail } from "react-icons/fi";
import bg from "../assets/train-bg.jpg";
import { useAuth } from "../context/AuthContext";

const CARD_BORDER  = "1px solid rgba(59,130,246,0.2)";
const CARD_SHADOW  = "0 0 40px rgba(37,99,235,0.25)";
const INPUT_BORDER = "1px solid rgba(59,130,246,0.25)";
const BTN_BG       = "linear-gradient(135deg,#1d4ed8,#3b82f6)";

const LOCK_REASON_MSG = {
  invalid_credentials: "Invalid email or password.",
  account_locked:      "Account temporarily locked due to multiple failed attempts.",
  account_suspended:   "Your account has been suspended. Contact your Zone Admin.",
  account_deactivated: "Your account has been deactivated. Contact your Zone Admin.",
  not_activated:       "Account not yet activated. Check your email for the activation link.",
  account_inactive:    "Your account is inactive. Contact your Zone Admin.",
};

// ── Forgot Password sub-form ──────────────────────────────────────────────────
function ForgotPasswordForm({ onBack }) {
  const { requestPasswordReset } = useAuth();
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [link,    setLink]    = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const result = requestPasswordReset(email);
      setLoading(false);
      setSent(true);
      if (result.resetLink) setLink(result.resetLink);
    }, 500);
  };

  if (sent) return (
    <div style={{ textAlign:"center", padding:"8px 0" }}>
      <div style={{ fontSize:40, marginBottom:14 }}>📧</div>
      <h3 style={{ color:"#f1f5f9", marginBottom:8, fontWeight:700 }}>Check Your Email</h3>
      <p style={{ color:"#94a3b8", fontSize:13, lineHeight:1.7, marginBottom:16 }}>
        If an account exists for this email, a secure password reset link has been sent.
        The link is valid for <strong style={{ color:"#60a5fa" }}>1 hour</strong>.
      </p>
      <div style={{ background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", borderRadius:10, padding:"10px 14px", marginBottom:16, textAlign:"left" }}>
        <div style={{ color:"#f59e0b", fontSize:12, fontWeight:600, marginBottom:4 }}>🔒 Security Notice</div>
        <div style={{ color:"#94a3b8", fontSize:12 }}>No password is ever sent via email. Only a secure one-time link.</div>
      </div>
      {link && (
        <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 14px", marginBottom:16, textAlign:"left" }}>
          <div style={{ color:"#4a6fa5", fontSize:11, marginBottom:4 }}>Simulated reset link (no email server):</div>
          <a href={link} style={{ color:"#60a5fa", fontSize:11, wordBreak:"break-all", textDecoration:"underline" }}>{link}</a>
        </div>
      )}
      <button onClick={onBack} style={{ background:"none", border:"1px solid #1a3356", borderRadius:10, color:"#94a3b8", padding:"9px 20px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
        Back to Login
      </button>
    </div>
  );

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20 }}>
        <button onClick={onBack} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:13 }}>←</button>
        <h3 style={{ color:"#f1f5f9", margin:0, fontWeight:700 }}>Reset Your Password</h3>
      </div>
      <p style={{ color:"#94a3b8", fontSize:13, marginBottom:20, lineHeight:1.6 }}>
        Enter your registered email. We'll send a secure reset link (no plain-text password).
      </p>
      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:12, color:"#94a3b8", fontWeight:600, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>Email Address</label>
        <div style={{ position:"relative" }}>
          <FiMail size={14} color="#4a6fa5" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="your-email@railways.gov.in"
            style={{ width:"100%", padding:"11px 14px 11px 38px", borderRadius:12, border:INPUT_BORDER, background:"rgba(0,0,0,.35)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }}
            onFocus={e => e.target.style.borderColor="#3b82f6"}
            onBlur={e  => e.target.style.borderColor="rgba(59,130,246,.25)"}
          />
        </div>
      </div>
      <button onClick={handleSubmit} disabled={!email.trim() || loading} style={{
        width:"100%", padding:"12px", border:"none", borderRadius:12,
        background: email.trim() ? BTN_BG : "rgba(255,255,255,.08)",
        color:"white", fontSize:14, fontWeight:700,
        cursor: email.trim() ? "pointer" : "not-allowed",
        opacity: loading ? .7 : 1,
      }}>
        {loading ? "Sending…" : "Send Reset Link"}
      </button>
    </>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginOperator, loginAnalyst } = useAuth();

  const [tab,        setTab]        = useState("admin");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPw,     setShowPw]     = useState(false);
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);
  const [lockMins,   setLockMins]   = useState(null);
  const [showForgot, setShowForgot] = useState(false);

  const switchTab = t => { setTab(t); setEmail(""); setPassword(""); setError(""); setLockMins(null); };

  const handleLogin = () => {
    setError(""); setLockMins(null);
    const trimmedEmail    = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === "admin") {
        const result = login(trimmedEmail, trimmedPassword);
        if (result.success) { navigate("/admin"); }
        else { setError("Invalid credentials. Please try again."); }
      } else if (tab === "analytics") {
        const result = loginAnalyst(trimmedEmail, trimmedPassword);
        if (result.success) { navigate("/analytics-dashboard"); }
        else { setError("Invalid analytics credentials. Please try again."); }
      } else {
        const result = loginOperator(trimmedEmail, trimmedPassword);
        if (result.success) {
          navigate("/operator");
        } else {
          if (result.reason === "account_locked") {
            setLockMins(result.lockMins || 15);
            setError(LOCK_REASON_MSG.account_locked);
          } else {
            const base = LOCK_REASON_MSG[result.reason] || "Login failed.";
            const extra = result.attemptsLeft != null
              ? ` ${result.attemptsLeft} attempt${result.attemptsLeft !== 1 ? "s" : ""} remaining before lock.`
              : "";
            setError(base + extra);
          }
        }
      }
    }, 400);
  };

  const handleKey = e => { if (e.key === "Enter") handleLogin(); };
  const isOp  = tab === "operator";
  const isAnl = tab === "analytics";

  if (showForgot) {
    return (
      <div style={{ minHeight:"100vh", backgroundImage:`url(${bg})`, backgroundSize:"cover", backgroundPosition:"center", display:"flex", justifyContent:"center", alignItems:"center", position:"relative", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.68)", backdropFilter:"blur(4px)" }}/>
        <div style={{ position:"relative", zIndex:2, width:"420px", padding:"32px", borderRadius:"28px", background:"rgba(13,31,60,0.88)", border:CARD_BORDER, backdropFilter:"blur(18px)", boxShadow:CARD_SHADOW, color:"white" }}>
          <ForgotPasswordForm onBack={() => setShowForgot(false)}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", backgroundImage:`url(${bg})`, backgroundSize:"cover", backgroundPosition:"center", display:"flex", justifyContent:"center", alignItems:"center", position:"relative", fontFamily:"'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.68)", backdropFilter:"blur(4px)" }}/>

      <div style={{ position:"relative", zIndex:2, width:"440px", padding:"32px", borderRadius:"28px", background:"rgba(13,31,60,0.82)", border:CARD_BORDER, backdropFilter:"blur(18px)", boxShadow:CARD_SHADOW, color:"white" }}>

        <div onClick={() => navigate("/")} style={{ marginBottom:16, color:"#94a3b8", cursor:"pointer", fontSize:13 }}>
          ← Back
        </div>

        {/* Role Tabs */}
        <div style={{ display:"flex", background:"rgba(0,0,0,0.3)", borderRadius:"14px", padding:"4px", marginBottom:"24px", border:"1px solid rgba(255,255,255,0.06)" }}>
          {[["admin","🏛 Admin"],["operator","🚆 Operator"],["analytics","📊 Analytics"]].map(([key, label]) => (
            <button key={key} onClick={() => switchTab(key)} style={{
              flex:1, padding:"9px 0", border:"none", borderRadius:"10px", cursor:"pointer",
              fontSize:"13px", fontWeight:700, transition:"all .2s",
              background: tab === key ? (key === "analytics" ? "#0369a1" : "#1d4ed8") : "transparent",
              color:       tab === key ? "#fff" : "#64748b",
              boxShadow:   tab === key ? (key === "analytics" ? "0 2px 12px rgba(3,105,161,.4)" : "0 2px 12px rgba(37,99,235,.4)") : "none",
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Icon */}
        <div style={{ width:64, height:64, margin:"0 auto 12px", borderRadius:20, background: isAnl ? "linear-gradient(135deg,#0369a1,#0ea5e9)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", justifyContent:"center", alignItems:"center", fontSize:26, boxShadow: isAnl ? "0 0 28px rgba(14,165,233,0.5)" : "0 0 28px rgba(59,130,246,0.5)" }}>
          {isAnl ? "📊" : isOp ? "🚆" : "🏛"}
        </div>

        <h1 style={{ textAlign:"center", fontSize:28, margin:0, fontWeight:700 }}>
          {isAnl ? "Analytics Login" : isOp ? "Operator Login" : "Welcome Back"}
        </h1>
        <p style={{ textAlign:"center", color:"#94a3b8", fontSize:14, marginTop:6, marginBottom:24 }}>
          {isAnl ? "Sign in to the Analytics & Reporting Portal" : isOp ? "Sign in to your Operator Portal" : "Sign in to your regional command center"}
        </p>

        {/* Account lock banner */}
        {lockMins && (
          <div style={{ background:"rgba(239,68,68,.12)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, padding:"12px 14px", marginBottom:16, display:"flex", gap:8, alignItems:"flex-start" }}>
            <FiLock size={14} color="#ef4444" style={{ marginTop:1, flexShrink:0 }}/>
            <div>
              <div style={{ color:"#ef4444", fontSize:13, fontWeight:700 }}>Account Locked</div>
              <div style={{ color:"#94a3b8", fontSize:12, marginTop:2 }}>
                Too many failed attempts. Try again in <strong style={{ color:"#f97316" }}>{lockMins} minute{lockMins !== 1 ? "s" : ""}</strong>, or contact your Zone Admin to unlock.
              </div>
            </div>
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom:14 }}>
          <label style={{ fontSize:12, color:"#94a3b8", fontWeight:600, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>Email Address</label>
          <div style={{ position:"relative" }}>
            <FiMail size={14} color="#4a6fa5" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
              placeholder={isAnl ? "analyst.nr@railways.gov.in" : isOp ? "operator.nr@railways.gov.in" : "admin.nr@railways.gov.in"}
              style={{ width:"100%", padding:"12px 14px 12px 38px", borderRadius:12, border:INPUT_BORDER, background:"rgba(0,0,0,0.35)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box", transition:"border-color .2s" }}
              onFocus={e => e.target.style.borderColor="#3b82f6"}
              onBlur={e  => e.target.style.borderColor="rgba(59,130,246,.25)"}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom:8 }}>
          <label style={{ fontSize:12, color:"#94a3b8", fontWeight:600, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>Password</label>
          <div style={{ position:"relative" }}>
            <FiLock size={14} color="#4a6fa5" style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)" }}/>
            <input
              type={showPw ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
              placeholder="Enter your password"
              style={{ width:"100%", padding:"12px 40px 12px 38px", borderRadius:12, border:INPUT_BORDER, background:"rgba(0,0,0,0.35)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box", transition:"border-color .2s" }}
              onFocus={e => e.target.style.borderColor="#3b82f6"}
              onBlur={e  => e.target.style.borderColor="rgba(59,130,246,.25)"}
            />
            <button onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer", padding:0 }}>
              {showPw ? <FiEyeOff size={14}/> : <FiEye size={14}/>}
            </button>
          </div>
        </div>

        {/* Forgot password — operators only */}
        {isOp && (
          <div style={{ textAlign:"right", marginBottom:8 }}>
            <button onClick={() => setShowForgot(true)} style={{ background:"none", border:"none", color:"#3b82f6", fontSize:12, cursor:"pointer", fontWeight:600 }}>
              Forgot password?
            </button>
          </div>
        )}

        {/* Error */}
        {error && !lockMins && (
          <div style={{ background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, padding:"10px 14px", color:"#ef4444", fontSize:13, marginBottom:14, marginTop:8 }}>
            ⚠ {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading || !!lockMins}
          style={{
            width:"100%", padding:"13px", border:"none", borderRadius:14,
            background: (loading || lockMins) ? "rgba(255,255,255,.1)" : isAnl ? "linear-gradient(135deg,#0369a1,#0ea5e9)" : BTN_BG,
            color:"white", fontSize:16, fontWeight:700,
            cursor: (loading || lockMins) ? "not-allowed" : "pointer",
            boxShadow: lockMins ? "none" : isAnl ? "0 0 24px rgba(14,165,233,0.4)" : "0 0 24px rgba(37,99,235,0.4)",
            marginTop:8, opacity: (loading || lockMins) ? .7 : 1,
          }}>
          {loading ? "Signing in…" : isAnl ? "Sign In as Analyst →" : isOp ? "Sign In as Operator →" : "Sign In →"}
        </button>

        {/* Request access link */}
        {isOp && (
          <div style={{ marginTop:18, textAlign:"center" }}>
            <span style={{ color:"#64748b", fontSize:13 }}>Don't have an account? </span>
            <button onClick={() => navigate("/create-account")} style={{ background:"none", border:"none", color:"#3b82f6", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              Request Access
            </button>
          </div>
        )}

        {/* Security note */}
        <div style={{ marginTop:18, display:"flex", alignItems:"center", gap:6, justifyContent:"center" }}>
          <FiLock size={11} color="#2a4a6e"/>
          <span style={{ color:"#2a4a6e", fontSize:11 }}>Secured · RBAC · Session-based auth</span>
        </div>


      </div>
    </div>
  );
};

export default LoginPage;
