import { readSessionsDb, readUsersDb } from "../lib/storage.js";
import { sanitizeUser } from "../lib/auth.js";

export async function requireAuth(req, res, next) {
  try {
    const authHeader = String(req.headers.authorization || "");
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";

    if (!token) {
      return res.status(401).json({ ok: false, message: "Authentication required." });
    }

    const sessionsDb = await readSessionsDb();
    const session = sessionsDb.sessions.find((item) => item.token === token);

    if (!session) {
      return res.status(401).json({ ok: false, message: "Invalid session." });
    }

    if (session.expires_at && Date.now() > session.expires_at) {
      return res.status(401).json({ ok: false, message: "Session expired." });
    }

     const usersDb = await readUsersDb();
    const user = usersDb.users.find((item) => item.id === session.user_id);

    if (!user) {
      return res.status(401).json({ ok: false, message: "User not found." });
    }

    req.auth = {
      token,
      session,
      user,
      safeUser: sanitizeUser(user)
    };

    next();
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || "Auth middleware failed." });
  }
}
    
