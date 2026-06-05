import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheck, FiX, FiLock, FiShield } from "react-icons/fi";
import bg from "../assets/train-bg.jpg";
import { useAuth } from "../context/AuthContext";

const BTN_BG      = "linear-gradient(135deg,#1d4ed8,#3b82f6)";
const CARD_BORDER = "1px solid rgba(59,130,246,0.2)";
const CARD_SHADOW = "0 0 40px rgba(37,99,235,0.25)";

const RULES = [
  { id:"len",   label:"At least 8 characters",                test: v => v.length >= 8              },
  { id:"upper", label:"At least one uppercase letter",        test: v => /[A-Z]/.test(v)             },
  { id:"lower", label:"At least one lowercase letter",        test: v => /[a-z]/.test(v)             },
  { id:"digit", label:"At least one number",                  test: v => /\d/.test(v)                },
  { id:"spec",  label:"At least one special character",       test: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export default function ActivatePage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const { getOperatorByActivationToken, activateAccount } = useAuth();

  const [step,     setStep]     = useState("loading"); // loading | form | success | error
  const [opName,   setOpName]   = useState("");
  const [opEmail,  setOpEmail]  = useState("");
  const [pw,       setPw]       = useState("");
  const [cpw,      setCpw]      = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [showCpw,  setShowCpw]  = useState(false);
  const [errMsg,   setErrMsg]   = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    const op = getOperatorByActivationToken(token);
    if (!op) {
      setStep("error");
      setErrMsg("This activation link is invalid or has already been used.");
      return;
    }
    if (Date.now() > op.activationExpiry) {
      setStep("error");
      setErrMsg("This activation link has expired (valid for 72 hours). Contact your Zone Admin to resend a new link.");
      return;
    }
    if (op.activated) {
      setStep("error");
      setErrMsg("This account has already been activated. Please login instead.");
      return;
    }
    setOpName(op.name);
    setOpEmail(op.email);
    setStep("form");
  }, [token, getOperatorByActivationToken]);

  const pwStrength = RULES.filter(r => r.test(pw)).length;
  const strengthLabel = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"][pwStrength];
  const strengthColor = ["#1a3356","#ef4444","#f97316","#f59e0b","#22c55e","#16a34a"][pwStrength];
  const allPassed = RULES.every(r => r.test(pw));
  const matches   = pw === cpw && cpw.length > 0;
  const canSubmit = allPassed && matches && !loading;

  const handleActivate = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      const result = activateAccount(token, pw);
      setLoading(false);
      if (result.success) {
        setStep("success");
      } else {
        setErrMsg(result.reason === "token_expired"
          ? "This link has expired. Request a new one from your Zone Admin."
          : "Activation failed. The link may have already been used.");
        setStep("error");
      }
    }, 600);
  };

  return (
    <div style={{
      minHeight:"100vh", backgroundImage:`url(${bg})`,
      backgroundSize:"cover", backgroundPosition:"center",
      display:"flex", justifyContent:"center", alignItems:"center",
      position:"relative", fontFamily:"'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.70)", backdropFilter:"blur(4px)" }}/>

      <div style={{
        position:"relative", zIndex:2, width:"460px", padding:"36px",
        borderRadius:"28px", background:"rgba(13,31,60,0.90)",
        border:CARD_BORDER, backdropFilter:"blur(18px)",
        boxShadow:CARD_SHADOW, color:"white",
        maxHeight:"95vh", overflowY:"auto",
      }}>

        {/* Loading */}
        {step === "loading" && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>⏳</div>
            <div style={{ color:"#94a3b8", fontSize:14 }}>Verifying activation link…</div>
          </div>
        )}

        {/* Error */}
        {step === "error" && (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <FiX size={28} color="#ef4444"/>
            </div>
            <h2 style={{ color:"#f1f5f9", fontWeight:700, marginBottom:8 }}>Activation Failed</h2>
            <p style={{ color:"#94a3b8", fontSize:14, lineHeight:1.7, marginBottom:28 }}>{errMsg}</p>
            <button onClick={() => navigate("/login")} style={{
              padding:"12px 28px", border:"none", borderRadius:12,
              background:BTN_BG, color:"white", fontSize:14, fontWeight:700, cursor:"pointer",
            }}>
              Go to Login
            </button>
          </div>
        )}

        {/* Success */}
        {step === "success" && (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <FiCheck size={28} color="#22c55e"/>
            </div>
            <h2 style={{ color:"#f1f5f9", fontWeight:700, marginBottom:8 }}>Account Activated!</h2>
            <p style={{ color:"#94a3b8", fontSize:14, lineHeight:1.7, marginBottom:8 }}>
              Welcome, <strong style={{ color:"#60a5fa" }}>{opName}</strong>. Your account is now active.
            </p>
            <p style={{ color:"#64748b", fontSize:13, marginBottom:28 }}>
              Your password has been securely saved. You can now log in to the Operator Portal.
            </p>
            <div style={{ background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.2)", borderRadius:10, padding:"12px 16px", marginBottom:24, textAlign:"left" }}>
              <div style={{ color:"#22c55e", fontSize:12, fontWeight:600 }}>🔒 Security Note</div>
              <div style={{ color:"#94a3b8", fontSize:12, marginTop:4 }}>
                Your password is securely hashed and never stored in plain text.
              </div>
            </div>
            <button onClick={() => navigate("/login")} style={{
              width:"100%", padding:"13px", border:"none", borderRadius:12,
              background:BTN_BG, color:"white", fontSize:15, fontWeight:700, cursor:"pointer",
            }}>
              Go to Login →
            </button>
          </div>
        )}

        {/* Form */}
        {step === "form" && (
          <>
            {/* Header */}
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ width:56, height:56, margin:"0 auto 12px", borderRadius:16, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", justifyContent:"center", alignItems:"center", fontSize:24, boxShadow:"0 0 28px rgba(59,130,246,0.5)" }}>
                <FiShield size={26} color="#fff"/>
              </div>
              <h1 style={{ fontSize:22, margin:0, fontWeight:700 }}>Activate Your Account</h1>
              <p style={{ color:"#94a3b8", fontSize:13, marginTop:6 }}>Welcome, <strong style={{ color:"#60a5fa" }}>{opName}</strong></p>
              <p style={{ color:"#64748b", fontSize:12, marginTop:2 }}>{opEmail}</p>
            </div>

            {/* Security notice */}
            <div style={{ background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 14px", marginBottom:20, display:"flex", gap:8, alignItems:"flex-start" }}>
              <FiLock size={13} color="#3b82f6" style={{ marginTop:2, flexShrink:0 }}/>
              <span style={{ color:"#60a5fa", fontSize:12, lineHeight:1.6 }}>
                Create a strong password. It will be securely hashed and never stored in plain text or sent by email.
              </span>
            </div>

            {/* Password */}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:"#94a3b8", fontWeight:700, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>
                New Password
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  placeholder="Create a strong password"
                  style={{ width:"100%", padding:"11px 40px 11px 14px", borderRadius:12, border:"1px solid rgba(59,130,246,.25)", background:"rgba(0,0,0,.35)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }}
                  onFocus={e => e.target.style.borderColor="#3b82f6"}
                  onBlur={e  => e.target.style.borderColor="rgba(59,130,246,.25)"}
                />
                <button onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer", padding:0 }}>
                  {showPw ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                </button>
              </div>

              {/* Strength bar */}
              {pw.length > 0 && (
                <div style={{ marginTop:8 }}>
                  <div style={{ display:"flex", gap:3, marginBottom:4 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex:1, height:4, borderRadius:4, background: i <= pwStrength ? strengthColor : "#1a3356", transition:"background .2s" }}/>
                    ))}
                  </div>
                  <div style={{ color:strengthColor, fontSize:11, fontWeight:600 }}>{strengthLabel}</div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, color:"#94a3b8", fontWeight:700, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>
                Confirm Password
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type={showCpw ? "text" : "password"}
                  value={cpw}
                  onChange={e => setCpw(e.target.value)}
                  placeholder="Re-enter your password"
                  style={{ width:"100%", padding:"11px 40px 11px 14px", borderRadius:12, border:`1px solid ${cpw.length > 0 ? (matches ? "rgba(34,197,94,.4)" : "rgba(239,68,68,.4)") : "rgba(59,130,246,.25)"}`, background:"rgba(0,0,0,.35)", color:"white", fontSize:14, outline:"none", boxSizing:"border-box" }}
                />
                <button onClick={() => setShowCpw(p => !p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#64748b", cursor:"pointer", padding:0 }}>
                  {showCpw ? <FiEyeOff size={15}/> : <FiEye size={15}/>}
                </button>
              </div>
              {cpw.length > 0 && (
                <div style={{ marginTop:6, color: matches ? "#22c55e" : "#ef4444", fontSize:11, fontWeight:600 }}>
                  {matches ? "✓ Passwords match" : "✗ Passwords do not match"}
                </div>
              )}
            </div>

            {/* Rules checklist */}
            <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"12px 14px", marginBottom:20 }}>
              <div style={{ color:"#64748b", fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, marginBottom:8 }}>Password Requirements</div>
              {RULES.map(r => {
                const ok = r.test(pw);
                return (
                  <div key={r.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                    <div style={{ width:16, height:16, borderRadius:"50%", background: ok ? "rgba(34,197,94,.15)" : "transparent", border:`1px solid ${ok ? "#22c55e" : "#2a4a6e"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {ok ? <FiCheck size={9} color="#22c55e"/> : null}
                    </div>
                    <span style={{ color: ok ? "#22c55e" : "#4a6fa5", fontSize:12 }}>{r.label}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleActivate}
              disabled={!canSubmit}
              style={{
                width:"100%", padding:"13px", border:"none", borderRadius:14,
                background: canSubmit ? BTN_BG : "rgba(255,255,255,.08)",
                color:"white", fontSize:15, fontWeight:700,
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              {loading ? "Activating…" : "Activate Account & Set Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
