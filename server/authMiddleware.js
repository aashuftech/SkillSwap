import jwt from "jsonwebtoken";
import User from "./models/User.js";

export const adminEmails = () =>
  (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

export const isAdminEmail = (email) => adminEmails().includes(String(email || "").trim().toLowerCase());

// The ONLY place a user's role is decided. Never read from a stored DB/JWT
// field for this decision — that field can drift (stale test data, a
// changed ADMIN_EMAILS, etc.). Whoever's email is in ADMIN_EMAILS right now
// is the admin; everyone else is a normal user, full stop.
export const roleForEmail = (email) => (isAdminEmail(email) ? "ADMIN" : "USER");

// Verifies the JWT AND re-checks the account against the database on every
// request: catches a banned account immediately (not just at login) and
// never trusts a role claim baked into an old token.
export async function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ success: false, message: "Login required." });

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }

  try {
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ success: false, message: "Account no longer exists." });
    if (user.banned) {
      return res.status(403).json({ success: false, code: "BANNED", message: "This account has been banned." });
    }

    req.auth = { sub: user._id.toString(), email: user.email, role: roleForEmail(user.email) };
    req.sessionUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
}

export function optionalAuth(req, _res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.auth = { sub: payload.sub, email: payload.email, role: roleForEmail(payload.email) };
    } catch {
      req.auth = null;
    }
  }
  return next();
}

// req.auth.role was just re-derived from the live ADMIN_EMAILS list above
// (via `auth`), so this only needs to check it — but it re-checks the
// email membership too, defense in depth against any future change to auth().
export function adminOnly(req, res, next) {
  if (req.auth?.role !== "ADMIN" || !isAdminEmail(req.auth?.email)) {
    return res.status(403).json({ success: false, message: "Admin access required." });
  }
  return next();
}
