// 🔐 Unlock System (Final Production Version)

// ----------------------------
// Storage Helpers
// ----------------------------

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem("supabase.auth.token");
    if (raw) {
      const parsed = JSON.parse(raw);
      const user = parsed?.currentSession?.user;
      if (user?.id) return user.id;
    }
  } catch {}

  return "guest";
}

function dnStorageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function dnStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function dnStorageRemove(key) {
  try { localStorage.removeItem(key); } catch {}
}

function getCurrentUserId() {
  try {
    const cachedUser = JSON.parse(localStorage.getItem("dn_user") || "null");
    if (cachedUser?.id) return cachedUser.id;

    const rawSupabase = localStorage.getItem("supabase.auth.token");
    if (rawSupabase) {
      const parsed = JSON.parse(rawSupabase);
      const sessionUser = parsed?.currentSession?.user || parsed?.user || null;
      if (sessionUser?.id) return sessionUser.id;
    }
  } catch (error) {
    console.warn("Could not resolve current user id:", error);
  }

  return "guest";
}

// ----------------------------
// Keys
// ----------------------------

function getOwnerModeKey() {
  return `${DN_CONFIG.STORAGE_KEYS.OWNER_MODE}_${getCurrentUserId()}`;
}

function getPaidUnlockKey() {
  return `${DN_CONFIG.STORAGE_KEYS.PAID_UNLOCK}_${getCurrentUserId()}`;
}

function getUnlockSourceKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_SOURCE}_${getCurrentUserId()}`;
}

function getUnlockTimeKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_TIME}_${getCurrentUserId()}`;
}

function getUnlockOrderIdKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_ORDER_ID}_${getCurrentUserId()}`;
}

function getPendingOrderIdKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_PENDING_ORDER_ID}_${getCurrentUserId()}`;
}

function getUnlockExpiresAtKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_EXPIRES_AT}_${getCurrentUserId()}`;
}

// ----------------------------
// Core Access Logic
// ----------------------------

function isOwnerMode() {
  return dnStorageGet(getOwnerModeKey()) === "true";
}

function getSubscriptionExpiresAt() {
  const raw = dnStorageGet(getUnlockExpiresAtKey());
  if (!raw) return 0;

  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}

function isSubscriptionActive() {
  const expiresAt = getSubscriptionExpiresAt();
  if (!expiresAt) return false;
  return Date.now() < expiresAt;
}

function getRemainingDays() {
  const expiresAt = getSubscriptionExpiresAt();
  if (!expiresAt) return 0;

  const diff = expiresAt - Date.now();
  if (diff <= 0) return 0;

  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function hasPaidAccess() {
  if (isOwnerMode()) return true;

  const paidFlag = dnStorageGet(getPaidUnlockKey()) === "true";
  if (!paidFlag) return false;

  const active = isSubscriptionActive();

  if (!active) {
    clearPaidAccess();
    return false;
  }

  return true;
}

function canAccessPdf(subject) {
  if (isOwnerMode() || hasPaidAccess()) return true;
  return DN_CONFIG.ACCESS.FREE_PDF_SUBJECTS.includes(subject);
}

function canAccessQuiz(topic) {
  if (isOwnerMode() || hasPaidAccess()) return true;
  return DN_CONFIG.ACCESS.FREE_QUIZ_TOPICS.includes(topic);
}

// ----------------------------
// Unlock Control
// ----------------------------

function activatePaidAccess(meta = {}) {
  const now = Date.now();
  const durationDays = Number(DN_CONFIG?.PRODUCT?.DURATION_DAYS) || 30;
  const fallbackExpiresAt = now + durationDays * 24 * 60 * 60 * 1000;
  const expiresAt = Number(meta.expiresAt) || fallbackExpiresAt;

  dnStorageSet(getPaidUnlockKey(), "true");
  dnStorageSet(getUnlockSourceKey(), meta.source || "unknown");
  dnStorageSet(getUnlockTimeKey(), String(now));
  dnStorageSet(getUnlockExpiresAtKey(), String(expiresAt));

  if (meta.orderId) {
    dnStorageSet(getUnlockOrderIdKey(), meta.orderId);
  }
}

function clearPaidAccess() {
  dnStorageRemove(getPaidUnlockKey());
  dnStorageRemove(getUnlockSourceKey());
  dnStorageRemove(getUnlockTimeKey());
  dnStorageRemove(getUnlockOrderIdKey());
  dnStorageRemove(getPendingOrderIdKey());
  dnStorageRemove(getUnlockExpiresAtKey());
}

// ----------------------------
// Owner Mode
// ----------------------------

function enableOwnerMode() {
  dnStorageSet(getOwnerModeKey(), "true");
  activatePaidAccess({ source: "owner" });
}

function disableOwnerMode() {
  dnStorageRemove(getOwnerModeKey());
  clearPaidAccess();
}

function unlockWithOwnerCode(code) {
  if (code === DN_CONFIG.ACCESS.OWNER_CODE) {
    enableOwnerMode();
    closeUnlockModal();
    showDnMessage("Owner mode activated 🔓");
    setTimeout(() => location.reload(), 300);
  } else {
    showDnMessage("Invalid owner code ❌");
  }
}

// ----------------------------
// Pending Order
// ----------------------------

function setPendingOrderId(orderId) {
  if (orderId) dnStorageSet(getPendingOrderIdKey(), orderId);
}

function getPendingOrderId() {
  return dnStorageGet(getPendingOrderIdKey()) || "";
}

function clearPendingOrderId() {
  dnStorageRemove(getPendingOrderIdKey());
}

// ----------------------------
// 🔥 GET USER STATE FROM SERVER (/me)
// ----------------------------

async function fetchUserStateFromServer() {
  try {
    const session = await supabaseClient.auth.getSession();
    const token = session?.data?.session?.access_token;

    if (!token) return null;

    const res = await fetch(
      DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.AUTH_ME_URL,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!res.ok) return null;

    const data = await res.json();

    return data;

  } catch (e) {
    console.log("User state fetch failed:", e);
    return null;
  }
}

// ----------------------------
// Server Sync (IMPORTANT)
// ----------------------------

async function syncUnlockWithServer() {
  try {
    const data = await fetchUserStateFromServer();

    if (!data || !data.ok) return;

    const expiresAtRaw =
      data.entitlement?.expires_at ||
      data.subscription_expires_at ||
      data.expires_at ||
      "";

    const expiresAtMs = expiresAtRaw ? new Date(expiresAtRaw).getTime() : 0;
    const isActive = Boolean(data.paid) && Number.isFinite(expiresAtMs) && expiresAtMs > Date.now();

    if (isActive) {
      activatePaidAccess({
        source: "server",
        orderId: data.entitlement?.order_id || "",
        expiresAt: expiresAtMs
      });
    } else {
      clearPaidAccess();
    }

  } catch (e) {
    console.log("Unlock sync failed:", e);
  }
}

// ----------------------------
// Payment Start
// ----------------------------

async function startFullUnlockCheckout() {
  if (!DN_CONFIG.BACKEND.CREATE_ORDER_URL) {
    showDnMessage("Payment not configured yet.");
    return;
  }

  try {
    const user = JSON.parse(localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE) || "{}");

    const res = await fetch(
      DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.CREATE_ORDER_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: user.name || "DN",
          last_name: "User",
          email: user.email || "student@example.com",
          phone: user.phone || "0770000000",
          address: "Sri Lanka",
          city: "Colombo",
          country: "Sri Lanka"
        })
      }
    );

    const data = await res.json();

    if (!res.ok || !data.ok) {
      showDnMessage(data.message || "Payment start failed");
      return;
    }

    setPendingOrderId(data.fields?.order_id || "");

    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.checkout_url;
    form.style.display = "none";

    Object.entries(data.fields || {}).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = String(v ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

  } catch (e) {
    showDnMessage("Payment error");
  }
}

// ----------------------------
// Verify Payment
// ----------------------------

async function checkServerUnlockStatus(orderId = "") {
  const finalOrderId = orderId || getPendingOrderId();

  if (!finalOrderId) return { ok: false, paid: false };

  try {
    const token = localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN);

    const res = await fetch(
      DN_CONFIG.BACKEND.API_BASE_URL +
        DN_CONFIG.BACKEND.VERIFY_UNLOCK_URL +
        `?order_id=${encodeURIComponent(finalOrderId)}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );

    if (!res.ok) return { ok: false, paid: false };

    const data = await res.json();

    return {
      ok: true,
      paid: Boolean(data.paid),
      orderId: data.order_id || finalOrderId
    };

  } catch {
    return { ok: false, paid: false };
  }
}

function applyServerUnlock(orderId = "", expiresAt = 0) {
  activatePaidAccess({
    source: "server-verified",
    orderId,
    expiresAt
  });
  clearPendingOrderId();
}

// ----------------------------
// Toast
// ----------------------------

function showDnMessage(msg = "Done") {
  let box = document.getElementById("dn-toast");

  if (!box) {
    box = document.createElement("div");
    box.id = "dn-toast";
    document.body.appendChild(box);

    box.style.cssText = `
      position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
      background:#111;color:#fff;padding:12px 16px;border-radius:10px;
      z-index:100000;font-size:14px;opacity:0;transition:.2s;
    `;
  }

  box.textContent = msg;
  box.style.opacity = "1";

  setTimeout(() => {
    box.style.opacity = "0";
  }, 2000);
}

// ----------------------------
// Modal (simplified safe)
// ----------------------------

function ensureUnlockModal() {}

function openUnlockModal() {
  showDnMessage("🔒 Locked — Please unlock");
}

function closeUnlockModal() {}

function lockAlert() {
  openUnlockModal();
}

// ----------------------------
// INIT
// ----------------------------

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await syncUnlockWithServer();
  } catch {}

  const days = getRemainingDays();

  if (hasPaidAccess() && days > 0 && days <= 3) {
    showDnMessage(`⏳ Subscription expires in ${days} day${days === 1 ? "" : "s"}`);
  }

  // background sync every 60s
  setInterval(() => {
    try {
      syncUnlockWithServer();
    } catch {}
  }, 60000);
});
