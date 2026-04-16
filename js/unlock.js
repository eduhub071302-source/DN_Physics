// 🔐 Unlock System (Production Final Version)

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
    const firebaseUid = auth?.currentUser?.uid;
    if (firebaseUid) return firebaseUid;

    const cachedUser = JSON.parse(localStorage.getItem("dn_user") || "null");
    if (cachedUser?.id) return cachedUser.id;
  } catch {
    // ignore
  }

  return "guest";
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
  if (hasPaidAccess()) return true;

  const normalizedSubject = normalizeAccessSlug(subject);
  const freeSubjects = (DN_CONFIG?.ACCESS?.FREE_PDF_SUBJECTS || []).map(normalizeAccessSlug);

  return freeSubjects.includes(normalizedSubject);
}

function canAccessQuiz(topic) {
  if (hasPaidAccess()) return true;

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
let unlockAuthUnsubscribe = null;
let unlockSyncRetryTimer = null;
let unlockSyncStarted = false;

function startFirebaseSync() {
  if (unlockSyncStarted) return;

  const auth = window.firebaseAuth || null;
  const db = window.firebaseDb || null;
  const sdk = window.firebaseSdk || null;

  if (!auth || !db || !sdk?.onAuthStateChanged || !sdk?.ref || !sdk?.onValue) {
    console.warn("Unlock Firebase sync not ready. Retrying...");
    clearTimeout(unlockSyncRetryTimer);
    unlockSyncRetryTimer = setTimeout(startFirebaseSync, 800);
    return;
  }

  unlockSyncStarted = true;

  if (unlockAuthUnsubscribe) {
    unlockAuthUnsubscribe();
    unlockAuthUnsubscribe = null;
  }

  unlockAuthUnsubscribe = sdk.onAuthStateChanged(auth, (user) => {
    if (unlockValueUnsubscribe) {
      unlockValueUnsubscribe();
      unlockValueUnsubscribe = null;
    }

    if (!user) {
      clearPaidAccess();
      return;
    }

    const subscriptionRef = sdk.ref(db, "subscriptions/" + user.uid);

    unlockValueUnsubscribe = sdk.onValue(
      subscriptionRef,
      (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          clearPaidAccess();
          return;
        }

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
      },
      (error) => {
        console.warn("Unlock Firebase onValue failed:", error);
      }
    );
  });
}

// ----------------------------
// Payment Start
// ----------------------------

async function startFullUnlockCheckout() {
  const unlockNowBtn = document.getElementById("unlockNowBtn");
  const originalText = "🔓 Buy Now";

  if (unlockNowBtn) {
    unlockNowBtn.disabled = true;
    unlockNowBtn.textContent = "Opening Checkout...";
  }

  try {
    if (isGuestMode()) {
      showDnMessage("Please log in before purchasing DN Physics Pro.");

      if (typeof window.openDnAuthModal === "function") {
        setTimeout(() => {
          window.openDnAuthModal();
        }, 120);
      }

      return;
    }

    if (!DN_CONFIG.BACKEND.CREATE_ORDER_URL) {
      showDnMessage("Payment is not configured yet.");
      return;
    }

    const user = JSON.parse(
      localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE) || "{}",
    );

    const res = await fetch(
      DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.CREATE_ORDER_URL,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid:
            window.firebaseAuth?.currentUser?.uid ||
            JSON.parse(localStorage.getItem("dn_user") || "null")?.id ||
            "",
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
      showDnMessage(data.message || "Could not start checkout.");
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
    console.error("Checkout error");
    showDnMessage("Checkout failed. Please try again.");
  } finally {
    if (unlockNowBtn) {
      unlockNowBtn.disabled = false;
      unlockNowBtn.textContent = originalText;
    }
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
      position: fixed;
      right: 14px;
      bottom: 14px;
      left: auto;
      transform: none;
      max-width: min(88vw, 320px);
      background: rgba(15, 20, 32, 0.96);
      color: #eef4ff;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 12px 28px rgba(0,0,0,0.28);
      z-index: 100000;
      font-size: 13px;
      line-height: 1.45;
      opacity: 0;
      transition: .2s;
      pointer-events: none;
    `;
  }

  box.textContent = msg;
  box.style.opacity = "1";

  clearTimeout(box._hideTimer);
  box._hideTimer = setTimeout(() => {
    box.style.opacity = "0";
  }, 1800);
}

// ----------------------------
// Modal
// ----------------------------

function ensureUnlockModal() {}

function openUnlockModal() {
  const unlockModal = document.getElementById("unlockModal");
  const authModal = document.getElementById("authModal");
  const unlockAccountEmail = document.getElementById("unlockAccountEmail");

  if (isGuestMode()) {
    if (authModal) {
      authModal.classList.remove("hidden");
      authModal.style.display = "flex";
    } else {
      showDnMessage("Please log in first.");
    }
    return;
  }

  if (!unlockModal) {
    showDnMessage("Unlock modal missing in HTML.");
    return;
  }

  try {
    const auth = window.firebaseAuth || null;
    const email =
      auth?.currentUser?.email ||
      JSON.parse(localStorage.getItem("dn_user") || "null")?.email ||
      "Logged-in account";

    if (unlockAccountEmail) {
      unlockAccountEmail.textContent = email;
    }
  } catch (error) {
    if (unlockAccountEmail) {
      unlockAccountEmail.textContent = "Logged-in account";
    }
  }

  unlockModal.scrollTop = 0;
  unlockModal.classList.remove("hidden");
  unlockModal.style.display = "flex";
}

function closeUnlockModal() {
  const unlockModal = document.getElementById("unlockModal");
  if (!unlockModal) return;

  unlockModal.classList.add("hidden");
  unlockModal.style.display = "none";
}

function lockAlert() {
  openUnlockModal();
}

// ----------------------------
// Expose Globals
// ----------------------------

window.getSubscriptionExpiresAt = getSubscriptionExpiresAt;
window.isSubscriptionActive = isSubscriptionActive;
window.getRemainingDays = getRemainingDays;
window.hasPaidAccess = hasPaidAccess;
window.canAccessPdf = canAccessPdf;
window.canAccessQuiz = canAccessQuiz;

window.activatePaidAccess = activatePaidAccess;
window.clearPaidAccess = clearPaidAccess;

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

  const unlockNowBtn = document.getElementById("unlockNowBtn");
  const unlockCloseBtn = document.getElementById("unlockCloseBtn");
  const unlockLaterBtn = document.getElementById("unlockLaterBtn");
  const unlockModal = document.getElementById("unlockModal");

  if (unlockNowBtn) {
    unlockNowBtn.addEventListener("click", async () => {
      await startFullUnlockCheckout();
    });
  }

  if (unlockCloseBtn) {
    unlockCloseBtn.addEventListener("click", () => {
      closeUnlockModal();
    });
  }

  if (unlockLaterBtn) {
    unlockLaterBtn.addEventListener("click", () => {
      closeUnlockModal();
    });
  }

  if (unlockModal) {
    unlockModal.addEventListener("click", (e) => {
      if (e.target === unlockModal) {
        closeUnlockModal();
      }
    });
  }

  setInterval(() => {
    try {
      syncUnlockWithServer();
    } catch {}
  }, 60000);
});
