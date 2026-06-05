import { createContext, useContext, useState, useCallback } from "react";

// ── Static Admin Credentials (unchanged) ────────────────────────────────────
export const ADMIN_CREDENTIALS = [
  { id:"ADM-NR",  name:"Rajesh Kumar",     email:"admin.nr@railways.gov.in",  password:"NR@2025",  zone:"NR",  region:"North Railway"         },
  { id:"ADM-SR",  name:"Kavitha Reddy",    email:"admin.sr@railways.gov.in",  password:"SR@2025",  zone:"SR",  region:"South Railway"         },
  { id:"ADM-ER",  name:"Subhash Ghosh",    email:"admin.er@railways.gov.in",  password:"ER@2025",  zone:"ER",  region:"East Railway"          },
  { id:"ADM-WR",  name:"Rohit Patel",      email:"admin.wr@railways.gov.in",  password:"WR@2025",  zone:"WR",  region:"West Railway"          },
  { id:"ADM-NER", name:"Biren Das",        email:"admin.ner@railways.gov.in", password:"NER@2025", zone:"NER", region:"North East Railway"    },
  { id:"ADM-NWR", name:"Suresh Choudhary", email:"admin.nwr@railways.gov.in", password:"NWR@2025", zone:"NWR", region:"North Western Railway" },
  { id:"ADM-SER", name:"Prasad Murthy",    email:"admin.ser@railways.gov.in", password:"SER@2025", zone:"SER", region:"South Eastern Railway" },
  { id:"ADM-SWR", name:"Anitha Nair",      email:"admin.swr@railways.gov.in", password:"SWR@2025", zone:"SWR", region:"South Western Railway" },
];

// ── RBAC: all modules an operator can be granted/denied ──────────────────────
export const ALL_PERMISSIONS = [
  { key:"wagons",      label:"Assigned Wagons",  path:"/operator/wagons"      },
  { key:"tracking",    label:"Live Tracking",    path:"/operator/tracking"    },
  { key:"maintenance", label:"Maintenance",      path:"/operator/maintenance" },
  { key:"alerts",      label:"AI Alerts",        path:"/operator/alerts"      },
  { key:"cargo",       label:"Cargo Monitoring", path:"/operator/cargo"       },
  { key:"reports",     label:"Reports",          path:"/operator/reports"     },
];

const DEFAULT_PERMISSIONS = ALL_PERMISSIONS.map(p => p.key);

// ── Seed operator registry (pre-approved, active) ────────────────────────────
const SEED_OPERATORS = [
  {
    id:"OPR-NR", name:"Rajan Verma",   email:"operator.nr@railways.gov.in",
    password:"NR@2025", zone:"NR", region:"North Railway", shift:"Shift A",
    status:"Active", permissions:DEFAULT_PERMISSIONS,
    createdAt:"01 Jul 2025", lastLogin:"Today 08:30 AM",
    activityLog:[
      { action:"Logged in",             at:"Today 08:30 AM",  ip:"10.0.1.12"  },
      { action:"Viewed Live Tracking",  at:"Today 08:35 AM",  ip:"10.0.1.12"  },
      { action:"Resolved ALT-003",      at:"Today 09:10 AM",  ip:"10.0.1.12"  },
      { action:"Updated WGN-1042 status",at:"Today 09:45 AM", ip:"10.0.1.12"  },
    ],
  },
  {
    id:"OPR-SR", name:"Meena Pillai",  email:"operator.sr@railways.gov.in",
    password:"SR@2025", zone:"SR", region:"South Railway", shift:"Shift B",
    status:"Active", permissions:DEFAULT_PERMISSIONS,
    createdAt:"01 Jul 2025", lastLogin:"Today 07:50 AM",
    activityLog:[
      { action:"Logged in",             at:"Today 07:50 AM",  ip:"10.0.2.44"  },
      { action:"Downloaded RPT-D001",   at:"Today 08:05 AM",  ip:"10.0.2.44"  },
    ],
  },
  {
    id:"OPR-ER", name:"Arnab Sen",     email:"operator.er@railways.gov.in",
    password:"ER@2025", zone:"ER", region:"East Railway", shift:"Shift A",
    status:"Active", permissions:DEFAULT_PERMISSIONS,
    createdAt:"01 Jul 2025", lastLogin:"Yesterday 22:10 PM",
    activityLog:[
      { action:"Logged in",             at:"Yesterday 22:10 PM", ip:"10.0.3.7"   },
      { action:"Viewed Cargo",          at:"Yesterday 22:18 PM", ip:"10.0.3.7"   },
    ],
  },
  {
    id:"OPR-WR", name:"Sunita Desai",  email:"operator.wr@railways.gov.in",
    password:"WR@2025", zone:"WR", region:"West Railway", shift:"Shift C",
    status:"Inactive", permissions:["wagons","tracking","alerts"],
    createdAt:"28 Jun 2025", lastLogin:"3 days ago",
    activityLog:[
      { action:"Logged in",             at:"3 days ago",         ip:"10.0.4.19"  },
    ],
  },
];

