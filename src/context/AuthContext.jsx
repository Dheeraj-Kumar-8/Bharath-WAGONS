import { createContext, useContext, useState, useCallback } from "react";
import { isValidRailwayEmail, DOMAIN_ERROR } from "../utils/emailValidator";
import { generateActivationToken, verifyActivationToken } from "../utils/tokenService";
import { sendActivationEmail } from "../utils/emailService";

export const ANALYTICS_CREDENTIALS = [
  { id:"ANL-NR",  name:"Priya Sharma",      email:"analyst.nr@railway.gov.in",  password:"NR@2025",  zone:"NR",  region:"North Railway"         },
  { id:"ANL-SR",  name:"Kiran Babu",        email:"analyst.sr@railway.gov.in",  password:"SR@2025",  zone:"SR",  region:"South Railway"         },
  { id:"ANL-ER",  name:"Debashish Roy",     email:"analyst.er@railway.gov.in",  password:"ER@2025",  zone:"ER",  region:"East Railway"          },
  { id:"ANL-WR",  name:"Sneha Joshi",       email:"analyst.wr@railway.gov.in",  password:"WR@2025",  zone:"WR",  region:"West Railway"          },
  { id:"ANL-NER", name:"Biren Kalita",      email:"analyst.ner@railway.gov.in", password:"NER@2025", zone:"NER", region:"North East Railway"    },
  { id:"ANL-NWR", name:"Geeta Choudhary",   email:"analyst.nwr@railway.gov.in", password:"NWR@2025", zone:"NWR", region:"North Western Railway" },
  { id:"ANL-SER", name:"Tanmay Mohanty",    email:"analyst.ser@railway.gov.in", password:"SER@2025", zone:"SER", region:"South Eastern Railway" },
  { id:"ANL-SWR", name:"Lakshmi Venkat",    email:"analyst.swr@railway.gov.in", password:"SWR@2025", zone:"SWR", region:"South Western Railway" },
];

export const ADMIN_CREDENTIALS = [
  { id:"ADM-NR",  name:"Rajesh Kumar",     email:"admin.nr@railway.gov.in",  password:"NR@2025",  zone:"NR",  region:"North Railway"         },
  { id:"ADM-SR",  name:"Kavitha Reddy",    email:"admin.sr@railway.gov.in",  password:"SR@2025",  zone:"SR",  region:"South Railway"         },
  { id:"ADM-ER",  name:"Subhash Ghosh",    email:"admin.er@railway.gov.in",  password:"ER@2025",  zone:"ER",  region:"East Railway"          },
  { id:"ADM-WR",  name:"Rohit Patel",      email:"admin.wr@railway.gov.in",  password:"WR@2025",  zone:"WR",  region:"West Railway"          },
  { id:"ADM-NER", name:"Biren Das",        email:"admin.ner@railway.gov.in", password:"NER@2025", zone:"NER", region:"North East Railway"    },
  { id:"ADM-NWR", name:"Suresh Choudhary", email:"admin.nwr@railway.gov.in", password:"NWR@2025", zone:"NWR", region:"North Western Railway" },
  { id:"ADM-SER", name:"Prasad Murthy",    email:"admin.ser@railway.gov.in", password:"SER@2025", zone:"SER", region:"South Eastern Railway" },
  { id:"ADM-SWR", name:"Anitha Nair",      email:"admin.swr@railway.gov.in", password:"SWR@2025", zone:"SWR", region:"South Western Railway" },
];

export const ALL_PERMISSIONS = [
  { key:"wagons",      label:"Assigned Wagons",  path:"/operator/wagons"      },
  { key:"tracking",    label:"Live Tracking",    path:"/operator/tracking"    },
  { key:"maintenance", label:"Maintenance",      path:"/operator/maintenance" },
  { key:"alerts",      label:"AI Alerts",        path:"/operator/alerts"      },
  { key:"cargo",       label:"Cargo Monitoring", path:"/operator/cargo"       },
  { key:"reports",     label:"Reports",          path:"/operator/reports"     },
];

const DEFAULT_PERMISSIONS = ALL_PERMISSIONS.map(p => p.key);

const hashPassword = (pw) => btoa(unescape(encodeURIComponent(pw + ":rcc-salt-v1")));
const checkPassword = (pw, hash) => hashPassword(pw) === hash;

const genToken = () => {
  const arr = new Uint8Array(32);
  window.crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, "0")).join("");
};

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS    = 15 * 60 * 1000;

