import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isValidRailwayEmail, DOMAIN_ERROR } from "../utils/emailValidator";

function ParticleCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize(); window.addEventListener("resize", resize);
    const DOTS = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3, vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28, a: Math.random() * 0.45 + 0.1,
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      DOTS.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0) d.x = canvas.width; if (d.x > canvas.width) d.x = 0;
        if (d.y < 0) d.y = canvas.height; if (d.y > canvas.height) d.y = 0;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${d.a})`; ctx.fill();
      });
      for (let i = 0; i < DOTS.length; i++) for (let j = i + 1; j < DOTS.length; j++) {
        const dx = DOTS[i].x - DOTS[j].x, dy = DOTS[i].y - DOTS[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 110) {
          ctx.beginPath(); ctx.moveTo(DOTS[i].x, DOTS[i].y); ctx.lineTo(DOTS[j].x, DOTS[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${0.07*(1-dist/110)})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"none", opacity:0.7 }} />;
}

const ZONES = [
  { code:"NR",  label:"North Railway"         },
  { code:"SR",  label:"South Railway"         },
  { code:"ER",  label:"East Railway"          },
  { code:"WR",  label:"West Railway"          },
  { code:"NER", label:"North East Railway"    },
  { code:"NWR", label:"North Western Railway" },
  { code:"SER", label:"South Eastern Railway" },
  { code:"SWR", label:"South Western Railway" },
];

const DEPARTMENTS = ["Operations","Logistics","Maintenance","Cargo","Safety","IT","Administration"];

const CARD_BORDER  = "1px solid rgba(59,130,246,0.2)";
const INPUT_BORDER = "1px solid rgba(59,130,246,0.25)";
const BTN_BG       = "linear-gradient(135deg,#1d4ed8,#3b82f6)";

const CreateAccount = () => {
  const navigate = useNavigate();
  const { submitAccessRequest } = useAuth();
  const [form, setForm] = useState({
    name:"", email:"", employeeId:"", department:"Operations",
    designation:"", zone:"NR", shift:"Shift A", note:"", role:"Operator",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState("");

  const set = (k, v) => setForm(p => ({ ...p, [k]:v }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.email.trim() || !form.employeeId.trim()) {
      setError("Full name, email, and employee ID are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!isValidRailwayEmail(form.email.trim())) {
      setError(DOMAIN_ERROR);
      return;
    }
    submitAccessRequest({
      name:        form.name.trim(),
      email:       form.email.trim().toLowerCase(),
      employeeId:  form.employeeId.trim(),
      department:  form.department,
      designation: form.designation.trim(),
      zone:        form.zone,
      region:      ZONES.find(z => z.code === form.zone)?.label || form.zone,
      shift:       form.shift,
      note:        form.note.trim(),
      role:        form.role,
    });
    setSubmitted(true);
  };

  const inputStyle = {
    width:"100%", padding:"11px 14px", borderRadius:12,
    border:INPUT_BORDER, background:"rgba(0,0,0,0.35)", color:"white",
    fontSize:14, outline:"none", boxSizing:"border-box",
    transition:"border-color .2s, box-shadow .2s",
  };
  const onFocus = e => { e.target.style.borderColor = "#3b82f6"; e.target.style.boxShadow = "0 0 0 3px rgba(59,130,246,.13)"; };
  const onBlur  = e => { e.target.style.borderColor = "rgba(59,130,246,0.25)"; e.target.style.boxShadow = "none"; };
  const labelStyle = { fontSize:12, color:"#94a3b8", fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".5px" };

  return (
    <div style={{
      minHeight:"100vh", display:"flex", justifyContent:"center", alignItems:"center",
      position:"relative", overflow:"hidden", fontFamily:"'Inter','Segoe UI',system-ui,sans-serif",
      background:"#020b18",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes ca-scan { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes ca-gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes ca-orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.15)} 66%{transform:translate(-40px,50px) scale(0.9)} }
        @keyframes ca-orb2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-70px,30px) scale(0.85)} 66%{transform:translate(50px,-60px) scale(1.2)} }
        @keyframes ca-orb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,40px)} }
      `}</style>

      {/* Animated gradient orbs */}
      <div style={{ position:"absolute", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", top:"-10%", left:"-5%", width:550, height:550, borderRadius:"50%", background:"radial-gradient(circle,rgba(29,78,216,0.18),transparent 70%)", animation:"ca-orb1 18s ease-in-out infinite", filter:"blur(40px)" }} />
        <div style={{ position:"absolute", bottom:"-15%", right:"-8%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.14),transparent 70%)", animation:"ca-orb2 22s ease-in-out infinite", filter:"blur(50px)" }} />
        <div style={{ position:"absolute", top:"40%", left:"50%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(59,130,246,0.09),transparent 70%)", animation:"ca-orb3 14s ease-in-out infinite", filter:"blur(35px)" }} />
      </div>

      {/* Video background */}
      <video autoPlay loop muted playsInline
        poster="https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=55"
        style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", filter:"brightness(.25) saturate(.6)", zIndex:1 }}>
        <source src="https://videos.pexels.com/video-files/4873765/4873765-hd_1920_1080_25fps.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div style={{ position:"absolute", inset:0, zIndex:1, background:"linear-gradient(135deg,rgba(2,8,20,.85) 0%,rgba(4,14,35,.6) 50%,rgba(2,8,20,.82) 100%)" }} />

      {/* Grid pattern */}
      <div style={{ position:"absolute", inset:0, zIndex:1, pointerEvents:"none", backgroundImage:"linear-gradient(rgba(59,130,246,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.025) 1px,transparent 1px)", backgroundSize:"55px 55px" }} />

      {/* Scan line */}
      <div style={{ position:"absolute", inset:0, zIndex:2, overflow:"hidden", pointerEvents:"none" }}>
        <div style={{ position:"absolute", left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(59,130,246,.12),transparent)", animation:"ca-scan 9s linear infinite" }} />
      </div>

      {/* Particles */}
      <ParticleCanvas />

      <div style={{
        position:"relative", zIndex:10, width:"520px", padding:"32px",
        borderRadius:"28px", background:"rgba(5,14,30,0.82)",
        border:CARD_BORDER, backdropFilter:"blur(28px) saturate(1.5)",
        WebkitBackdropFilter:"blur(28px) saturate(1.5)",
        boxShadow:"0 32px 80px rgba(0,0,0,.65), 0 0 60px rgba(37,99,235,.08), inset 0 1px 0 rgba(255,255,255,.04)",
        color:"white", maxHeight:"95vh", overflowY:"auto",
        margin:"clamp(16px,3vw,40px) 0",
      }}>
        <div onClick={() => navigate("/")} style={{ marginBottom:16, color:"#94a3b8", cursor:"pointer", fontSize:13 }}>
          ← Back
        </div>

        {submitted ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
            <h2 style={{ color:"#f1f5f9", fontWeight:700, marginBottom:8 }}>Request Submitted</h2>
            <p style={{ color:"#94a3b8", fontSize:14, marginBottom:12, lineHeight:1.7 }}>
              Your <strong style={{ color:"#60a5fa" }}>{form.role}</strong> access request has been sent to the Zone Admin for review.
            </p>
            <div style={{ background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.25)", borderRadius:12, padding:"14px 18px", marginBottom:24, textAlign:"left" }}>
              <div style={{ color:"#22c55e", fontWeight:700, fontSize:13, marginBottom:6 }}>🔒 What happens next?</div>
              <div style={{ color:"#94a3b8", fontSize:13, lineHeight:1.7 }}>
                1. Zone Admin reviews your request<br/>
                2. Admin approves and assigns your permissions<br/>
                3. A <strong style={{ color:"#60a5fa" }}>secure activation link</strong> is sent to your email<br/>
                4. Click the link to set your own password<br/>
                5. No password is ever sent via email
              </div>
            </div>
            <button onClick={() => navigate("/login")} style={{
              padding:"12px 28px", border:"none", borderRadius:12,
              background:BTN_BG, color:"white", fontSize:14, fontWeight:700, cursor:"pointer",
            }}>
              Go to Login →
            </button>
          </div>
        ) : (
          <>
            <div style={{ width:56, height:56, margin:"0 auto 12px", borderRadius:16, background: form.role === "Analyst" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", justifyContent:"center", alignItems:"center", fontSize:24, boxShadow: form.role === "Analyst" ? "0 0 28px rgba(168,85,247,0.5)" : "0 0 28px rgba(59,130,246,0.5)" }}>
              {form.role === "Analyst" ? "📊" : "🚆"}
            </div>
            <h1 style={{ textAlign:"center", fontSize:22, margin:0, fontWeight:700 }}>Request Access</h1>
            <p style={{ textAlign:"center", color:"#94a3b8", fontSize:13, marginTop:6, marginBottom:12 }}>
              Submit a request — your Zone Admin will review and issue a secure activation link.
            </p>

            {/* Role selector */}
            <div style={{ display:"flex", background:"rgba(0,0,0,0.3)", borderRadius:12, padding:4, marginBottom:16, border:"1px solid rgba(255,255,255,0.06)" }}>
              {[["Operator","🚆"],["Analyst","📊"]].map(([role, icon]) => (
                <button key={role} onClick={() => set("role", role)} style={{
                  flex:1, padding:"9px 0", border:"none", borderRadius:9, cursor:"pointer",
                  fontSize:13, fontWeight:700, transition:"all .2s",
                  background: form.role === role ? (role === "Analyst" ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)") : "transparent",
                  color: form.role === role ? "#fff" : "#64748b",
                  boxShadow: form.role === role ? (role === "Analyst" ? "0 2px 12px rgba(168,85,247,.4)" : "0 2px 12px rgba(37,99,235,.4)") : "none",
                }}>
                  {icon} {role}
                </button>
              ))}
            </div>

            {/* Security notice */}
            <div style={{ background: form.role === "Analyst" ? "rgba(168,85,247,.08)" : "rgba(59,130,246,.08)", border: form.role === "Analyst" ? "1px solid rgba(168,85,247,.2)" : "1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 14px", marginBottom:20, display:"flex", alignItems:"flex-start", gap:8 }}>
              <span style={{ fontSize:16 }}>🔒</span>
              <span style={{ color: form.role === "Analyst" ? "#c084fc" : "#60a5fa", fontSize:12 }}>
                No password will be assigned or emailed. After approval, you'll receive a secure activation link to create your own password.
              </span>
            </div>

            {/* Form grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} placeholder="Rajesh Kumar" value={form.name} onChange={e => set("name", e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={inputStyle} type="email" placeholder="you@railway.gov.in" value={form.email} onChange={e => set("email", e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
              </div>
              <div>
                <label style={labelStyle}>Employee ID *</label>
                <input style={inputStyle} placeholder="EMP-NR-042" value={form.employeeId} onChange={e => set("employeeId", e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
              </div>
              <div>
                <label style={labelStyle}>Designation</label>
                <input style={inputStyle} placeholder="Senior Operator" value={form.designation} onChange={e => set("designation", e.target.value)} onFocus={onFocus} onBlur={onBlur}/>
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <select style={{ ...inputStyle, padding:"10px 14px" }} value={form.department} onChange={e => set("department", e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Zone</label>
                <select style={{ ...inputStyle, padding:"10px 14px" }} value={form.zone} onChange={e => set("zone", e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  {ZONES.map(z => <option key={z.code} value={z.code}>{z.code} — {z.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Shift</label>
                <select style={{ ...inputStyle, padding:"10px 14px" }} value={form.shift} onChange={e => set("shift", e.target.value)} onFocus={onFocus} onBlur={onBlur}>
                  {["Shift A","Shift B","Shift C"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={labelStyle}>Note (Optional)</label>
              <textarea
                style={{ ...inputStyle, resize:"vertical", minHeight:68 }}
                placeholder="Brief reason for access request…"
                value={form.note}
                onChange={e => set("note", e.target.value)}
                onFocus={onFocus} onBlur={onBlur}
              />
            </div>

            {error && (
              <div style={{ background:"rgba(239,68,68,.15)", border:"1px solid rgba(239,68,68,.3)", borderRadius:10, padding:"10px 14px", color:"#ef4444", fontSize:13, marginBottom:14 }}>
                ⚠ {error}
              </div>
            )}

            <button onClick={handleSubmit} style={{
              width:"100%", padding:"13px", border:"none", borderRadius:14,
              background:BTN_BG, color:"white", fontSize:15, fontWeight:700,
              cursor:"pointer", boxShadow:"0 0 24px rgba(37,99,235,0.4)",
            }}>
              Submit Access Request →
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;
