import { createContext, useContext, useState } from "react";

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

  const login = (email, password) => {
    const found = ADMIN_CREDENTIALS.find(
      a => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
    );
    if (found) {
      const session = { id:found.id, name:found.name, email:found.email, zone:found.zone, region:found.region, role:"Admin" };
      sessionStorage.setItem("rcc_admin", JSON.stringify(session));
      setAdmin(session);
      return { success: true, admin: session };
    }
    return { success: false };
  };

  const logout = () => {
    sessionStorage.removeItem("rcc_admin");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