const SEED_OPERATORS = [
  {
    id:"OPR-NR", name:"Rajan Verma", email:"operator.nr@railway.gov.in",
    passwordHash: hashPassword("NR@2025"),
    zone:"NR", region:"North Railway", shift:"Shift A",
    status:"Active", accountStatus:"active", permissions:DEFAULT_PERMISSIONS,
    employeeId:"EMP-NR-001", department:"Operations", designation:"Senior Operator",
    createdAt:"01 Jul 2025", lastLogin:"Today 08:30 AM",
    failedAttempts:0, lockedUntil:null,
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    loginHistory:[{ at:"Today 08:30 AM", ip:"10.0.1.12", success:true }],
    activityLog:[{ action:"Logged in", at:"Today 08:30 AM", ip:"10.0.1.12" }],
  },
  {
    id:"OPR-SR", name:"Meena Pillai", email:"operator.sr@railway.gov.in",
    passwordHash: hashPassword("SR@2025"),
    zone:"SR", region:"South Railway", shift:"Shift B",
    status:"Active", accountStatus:"active", permissions:DEFAULT_PERMISSIONS,
    employeeId:"EMP-SR-001", department:"Operations", designation:"Operator",
    createdAt:"01 Jul 2025", lastLogin:"Today 07:50 AM",
    failedAttempts:0, lockedUntil:null,
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    loginHistory:[{ at:"Today 07:50 AM", ip:"10.0.2.44", success:true }],
    activityLog:[{ action:"Logged in", at:"Today 07:50 AM", ip:"10.0.2.44" }],
  },
  {
    id:"OPR-ER", name:"Arnab Sen", email:"operator.er@railway.gov.in",
    passwordHash: hashPassword("ER@2025"),
    zone:"ER", region:"East Railway", shift:"Shift A",
    status:"Active", accountStatus:"active", permissions:DEFAULT_PERMISSIONS,
    employeeId:"EMP-ER-001", department:"Logistics", designation:"Operator",
    createdAt:"01 Jul 2025", lastLogin:"Yesterday 22:10 PM",
    failedAttempts:0, lockedUntil:null,
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    loginHistory:[{ at:"Yesterday 22:10 PM", ip:"10.0.3.7", success:true }],
    activityLog:[{ action:"Logged in", at:"Yesterday 22:10 PM", ip:"10.0.3.7" }],
  },
  {
    id:"OPR-WR", name:"Sunita Desai", email:"operator.wr@railway.gov.in",
    passwordHash: hashPassword("WR@2025"),
    zone:"WR", region:"West Railway", shift:"Shift C",
    status:"Active", accountStatus:"active", permissions:DEFAULT_PERMISSIONS,
    employeeId:"EMP-WR-001", department:"Operations", designation:"Operator",
    createdAt:"28 Jun 2025", lastLogin:"Yesterday 14:20 PM",
    failedAttempts:0, lockedUntil:null,
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    loginHistory:[{ at:"Yesterday 14:20 PM", ip:"10.0.4.19", success:true }],
    activityLog:[{ action:"Logged in", at:"Yesterday 14:20 PM", ip:"10.0.4.19" }],
  },
  {
    id:"OPR-NER", name:"Bimal Chakraborty", email:"operator.ner@railway.gov.in",
    passwordHash: hashPassword("NER@2025"),
    zone:"NER", region:"North East Railway", shift:"Shift A",
    status:"Active", accountStatus:"active", permissions:DEFAULT_PERMISSIONS,
    employeeId:"EMP-NER-001", department:"Operations", designation:"Senior Operator",
    createdAt:"01 Jul 2025", lastLogin:"Today 09:00 AM",
    failedAttempts:0, lockedUntil:null,
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    loginHistory:[{ at:"Today 09:00 AM", ip:"10.0.5.31", success:true }],
    activityLog:[{ action:"Logged in", at:"Today 09:00 AM", ip:"10.0.5.31" }],
  },
  {
    id:"OPR-NWR", name:"Kavya Sharma", email:"operator.nwr@railway.gov.in",
    passwordHash: hashPassword("NWR@2025"),
    zone:"NWR", region:"North Western Railway", shift:"Shift B",
    status:"Active", accountStatus:"active", permissions:DEFAULT_PERMISSIONS,
    employeeId:"EMP-NWR-001", department:"Logistics", designation:"Operator",
    createdAt:"01 Jul 2025", lastLogin:"Today 10:15 AM",
    failedAttempts:0, lockedUntil:null,
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    loginHistory:[{ at:"Today 10:15 AM", ip:"10.0.6.55", success:true }],
    activityLog:[{ action:"Logged in", at:"Today 10:15 AM", ip:"10.0.6.55" }],
  },
  {
    id:"OPR-SER", name:"Prasanna Reddy", email:"operator.ser@railway.gov.in",
    passwordHash: hashPassword("SER@2025"),
    zone:"SER", region:"South Eastern Railway", shift:"Shift A",
    status:"Active", accountStatus:"active", permissions:DEFAULT_PERMISSIONS,
    employeeId:"EMP-SER-001", department:"Maintenance", designation:"Maintenance Operator",
    createdAt:"01 Jul 2025", lastLogin:"Today 08:00 AM",
    failedAttempts:0, lockedUntil:null,
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    loginHistory:[{ at:"Today 08:00 AM", ip:"10.0.7.22", success:true }],
    activityLog:[{ action:"Logged in", at:"Today 08:00 AM", ip:"10.0.7.22" }],
  },
  {
    id:"OPR-SWR", name:"Deepa Krishnamurthy", email:"operator.swr@railway.gov.in",
    passwordHash: hashPassword("SWR@2025"),
    zone:"SWR", region:"South Western Railway", shift:"Shift C",
    status:"Active", accountStatus:"active", permissions:DEFAULT_PERMISSIONS,
    employeeId:"EMP-SWR-001", department:"Cargo", designation:"Cargo Operator",
    createdAt:"01 Jul 2025", lastLogin:"Yesterday 20:30 PM",
    failedAttempts:0, lockedUntil:null,
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    loginHistory:[{ at:"Yesterday 20:30 PM", ip:"10.0.8.14", success:true }],
    activityLog:[{ action:"Logged in", at:"Yesterday 20:30 PM", ip:"10.0.8.14" }],
  },
];