// ── Pending access requests ──────────────────────────────────────────────────
const SEED_REQUESTS = [
  {
    id:"REQ-001", name:"Vikram Nair",    email:"vikram.n@railways.gov.in",
    zone:"NR", region:"North Railway", shift:"Shift B",
    requestedAt:"03 Jul 2025 10:15 AM", status:"Pending",
    note:"Requesting operator access for North Railway wagon monitoring.",
  },
  {
    id:"REQ-002", name:"Divya Krishnan", email:"divya.k@railways.gov.in",
    zone:"NR", region:"North Railway", shift:"Shift A",
    requestedAt:"02 Jul 2025 03:40 PM", status:"Pending",
    note:"Transfer from SR zone. Requires NR operator credentials.",
  },
  {
    id:"REQ-003", name:"Suresh Nambiar", email:"suresh.nb@railways.gov.in",
    zone:"SR", region:"South Railway", shift:"Shift C",
    requestedAt:"01 Jul 2025 09:00 AM", status:"Approved",
    note:"New hire — South Railway depot.",
  },
];

// ── Storage helpers ──────────────────────────────────────────────────────────
const STORE_KEY_OPS  = "rcc_rbac_operators";
const STORE_KEY_REQS = "rcc_rbac_requests";

function loadStore(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch { return seed; }
}
function saveStore(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// ── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  // Admin session (sessionStorage — clears on tab close)
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("rcc_admin")) || null; }
    catch { return null; }
  });

  // Operator session (localStorage — persists)
  const [operator, setOperator] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rcc_operator")) || null; }
    catch { return null; }
  });

  // RBAC registry
  const [operators, setOperators] = useState(() => loadStore(STORE_KEY_OPS,  SEED_OPERATORS));
  const [requests,  setRequests]  = useState(() => loadStore(STORE_KEY_REQS, SEED_REQUESTS));

  // Persist helpers
  const persistOps  = (data) => { setOperators(data);  saveStore(STORE_KEY_OPS,  data); };
  const persistReqs = (data) => { setRequests(data);   saveStore(STORE_KEY_REQS, data); };

  // ── Admin login ────────────────────────────────────────────────────────────
  const login = (email, password) => {
    const e = email.trim().toLowerCase();
    const p = password.trim();
    const found = ADMIN_CREDENTIALS.find(a => a.email.toLowerCase() === e && a.password === p);
    if (found) {
      const session = { id:found.id, name:found.name, email:found.email, zone:found.zone, region:found.region, role:"admin" };
      sessionStorage.setItem("rcc_admin", JSON.stringify(session));
      setAdmin(session);
      return { success:true, admin:session };
    }
    return { success:false };
  };

  // ── Operator login — checks live RBAC registry ─────────────────────────────
  const loginOperator = (email, password) => {
    const e = email.trim().toLowerCase();
    const p = password.trim();
    const found = operators.find(o => o.email.toLowerCase() === e && o.password === p);
    if (!found) return { success:false, reason:"invalid_credentials" };
    if (found.status !== "Active") return { success:false, reason:"account_inactive" };

    // Append login to activity log
    const now = new Date().toLocaleString("en-IN", { hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short" });
    const updated = operators.map(o =>
      o.id === found.id
        ? { ...o, lastLogin:"Just now", activityLog:[{ action:"Logged in", at:now, ip:"—" }, ...(o.activityLog||[]).slice(0,19)] }
        : o
    );
    persistOps(updated);

    const session = {
      id:found.id, name:found.name, email:found.email,
      zone:found.zone, region:found.region, shift:found.shift,
      role:"operator", permissions:found.permissions,
    };
    localStorage.setItem("rcc_operator", JSON.stringify(session));
    setOperator(session);
    return { success:true };
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = () => {
    sessionStorage.removeItem("rcc_admin");
    setAdmin(null);
  };

  const logoutOperator = () => {
    localStorage.removeItem("rcc_operator");
    setOperator(null);
  };

  // ── RBAC: permission check (used by operator pages) ────────────────────────
  const hasPermission = useCallback((moduleKey) => {
    if (!operator) return false;
    // Re-read live permissions from registry (in case admin changed them)
    const live = operators.find(o => o.id === operator.id);
    return live ? live.permissions.includes(moduleKey) : false;
  }, [operator, operators]);

  // ── Admin: create operator ─────────────────────────────────────────────────
  const adminCreateOperator = useCallback((form) => {
    const id = `OPR-${Date.now().toString(36).toUpperCase()}`;
    const newOp = {
      id,
      name:        form.name,
      email:       form.email,
      password:    form.password,
      zone:        form.zone,
      region:      form.region || `${form.zone} Railway`,
      shift:       form.shift || "Shift A",
      status:      "Active",
      permissions: form.permissions || DEFAULT_PERMISSIONS,
      createdAt:   new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
      lastLogin:   "Never",
      activityLog: [{ action:"Account created by admin", at:new Date().toLocaleTimeString("en-IN"), ip:"Admin" }],
    };
    const updated = [...operators, newOp];
    persistOps(updated);
    return newOp;
  }, [operators]);

  // ── Admin: update operator fields ─────────────────────────────────────────
  const adminUpdateOperator = useCallback((id, changes) => {
    const updated = operators.map(o => {
      if (o.id !== id) return o;
      const patched = { ...o, ...changes };
      // Log the change
      const entry = { action:`Admin updated: ${Object.keys(changes).join(", ")}`, at:new Date().toLocaleTimeString("en-IN"), ip:"Admin" };
      patched.activityLog = [entry, ...(o.activityLog||[]).slice(0,19)];
      return patched;
    });
    persistOps(updated);
    // If the logged-in operator was updated, refresh session permissions
    if (operator && changes.permissions) {
      const fresh = updated.find(o => o.id === operator.id);
      if (fresh) {
        const session = { ...operator, permissions:fresh.permissions };
        localStorage.setItem("rcc_operator", JSON.stringify(session));
        setOperator(session);
      }
    }
  }, [operators, operator]);

  // ── Admin: toggle operator active/inactive ─────────────────────────────────
  const adminToggleOperator = useCallback((id) => {
    const op = operators.find(o => o.id === id);
    if (!op) return;
    adminUpdateOperator(id, { status: op.status === "Active" ? "Inactive" : "Active" });
  }, [operators, adminUpdateOperator]);

  // ── Admin: reset operator password ────────────────────────────────────────
  const adminResetPassword = useCallback((id, newPassword) => {
    adminUpdateOperator(id, { password: newPassword });
  }, [adminUpdateOperator]);

  // ── Admin: approve/reject request ─────────────────────────────────────────
  const adminApproveRequest = useCallback((reqId, permissions = DEFAULT_PERMISSIONS) => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return;

    // Create operator account from request
    adminCreateOperator({
      name:        req.name,
      email:       req.email,
      password:    `${req.zone}@2025`,   // default password
      zone:        req.zone,
      region:      req.region,
      shift:       req.shift,
      permissions,
    });

    // Mark request approved
    const updatedReqs = requests.map(r => r.id === reqId ? { ...r, status:"Approved" } : r);
    persistReqs(updatedReqs);
  }, [requests, adminCreateOperator]);

  const adminRejectRequest = useCallback((reqId) => {
    const updatedReqs = requests.map(r => r.id === reqId ? { ...r, status:"Rejected" } : r);
    persistReqs(updatedReqs);
  }, [requests]);

  // ── Admin: delete operator ────────────────────────────────────────────────
  const adminDeleteOperator = useCallback((id) => {
    persistOps(operators.filter(o => o.id !== id));
  }, [operators]);

  // ── Public: submit operator access request ────────────────────────────────
  const submitAccessRequest = useCallback((data) => {
    const id = `REQ-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    const newReq = { id, status: "Pending", requestedAt: now, ...data };
    const updated = [...requests, newReq];
    persistReqs(updated);
  }, [requests]);

  // ── Admin: add activity log entry (operators call this for audit) ──────────
  const logActivity = useCallback((action) => {
    if (!operator) return;
    const now = new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
    const updated = operators.map(o =>
      o.id === operator.id
        ? { ...o, activityLog:[{ action, at:now, ip:"—" }, ...(o.activityLog||[]).slice(0,19)] }
        : o
    );
    persistOps(updated);
  }, [operator, operators]);

  return (
    <AuthContext.Provider value={{
      // Sessions
      admin, login, logout,
      operator, loginOperator, logoutOperator,
      // RBAC
      operators, requests, hasPermission,
      // Admin management
      adminCreateOperator, adminUpdateOperator, adminToggleOperator,
      adminResetPassword, adminApproveRequest, adminRejectRequest,
      adminDeleteOperator, logActivity, submitAccessRequest,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
