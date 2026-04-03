import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, "..", "data", "orders.json");

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify({ orders: [] }, null, 2), "utf8");
  }
}

export async function readDb() {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw || "{}");
  if (!Array.isArray(parsed.orders)) {
    parsed.orders = [];
  }
  return parsed;
}

export async function writeDb(db) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function upsertOrder(order) {
  const db = await readDb();
  const index = db.orders.findIndex((item) => item.order_id === order.order_id);

  if (index >= 0) {
    db.orders[index] = { ...db.orders[index], ...order, updated_at: Date.now() };
  } else {
    db.orders.push({ ...order, created_at: Date.now(), updated_at: Date.now() });
  }

  await writeDb(db);
  return order;
}

export async function getOrder(orderId) {
  const db = await readDb();
  return db.orders.find((item) => item.order_id === orderId) || null;
}