const SEED_REQUESTS = [
  {
    id:"REQ-001", name:"Vikram Nair", email:"vikram.n@railway.gov.in",
    employeeId:"EMP-NR-042", department:"Operations", designation:"Senior Operator",
    zone:"NR", region:"North Railway", shift:"Shift B", role:"Operator",
    requestedAt:"03 Jul 2025 10:15 AM", status:"Pending",
    note:"Requesting operator access for North Railway wagon monitoring.",
  },
  {
    id:"REQ-002", name:"Divya Krishnan", email:"divya.k@railway.gov.in",
    employeeId:"EMP-NR-018", department:"Logistics", designation:"Analyst",
    zone:"NR", region:"North Railway", shift:"Shift A", role:"Analyst",
    requestedAt:"02 Jul 2025 03:40 PM", status:"Pending",
    note:"Requesting Analyst access for North Railway analytics dashboard.",
  },
  {
    id:"REQ-003", name:"Suresh Nambiar", email:"suresh.nb@railway.gov.in",
    employeeId:"EMP-SR-009", department:"Maintenance", designation:"Maintenance Operator",
    zone:"SR", region:"South Railway", shift:"Shift C", role:"Operator",
    requestedAt:"01 Jul 2025 09:00 AM", status:"Approved",
    note:"New hire — South Railway depot.",
  },
];

// v6 key — adds role field to requests seed; v7 adds encrypted tokens
const STORE_KEY_OPS      = "rcc_rbac_operators_v5";
const STORE_KEY_REQS     = "rcc_rbac_requests_v6";
const STORE_KEY_ANALYSTS = "rcc_rbac_analysts_v2";
const STORE_KEY_TOKENS   = "rcc_enc_tokens_v1";   // encrypted-token → accountId map

// ── Seed analysts (mirrors ANALYTICS_CREDENTIALS with full RBAC fields) ───────
const SEED_ANALYSTS = [
  {
    id:"ANL-NR",  name:"Priya Sharma",    email:"analyst.nr@railway.gov.in",
    passwordHash: hashPassword("NR@2025"),
    zone:"NR",  region:"North Railway",
    status:"Active", accountStatus:"active",
    employeeId:"EMP-ANL-NR-001",  department:"Analytics", designation:"Senior Analyst",
    createdAt:"01 Jul 2025", lastLogin:"Today 09:00 AM",
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    activityLog:[{ action:"Logged in", at:"Today 09:00 AM", ip:"—" }],
  },
  {
    id:"ANL-SR",  name:"Kiran Babu",      email:"analyst.sr@railway.gov.in",
    passwordHash: hashPassword("SR@2025"),
    zone:"SR",  region:"South Railway",
    status:"Active", accountStatus:"active",
    employeeId:"EMP-ANL-SR-001",  department:"Analytics", designation:"Analyst",
    createdAt:"01 Jul 2025", lastLogin:"Today 08:45 AM",
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    activityLog:[{ action:"Logged in", at:"Today 08:45 AM", ip:"—" }],
  },
  {
    id:"ANL-ER",  name:"Debashish Roy",   email:"analyst.er@railway.gov.in",
    passwordHash: hashPassword("ER@2025"),
    zone:"ER",  region:"East Railway",
    status:"Active", accountStatus:"active",
    employeeId:"EMP-ANL-ER-001",  department:"Analytics", designation:"Analyst",
    createdAt:"01 Jul 2025", lastLogin:"Yesterday 22:00 PM",
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    activityLog:[{ action:"Logged in", at:"Yesterday 22:00 PM", ip:"—" }],
  },
  {
    id:"ANL-WR",  name:"Sneha Joshi",     email:"analyst.wr@railway.gov.in",
    passwordHash: hashPassword("WR@2025"),
    zone:"WR",  region:"West Railway",
    status:"Active", accountStatus:"active",
    employeeId:"EMP-ANL-WR-001",  department:"Analytics", designation:"Analyst",
    createdAt:"01 Jul 2025", lastLogin:"Yesterday 14:30 PM",
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    activityLog:[{ action:"Logged in", at:"Yesterday 14:30 PM", ip:"—" }],
  },
  {
    id:"ANL-NER", name:"Biren Kalita",    email:"analyst.ner@railway.gov.in",
    passwordHash: hashPassword("NER@2025"),
    zone:"NER", region:"North East Railway",
    status:"Active", accountStatus:"active",
    employeeId:"EMP-ANL-NER-001", department:"Analytics", designation:"Analyst",
    createdAt:"01 Jul 2025", lastLogin:"Today 09:30 AM",
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    activityLog:[{ action:"Logged in", at:"Today 09:30 AM", ip:"—" }],
  },
  {
    id:"ANL-NWR", name:"Geeta Choudhary", email:"analyst.nwr@railway.gov.in",
    passwordHash: hashPassword("NWR@2025"),
    zone:"NWR", region:"North Western Railway",
    status:"Active", accountStatus:"active",
    employeeId:"EMP-ANL-NWR-001", department:"Analytics", designation:"Analyst",
    createdAt:"01 Jul 2025", lastLogin:"Today 10:00 AM",
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    activityLog:[{ action:"Logged in", at:"Today 10:00 AM", ip:"—" }],
  },
  {
    id:"ANL-SER", name:"Tanmay Mohanty",  email:"analyst.ser@railway.gov.in",
    passwordHash: hashPassword("SER@2025"),
    zone:"SER", region:"South Eastern Railway",
    status:"Active", accountStatus:"active",
    employeeId:"EMP-ANL-SER-001", department:"Analytics", designation:"Analyst",
    createdAt:"01 Jul 2025", lastLogin:"Today 08:15 AM",
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    activityLog:[{ action:"Logged in", at:"Today 08:15 AM", ip:"—" }],
  },
  {
    id:"ANL-SWR", name:"Lakshmi Venkat",  email:"analyst.swr@railway.gov.in",
    passwordHash: hashPassword("SWR@2025"),
    zone:"SWR", region:"South Western Railway",
    status:"Active", accountStatus:"active",
    employeeId:"EMP-ANL-SWR-001", department:"Analytics", designation:"Analyst",
    createdAt:"01 Jul 2025", lastLogin:"Yesterday 21:00 PM",
    activationToken:null, activationExpiry:null, activated:true,
    resetToken:null, resetExpiry:null,
    activityLog:[{ action:"Logged in", at:"Yesterday 21:00 PM", ip:"—" }],
  },
];

