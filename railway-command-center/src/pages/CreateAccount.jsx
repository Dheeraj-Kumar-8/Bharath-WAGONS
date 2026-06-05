import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/train-bg.jpg";
import { useAuth } from "../context/AuthContext";

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
const CARD_SHADOW  = "0 0 40px rgba(37,99,235,0.25)";
const INPUT_BORDER = "1px solid rgba(59,130,246,0.25)";
const BTN_BG       = "linear-gradient(135deg,#1d4ed8,#3b82f6)";

const CreateAccount = () => {
  const navigate = useNavigate();
  const { submitAccessRequest } = useAuth();
  const [form, setForm] = useState({
    name:"", email:"", employeeId:"", department:"Operations",
    designation:"", zone:"NR", shift:"Shift A", note:"",
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
    });
    setSubmitted(true);
  };

  const inputStyle = {
    width:"100%", padding:"11px 14px", borderRadius:12,
    border:INPUT_BORDER, background:"rgba(0,0,0,0.35)", color:"white",
    fontSize:14, outline:"none", boxSizing:"border-box",
  };
  const labelStyle = { fontSize:12, color:"#94a3b8", fontWeight:600, display:"block", marginBottom:5, textTransform:"uppercase", letterSpacing:".5px" };

  return (
    <div style={{
      minHeight:"100vh", backgroundImage:`url(${bg})`,
      backgroundSize:"cover", backgroundPosition:"center",
      display:"flex", justifyContent:"center", alignItems:"center",
      position:"relative", fontFamily:"'Segoe UI', system-ui, sans-serif",
    }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.68)", backdropFilter:"blur(4px)" }}/>

      <div style={{
        position:"relative", zIndex:2, width:"520px", padding:"32px",
        borderRadius:"28px", background:"rgba(13,31,60,0.88)",
        border:CARD_BORDER, backdropFilter:"blur(18px)",
        boxShadow:CARD_SHADOW, color:"white",
        maxHeight:"95vh", overflowY:"auto",
      }}>
        <div onClick={() => navigate("/")} style={{ marginBottom:16, color:"#94a3b8", cursor:"pointer", fontSize:13 }}>
          ← Back
        </div>

        {submitted ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ fontSize:52, marginBottom:16 }}>✅</div>
            <h2 style={{ color:"#f1f5f9", fontWeight:700, marginBottom:8 }}>Request Submitted</h2>
            <p style={{ color:"#94a3b8", fontSize:14, marginBottom:12, lineHeight:1.7 }}>
              Your operator access request has been sent to the Zone Admin for review.
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
            <div style={{ width:56, height:56, margin:"0 auto 12px", borderRadius:16, background:"linear-gradient(135deg,#1d4ed8,#3b82f6)", display:"flex", justifyContent:"center", alignItems:"center", fontSize:24, boxShadow:"0 0 28px rgba(59,130,246,0.5)" }}>
              🚆
            </div>
            <h1 style={{ textAlign:"center", fontSize:22, margin:0, fontWeight:700 }}>Request Operator Access</h1>
            <p style={{ textAlign:"center", color:"#94a3b8", fontSize:13, marginTop:6, marginBottom:4 }}>
              Operators cannot self-register. Submit a request — your Zone Admin will review and issue a secure activation link.
            </p>

            {/* Security notice */}
            <div style={{ background:"rgba(59,130,246,.08)", border:"1px solid rgba(59,130,246,.2)", borderRadius:10, padding:"10px 14px", marginBottom:20, display:"flex", alignItems:"flex-start", gap:8 }}>
              <span style={{ fontSize:16 }}>🔒</span>
              <span style={{ color:"#60a5fa", fontSize:12 }}>
                No password will be assigned or emailed. After approval, you'll receive a secure activation link to create your own password.
              </span>
            </div>

            {/* Form grid */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input style={inputStyle} placeholder="Rajesh Kumar" value={form.name} onChange={e => set("name", e.target.value)}/>
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={inputStyle} type="email" placeholder="you@railways.gov.in" value={form.email} onChange={e => set("email", e.target.value)}/>
              </div>
              <div>
                <label style={labelStyle}>Employee ID *</label>
                <input style={inputStyle} placeholder="EMP-NR-042" value={form.employeeId} onChange={e => set("employeeId", e.target.value)}/>
              </div>
              <div>
                <label style={labelStyle}>Designation</label>
                <input style={inputStyle} placeholder="Senior Operator" value={form.designation} onChange={e => set("designation", e.target.value)}/>
              </div>
              <div>
                <label style={labelStyle}>Department</label>
                <select style={{ ...inputStyle, padding:"10px 14px" }} value={form.department} onChange={e => set("department", e.target.value)}>
                  {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Zone</label>
                <select style={{ ...inputStyle, padding:"10px 14px" }} value={form.zone} onChange={e => set("zone", e.target.value)}>
                  {ZONES.map(z => <option key={z.code} value={z.code}>{z.code} — {z.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Shift</label>
                <select style={{ ...inputStyle, padding:"10px 14px" }} value={form.shift} onChange={e => set("shift", e.target.value)}>
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
