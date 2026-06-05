import { createContext, useContext, useState } from "react";

// ── Operator Credentials ─────────────────────────────────────────────────────
export const OPERATOR_CREDENTIALS = [
  { id:"OPR-NR",  name:"Rajan Verma",    email:"operator.nr@railways.gov.in",  password:"NR@2025",  zone:"NR",  region:"North Railway",         shift:"Shift A" },
  { id:"OPR-SR",  name:"Meena Pillai",   email:"operator.sr@railways.gov.in",  password:"SR@2025",  zone:"SR",  region:"South Railway",         shift:"Shift B" },
  { id:"OPR-ER",  name:"Arnab Sen",      email:"operator.er@railways.gov.in",  password:"ER@2025",  zone:"ER",  region:"East Railway",          shift:"Shift A" },
  { id:"OPR-WR",  name:"Sunita Desai",   email:"operator.wr@railways.gov.in",  password:"WR@2025",  zone:"WR",  region:"West Railway",          shift:"Shift C" },
];

// ── Regional Admin Credentials ────────────────────────────────────────────────
// Each region has exactly one admin with a fixed email + password
export const ADMIN_CREDENTIALS = [
  { id:"ADM-NR",  name:"Rajesh Kumar",    email:"admin.nr@railways.gov.in",   password:"NR@2025",  zone:"NR",  region:"North Railway"          },
  { id:"ADM-SR",  name:"Kavitha Reddy",   email:"admin.sr@railways.gov.in",   password:"SR@2025",  zone:"SR",  region:"South Railway"          },
  { id:"ADM-ER",  name:"Subhash Ghosh",   email:"admin.er@railways.gov.in",   password:"ER@2025",  zone:"ER",  region:"East Railway"           },
  { id:"ADM-WR",  name:"Rohit Patel",     email:"admin.wr@railways.gov.in",   password:"WR@2025",  zone:"WR",  region:"West Railway"           },
  { id:"ADM-NER", name:"Biren Das",       email:"admin.ner@railways.gov.in",  password:"NER@2025", zone:"NER", region:"North East Railway"     },
  { id:"ADM-NWR", name:"Suresh Choudhary",email:"admin.nwr@railways.gov.in",  password:"NWR@2025", zone:"NWR", region:"North Western Railway"  },
  { id:"ADM-SER", name:"Prasad Murthy",   email:"admin.ser@railways.gov.in",  password:"SER@2025", zone:"SER", region:"South Eastern Railway"  },
  { id:"ADM-SWR", name:"Anitha Nair",     email:"admin.swr@railways.gov.in",  password:"SWR@2025", zone:"SWR", region:"South Western Railway"  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("rcc_admin")) || null; }
    catch { return null; }
  });

  const [operator, setOperator] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rcc_operator")) || null; }
    catch { return null; }
  });

  const login = (email, password) => {
    const e = email.trim().toLowerCase();
    const p = password.trim();
    console.log("[AUTH] Admin login attempt → email:", e, "| password:", p);
    const found = ADMIN_CREDENTIALS.find(a => a.email.toLowerCase() === e && a.password === p);
    console.log("[AUTH] Admin match found:", found ? found.id : "NONE");
    if (found) {
      const session = { id:found.id, name:found.name, email:found.email, zone:found.zone, region:found.region, role:"admin" };
      sessionStorage.setItem("rcc_admin", JSON.stringify(session));
      setAdmin(session);
      console.log("[AUTH] Admin session saved → navigating to /admin");
      return { success: true, admin: session };
    }
    console.error("[AUTH] Admin login FAILED — no matching credentials");
    return { success: false };
  };

  const loginOperator = (email, password) => {
    const e = email.trim().toLowerCase();
    const p = password.trim();
    console.log("[AUTH] Operator login attempt → email:", e, "| password:", p);
    const found = OPERATOR_CREDENTIALS.find(o => o.email.toLowerCase() === e && o.password === p);
    console.log("[AUTH] Operator match found:", found ? found.id : "NONE");
    if (found) {
      const session = { id:found.id, name:found.name, email:found.email, zone:found.zone, region:found.region, shift:found.shift, role:"operator" };
      localStorage.setItem("rcc_operator", JSON.stringify(session));
      setOperator(session);
      console.log("[AUTH] Operator session saved → navigating to /operator");
      return { success: true };
    }
    console.error("[AUTH] Operator login FAILED — no matching credentials");
    return { success: false };
  };

  const logout = () => {
    sessionStorage.removeItem("rcc_admin");
    setAdmin(null);
  };

  const logoutOperator = () => {
    localStorage.removeItem("rcc_operator");
    setOperator(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, operator, loginOperator, logoutOperator }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
