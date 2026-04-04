import crypto from "crypto";

export function randomToken(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}

