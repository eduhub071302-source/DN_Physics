import crypto from "crypto";

function md5Upper(value) {
  return crypto.createHash("md5").update(String(value), "utf8").digest("hex").toUpperCase();
}

export function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

export function generateCheckoutHash({ merchantId, merchantSecret, orderId, amount, currency }) {
  const hashedSecret = md5Upper(merchantSecret);
  const amountFormatted = formatAmount(amount);
  return md5Upper(`${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`);
}

export function verifyNotifyMd5Sig({ merchantId, merchantSecret, orderId, payhereAmount, payhereCurrency, statusCode, md5sig }) {
  const localSig = md5Upper(
    `${merchantId}${orderId}${formatAmount(payhereAmount)}${payhereCurrency}${statusCode}${md5Upper(merchantSecret)}`
  );
  return localSig === String(md5sig || "").toUpperCase();
}

export function buildReturnUrl(frontendSiteUrl, appBasePath, successPath, orderId) {
  const base = `${String(frontendSiteUrl).replace(/\/+$/, "")}${appBasePath}`;
  return `${base}${successPath}?order_id=${encodeURIComponent(orderId)}`;
}

export function buildCancelUrl(frontendSiteUrl, appBasePath, cancelPath, orderId) {
  const base = `${String(frontendSiteUrl).replace(/\/+$/, "")}${appBasePath}`;
  return `${base}${cancelPath}?order_id=${encodeURIComponent(orderId)}`;
}
