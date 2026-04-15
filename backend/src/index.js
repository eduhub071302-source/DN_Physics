function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      ...extraHeaders,
    },
  });
}

function textResponse(text, status = 200) {
  return new Response(text, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

function normalizeAmount(value) {
  return Number(value || 0).toFixed(2);
}

function createOrderId(prefix = "DNP") {
  const now = Date.now();
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${now}-${random}`;
}

function getOriginFromRequest(request, fallback) {
  const origin = request.headers.get("origin");
  return origin || fallback;
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function buildPayHereHash({
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

async function buildPayHereMd5sig({
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

async function firebaseGet(path, env) {
  const url = `${env.FIREBASE_DATABASE_URL}/${path}.json?auth=${encodeURIComponent(env.FIREBASE_DATABASE_SECRET)}`;
  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    throw new Error(`firebaseGet failed: ${res.status}`);
  }

  return res.json();
}

async function firebaseSet(path, value, env) {
  const url = `${env.FIREBASE_DATABASE_URL}/${path}.json?auth=${encodeURIComponent(env.FIREBASE_DATABASE_SECRET)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });

  if (!res.ok) {
    throw new Error(`firebaseSet failed: ${res.status}`);
  }

  return res.json();
}

async function firebasePatch(path, value, env) {
  const url = `${env.FIREBASE_DATABASE_URL}/${path}.json?auth=${encodeURIComponent(env.FIREBASE_DATABASE_SECRET)}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });

  if (!res.ok) {
    throw new Error(`firebasePatch failed: ${res.status}`);
  }

  return res.json();
}

async function parseJsonSafe(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isPaidStatusCode(statusCode) {
  return String(statusCode) === "2";
}

async function handleCreateOrder(request, env) {
  const body = await parseJsonSafe(request);

  if (!body) {
    return json({ ok: false, message: "Invalid JSON body" }, 400);
  }

  const merchantId = env.PAYHERE_MERCHANT_ID || "";
  const merchantSecret = env.PAYHERE_MERCHANT_SECRET || "";
  const currency = env.PAYHERE_CURRENCY || "LKR";
  const amount = normalizeAmount(env.PAYHERE_AMOUNT || "70.00");
  const durationDays = Number(env.PAYHERE_DURATION_DAYS || "30") || 30;
  const productName = env.PAYHERE_PRODUCT_NAME || "DN Physics Monthly Subscription";
  const frontendBaseUrl = env.FRONTEND_BASE_URL || "https://dnphysics.com.lk";
  const backendBaseUrl = new URL(request.url).origin;

  if (!merchantId || !merchantSecret || !env.FIREBASE_DATABASE_URL || !env.FIREBASE_DATABASE_SECRET) {
    return json({ ok: false, message: "Server payment configuration missing" }, 500);
  }

  const orderId = createOrderId("DNP");

  const hash = await buildPayHereHash({
    merchantId,
    orderId,
    amount,
    currency,
    merchantSecret,
  });

  const uid = String(body.uid || "").trim();
  const email = String(body.email || "").trim().toLowerCase();

  const orderRecord = {
    order_id: orderId,
    status: "pending",
    amount,
    currency,
    duration_days: durationDays,
    product_name: productName,
    uid: uid || null,
    created_at: new Date().toISOString(),
    customer: {
      first_name: body.first_name || "DN",
      last_name: body.last_name || "User",
      email,
      phone: body.phone || "",
      address: body.address || "",
      city: body.city || "",
      country: body.country || "Sri Lanka",
    },
  };

  await firebaseSet(`payment_orders/${orderId}`, orderRecord, env);

  const checkoutUrl =
    String(env.PAYHERE_SANDBOX || "false") === "true"
      ? "https://sandbox.payhere.lk/pay/checkout"
      : "https://www.payhere.lk/pay/checkout";

  const fields = {
    merchant_id: merchantId,
    return_url: `${frontendBaseUrl}/payment-success.html`,
    cancel_url: `${frontendBaseUrl}/payment-cancel.html`,
    notify_url: `${backendBaseUrl}/api/payments/notify`,
    order_id: orderId,
    items: productName,
    currency,
    amount,
    first_name: body.first_name || "DN",
    last_name: body.last_name || "User",
    email,
    phone: body.phone || "",
    address: body.address || "Sri Lanka",
    city: body.city || "Colombo",
    country: body.country || "Sri Lanka",
    hash,
  };

  return json({
    ok: true,
    checkout_url: checkoutUrl,
    fields,
  });
}

async function handleNotify(request, env) {
  const merchantSecret = env.PAYHERE_MERCHANT_SECRET || "";
  const merchantIdExpected = env.PAYHERE_MERCHANT_ID || "";

  if (!merchantSecret || !merchantIdExpected) {
    return textResponse("Server config missing", 500);
  }

  const raw = await request.text();
  const form = new URLSearchParams(raw);

  const merchantId = form.get("merchant_id") || "";
  const orderId = form.get("order_id") || "";
  const payhereAmount = form.get("payhere_amount") || "";
  const payhereCurrency = form.get("payhere_currency") || "";
  const statusCode = form.get("status_code") || "";
  const receivedMd5sig = (form.get("md5sig") || "").toUpperCase();

  if (!merchantId || !orderId || !receivedMd5sig) {
    return textResponse("Missing fields", 400);
  }

  if (merchantId !== merchantIdExpected) {
    return textResponse("Merchant mismatch", 400);
  }

  const expectedMd5sig = await buildPayHereMd5sig({
    merchantId,
    orderId,
    payhereAmount,
    payhereCurrency,
    statusCode,
    merchantSecret,
  });

  if (receivedMd5sig !== expectedMd5sig) {
    return textResponse("Invalid signature", 400);
  }

  const order = await firebaseGet(`payment_orders/${orderId}`, env);

  if (!order) {
    return textResponse("Order not found", 404);
  }

  const paid = isPaidStatusCode(statusCode);

  await firebasePatch(
    `payment_orders/${orderId}`,
    {
      status: paid ? "paid" : "failed",
      status_code: statusCode,
      payhere_amount: payhereAmount,
      payhere_currency: payhereCurrency,
      updated_at: new Date().toISOString(),
      paid_at: paid ? new Date().toISOString() : null,
    },
    env,
  );

  if (paid) {
    const durationDays = Number(order.duration_days || env.PAYHERE_DURATION_DAYS || "30") || 30;
    const expiresAt = Date.now() + durationDays * 24 * 60 * 60 * 1000;

    const unlockRecord = {
      orderId,
      uid: order.uid || null,
      email: order.customer?.email || "",
      status: "active",
      amount: payhereAmount,
      currency: payhereCurrency,
      activatedAt: new Date().toISOString(),
      expiresAt,
    };

    await firebaseSet(`verified_unlocks_by_order/${orderId}`, unlockRecord, env);

    if (order.uid) {
      await firebasePatch(
        `users/${order.uid}`,
        {
          orderId,
          expiresAt,
          updated_at: new Date().toISOString(),
        },
        env,
      );

      await firebaseSet(
        `subscriptions/${order.uid}`,
        {
          orderId,
          uid: order.uid,
          email: order.customer?.email || "",
          status: "active",
          amount: payhereAmount,
          currency: payhereCurrency,
          activatedAt: new Date().toISOString(),
          expiresAt,
        },
        env,
      );
    }
  }

  return textResponse("OK", 200);
}

async function handleVerifyUnlock(request, env) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("order_id") || "";

  if (!orderId) {
    return json({ ok: false, paid: false, message: "Missing order_id" }, 400);
  }

  const unlockRecord = await firebaseGet(`verified_unlocks_by_order/${orderId}`, env);

  if (!unlockRecord) {
    return json({
      ok: true,
      paid: false,
    });
  }

  const expiresAt = Number(unlockRecord.expiresAt || 0);
  const paid = unlockRecord.status === "active" && expiresAt > Date.now();

  return json({
    ok: true,
    paid,
    order_id: orderId,
    expiresAt,
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return json({ ok: true });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (request.method === "POST" && path === "/api/payments/create-order") {
        return await handleCreateOrder(request, env);
      }

      if (request.method === "POST" && path === "/api/payments/notify") {
        return await handleNotify(request, env);
      }

      if (request.method === "GET" && path === "/api/unlock/verify") {
        return await handleVerifyUnlock(request, env);
      }

      return json({ ok: false, message: "Not found" }, 404);
    } catch (error) {
      console.error("Worker error:", error);
      return json({ ok: false, message: "Server error" }, 500);
    }
  },
};
