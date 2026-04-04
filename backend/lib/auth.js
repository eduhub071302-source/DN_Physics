import crypto from "crypto";

export function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

export function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password), "utf8").digest("hex");
}

export function verifyPassword(password, storedHash) {
  return hashPassword(password) === storedHash;
}

export function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name || "",
    avatar_url: user.avatar_url || "",
    paid: Boolean(user.paid),
    created_at: user.created_at || 0,
    updated_at: user.updated_at || 0
  };
}

export function validateEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function validatePassword(password = "") {
  return String(password).length >= 6;
}

export function validateName(name = "") {
  return String(name).trim().length >= 2;
}
