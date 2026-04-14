// 🔐 Unlock System (Firebase-only Final Version)

// ----------------------------
// Storage Helpers
// ----------------------------

function getAppMode() {
  try {
    return localStorage.getItem("dn_app_mode") || "guest";
  } catch {
    return "guest";
  }
}

function isGuestMode() {
  return getAppMode() === "guest";
}

function dnStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function dnStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function dnStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

// ----------------------------
// User / Key Helpers
// ----------------------------

function getUserKeySuffix() {
  try {
    const auth = window.firebaseAuth || null;
    return auth?.currentUser?.uid || "guest";
  } catch {
    return "guest";
  }
}

function getOwnerModeKey() {
  return `${DN_CONFIG.STORAGE_KEYS.OWNER_MODE}_${getUserKeySuffix()}`;
}

function getPaidUnlockKey() {
  return `${DN_CONFIG.STORAGE_KEYS.PAID_UNLOCK}_${getUserKeySuffix()}`;
}

function getUnlockSourceKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_SOURCE}_${getUserKeySuffix()}`;
}

function getUnlockTimeKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_TIME}_${getUserKeySuffix()}`;
}

function getUnlockOrderIdKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_ORDER_ID}_${getUserKeySuffix()}`;
}

function getPendingOrderIdKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_PENDING_ORDER_ID}_${getUserKeySuffix()}`;
}

function getUnlockExpiresAtKey() {
  return `${DN_CONFIG.STORAGE_KEYS.UNLOCK_EXPIRES_AT}_${getUserKeySuffix()}`;
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

function clearPaidAccess() {
  dnStorageRemove(getPaidUnlockKey());
  dnStorageRemove(getUnlockSourceKey());
  dnStorageRemove(getUnlockTimeKey());
  dnStorageRemove(getUnlockOrderIdKey());
  dnStorageRemove(getPendingOrderIdKey());
  dnStorageRemove(getUnlockExpiresAtKey());
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

function normalizeAccessSlug(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function canAccessPdf(subject) {
  if (isOwnerMode() || hasPaidAccess()) return true;

  const normalizedSubject = normalizeAccessSlug(subject);
  const freeSubjects = (DN_CONFIG?.ACCESS?.FREE_PDF_SUBJECTS || []).map(normalizeAccessSlug);

  return freeSubjects.includes(normalizedSubject);
}

function canAccessQuiz(topic) {
  if (isOwnerMode() || hasPaidAccess()) return true;

  const normalizedTopic = normalizeAccessSlug(topic);
  const freeTopics = (DN_CONFIG?.ACCESS?.FREE_QUIZ_TOPICS || []).map(normalizeAccessSlug);

  return freeTopics.includes(normalizedTopic);
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
// Firebase Sync
// ----------------------------

let unlockValueUnsubscribe = null;

function startFirebaseSync() {
  const auth = window.firebaseAuth || null;
  const db = window.firebaseDb || null;
  const sdk = window.firebaseSdk || null;

  if (!auth || !db || !sdk?.onAuthStateChanged || !sdk?.ref || !sdk?.onValue) {
    console.warn("Unlock Firebase sync not ready.");
    return;
  }

  sdk.onAuthStateChanged(auth, (user) => {
    if (unlockValueUnsubscribe) {
      unlockValueUnsubscribe();
      unlockValueUnsubscribe = null;
    }

    if (!user) {
      clearPaidAccess();
      return;
    }

    const userRef = sdk.ref(db, "users/" + user.uid);

    unlockValueUnsubscribe = sdk.onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const expiresAt = Number(data.expiresAt) || 0;

      if (expiresAt > Date.now()) {
        activatePaidAccess({
          source: "firebase",
          orderId: data.orderId || "",
          expiresAt,
        });
      } else {
        clearPaidAccess();
      }
    });
  });
}

// ----------------------------
// Payment Start
// ----------------------------

async function startFullUnlockCheckout() {
    if (isGuestMode()) {
    showDnMessage("🔒 Please log in or create an account before purchasing DN Physics Pro.");

    if (typeof window.openDnAuthModal === "function") {
      setTimeout(() => {
        window.openDnAuthModal();
      }, 120);
    }

    return;
  }
  
  if (!DN_CONFIG.BACKEND.CREATE_ORDER_URL) {
    showDnMessage("Payment not configured yet.");
    return;
  }

  try {
    const user = JSON.parse(
      localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE) || "{}",
    );

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
          country: "Sri Lanka",
        }),
      },
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
    console.error("startFullUnlockCheckout error:", e);
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
    const token = localStorage.getItem(
      DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN,
    );

    const res = await fetch(
      DN_CONFIG.BACKEND.API_BASE_URL +
        DN_CONFIG.BACKEND.VERIFY_UNLOCK_URL +
        `?order_id=${encodeURIComponent(finalOrderId)}`,
      {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );

    if (!res.ok) return { ok: false, paid: false };

    const data = await res.json();

    return {
      ok: true,
      paid: Boolean(data.paid),
      orderId: data.order_id || finalOrderId,
      expiresAt: Number(data.expiresAt) || 0,
    };
  } catch {
    return { ok: false, paid: false };
  }
}