function loadStore(key, seed) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : seed;
  } catch { return seed; }
}
function saveStore(key, data) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
}

// Encrypted token registry: tokenString → { accountId, role }
function loadTokenRegistry() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY_TOKENS)) || {}; }
  catch { return {}; }
}
function saveTokenRegistry(reg) {
  try { localStorage.setItem(STORE_KEY_TOKENS, JSON.stringify(reg)); } catch {}
}

// Wipe all legacy keys so every browser gets a fresh seed on first load
(function migrateStorage() {
  try {
    [
      "rcc_rbac_operators",    "rcc_rbac_requests",
      "rcc_rbac_operators_v2", "rcc_rbac_requests_v2",
      "rcc_rbac_operators_v3", "rcc_rbac_requests_v3",
      "rcc_rbac_operators_v4", "rcc_rbac_requests_v4",
      "rcc_rbac_operators_v5", "rcc_rbac_requests_v5",
      "rcc_rbac_analysts_v1",
    ].forEach(k => localStorage.removeItem(k));

    // Also wipe v5 if any activated operator is missing passwordHash
    const raw = localStorage.getItem(STORE_KEY_OPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.some(o => o.activated && !o.passwordHash)) {
        localStorage.removeItem(STORE_KEY_OPS);
      }
    }
  } catch { /* ignore */ }
})();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("rcc_admin")) || null; }
    catch { return null; }
  });

  const [analyst, setAnalyst] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem("rcc_analyst")) || null; }
    catch { return null; }
  });

  const [operator, setOperator] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rcc_operator")) || null; }
    catch { return null; }
  });

  const [operators,     setOperators]     = useState(() => loadStore(STORE_KEY_OPS,      SEED_OPERATORS));
  const [requests,      setRequests]      = useState(() => loadStore(STORE_KEY_REQS,     SEED_REQUESTS));
  const [analystUsers,  setAnalystUsers]  = useState(() => loadStore(STORE_KEY_ANALYSTS, SEED_ANALYSTS));

  const persistOps      = (data) => { setOperators(data);    saveStore(STORE_KEY_OPS,      data); };
  const persistReqs     = (data) => { setRequests(data);     saveStore(STORE_KEY_REQS,     data); };
  const persistAnalysts = (data) => { setAnalystUsers(data); saveStore(STORE_KEY_ANALYSTS, data); };

  // Analytics login — local credential check
  const loginAnalyst = useCallback((email, password) => {
    const e = email.trim().toLowerCase();
    const p = password.trim();
    if (!isValidRailwayEmail(e)) return { success:false, reason:"invalid_domain" };
    const found = ANALYTICS_CREDENTIALS.find(a => a.email.toLowerCase() === e);
    if (!found || found.password !== p) return { success:false, reason:"invalid_credentials" };
    const session = { name:found.name, email:e, zone:found.zone, role:"analyst" };
    sessionStorage.setItem("rcc_analyst", JSON.stringify(session));
    setAnalyst(session);
    return { success:true };
  }, []);

  const logoutAnalyst = () => {
    sessionStorage.removeItem("rcc_analyst");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAnalyst(null);
  };

  // Admin login — local credential check
  const login = (email, password) => {
    const e = email.trim().toLowerCase();
    const p = password.trim();
    if (!isValidRailwayEmail(e)) return { success:false, reason:"invalid_domain" };
    const found = ADMIN_CREDENTIALS.find(a => a.email.toLowerCase() === e);
    if (!found || found.password !== p) return { success:false };
    const session = { name:found.name, email:e, zone:found.zone, role:"admin" };
    sessionStorage.setItem("rcc_admin", JSON.stringify(session));
    setAdmin(session);
    return { success:true, admin:session };
  };

  // Operator login
  const loginOperator = useCallback((email, password) => {
    const e = email.trim().toLowerCase();
    const p = password.trim();
    if (!isValidRailwayEmail(e)) return { success:false, reason:"invalid_domain" };
    const found = operators.find(o => o.email.toLowerCase() === e);

    if (!found) return { success:false, reason:"invalid_credentials" };

    if (found.accountStatus === "suspended")         return { success:false, reason:"account_suspended" };
    if (found.accountStatus === "deactivated")       return { success:false, reason:"account_deactivated" };
    if (found.accountStatus === "pending_activation") return { success:false, reason:"not_activated" };

    if (found.lockedUntil && Date.now() < found.lockedUntil) {
      const mins = Math.ceil((found.lockedUntil - Date.now()) / 60000);
      return { success:false, reason:"account_locked", lockMins: mins };
    }

    const validPassword = checkPassword(p, found.passwordHash);
    const now = new Date().toLocaleString("en-IN", { hour:"2-digit", minute:"2-digit", day:"2-digit", month:"short" });

    if (!validPassword) {
      const attempts = (found.failedAttempts || 0) + 1;
      const locked   = attempts >= MAX_FAILED_ATTEMPTS;
      const updated  = operators.map(o => o.id === found.id ? {
        ...o,
        failedAttempts: locked ? 0 : attempts,
        lockedUntil:    locked ? Date.now() + LOCK_DURATION_MS : null,
        loginHistory: [{ at:now, ip:"—", success:false }, ...(o.loginHistory||[]).slice(0,19)],
      } : o);
      persistOps(updated);
      if (locked) return { success:false, reason:"account_locked", lockMins: 15 };
      return { success:false, reason:"invalid_credentials", attemptsLeft: MAX_FAILED_ATTEMPTS - attempts };
    }

    if (found.status !== "Active") return { success:false, reason:"account_inactive" };

    const updated = operators.map(o => o.id === found.id ? {
      ...o,
      failedAttempts: 0, lockedUntil: null, lastLogin: "Just now",
      loginHistory: [{ at:now, ip:"—", success:true }, ...(o.loginHistory||[]).slice(0,19)],
      activityLog:  [{ action:"Logged in", at:now, ip:"—" }, ...(o.activityLog||[]).slice(0,19)],
    } : o);
    persistOps(updated);

    const session = {
      id:found.id, name:found.name, email:found.email,
      zone:found.zone, region:found.region, shift:found.shift,
      role:"operator", permissions:found.permissions,
      employeeId:found.employeeId, department:found.department, designation:found.designation,
    };
    localStorage.setItem("rcc_operator", JSON.stringify(session));
    setOperator(session);
    return { success:true };
  }, [operators]);

  const logout = () => {
    sessionStorage.removeItem("rcc_admin");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAdmin(null);
  };

  const logoutOperator = () => {
    localStorage.removeItem("rcc_operator");
    setOperator(null);
  };

  const hasPermission = useCallback((moduleKey) => {
    if (!operator) return false;
    const live = operators.find(o => o.id === operator.id);
    return live ? live.permissions.includes(moduleKey) : false;
  }, [operator, operators]);

  // Expose token registry lookup for ActivatePage
  const getAccountByEncryptedToken = useCallback((token) => {
    const reg = loadTokenRegistry();
    return reg[token] || null;
  }, []);

  // Unified activateAccount — handles both Operator and Analyst
  // Single-use enforcement: token is deleted from the registry as the FIRST
  // operation so a second concurrent request finds nothing even before the
  // account record is written.
  const activateEncryptedAccount = useCallback(async (encToken, password) => {
    const { valid, payload, reason } = await verifyActivationToken(encToken);
    if (!valid) return { success: false, reason: reason || "already_used" };

    // ── Atomically consume the token FIRST ───────────────────────────────────
    const reg = loadTokenRegistry();
    const entry = reg[encToken];
    if (!entry) return { success: false, reason: "already_used" };
    delete reg[encToken];          // mark consumed before any further writes
    saveTokenRegistry(reg);
    // ─────────────────────────────────────────────────────────────────────────

    const now = new Date().toLocaleTimeString("en-IN");

    if (payload.role === "Analyst") {
      const a = analystUsers.find(x => x.id === entry.accountId);
      if (!a || a.activated) {
        // Token was consumed above — do not re-insert, account is already active
        return { success: false, reason: "already_used" };
      }
      persistAnalysts(analystUsers.map(x => x.id === a.id ? {
        ...x,
        passwordHash:     hashPassword(password),
        status:           "Active",
        accountStatus:    "active",
        activated:        true,
        activationToken:  null,
        activationExpiry: null,
        activityLog: [{ action: "Account activated via secure link — link invalidated", at: now, ip: "—" }, ...(x.activityLog || []).slice(0, 19)],
      } : x));
      return { success: true, name: a.name, role: "Analyst" };
    }

    // Operator
    const op = operators.find(o => o.id === entry.accountId);
    if (!op || op.activated) {
      return { success: false, reason: "already_used" };
    }
    persistOps(operators.map(o => o.id === op.id ? {
      ...o,
      passwordHash:     hashPassword(password),
      status:           "Active",
      accountStatus:    "active",
      activated:        true,
      activationToken:  null,
      activationExpiry: null,
      activityLog: [{ action: "Account activated via secure link — link invalidated", at: now, ip: "—" }, ...(o.activityLog || []).slice(0, 19)],
    } : o));
    return { success: true, name: op.name, role: "Operator" };
  }, [analystUsers, operators]);

  const adminCreateOperator = useCallback((form) => {
    if (!isValidRailwayEmail(form.email)) return { error: DOMAIN_ERROR };
    const id    = `OPR-${Date.now().toString(36).toUpperCase()}`;
    const token = genToken();
    const expiry= Date.now() + 72 * 60 * 60 * 1000;
    const newOp = {
      id, name:form.name, email:form.email,
      passwordHash: null,
      zone:form.zone, region:form.region || `${form.zone} Railway`,
      shift:form.shift || "Shift A",
      status:"Inactive", accountStatus:"pending_activation",
      permissions:form.permissions || DEFAULT_PERMISSIONS,
      employeeId:form.employeeId||"", department:form.department||"", designation:form.designation||"",
      createdAt:new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
      lastLogin:"Never", failedAttempts:0, lockedUntil:null,
      activationToken:token, activationExpiry:expiry, activated:false,
      resetToken:null, resetExpiry:null,
      loginHistory:[],
      activityLog:[{ action:"Account created by admin", at:new Date().toLocaleTimeString("en-IN"), ip:"Admin" }],
    };
    const updated = [...operators, newOp];
    persistOps(updated);
    return { ...newOp, activationLink:`${window.location.origin}/activate/${token}` };
  }, [operators]);

  const activateAccount = useCallback((token, password) => {
    const op = operators.find(o => o.activationToken === token);
    // Token not found OR already consumed (null) means already used
    if (!op) return { success:false, reason:"already_used" };
    if (Date.now() > op.activationExpiry) return { success:false, reason:"already_used" };
    if (op.activated) return { success:false, reason:"already_used" };
    const now = new Date().toLocaleTimeString("en-IN");
    // Null out the token FIRST in the same update batch to prevent reuse
    const updated = operators.map(o => o.id === op.id ? {
      ...o,
      passwordHash:     hashPassword(password),
      status:           "Active",
      accountStatus:    "active",
      activated:        true,
      activationToken:  null,   // immediately invalidated
      activationExpiry: null,
      activityLog:[{ action:"Account activated via secure link — link invalidated", at:now, ip:"—" }, ...(o.activityLog||[]).slice(0,19)],
    } : o);
    persistOps(updated);
    return { success:true, name:op.name, role:"Operator" };
  }, [operators]);

  const requestPasswordReset = useCallback((email) => {
    const op = operators.find(o => o.email.toLowerCase() === email.trim().toLowerCase());
    if (!op) return { success:true };
    const token  = genToken();
    const expiry = Date.now() + 60 * 60 * 1000;
    const updated = operators.map(o => o.id === op.id ? { ...o, resetToken:token, resetExpiry:expiry } : o);
    persistOps(updated);
    return { success:true, resetLink:`${window.location.origin}/reset-password/${token}`, name:op.name };
  }, [operators]);

  const resetPasswordWithToken = useCallback((token, newPassword) => {
    const op = operators.find(o => o.resetToken === token);
    if (!op) return { success:false, reason:"invalid_token" };
    if (Date.now() > op.resetExpiry) return { success:false, reason:"token_expired" };
    const now = new Date().toLocaleTimeString("en-IN");
    const updated = operators.map(o => o.id === op.id ? {
      ...o,
      passwordHash:hashPassword(newPassword),
      resetToken:null, resetExpiry:null, failedAttempts:0, lockedUntil:null,
      activityLog:[{ action:"Password reset via secure link", at:now, ip:"—" }, ...(o.activityLog||[]).slice(0,19)],
    } : o);
    persistOps(updated);
    return { success:true };
  }, [operators]);

  const adminUpdateOperator = useCallback((id, changes) => {
    const updated = operators.map(o => {
      if (o.id !== id) return o;
      const patched = { ...o, ...changes };
      patched.activityLog = [
        { action:`Admin updated: ${Object.keys(changes).join(", ")}`, at:new Date().toLocaleTimeString("en-IN"), ip:"Admin" },
        ...(o.activityLog||[]).slice(0,19),
      ];
      return patched;
    });
    persistOps(updated);
    if (operator && changes.permissions) {
      const fresh = updated.find(o => o.id === operator.id);
      if (fresh) {
        const session = { ...operator, permissions:fresh.permissions };
        localStorage.setItem("rcc_operator", JSON.stringify(session));
        setOperator(session);
      }
    }
  }, [operators, operator]);

  const adminToggleOperator = useCallback((id) => {
    const op = operators.find(o => o.id === id);
    if (!op) return;
    const isActive = op.status === "Active";
    adminUpdateOperator(id, { status:isActive?"Inactive":"Active", accountStatus:isActive?"suspended":"active" });
  }, [operators, adminUpdateOperator]);

  const adminSuspendOperator    = useCallback((id) => { adminUpdateOperator(id, { status:"Inactive", accountStatus:"suspended" }); },   [adminUpdateOperator]);
  const adminDeactivateOperator = useCallback((id) => { adminUpdateOperator(id, { status:"Inactive", accountStatus:"deactivated" }); }, [adminUpdateOperator]);
  const adminReactivateOperator = useCallback((id) => { adminUpdateOperator(id, { status:"Active",   accountStatus:"active", failedAttempts:0, lockedUntil:null }); }, [adminUpdateOperator]);
  const adminUnlockOperator     = useCallback((id) => { adminUpdateOperator(id, { failedAttempts:0, lockedUntil:null }); }, [adminUpdateOperator]);

  const adminResetPassword = useCallback((id) => {
    const op = operators.find(o => o.id === id);
    if (!op) return { resetLink:"" };
    const token  = genToken();
    const expiry = Date.now() + 60 * 60 * 1000;
    const now    = new Date().toLocaleTimeString("en-IN");
    const updated = operators.map(o => o.id === id ? {
      ...o, resetToken:token, resetExpiry:expiry,
      activityLog:[{ action:"Admin triggered password reset", at:now, ip:"Admin" }, ...(o.activityLog||[]).slice(0,19)],
    } : o);
    persistOps(updated);
    return { resetLink:`${window.location.origin}/reset-password/${token}`, name:op.name };
  }, [operators]);

  const adminDeleteOperator = useCallback((id) => {
    persistOps(operators.filter(o => o.id !== id));
  }, [operators]);

  // Returns a Promise — generates encrypted token then dispatches email
  // Note: adminCreateAnalyst is used here by accessing analystUsers/persistAnalysts directly
  // to avoid a forward-reference dependency cycle with useCallback.
  const adminApproveRequest = useCallback(async (reqId, permissions = DEFAULT_PERMISSIONS, adminName = "Zone Admin") => {
    const req = requests.find(r => r.id === reqId);
    if (!req) return { activationLink: "" };

    const now = new Date().toLocaleTimeString("en-IN");

    if (req.role === "Analyst") {
      if (!isValidRailwayEmail(req.email)) return { activationLink: "" };
      const id    = `ANL-${Date.now().toString(36).toUpperCase()}`;
      const newA = {
        id, name: req.name, email: req.email,
        passwordHash: null,
        zone: req.zone, region: req.region || `${req.zone} Railway`,
        status: "Inactive", accountStatus: "pending_activation",
        employeeId: req.employeeId || "", department: req.department || "Analytics", designation: req.designation || "",
        createdAt: new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
        lastLogin: "Never",
        activationToken: null, activationExpiry: null, activated: false,
        resetToken: null, resetExpiry: null,
        activityLog: [{ action: "Analyst account created via access request approval", at: now, ip: "Admin" }],
      };
      const updatedAnalysts = [...analystUsers, newA];
      persistAnalysts(updatedAnalysts);

      const encToken = await generateActivationToken({ email: req.email, role: "Analyst", accountId: id });
      const activationLink = `${window.location.origin}/activate/${encodeURIComponent(encToken)}`;

      const reg = loadTokenRegistry();
      reg[encToken] = { accountId: id, role: "Analyst" };
      saveTokenRegistry(reg);

      persistAnalysts(updatedAnalysts.map(a => a.id === id
        ? { ...a, activationToken: encToken,
            activityLog: [{ action: `Approved by ${adminName} — activation email dispatched`, at: now, ip: "Admin" }, ...a.activityLog.slice(0, 19)] }
        : a
      ));

      persistReqs(requests.map(r => r.id === reqId
        ? { ...r, status: "Approved", approvedBy: adminName, approvedAt: now,
            auditLog: [{ action:`Approved by ${adminName} — activation email dispatched to ${req.email}`, at:now, by:adminName }, ...(r.auditLog||[])] }
        : r
      ));

      sendActivationEmail({ to: req.email, name: req.name, role: "Analyst", zone: req.zone, activationLink, approvedBy: adminName });
      return { activationLink, name: req.name };
    }

    // Operator path
    const result = adminCreateOperator({
      name: req.name, email: req.email, zone: req.zone, region: req.region,
      shift: req.shift, permissions, employeeId: req.employeeId || "",
      department: req.department || "", designation: req.designation || "",
    });

    const encToken = await generateActivationToken({ email: req.email, role: "Operator", accountId: result.id });
    const activationLink = `${window.location.origin}/activate/${encodeURIComponent(encToken)}`;

    const reg = loadTokenRegistry();
    reg[encToken] = { accountId: result.id, role: "Operator" };
    saveTokenRegistry(reg);

    persistOps(operators.map(o => o.id === result.id
      ? { ...o, activationToken: encToken,
          activityLog: [{ action: `Approved by ${adminName} — activation email dispatched`, at: now, ip: "Admin" }, ...(o.activityLog || []).slice(0, 19)] }
      : o
    ));

    persistReqs(requests.map(r => r.id === reqId
      ? { ...r, status: "Approved", approvedBy: adminName, approvedAt: now,
          auditLog: [{ action:`Approved by ${adminName} — activation email dispatched to ${req.email}`, at:now, by:adminName }, ...(r.auditLog||[])] }
      : r
    ));

    sendActivationEmail({ to: req.email, name: req.name, role: "Operator", zone: req.zone, activationLink, approvedBy: adminName });
    return { activationLink, name: req.name };
  }, [requests, adminCreateOperator, operators, analystUsers]);

  const adminRejectRequest = useCallback((reqId, adminName = "Zone Admin") => {
    const now = new Date().toLocaleTimeString("en-IN");
    persistReqs(requests.map(r => r.id === reqId ? {
      ...r,
      status:     "Rejected",
      rejectedBy: adminName,
      rejectedAt: now,
      auditLog: [
        { action:`Request rejected by ${adminName}`, at:now, by:adminName },
        ...(r.auditLog || []),
      ],
    } : r));
  }, [requests]);

  const adminResendActivation = useCallback(async (id) => {
    const op = operators.find(o => o.id === id);
    if (!op) return { activationLink:"" };
    const now = new Date().toLocaleTimeString("en-IN");

    // Purge any previous token for this account from the registry
    const reg = loadTokenRegistry();
    Object.keys(reg).forEach(k => { if (reg[k].accountId === id) delete reg[k]; });

    const encToken = await generateActivationToken({ email: op.email, role: "Operator", accountId: id });
    reg[encToken] = { accountId: id, role: "Operator" };
    saveTokenRegistry(reg);

    const updated = operators.map(o => o.id === id ? {
      ...o,
      activationToken:  encToken,
      activationExpiry: Date.now() + 72 * 60 * 60 * 1000,
      activityLog:[{ action:"New activation link issued by admin — previous link invalidated", at:now, ip:"Admin" }, ...(o.activityLog||[]).slice(0,19)],
    } : o);
    persistOps(updated);
    return { activationLink:`${window.location.origin}/activate/${encodeURIComponent(encToken)}` };
  }, [operators]);

  const submitAccessRequest = useCallback((data) => {
    if (!isValidRailwayEmail(data.email)) return { success:false, reason:"invalid_domain" };
    const id  = `REQ-${Date.now().toString(36).toUpperCase()}`;
    const now = new Date().toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
    const entry = {
      id, status:"Pending", requestedAt:now, ...data,
      auditLog:[
        { action:`Access request submitted for role: ${data.role || "Operator"}`, at:now, by:data.email },
      ],
    };
    persistReqs([...requests, entry]);
    return { success:true };
  }, [requests]);

  const logActivity = useCallback((action) => {
    if (!operator) return;
    const now = new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
    persistOps(operators.map(o => o.id === operator.id
      ? { ...o, activityLog:[{ action, at:now, ip:"—" }, ...(o.activityLog||[]).slice(0,19)] }
      : o
    ));
  }, [operator, operators]);

  const getOperatorByActivationToken = useCallback((token) => operators.find(o => o.activationToken === token) || null, [operators]);
  const getOperatorByResetToken      = useCallback((token) => operators.find(o => o.resetToken === token) || null,      [operators]);

  // ── Analyst management (admin-only, mirrors operator pattern) ────────────
  const adminCreateAnalyst = useCallback((form) => {
    // When called directly (not via approval flow), still generates a plain token
    // The approval flow replaces it with an encrypted one after this returns.
    if (!isValidRailwayEmail(form.email)) return { error: DOMAIN_ERROR };
    const id    = `ANL-${Date.now().toString(36).toUpperCase()}`;
    const token = genToken();
    const expiry = Date.now() + 72 * 60 * 60 * 1000;
    const newA = {
      id, name:form.name, email:form.email,
      passwordHash: null,
      zone:form.zone, region:form.region || `${form.zone} Railway`,
      status:"Inactive", accountStatus:"pending_activation",
      employeeId:form.employeeId||"", department:form.department||"Analytics", designation:form.designation||"",
      createdAt:new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
      lastLogin:"Never",
      activationToken:token, activationExpiry:expiry, activated:false,
      resetToken:null, resetExpiry:null,
      activityLog:[{ action:"Analyst account created by admin", at:new Date().toLocaleTimeString("en-IN"), ip:"Admin" }],
    };
    persistAnalysts([...analystUsers, newA]);
    return { ...newA, activationLink: `${window.location.origin}/activate/${encodeURIComponent(token)}` };
  }, [analystUsers]);

  const adminUpdateAnalyst = useCallback((id, changes) => {
    persistAnalysts(analystUsers.map(a => {
      if (a.id !== id) return a;
      return {
        ...a, ...changes,
        activityLog:[
          { action:`Admin updated: ${Object.keys(changes).join(", ")}`, at:new Date().toLocaleTimeString("en-IN"), ip:"Admin" },
          ...(a.activityLog||[]).slice(0,19),
        ],
      };
    }));
  }, [analystUsers]);

  const adminDeleteAnalyst      = useCallback((id) => { persistAnalysts(analystUsers.filter(a => a.id !== id)); }, [analystUsers]);
  const adminSuspendAnalyst     = useCallback((id) => { adminUpdateAnalyst(id, { status:"Inactive", accountStatus:"suspended" }); },   [adminUpdateAnalyst]);
  const adminDeactivateAnalyst  = useCallback((id) => { adminUpdateAnalyst(id, { status:"Inactive", accountStatus:"deactivated" }); }, [adminUpdateAnalyst]);
  const adminReactivateAnalyst  = useCallback((id) => { adminUpdateAnalyst(id, { status:"Active",   accountStatus:"active" }); },      [adminUpdateAnalyst]);

  const adminResetAnalystPassword = useCallback((id) => {
    const a = analystUsers.find(x => x.id === id);
    if (!a) return { resetLink:"" };
    const token  = genToken();
    const expiry = Date.now() + 60 * 60 * 1000;
    const now    = new Date().toLocaleTimeString("en-IN");
    persistAnalysts(analystUsers.map(x => x.id === id ? {
      ...x, resetToken:token, resetExpiry:expiry,
      activityLog:[{ action:"Admin triggered password reset", at:now, ip:"Admin" }, ...(x.activityLog||[]).slice(0,19)],
    } : x));
    return { resetLink:`${window.location.origin}/reset-password/${token}`, name:a.name };
  }, [analystUsers]);

  const adminResendAnalystActivation = useCallback(async (id) => {
    const a = analystUsers.find(x => x.id === id);
    if (!a) return { activationLink:"" };
    const now = new Date().toLocaleTimeString("en-IN");

    // Purge any previous token for this analyst from the registry
    const reg = loadTokenRegistry();
    Object.keys(reg).forEach(k => { if (reg[k].accountId === id) delete reg[k]; });

    const encToken = await generateActivationToken({ email: a.email, role: "Analyst", accountId: id });
    reg[encToken] = { accountId: id, role: "Analyst" };
    saveTokenRegistry(reg);

    persistAnalysts(analystUsers.map(x => x.id === id ? {
      ...x,
      activationToken:  encToken,
      activationExpiry: Date.now() + 72 * 60 * 60 * 1000,
      activityLog:[{ action:"New activation link issued by admin — previous link invalidated", at:now, ip:"Admin" }, ...(x.activityLog||[]).slice(0,19)],
    } : x));
    return { activationLink:`${window.location.origin}/activate/${encodeURIComponent(encToken)}` };
  }, [analystUsers]);

  return (
    <AuthContext.Provider value={{
      admin, login, logout,
      analyst, loginAnalyst, logoutAnalyst,
      operator, loginOperator, logoutOperator,
      operators, requests, hasPermission,
      activateAccount,
      requestPasswordReset, resetPasswordWithToken,
      getOperatorByActivationToken, getOperatorByResetToken,
      adminCreateOperator, adminUpdateOperator,
      adminToggleOperator, adminSuspendOperator,
      adminDeactivateOperator, adminReactivateOperator,
      adminUnlockOperator,
      adminResetPassword, adminApproveRequest,
      adminRejectRequest, adminDeleteOperator,
      adminResendActivation,
      logActivity, submitAccessRequest,
      // Encrypted activation
      getAccountByEncryptedToken, activateEncryptedAccount,
      // Analyst management
      analystUsers,
      adminCreateAnalyst, adminUpdateAnalyst, adminDeleteAnalyst,
      adminSuspendAnalyst, adminDeactivateAnalyst, adminReactivateAnalyst,
      adminResetAnalystPassword, adminResendAnalystActivation,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
