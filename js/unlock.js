// 🔐 Unlock System (Global, Future Ready)

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
  } catch {
    // ignore storage errors
  }
}

function dnStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore storage errors
  }
}

function getOwnerModeKey() {
  return DN_CONFIG.STORAGE_KEYS.OWNER_MODE;
}

function getPaidUnlockKey() {
  return DN_CONFIG.STORAGE_KEYS.PAID_UNLOCK;
}

function getUnlockSourceKey() {
  return DN_CONFIG.STORAGE_KEYS.UNLOCK_SOURCE;
}

function getUnlockTimeKey() {
  return DN_CONFIG.STORAGE_KEYS.UNLOCK_TIME;
}

function getUnlockOrderIdKey() {
  return DN_CONFIG.STORAGE_KEYS.UNLOCK_ORDER_ID;
}

function getPendingOrderIdKey() {
  return DN_CONFIG.STORAGE_KEYS.UNLOCK_PENDING_ORDER_ID;
}

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

function activatePaidAccess(meta = {}) {
  dnStorageSet(getPaidUnlockKey(), "true");
  dnStorageSet(getUnlockSourceKey(), meta.source || "manual");
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

// 🔥 Temporary local test only
function simulatePurchase() {
  activatePaidAccess({ source: "local-test" });
  closeUnlockModal();
  showDnMessage("Full app unlocked 🎉");
  setTimeout(() => location.reload(), 300);
}

function setPendingOrderId(orderId) {
  if (!orderId) return;
  dnStorageSet(getPendingOrderIdKey(), orderId);
}

function getPendingOrderId() {
  return dnStorageGet(getPendingOrderIdKey()) || "";
}

function clearPendingOrderId() {
  dnStorageRemove(getPendingOrderIdKey());
}

function getUnlockMeta() {
  return {
    ownerMode: isOwnerMode(),
    paid: hasPaidAccess(),
    source: dnStorageGet(getUnlockSourceKey()) || "",
    unlockedAt: dnStorageGet(getUnlockTimeKey()) || "",
    orderId: dnStorageGet(getUnlockOrderIdKey()) || "",
    pendingOrderId: getPendingOrderId()
  };
}

// ----------------------------
// Small toast message
// ----------------------------

function showDnMessage(message = "Done") {
  const existing = document.getElementById("dn-global-message");

  if (existing) {
    existing.textContent = message;
    existing.classList.add("show");
    setTimeout(() => existing.classList.remove("show"), 2200);
    return;
  }

  const box = document.createElement("div");
  box.id = "dn-global-message";
  box.textContent = message;

  box.style.position = "fixed";
  box.style.left = "50%";
  box.style.bottom = "20px";
  box.style.transform = "translateX(-50%)";
  box.style.zIndex = "100001";
  box.style.padding = "12px 16px";
  box.style.borderRadius = "12px";
  box.style.background = "rgba(11,18,32,0.96)";
  box.style.color = "#ffffff";
  box.style.border = "1px solid rgba(78,161,255,0.35)";
  box.style.boxShadow = "0 12px 30px rgba(0,0,0,0.35)";
  box.style.fontSize = "14px";
  box.style.maxWidth = "92vw";
  box.style.textAlign = "center";
  box.style.opacity = "0";
  box.style.transition = "opacity 0.2s ease";

  document.body.appendChild(box);

  requestAnimationFrame(() => {
    box.style.opacity = "1";
  });

  setTimeout(() => {
    box.style.opacity = "0";
    setTimeout(() => box.remove(), 220);
  }, 2200);
}

// ----------------------------
// Future PayHere integration
// ----------------------------

function getCheckoutPayloadSkeleton() {
  return {
    merchant_id: DN_CONFIG.PAYHERE.MERCHANT_ID,
    return_url: dnGetSuccessUrl(),
    cancel_url: dnGetCancelUrl(),
    notify_url: DN_CONFIG.BACKEND.NOTIFY_URL,
    order_id: "",
    items: DN_CONFIG.PRODUCT.FULL_UNLOCK_NAME,
    currency: DN_CONFIG.PRODUCT.CURRENCY,
    amount: DN_CONFIG.PRODUCT.PRICE,
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Sri Lanka",
    custom_1: DN_CONFIG.PRODUCT.FULL_UNLOCK_ID,
    custom_2: ""
  };
}

function hasPaymentConfigReady() {
  return Boolean(
    DN_CONFIG.PAYHERE.MERCHANT_ID &&
    DN_CONFIG.BACKEND.NOTIFY_URL &&
    dnGetSuccessUrl() &&
    dnGetCancelUrl()
  );
}

async function startFullUnlockCheckout() {
  if (!hasPaymentConfigReady()) {
    showDnMessage("Payment setup not added yet.");
    return;
  }

  if (!DN_CONFIG.BACKEND.CREATE_ORDER_URL) {
    showDnMessage("Create-order URL is missing.");
    return;
  }

  showDnMessage("Checkout integration placeholder is ready.");
}

async function checkServerUnlockStatus(orderId = "") {
  const finalOrderId = orderId || getPendingOrderId();

  if (!DN_CONFIG.BACKEND.VERIFY_UNLOCK_URL || !finalOrderId) {
    return { ok: false, paid: false };
  }

  try {
    const url = `${DN_CONFIG.BACKEND.VERIFY_UNLOCK_URL}?order_id=${encodeURIComponent(finalOrderId)}`;
    const res = await fetch(url, { method: "GET", credentials: "omit" });

    if (!res.ok) {
      return { ok: false, paid: false };
    }

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
  activatePaidAccess({
    source: "server-verified",
    orderId
  });
  clearPendingOrderId();
}

// ----------------------------
// Global injected unlock modal
// ----------------------------

function injectUnlockModalStyles() {
  if (document.getElementById("dn-unlock-modal-styles")) return;

  const style = document.createElement("style");
  style.id = "dn-unlock-modal-styles";
  style.textContent = `
    .unlock-modal {
      position: fixed;
      inset: 0;
      display: none;
      z-index: 100000;
    }

    .unlock-modal.show {
      display: block;
    }

    .unlock-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(3px);
    }

    .unlock-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(92vw, 360px);
      background: #111a2b;
      border: 1px solid #24314f;
      border-radius: 20px;
      padding: 22px 18px 18px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
      color: #e8eefc;
    }

    .unlock-box h2 {
      margin: 0 0 8px;
      font-size: 24px;
    }

    .unlock-box p {
      margin: 0 0 14px;
      color: #a8b3cf;
      line-height: 1.5;
    }

    .unlock-price {
      margin: 10px 0 14px;
      font-size: 20px;
      font-weight: 800;
      color: #4ea1ff;
    }

    .unlock-divider {
      margin: 14px 0 10px;
      color: #7f8dab;
      font-size: 13px;
    }

    .unlock-input {
      width: 100%;
      min-height: 44px;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid #24314f;
      background: #0b1220;
      color: #ffffff;
      outline: none;
      box-sizing: border-box;
      margin-bottom: 10px;
    }

    .unlock-actions {
      display: grid;
      gap: 10px;
      margin-top: 10px;
    }

    .unlock-close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 34px;
      height: 34px;
      border-radius: 999px;
      border: none;
      background: rgba(255,255,255,0.06);
      color: #c8d3ee;
      cursor: pointer;
      font-size: 16px;
    }

    .unlock-close:hover {
      background: rgba(255,255,255,0.1);
    }

    .unlock-note {
      margin-top: 12px;
      font-size: 12px;
      color: #7f8dab;
    }
  `;
  document.head.appendChild(style);
}

function injectUnlockModalHtml() {
  if (document.getElementById("unlockModal")) return;

  const wrapper = document.createElement("div");
  wrapper.id = "unlockModal";
  wrapper.className = "unlock-modal";
  wrapper.setAttribute("aria-hidden", "true");

  wrapper.innerHTML = `
    <div class="unlock-backdrop"></div>

    <div class="unlock-box" role="dialog" aria-modal="true" aria-labelledby="unlockModalTitle">
      <button id="closeUnlockBtn" class="unlock-close" type="button" aria-label="Close unlock popup">✕</button>

      <h2 id="unlockModalTitle">🔒 Premium Content</h2>
      <p>Unlock all notes and quizzes with one payment.</p>

      <div class="unlock-price">Rs.${DN_CONFIG.PRODUCT.PRICE} • One-Time</div>

      <div class="unlock-actions">
        <button id="buyUnlockBtn" class="btn btn-primary" type="button">💳 Unlock Now</button>
      </div>

      <div class="unlock-divider">or owner access</div>

      <input
        id="ownerCodeInput"
        class="unlock-input"
        type="text"
        placeholder="Enter owner code"
        autocomplete="off"
      />

      <div class="unlock-actions">
        <button id="ownerUnlockBtn" class="btn" type="button">Unlock</button>
      </div>

      <div class="unlock-note">Only Units quiz and Gravitational Field notes are free.</div>
    </div>
  `;

  document.body.appendChild(wrapper);
}

function ensureUnlockModal() {
  injectUnlockModalStyles();
  injectUnlockModalHtml();
}

function openUnlockModal() {
  ensureUnlockModal();

  const modal = document.getElementById("unlockModal");
  if (!modal) {
    showDnMessage(`🔒 Locked • Unlock all for Rs.${DN_CONFIG.PRODUCT.PRICE}`);
    return;
  }

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}

function closeUnlockModal() {
  const modal = document.getElementById("unlockModal");
  if (modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }
}

function lockAlert() {
  openUnlockModal();
}

function bindUnlockModalEvents() {
  const modal = document.getElementById("unlockModal");
  if (!modal) return;

  const closeBtn = document.getElementById("closeUnlockBtn");
  const ownerBtn = document.getElementById("ownerUnlockBtn");
  const buyBtn = document.getElementById("buyUnlockBtn");
  const ownerInput = document.getElementById("ownerCodeInput");
  const backdrop = modal.querySelector(".unlock-backdrop");

  if (closeBtn && !closeBtn.dataset.bound) {
    closeBtn.dataset.bound = "true";
    closeBtn.onclick = closeUnlockModal;
  }

  if (backdrop && !backdrop.dataset.bound) {
    backdrop.dataset.bound = "true";
    backdrop.onclick = closeUnlockModal;
  }

  if (ownerBtn && !ownerBtn.dataset.bound) {
    ownerBtn.dataset.bound = "true";
    ownerBtn.onclick = () => {
      const code = ownerInput ? ownerInput.value.trim() : "";
      unlockWithOwnerCode(code);
    };
  }

  if (ownerInput && !ownerInput.dataset.bound) {
    ownerInput.dataset.bound = "true";
    ownerInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const code = ownerInput.value.trim();
        unlockWithOwnerCode(code);
      }
    });
  }

  if (buyBtn && !buyBtn.dataset.bound) {
    buyBtn.dataset.bound = "true";
    buyBtn.onclick = () => {
      simulatePurchase(); // later change to startFullUnlockCheckout()
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  ensureUnlockModal();
  bindUnlockModalEvents();
});