function applyServerUnlock(orderId = "", expiresAt = 0) {
  activatePaidAccess({
    source: "server-verified",
    orderId,
    expiresAt,
  });
  clearPendingOrderId();
}

async function syncUnlockWithServer() {
  if (isGuestMode()) {
    clearPaidAccess();
    return false;
  }

  const status = await checkServerUnlockStatus();

  if (!status.ok) return false;

  if (status.paid) {
    applyServerUnlock(status.orderId || "", status.expiresAt || 0);
    return true;
  }

  return false;
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
// Modal
// ----------------------------

function ensureUnlockModal() {}

function openUnlockModal() {
  const modal =
    document.getElementById("unlockModal") ||
    document.getElementById("authModal");

  if (!modal) {
    showDnMessage("🔒 Locked — Modal missing in HTML");
    return;
  }

  modal.classList.remove("hidden");
  modal.style.display = "flex";
}

function closeUnlockModal() {
  const modal =
    document.getElementById("unlockModal") ||
    document.getElementById("authModal");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.style.display = "none";
}

function lockAlert() {
  openUnlockModal();
}

// ----------------------------
// Expose Globals
// ----------------------------

window.isOwnerMode = isOwnerMode;
window.getSubscriptionExpiresAt = getSubscriptionExpiresAt;
window.isSubscriptionActive = isSubscriptionActive;
window.getRemainingDays = getRemainingDays;
window.hasPaidAccess = hasPaidAccess;
window.canAccessPdf = canAccessPdf;
window.canAccessQuiz = canAccessQuiz;

window.activatePaidAccess = activatePaidAccess;
window.clearPaidAccess = clearPaidAccess;
window.enableOwnerMode = enableOwnerMode;
window.disableOwnerMode = disableOwnerMode;
window.unlockWithOwnerCode = unlockWithOwnerCode;

window.setPendingOrderId = setPendingOrderId;
window.getPendingOrderId = getPendingOrderId;
window.clearPendingOrderId = clearPendingOrderId;

window.startFullUnlockCheckout = startFullUnlockCheckout;
window.checkServerUnlockStatus = checkServerUnlockStatus;
window.applyServerUnlock = applyServerUnlock;
window.syncUnlockWithServer = syncUnlockWithServer;

window.openUnlockModal = openUnlockModal;
window.closeUnlockModal = closeUnlockModal;
window.lockAlert = lockAlert;
window.showDnMessage = showDnMessage;

// ----------------------------
// INIT
// ----------------------------

document.addEventListener("DOMContentLoaded", async () => {
  startFirebaseSync();

  try {
    await syncUnlockWithServer();
  } catch {}

  const days = getRemainingDays();

  if (hasPaidAccess() && days > 0 && days <= 3) {
    showDnMessage(
      `⏳ Subscription expires in ${days} day${days === 1 ? "" : "s"}`,
    );
  }

  setInterval(() => {
    try {
      syncUnlockWithServer();
    } catch {}
  }, 60000);
});
