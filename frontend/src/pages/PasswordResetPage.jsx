import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiCheck, FiX, FiLock } from "react-icons/fi";
import bg from "../assets/train-bg.jpg";
import { useAuth } from "../context/AuthContext";

const BTN_BG      = "linear-gradient(135deg,#1d4ed8,#3b82f6)";
const CARD_BORDER = "1px solid rgba(59,130,246,0.2)";
const CARD_SHADOW = "0 0 40px rgba(37,99,235,0.25)";

const RULES = [
  { id:"len",   label:"At least 8 characters",          test: v => v.length >= 8             },
  { id:"upper", label:"At least one uppercase letter",  test: v => /[A-Z]/.test(v)            },
  { id:"lower", label:"At least one lowercase letter",  test: v => /[a-z]/.test(v)            },
  { id:"digit", label:"At least one number",            test: v => /\d/.test(v)               },
  { id:"spec",  label:"At least one special character", test: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

export default function PasswordResetPage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const { getOperatorByResetToken, resetPasswordWithToken } = useAuth();

  const [step,    setStep]    = useState("loading");
  const [opName,  setOpName]  = useState("");
  const [pw,      setPw]      = useState("");
  const [cpw,     setCpw]     = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [errMsg,  setErrMsg]  = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const op = getOperatorByResetToken(token);
    if (!op) {
      setStep("error");
      setErrMsg("This reset link is invalid or has already been used.");
      return;
    }
    if (Date.now() > op.resetExpiry) {
      setStep("error");
      setErrMsg("This reset link has expired (valid for 1 hour). Request a new password reset.");
      return;
    }
    setOpName(op.name);
    setStep("form");
  }, [token, getOperatorByResetToken]);

  const pwStrength   = RULES.filter(r => r.test(pw)).length;
  const strengthLabel = ["","Very Weak","Weak","Fair","Strong","Very Strong"][pwStrength];
  const strengthColor = ["#1a3356","#ef4444","#f97316","#f59e0b","#22c55e","#16a34a"][pwStrength];
  const allPassed = RULES.every(r => r.test(pw));
  const matches   = pw === cpw && cpw.length > 0;
  const canSubmit = allPassed && matches && !loading;

  const handleReset = () => {
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      const result = resetPasswordWithToken(token, pw);
      setLoading(false);
      if (result.success) {
        setStep("success");
      } else {
        setErrMsg(result.reason === "token_expired"
          ? "This link has expired. Please request a new password reset."
          : "Reset failed. The link may have already been used.");
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
        position:"relative", zIndex:2, width:"440px", padding:"36px",
        borderRadius:"28px", background:"rgba(13,31,60,0.90)",
        border:CARD_BORDER, backdropFilter:"blur(18px)",
        boxShadow:CARD_SHADOW, color:"white",
        maxHeight:"95vh", overflowY:"auto",
      }}>

        {step === "loading" && (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>⏳</div>
            <div style={{ color:"#94a3b8", fontSize:14 }}>Verifying reset link…</div>
          </div>
        )}

        {step === "error" && (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <FiX size={26} color="#ef4444"/>
            </div>
            <h2 style={{ color:"#f1f5f9", fontWeight:700, marginBottom:8 }}>Reset Failed</h2>
            <p style={{ color:"#94a3b8", fontSize:14, lineHeight:1.7, marginBottom:28 }}>{errMsg}</p>
            <button onClick={() => navigate("/login")} style={{
              padding:"12px 28px", border:"none", borderRadius:12,
              background:BTN_BG, color:"white", fontSize:14, fontWeight:700, cursor:"pointer",
            }}>
              Back to Login
            </button>
          </div>
        )}

        {step === "success" && (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ width:56, height:56, borderRadius:"50%", background:"rgba(34,197,94,.15)", border:"1px solid rgba(34,197,94,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
              <FiCheck size={26} color="#22c55e"/>
            </div>
            <h2 style={{ color:"#f1f5f9", fontWeight:700, marginBottom:8 }}>Password Reset!</h2>
            <p style={{ color:"#94a3b8", fontSize:14, lineHeight:1.7, marginBottom:28 }}>
              Your password has been updated securely. You can now log in with your new password.
            </p>
            <button onClick={() => navigate("/login")} style={{
              width:"100%", padding:"13px", border:"none", borderRadius:12,
              background:BTN_BG, color:"white", fontSize:15, fontWeight:700, cursor:"pointer",
            }}>
              Go to Login →
            </button>
          </div>
        )}

        {step === "form" && (
          <>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ width:52, height:52, margin:"0 auto 12px", borderRadius:14, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", justifyContent:"center", alignItems:"center", boxShadow:"0 0 28px rgba(59,130,246,0.5)" }}>
                <FiLock size={22} color="#fff"/>
              </div>
              <h1 style={{ fontSize:22, margin:0, fontWeight:700 }}>Reset Your Password</h1>
              <p style={{ color:"#94a3b8", fontSize:13, marginTop:6 }}>
                Hello, <strong style={{ color:"#60a5fa" }}>{opName}</strong>
              </p>
            </div>

            <div style={{ background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 14px", marginBottom:18, display:"flex", gap:8, alignItems:"flex-start" }}>
              <FiLock size={13} color="#3b82f6" style={{ marginTop:2, flexShrink:0 }}/>
              <span style={{ color:"#60a5fa", fontSize:12, lineHeight:1.6 }}>
                Create a new strong password. It will be securely hashed — never stored or emailed as plain text.
              </span>
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, color:"#94a3b8", fontWeight:700, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>New Password</label>
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

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:11, color:"#94a3b8", fontWeight:700, display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:".5px" }}>Confirm Password</label>
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

            <div style={{ background:"#071628", border:"1px solid #1a3356", borderRadius:10, padding:"10px 14px", marginBottom:20 }}>
              {RULES.map(r => {
                const ok = r.test(pw);
                return (
                  <div key={r.id} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <div style={{ width:15, height:15, borderRadius:"50%", background: ok ? "rgba(34,197,94,.15)" : "transparent", border:`1px solid ${ok ? "#22c55e" : "#2a4a6e"}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {ok ? <FiCheck size={8} color="#22c55e"/> : null}
                    </div>
                    <span style={{ color: ok ? "#22c55e" : "#4a6fa5", fontSize:12 }}>{r.label}</span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleReset}
              disabled={!canSubmit}
              style={{
                width:"100%", padding:"13px", border:"none", borderRadius:14,
                background: canSubmit ? BTN_BG : "rgba(255,255,255,.08)",
                color:"white", fontSize:15, fontWeight:700,
                cursor: canSubmit ? "pointer" : "not-allowed",
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              {loading ? "Resetting…" : "Set New Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
