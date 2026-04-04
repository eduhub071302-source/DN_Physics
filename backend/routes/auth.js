import express from "express";
import { randomToken } from "../lib/tokens.js";
import { hashPassword, normalizeEmail, sanitizeUser, validateEmail, validateName, validatePassword, verifyPassword } from "../lib/auth.js";
import { readResetDb, readSessionsDb, readUsersDb, writeResetDb, writeSessionsDb, writeUsersDb } from "../lib/storage.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

function makeUserId() {
  return `usr_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function getSessionExpiresAt() {
  const days = Number(process.env.SESSION_EXPIRES_DAYS || 30);
  return Date.now() + days * 24 * 60 * 60 * 1000;
}

router.post("/register", async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = normalizeEmail(req.body?.email || "");
    const password = String(req.body?.password || "");

    if (!validateName(name)) {
      return res.status(400).json({ ok: false, message: "Name must have at least 2 characters." });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, message: "Enter a valid email address." });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ ok: false, message: "Password must be at least 6 characters." });
    }

    const usersDb = await readUsersDb();
    const existing = usersDb.users.find((item) => item.email === email);

    if (existing) {
      return res.status(409).json({ ok: false, message: "An account already exists for this email." });
    }

    const newUser = {
      id: makeUserId(),
      name,
      email,
      password_hash: hashPassword(password),
      avatar_url: "",
      paid: false,
      created_at: Date.now(),
      updated_at: Date.now()
    };

    usersDb.users.push(newUser);
    await writeUsersDb(usersDb);

    const sessionsDb = await readSessionsDb();
    const token = randomToken(24);
    sessionsDb.sessions.push({
      token,
      user_id: newUser.id,
      created_at: Date.now(),
      expires_at: getSessionExpiresAt()
    });
    await writeSessionsDb(sessionsDb);

    return res.json({
      ok: true,
      token,
      user: sanitizeUser(newUser)
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || "Register failed." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email || "");
    const password = String(req.body?.password || "");
    const usersDb = await readUsersDb();
    const user = usersDb.users.find((item) => item.email === email);

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ ok: false, message: "Invalid email or password." });
    }

    const sessionsDb = await readSessionsDb();
    const token = randomToken(24);
    sessionsDb.sessions.push({
      token,
      user_id: user.id,
      created_at: Date.now(),
      expires_at: getSessionExpiresAt()
    });
    await writeSessionsDb(sessionsDb);

    return res.json({
      ok: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || "Login failed." });
  }
});

router.post("/logout", requireAuth, async (req, res) => {
  try {
    const sessionsDb = await readSessionsDb();
    sessionsDb.sessions = sessionsDb.sessions.filter((item) => item.token !== req.auth.token);
    await writeSessionsDb(sessionsDb);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || "Logout failed." });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ ok: true, user: req.auth.safeUser });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email || "");

    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, message: "Enter a valid email address." });
    }

    const usersDb = await readUsersDb();
    const user = usersDb.users.find((item) => item.email === email);

    if (!user) {
      return res.json({ ok: true, message: "If the account exists, a reset request has been created." });
    }

    const resetDb = await readResetDb();
    const code = String(Math.floor(100000 + Math.random() * 900000));

    resetDb.items.push({
      id: `rst_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
      user_id: user.id,
      email,
      code,
      created_at: Date.now(),
      expires_at: Date.now() + 15 * 60 * 1000,
      used: false
    });

    await writeResetDb(resetDb);

    return res.json({
      ok: true,
      message: "Reset code generated.",
      dev_reset_code: code
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || "Forgot password failed." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email || "");
    const code = String(req.body?.code || "").trim();
    const newPassword = String(req.body?.new_password || "");

    if (!validateEmail(email)) {
      return res.status(400).json({ ok: false, message: "Enter a valid email 
address." });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ ok: false, message: "Password must be at least 6 characters." });
    }

    const resetDb = await readResetDb();
    const item = resetDb.items.find(
      (entry) => entry.email === email && entry.code === code && !entry.used && Date.now() <= entry.expires_at
    );

    if (!item) {
      return res.status(400).json({ ok: false, message: "Invalid or expired reset code." });
    }

    const usersDb = await readUsersDb();
    const user = usersDb.users.find((entry) => entry.id === item.user_id);

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }

    user.password_hash = hashPassword(newPassword);
    user.updated_at = Date.now();
    item.used = true;

    await writeUsersDb(usersDb);
    await writeResetDb(resetDb);

    return res.json({ ok: true, message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || "Reset password failed." });
  }
});

export default router;
        
