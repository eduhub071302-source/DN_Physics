// 🔐 Unlock System (Final Production Version)

// ----------------------------
// Storage Helpers
// ----------------------------

function dnStorageGet(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function dnStorageSet(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}

function dnStorageRemove(key) {
  try { localStorage.removeItem(key); } catch {}
}

// ----------------------------
// Keys
// ----------------------------

function getOwnerModeKey() { return DN_CONFIG.STORAGE_KEYS.OWNER_MODE; }
function getPaidUnlockKey() { return DN_CONFIG.STORAGE_KEYS.PAID_UNLOCK; }
function getUnlockSourceKey() { return DN_CONFIG.STORAGE_KEYS.UNLOCK_SOURCE; }
function getUnlockTimeKey() { return DN_CONFIG.STORAGE_KEYS.UNLOCK_TIME; }
function getUnlockOrderIdKey() { return DN_CONFIG.STORAGE_KEYS.UNLOCK_ORDER_ID; }
function getPendingOrderIdKey() { return DN_CONFIG.STORAGE_KEYS.UNLOCK_PENDING_ORDER_ID; }

// ----------------------------
// Core Access Logic
// ----------------------------

function isOwnerMode() {
  return dnStorageGet(getOwnerModeKey()) === "true";
}

function hasPaidAccess() {
  if (isOwnerMode()) return true;
  return dnStorageGet(getPaidUnlockKey()) === "true";
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
  dnStorageSet(getPaidUnlockKey(), "true");
  dnStorageSet(getUnlockSourceKey(), meta.source || "unknown");
  dnStorageSet(getUnlockTimeKey(), String(Date.now()));

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
// Server Sync (IMPORTANT)
// ----------------------------

async function syncUnlockWithServer() {
  try {
    const token = localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN);
    if (!token) return;

    if (!DN_CONFIG.BACKEND.API_BASE_URL || !DN_CONFIG.BACKEND.VERIFY_UNLOCK_URL) return;

    const res = await fetch(
      DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.VERIFY_UNLOCK_URL,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) return;

    const data = await res.json();

    if (data.paid === true) {
      activatePaidAccess({
        source: "server-sync",
        orderId: data.order_id || ""
      });
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

function applyServerUnlock(orderId = "") {
  activatePaidAccess({ source: "server-verified", orderId });
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

document.addEventListener("DOMContentLoaded", () => {
  try {
    syncUnlockWithServer();
  } catch {}

  // background sync every 60s
  setInterval(() => {
    try {
      syncUnlockWithServer();
    } catch {}
  }, 60000);
});
