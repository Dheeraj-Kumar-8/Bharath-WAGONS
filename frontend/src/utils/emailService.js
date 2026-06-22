// ── Simulated Email Service ───────────────────────────────────────────────────
// In production this would call an SMTP / SES API.
// Here we log to localStorage for audit visibility and console for dev inspection.

const EMAIL_LOG_KEY = "rcc_email_audit_log";

function loadLog() {
  try { return JSON.parse(localStorage.getItem(EMAIL_LOG_KEY)) || []; }
  catch { return []; }
}
function saveLog(log) {
  try { localStorage.setItem(EMAIL_LOG_KEY, JSON.stringify(log.slice(0, 200))); } catch {}
}

function logEmail(entry) {
  const log = loadLog();
  log.unshift({ ...entry, sentAt: new Date().toLocaleString("en-IN") });
  saveLog(log);
  // Dev visibility
  console.info(`[EmailService] ${entry.type} → ${entry.to}`, entry);
}

/**
 * Send activation email after admin approval.
 * @param {object} opts
 * @param {string} opts.to         - recipient @railway.gov.in address
 * @param {string} opts.name       - recipient full name
 * @param {string} opts.role       - "Operator" | "Analyst"
 * @param {string} opts.zone       - zone code
 * @param {string} opts.activationLink - full URL with encrypted token
 * @param {string} opts.approvedBy - admin name who approved
 */
export function sendActivationEmail({ to, name, role, zone, activationLink, approvedBy }) {
  const subject = `[Railway Command Centre] Your ${role} access has been approved`;
  const body = [
    `Dear ${name},`,
    ``,
    `Your access request for the Railway Command Centre has been approved by ${approvedBy} (Zone ${zone} Admin).`,
    ``,
    `Role granted: ${role}`,
    ``,
    `To activate your account and set your own password, click the secure link below:`,
    ``,
    activationLink,
    ``,
    `This link is:`,
    `  • Unique to your registered email address (${to})`,
    `  • Encrypted and tamper-proof`,
    `  • Valid for 72 hours only`,
    `  • Single-use — it will expire immediately after activation`,
    ``,
    `DO NOT share this link with anyone. Railway IT will never ask for this link.`,
    ``,
    `If you did not request this access, please contact your Zone Admin immediately.`,
    ``,
    `— Railway Command Centre Security System`,
  ].join("\n");

  logEmail({
    type:          "ACTIVATION",
    to,
    subject,
    body,
    role,
    zone,
    approvedBy,
    activationLink,
  });

  // Simulated delivery confirmation (replace with real API call in production)
  return { delivered: true, to, subject };
}

/**
 * Retrieve the email audit log (for admin visibility / debugging).
 */
export function getEmailAuditLog() {
  return loadLog();
}
