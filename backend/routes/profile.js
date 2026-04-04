import express from "express";
import { readUsersDb, writeUsersDb } from "../lib/storage.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { sanitizeUser, validateName } from "../lib/auth.js";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ ok: true, user: req.auth.safeUser });
});

router.patch("/me", requireAuth, async (req, res) => {
  try {
    const usersDb = await readUsersDb();
    const user = usersDb.users.find((item) => item.id === req.auth.user.id);

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }

    const nextName = typeof req.body?.name === "string" ? req.body.name.trim() : user.name;
    const nextAvatarUrl = typeof req.body?.avatar_url === "string" ? req.body.avatar_url.trim() : user.avatar_url;

    if (!validateName(nextName)) {
      return res.status(400).json({ ok: false, message: "Name must have at least 2 characters." });
    }

    user.name = nextName;
    user.avatar_url = nextAvatarUrl;
    user.updated_at = Date.now();

    await writeUsersDb(usersDb);

    return res.json({ ok: true, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message || "Profile update failed." });
  }
});

export default router;
