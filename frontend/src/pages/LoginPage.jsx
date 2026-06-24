import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiMail, FiShield } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { isValidRailwayEmail, DOMAIN_ERROR } from "../utils/emailValidator";

/* ── Constants (unchanged) ───────────────────────────────────────── */
const LOCK_REASON_MSG = {
  invalid_credentials: "Invalid email or password.",
  account_locked:      "Account temporarily locked due to multiple failed attempts.",
  account_suspended:   "Your account has been suspended. Contact your Zone Admin.",
  account_deactivated: "Your account has been deactivated. Contact your Zone Admin.",
  not_activated:       "Account not yet activated. Check your email for the activation link.",
  account_inactive:    "Your account is inactive. Contact your Zone Admin.",
  role_mismatch:       "",  // message field used directly
  network_error:       "Unable to reach the server. Please try again.",
};

/* ── Floating particle canvas ────────────────────────────────────── */
function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const DOTS = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      a: Math.random() * 0.45 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      DOTS.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width;
        if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height;
        if (d.y > canvas.height) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${d.a})`;
        ctx.fill();
      });
      // draw faint connection lines
      for (let i = 0; i < DOTS.length; i++) {
        for (let j = i + 1; j < DOTS.length; j++) {
          const dx = DOTS[i].x - DOTS[j].x;
          const dy = DOTS[i].y - DOTS[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(DOTS[i].x, DOTS[i].y);
            ctx.lineTo(DOTS[j].x, DOTS[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${0.07 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <canvas ref={ref} style={{
      position: "absolute", inset: 0, zIndex: 2,
      pointerEvents: "none", opacity: 0.7,
    }} />
  );
}

/* ── Forgot Password (logic unchanged) ──────────────────────────── */
function ForgotPasswordForm({ onBack }) {
  const { requestPasswordReset } = useAuth();
  const [email,   setEmail]   = useState("");
  const [sent,    setSent]    = useState(false);
  const [link,    setLink]    = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!email.trim()) return;
    if (!isValidRailwayEmail(email.trim())) { setSent(true); return; }
    setLoading(true);
    setTimeout(() => {
      const result = requestPasswordReset(email);
      setLoading(false); setSent(true);
      if (result.resetLink) setLink(result.resetLink);
    }, 500);
  };

  if (sent) return (
    <div style={{ textAlign: "center", padding: "8px 0", animation: "lp-fadeUp .4s ease both" }}>
      <div style={{ fontSize: 42, marginBottom: 14 }}>📧</div>
      <h3 style={S.cardTitle}>Check Your Email</h3>
      <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
        If an account exists for this email, a secure password reset link has been sent.
        The link is valid for <strong style={{ color: "#60a5fa" }}>1 hour</strong>.
      </p>
      <div style={S.infoBox("#f59e0b")}>
        <div style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>🔒 Security Notice</div>
        <div style={{ color: "#94a3b8", fontSize: 12 }}>No password is ever sent via email. Only a secure one-time link.</div>
      </div>
      {link && (
        <div style={S.codeBox}>
          <div style={{ color: "#4a6fa5", fontSize: 11, marginBottom: 4 }}>Simulated reset link (no email server):</div>
          <a href={link} style={{ color: "#60a5fa", fontSize: 11, wordBreak: "break-all", textDecoration: "underline" }}>{link}</a>
        </div>
      )}
      <button onClick={onBack} style={S.ghostBtn}>Back to Login</button>
    </div>
  );

  return (
    <div style={{ animation: "lp-fadeUp .4s ease both" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>←</button>
        <h3 style={S.cardTitle}>Reset Your Password</h3>
      </div>
      <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
        Enter your registered email. We'll send a secure reset link (no plain-text password).
      </p>
      <div style={{ marginBottom: 16 }}>
        <label style={S.label}>Email Address</label>
        <div style={{ position: "relative" }}>
          <FiMail size={14} color="#4a6fa5" style={S.inputIcon} />
          <input
            type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            placeholder="your-email@railway.gov.in"
            style={S.input}
            onFocus={e => e.target.style.borderColor = "#3b82f6"}
            onBlur={e  => e.target.style.borderColor = "rgba(59,130,246,.2)"}
          />
        </div>
      </div>
      <button onClick={handleSubmit} disabled={!email.trim() || loading}
        style={{ ...S.submitBtn(!email.trim() || loading, false), marginTop: 0 }}>
        {loading ? "Sending…" : "Send Reset Link"}
      </button>
    </div>
  );
}

/* ── Shared micro-styles ─────────────────────────────────────────── */
const S = {
  label: {
    fontSize: 11, color: "#4a6fa5", fontWeight: 700,
    display: "block", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: ".8px",
  },
  inputIcon: {
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
    pointerEvents: "none",
  },
  input: {
    width: "100%", padding: "11px 14px 11px 40px",
    borderRadius: 12, border: "1px solid rgba(59,130,246,.2)",
    background: "rgba(2,8,18,.55)", color: "white",
    fontSize: 14, outline: "none", boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "'Inter','Manrope',system-ui,sans-serif",
  },
  cardTitle: {
    color: "#f1f5f9", fontWeight: 800, fontSize: 17,
    margin: "0 0 8px", letterSpacing: "-.2px",
    fontFamily: "'Manrope','Inter',system-ui,sans-serif",
  },
  ghostBtn: {
    background: "none", border: "1px solid rgba(59,130,246,.2)",
    borderRadius: 10, color: "#94a3b8",
    padding: "9px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600,
    transition: "border-color .2s, color .2s",
    fontFamily: "'Inter',system-ui,sans-serif",
  },
  infoBox: col => ({
    background: `rgba(${col === "#f59e0b" ? "245,158,11" : "239,68,68"},.08)`,
    border:     `1px solid rgba(${col === "#f59e0b" ? "245,158,11" : "239,68,68"},.2)`,
    borderRadius: 10, padding: "10px 14px", marginBottom: 16, textAlign: "left",
  }),
  codeBox: {
    background: "rgba(2,8,18,.7)", border: "1px solid rgba(30,58,100,.8)",
    borderRadius: 10, padding: "10px 14px", marginBottom: 16, textAlign: "left",
  },
  submitBtn: (disabled, isAnl) => ({
    width: "100%", padding: "13px", border: "none", borderRadius: 13,
    background: disabled
      ? "rgba(255,255,255,.07)"
      : isAnl
        ? "linear-gradient(135deg,#0369a1,#0ea5e9)"
        : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
    color: "white", fontSize: 15, fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : isAnl
      ? "0 4px 20px rgba(14,165,233,.4)"
      : "0 4px 20px rgba(37,99,235,.45)",
    marginTop: 10, opacity: disabled ? .55 : 1,
    transition: "box-shadow .2s, transform .15s, opacity .2s",
    fontFamily: "'Inter','Manrope',system-ui,sans-serif",
    letterSpacing: ".2px",
  }),
};

/* ── Card — defined outside LoginPage to prevent remount on state change ── */
const Card = ({ children, width = 440, mounted }) => (
  <div style={{
    position: "relative", zIndex: 10,
    width: "min(94vw," + width + "px)",
    padding: "clamp(22px,4vw,36px)",
    borderRadius: 26,
    background: "rgba(5,14,30,0.82)",
    border: "1px solid rgba(59,130,246,.18)",
    backdropFilter: "blur(28px) saturate(1.5)",
    WebkitBackdropFilter: "blur(28px) saturate(1.5)",
    boxShadow: "0 32px 80px rgba(0,0,0,.65), 0 0 60px rgba(37,99,235,.08), inset 0 1px 0 rgba(255,255,255,.04)",
    color: "white",
    fontFamily: "'Inter','Manrope',system-ui,sans-serif",
    opacity:    mounted ? 1 : 0,
    transform:  mounted ? "translateY(0)" : "translateY(28px)",
    transition: "opacity .55s cubic-bezier(.4,0,.2,1), transform .55s cubic-bezier(.4,0,.2,1)",
  }}>
    <div style={{
      position: "absolute", top: 0, left: "10%", right: "10%", height: 1,
      background: "linear-gradient(90deg,transparent,rgba(99,163,255,.5),transparent)",
      borderRadius: "0 0 4px 4px",
    }}/>
    {children}
  </div>
);

/* ── Main Login Page ─────────────────────────────────────────────── */
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
  const [mounted,    setMounted]    = useState(false);
  // pendingNav holds the route to navigate to once auth state has committed
  const [pendingNav, setPendingNav] = useState(null);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  // Navigate only after admin/operator/analyst state has been committed to context
  useEffect(() => {
    if (!pendingNav) return;
    console.log("[LoginPage] pendingNav effect fired — navigating to:", pendingNav);
    navigate(pendingNav);
    setPendingNav(null);
  }, [pendingNav, navigate]);

  const switchTab = t => { setTab(t); setEmail(""); setPassword(""); setError(""); setLockMins(null); };

  const handleLogin = async () => {
    console.log("[LoginPage] Login button clicked — tab:", tab, "email:", email);
    setError(""); setLockMins(null);
    const trimmedEmail    = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      console.log("[LoginPage] handleLogin() — empty fields, aborting");
      setError("Please enter both email and password."); return;
    }
    if (tab !== "admin" && !isValidRailwayEmail(trimmedEmail)) {
      // Admin login skips client-side domain check — backend validates
      console.log("[LoginPage] handleLogin() — invalid railway email for non-admin tab");
      setError(DOMAIN_ERROR); return;
    }
    setLoading(true);
    try {
      console.log("[LoginPage] handleLogin() — tab:", tab, "| email:", trimmedEmail);
      if (tab === "admin") {
        console.log("[LoginPage] handleLogin() — awaiting login() from AuthContext");
        const result = await login(trimmedEmail, trimmedPassword);
        console.log("[LoginPage] handleLogin() — login() result:", JSON.stringify(result));
        if (result.success) {
          console.log("[LoginPage] handleLogin() — success! scheduling navigate to /admin");
          setPendingNav("/admin");
        } else {
          const backendMsg = result.message && result.message.trim();
          const useBackend = backendMsg && (result.reason === "role_mismatch" || /suspended|inactive|blocked/i.test(backendMsg));
          setError(useBackend ? backendMsg : (LOCK_REASON_MSG[result.reason] || "Invalid credentials. Please try again."));
        }
      } else if (tab === "analytics") {
        console.log("[LoginPage] handleLogin() — calling loginAnalyst() from AuthContext");
        const result = await loginAnalyst(trimmedEmail, trimmedPassword);
        console.log("[LoginPage] handleLogin() — loginAnalyst() result:", JSON.stringify(result));
        if (result.success) { setPendingNav("/analytics-dashboard"); }
        else if (result.reason === "invalid_domain") { setError(DOMAIN_ERROR); }
        else {
          const backendMsg = result.message && result.message.trim();
          const useBackend = backendMsg && (result.reason === "role_mismatch" || /suspended|inactive|blocked/i.test(backendMsg));
          setError(useBackend ? backendMsg : (LOCK_REASON_MSG[result.reason] || "Invalid analytics credentials. Please try again."));
        }
      } else {
        console.log("[LoginPage] handleLogin() — calling loginOperator() from AuthContext");
        const result = await loginOperator(trimmedEmail, trimmedPassword);
        console.log("[LoginPage] handleLogin() — loginOperator() result:", JSON.stringify(result));
        if (result.success) { setPendingNav("/operator"); }
        else if (result.reason === "invalid_domain") { setError(DOMAIN_ERROR); }
        else {
          if (result.reason === "account_locked") {
            setLockMins(result.lockMins || 15);
            setError(LOCK_REASON_MSG.account_locked);
          } else {
            const backendMsg = result.message && result.message.trim();
            const useBackend = backendMsg && (result.reason === "role_mismatch" || /suspended|inactive|blocked/i.test(backendMsg));
            const base = useBackend ? backendMsg : (LOCK_REASON_MSG[result.reason] || "Login failed.");
            const extra = result.attemptsLeft != null
              ? ` ${result.attemptsLeft} attempt${result.attemptsLeft !== 1 ? "s" : ""} remaining before lock.`
              : "";
            setError(base + extra);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => { if (e.key === "Enter") handleLogin(); };
  const isOp  = tab === "operator";
  const isAnl = tab === "analytics";

  /* ── Forgot password screen ── */
  if (showForgot) return (
    <PageShell>
      <Card width={420} mounted={mounted}>
        <ForgotPasswordForm onBack={() => setShowForgot(false)} />
      </Card>
    </PageShell>
  );

  /* ── Main login screen ── */
  return (
    <PageShell>
      {/* Left panel — branding (hidden on small screens via CSS) */}
      <div className="lp-brand-panel">
        <div style={{ animation: mounted ? "lp-fadeLeft .7s .15s ease both" : "none" }}>
          {/* Logo mark */}
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: "linear-gradient(135deg,#1d4ed8,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, marginBottom: 28,
            boxShadow: "0 0 32px rgba(59,130,246,.4)",
          }}>🚆</div>

          <div style={{
            fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 900, lineHeight: 1.15,
            color: "#f1f5f9", marginBottom: 16, letterSpacing: "-1px",
            fontFamily: "'Manrope','Inter',system-ui,sans-serif",
          }}>
            Railway Wagon<br />
            <span style={{ background: "linear-gradient(90deg,#60a5fa,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Monitoring &amp; Operations
            </span><br />
            Platform
          </div>

          <p style={{ color: "#64748b", fontSize: 15, lineHeight: 1.75, maxWidth: 340, marginBottom: 36 }}>
            Real-time GPS wagon tracking, AI-powered alerts, and enterprise-grade cargo operations for Indian Railways.
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {[["8+","Railway Zones"],["2400+","Wagons Tracked"],["99.9%","Uptime SLA"]].map(([v,l]) => (
              <div key={l}>
                <div style={{ color: "#60a5fa", fontSize: 22, fontWeight: 800, fontFamily: "'Manrope',sans-serif" }}>{v}</div>
                <div style={{ color: "#4a6fa5", fontSize: 12, fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 10, marginTop: 36, flexWrap: "wrap" }}>
            {["🔒 ISO 27001","🛡 RBAC Secured","🚀 NavIC GPS Active"].map(b => (
              <span key={b} style={{
                background: "rgba(59,130,246,.08)", border: "1px solid rgba(59,130,246,.18)",
                borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "#60a5fa", fontWeight: 600,
              }}>{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login card */}
      <Card width={450} mounted={mounted}>
        <div onClick={() => navigate("/")} style={{
          marginBottom: 18, color: "#4a6fa5", cursor: "pointer",
          fontSize: 13, display: "flex", alignItems: "center", gap: 6,
          transition: "color .2s",
        }}
          onMouseEnter={e => e.currentTarget.style.color = "#60a5fa"}
          onMouseLeave={e => e.currentTarget.style.color = "#4a6fa5"}
        >
          ← Back to Home
        </div>

        {/* Role tabs */}
        <div style={{
          display: "flex", background: "rgba(0,0,0,.35)",
          borderRadius: 14, padding: 4, marginBottom: 26,
          border: "1px solid rgba(255,255,255,.05)",
        }}>
          {[["admin","🏛 Admin"],["operator","🚆 Operator"],["analytics","📊 Analytics"]].map(([key, label]) => (
            <button key={key} onClick={() => switchTab(key)} style={{
              flex: 1, padding: "9px 0", border: "none", borderRadius: 10,
              cursor: "pointer", fontSize: 12, fontWeight: 700,
              fontFamily: "'Inter',system-ui,sans-serif",
              transition: "all .2s",
              background: tab === key
                ? key === "analytics" ? "linear-gradient(135deg,#0369a1,#0ea5e9)"
                : "linear-gradient(135deg,#1d4ed8,#3b82f6)"
                : "transparent",
              color:     tab === key ? "#fff" : "#475569",
              boxShadow: tab === key
                ? key === "analytics" ? "0 2px 14px rgba(3,105,161,.45)"
                : "0 2px 14px rgba(37,99,235,.45)"
                : "none",
            }}>{label}</button>
          ))}
        </div>

        {/* Icon + heading */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 58, height: 58, margin: "0 auto 14px",
            borderRadius: 18,
            background: isAnl
              ? "linear-gradient(135deg,#0369a1,#0ea5e9)"
              : "linear-gradient(135deg,#1d4ed8,#3b82f6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
            boxShadow: isAnl
              ? "0 0 30px rgba(14,165,233,.45)"
              : "0 0 30px rgba(59,130,246,.45)",
          }}>
            {isAnl ? "📊" : isOp ? "🚆" : "🏛"}
          </div>
          <h1 style={{ ...S.cardTitle, fontSize: 22, margin: 0 }}>
            {isAnl ? "Analytics Login" : isOp ? "Operator Login" : "Welcome Back"}
          </h1>
          <p style={{ color: "#4a6fa5", fontSize: 13, marginTop: 5 }}>
            {isAnl ? "Sign in to the Analytics & Reporting Portal"
              : isOp ? "Sign in to your Operator Portal"
              : "Sign in to your regional command center"}
          </p>
        </div>

        {/* Account lock banner */}
        {lockMins && (
          <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", borderRadius:11, padding:"12px 14px", marginBottom:16, display:"flex", gap:8, alignItems:"flex-start" }}>
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
        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Email Address</label>
          <div style={{ position: "relative" }}>
            <FiMail size={14} color="#4a6fa5" style={S.inputIcon} />
            <input
              type="email" value={email}
              onChange={e => setEmail(e.target.value)} onKeyDown={handleKey}
              placeholder={isAnl ? "analyst.nr@railway.gov.in" : isOp ? "operator.nr@railway.gov.in" : "admin.nr@railway.gov.in"}
              style={S.input}
              onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.12)"; }}
              onBlur={e  => { e.target.style.borderColor = "rgba(59,130,246,.2)"; e.target.style.boxShadow = "none"; }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 8 }}>
          <label style={S.label}>Password</label>
          <div style={{ position: "relative" }}>
            <FiLock size={14} color="#4a6fa5" style={S.inputIcon} />
            <input
              type={showPw ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={handleKey}
              placeholder="Enter your password"
              style={{ ...S.input, paddingRight: 42 }}
              onFocus={e => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.12)"; }}
              onBlur={e  => { e.target.style.borderColor = "rgba(59,130,246,.2)"; e.target.style.boxShadow = "none"; }}
            />
            <button onClick={() => setShowPw(p => !p)} style={{
              position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", color: "#4a6fa5", cursor: "pointer", padding: 0,
              transition: "color .2s",
            }}>
              {showPw ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        {isOp && (
          <div style={{ textAlign: "right", marginBottom: 10 }}>
            <button onClick={() => setShowForgot(true)} style={{
              background: "none", border: "none", color: "#3b82f6",
              fontSize: 12, cursor: "pointer", fontWeight: 600,
              fontFamily: "'Inter',system-ui,sans-serif",
              transition: "color .2s",
            }}>Forgot password?</button>
          </div>
        )}

        {/* Error */}
        {error && !lockMins && (
          <div style={{
            background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)",
            borderRadius:10, padding:"10px 14px", color:"#f87171",
            fontSize:13, marginBottom:12, marginTop:6,
            display:"flex", alignItems:"center", gap:8,
            animation: "lp-fadeUp .25s ease both",
          }}>
            <FiLock size={13} style={{ flexShrink:0 }}/> {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading || !!lockMins}
          style={S.submitBtn(loading || !!lockMins, isAnl)}
          onMouseEnter={e => { if (!loading && !lockMins) e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {loading
            ? <span style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
                <span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"lp-spin .7s linear infinite" }}/>
                Signing in…
              </span>
            : isAnl ? "Sign In as Analyst →"
            : isOp  ? "Sign In as Operator →"
            : "Sign In →"
          }
        </button>

        {/* Request access */}
        {isOp && (
          <div style={{ marginTop: 18, textAlign: "center" }}>
            <span style={{ color: "#475569", fontSize: 13 }}>Don't have an account? </span>
            <button onClick={() => navigate("/create-account")} style={{
              background: "none", border: "none", color: "#60a5fa",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Inter',system-ui,sans-serif",
            }}>Request Access</button>
          </div>
        )}

        {/* Security footer */}
        <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
          <FiShield size={11} color="#1e3a5f"/>
          <span style={{ color: "#1e3a5f", fontSize: 11, letterSpacing: ".3px" }}>
            Secured · RBAC · Session-based auth · Ministry of Railways
          </span>
        </div>
      </Card>
    </PageShell>
  );
};

/* ── PageShell — cinematic background ───────────────────────────── */
function PageShell({ children }) {
  return (
    <>
      {/* Keyframes injected once */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@700;800;900&display=swap');
        @keyframes lp-fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lp-fadeLeft { from{opacity:0;transform:translateX(-22px)} to{opacity:1;transform:translateX(0)} }
        @keyframes lp-spin     { to{transform:rotate(360deg)} }
        @keyframes lp-gradShift{
          0%  {background-position:0% 50%}
          50% {background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        @keyframes lp-scanline {
          0%  { transform:translateY(-100%); }
          100%{ transform:translateY(100vh); }
        }
        .lp-brand-panel {
          display:flex; align-items:center; justify-content:flex-start;
          padding:clamp(24px,5vw,64px);
          flex:1; max-width:520px;
          z-index:10; position:relative;
        }
        @media(max-width:860px){ .lp-brand-panel{ display:none; } }
        .lp-video-bg {
          position:absolute; inset:0; width:100%; height:100%;
          object-fit:cover; object-position:center;
          filter:brightness(.45) saturate(.8);
          z-index:0;
        }
        .lp-overlay {
          position:absolute; inset:0; z-index:1;
          background:
            linear-gradient(135deg, rgba(2,8,20,.85) 0%, rgba(4,14,35,.6) 50%, rgba(2,8,20,.82) 100%),
            linear-gradient(0deg, rgba(2,8,20,.9) 0%, transparent 40%);
        }
        .lp-scanline-fx {
          position:absolute; inset:0; z-index:1; pointer-events:none; overflow:hidden;
        }
        .lp-scanline-fx::after {
          content:''; position:absolute;
          left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(59,130,246,.06),transparent);
          animation: lp-scanline 8s linear infinite;
          pointer-events:none;
        }
      `}</style>

      <div style={{
        minHeight: "100vh", width: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden",
        fontFamily: "'Inter','Manrope',system-ui,sans-serif",
      }}>
        {/* Cinematic video background */}
        <video
          className="lp-video-bg"
          autoPlay loop muted playsInline
          poster="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=60"
        >
          {/* Public domain / free-use railway footage from Pexels CDN */}
          <source src="https://www.pexels.com/download/video/4873765/?fps=25.0&h=1080&w=1920" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/4873765/4873765-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay */}
        <div className="lp-overlay" />

        {/* Subtle scanline effect */}
        <div className="lp-scanline-fx" />

        {/* Floating particles */}
        <ParticleCanvas />

        {/* Content row */}
        <div style={{
          position: "relative", zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%", minHeight: "100vh",
          padding: "clamp(16px,4vw,40px)",
          gap: "clamp(24px,5vw,64px)",
        }}>
          {children}
        </div>
      </div>
    </>
  );
}

export default LoginPage;
