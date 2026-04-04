import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getFile(fileName) {
  return path.join(__dirname, "..", "data", fileName);
}

async function ensureJsonFile(fileName, fallback) {
  const filePath = getFile(fileName);

  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
  }

  return filePath;
}

export async function readJson(fileName, fallback) {
  const filePath = await ensureJsonFile(fileName, fallback);
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw || JSON.stringify(fallback));
}

export async function writeJson(fileName, data, fallback = {}) {
  const filePath = await ensureJsonFile(fileName, fallback);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function readUsersDb() {
  const db = await readJson("users.json", { users: [] });
  if (!Array.isArray(db.users)) db.users = [];
  return db;
}

export async function writeUsersDb(db) {
  await writeJson("users.json", db, { users: [] });
}

export async function readSessionsDb() {
  const db = await readJson("sessions.json", { sessions: [] });
  if (!Array.isArray(db.sessions)) db.sessions = [];
  return db;
}
  
export async function writeSessionsDb(db) {
  await writeJson("sessions.json", db, { sessions: [] });
}

export async function readResetDb() {
  const db = await readJson("password-resets.json", { items: [] });
  if (!Array.isArray(db.items)) db.items = [];
  return db;
}

export async function writeResetDb(db) {
  await writeJson("password-resets.json", db, { items: [] });
}
