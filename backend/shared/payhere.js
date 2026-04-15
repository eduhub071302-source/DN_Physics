async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export async function buildPayHereHash({
  merchantId,
  orderId,
  amount,
  currency,
  merchantSecret,
}) {
  const secretHash = await sha256Hex(merchantSecret);
  const raw = `${merchantId}${orderId}${amount}${currency}${secretHash}`;
  return sha256Hex(raw);
}

export async function buildPayHereMd5sig({
  merchantId,
  orderId,
  payhereAmount,
  payhereCurrency,
  statusCode,
  merchantSecret,
}) {
  const secretHash = await sha256Hex(merchantSecret);
  const raw = `${merchantId}${orderId}${payhereAmount}${payhereCurrency}${statusCode}${secretHash}`;
  return sha256Hex(raw);
}

export function normalizeAmount(value) {
  const num = Number(value || 0);
  return num.toFixed(2);
}

export function createOrderId(prefix = "DN") {
  const now = Date.now();
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${now}-${random}`;
}
