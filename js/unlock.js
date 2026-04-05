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
  if (!DN_CONFIG.BACKEND.CREATE_ORDER_URL) {
    showDnMessage("Payment setup not added yet.");
    return;
  }

  try {
    const res = await fetch(
      DN_CONFIG.BACKEND.API_BASE_URL +
        DN_CONFIG.BACKEND.CREATE_ORDER_URL,
      {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: "DN",
        last_name: "Physics User",
        email: "student@example.com",
        phone: "0770000000",
        address: "Sri Lanka",
        city: "Colombo",
        country: "Sri Lanka"
      })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      showDnMessage(data.message || "Failed to start payment.");
      return;
    }

    const fields = data.fields || {};
    setPendingOrderId(fields.order_id || "");

    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.checkout_url;
    form.style.display = "none";

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    showDnMessage(error.message || "Payment start failed.");
  }
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

async function syncUnlockWithServer() {
  try {
    const token = localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN);

    if (!token) return;
    if (!DN_CONFIG.BACKEND.VERIFY_UNLOCK_URL || !DN_CONFIG.BACKEND.API_BASE_URL) return;

    const res = await fetch(
      DN_CONFIG.BACKEND.API_BASE_URL +
        DN_CONFIG.BACKEND.VERIFY_UNLOCK_URL,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
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
  } catch (error) {
    console.log("Unlock sync failed:", error);
  }
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

function injectUnlockModalStyles() {
  if (document.getElementById("dn-unlock-style")) return;

  const style = document.createElement("style");
  style.id = "dn-unlock-style";

  style.textContent = `
    .unlock-modal {
      position: fixed;
      inset: 0;
      display: none;
      z-index: 100000;
    }

    .unlock-modal.show {
      display: block;
      animation: dnUnlockFadeIn 0.22s ease;
    }

    .unlock-backdrop {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at top, rgba(78, 161, 255, 0.10), transparent 30%),
        rgba(6, 12, 22, 0.82);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }

    .unlock-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.96);
      width: min(92vw, 380px);
      padding: 24px 20px 18px;
      border-radius: 24px;
      text-align: center;
      color: #e8eefc;

      background:
        radial-gradient(circle at top right, rgba(124, 196, 255, 0.12), transparent 34%),
        linear-gradient(180deg, rgba(17, 26, 43, 0.98), rgba(12, 18, 31, 0.98));

      border: 1px solid rgba(124, 196, 255, 0.14);

      box-shadow:
        0 24px 60px rgba(0, 0, 0, 0.52),
        0 0 0 1px rgba(124, 196, 255, 0.03),
        0 0 36px rgba(78, 161, 255, 0.10);

      animation: dnUnlockPopIn 0.28s ease forwards;
    }

    .unlock-box::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.06), transparent 30%),
        linear-gradient(180deg, transparent 65%, rgba(255,255,255,0.02));
    }

    .unlock-box > * {
      position: relative;
      z-index: 1;
    }

    .unlock-box h2 {
      margin: 0 0 8px;
      font-size: 1.55rem;
      line-height: 1.15;
      letter-spacing: -0.02em;
    }

    .unlock-box p {
      margin: 0 0 14px;
      color: #a8b3cf;
      line-height: 1.65;
      font-size: 0.96rem;
    }

    .unlock-price {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 10px 18px;
      margin: 8px 0 18px;
      border-radius: 999px;
      background: rgba(78, 161, 255, 0.10);
      border: 1px solid rgba(124, 196, 255, 0.22);
      color: #7cc4ff;
      font-size: 1.1rem;
      font-weight: 900;
      letter-spacing: 0.01em;
      box-shadow:
        inset 0 1px 0 rgba(255,255,255,0.06),
        0 0 18px rgba(78, 161, 255, 0.10);
    }

    .unlock-actions {
      display: grid;
      gap: 10px;
      margin-top: 8px;
    }

    .unlock-divider {
      margin: 16px 0 12px;
      color: #8290ae;
      font-size: 0.84rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      position: relative;
    }

    .unlock-divider::before,
    .unlock-divider::after {
      content: "";
      position: absolute;
      top: 50%;
      width: 32%;
      height: 1px;
      background: rgba(255,255,255,0.08);
    }

    .unlock-divider::before {
      left: 0;
    }

    .unlock-divider::after {
      right: 0;
    }

    .unlock-input {
      width: 100%;
      min-height: 48px;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04);
      color: #ffffff;
      outline: none;
      box-sizing: border-box;
      margin-bottom: 8px;
      transition:
        border-color 0.18s ease,
        box-shadow 0.18s ease,
        background 0.18s ease;
    }

    .unlock-input::placeholder {
      color: #8a97b4;
    }

        .unlock-input:focus {
      border-color: rgba(124, 196, 255, 0.32);
      background: rgba(255,255,255,0.05);
      box-shadow: 0 0 0 4px rgba(78, 161, 255, 0.10);
    }

    .unlock-box .btn,
    .unlock-box button:not(.unlock-close) {
      width: 100%;
      min-height: 48px;
      padding: 12px 16px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.08);
      background: linear-gradient(180deg, #17253d, #0f182a);
      color: #e8eefc;
      font-size: 15px;
      font-weight: 800;
      cursor: pointer;
      transition:
        transform 0.18s ease,
        border-color 0.18s ease,
        background 0.18s ease,
        box-shadow 0.18s ease,
        color 0.18s ease;
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
    }

    .unlock-box .btn:hover,
    .unlock-box button:not(.unlock-close):hover {
      transform: translateY(-2px);
      border-color: rgba(124, 196, 255, 0.24);
      box-shadow:
        0 12px 24px rgba(0, 0, 0, 0.28),
        0 0 0 1px rgba(124, 196, 255, 0.04);
    }

    .unlock-box .btn.btn-primary,
    .unlock-box #buyUnlockBtn {
      background: linear-gradient(135deg, #4ea1ff, #7cc4ff);
      color: #04101f;
      border-color: transparent;
      box-shadow:
        0 12px 26px rgba(78, 161, 255, 0.28),
        inset 0 1px 0 rgba(255,255,255,0.22);
    }

    .unlock-box .btn.btn-primary:hover,
    .unlock-box #buyUnlockBtn:hover {
      color: #04101f;
      filter: brightness(1.03);
      box-shadow:
        0 14px 30px rgba(78, 161, 255, 0.34),
        inset 0 1px 0 rgba(255,255,255,0.22);
    }

    .unlock-box #ownerUnlockBtn {
      background: linear-gradient(180deg, #16233a, #10192c);
      color: #e8eefc;
      border: 1px solid rgba(255,255,255,0.08);
    }

    .unlock-box #ownerUnlockBtn:hover {
      color: #7cc4ff;
      border-color: rgba(124, 196, 255, 0.24);
    }

    .unlock-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 48px;
      height: 48px;
      min-width: 48px;
      min-height: 48px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.06);
      color: #c8d3ee;
      cursor: pointer;
      font-size: 20px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      z-index: 5;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
      transition:
        transform 0.16s ease,
        background 0.16s ease,
        border-color 0.16s ease,
        color 0.16s ease;
    }

    .unlock-close:hover {
      transform: scale(1.06);
      background: rgba(255,255,255,0.08);
      border-color: rgba(124, 196, 255, 0.18);
      color: #ffffff;
    }

    .unlock-close:active {
      transform: scale(0.94);
    }

    .unlock-note {
      margin-top: 14px;
      font-size: 12px;
      color: #8290ae;
      line-height: 1.6;
    }

    #buyUnlockBtn,
    #ownerUnlockBtn {
      min-height: 48px;
      border-radius: 14px;
    }

    #buyUnlockBtn {
      box-shadow:
        0 10px 24px rgba(78, 161, 255, 0.24),
        inset 0 1px 0 rgba(255,255,255,0.20);
    }

    #buyUnlockBtn:hover {
      box-shadow:
        0 14px 28px rgba(78, 161, 255, 0.30),
        inset 0 1px 0 rgba(255,255,255,0.20);
    }

    @keyframes dnUnlockFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes dnUnlockPopIn {
      0% {
        transform: translate(-50%, -50%) scale(0.92);
        opacity: 0;
      }
      100% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .unlock-box {
        width: min(94vw, 380px);
        padding: 22px 16px 16px;
        border-radius: 20px;
      }

      .unlock-box h2 {
        font-size: 1.35rem;
      }

      .unlock-price {
        font-size: 1rem;
        min-height: 44px;
        padding: 9px 14px;
      }

      .unlock-close {
        top: 12px;
        right: 12px;
        width: 50px;
        height: 50px;
        font-size: 22px;
      }

      .unlock-input,
      #buyUnlockBtn,
      #ownerUnlockBtn {
        min-height: 44px;
      }
    }
  `;

  document.head.appendChild(style);
}

function ensureUnlockModal() {
  injectUnlockModalStyles();
  injectUnlockModalHtml();
}

function openUnlockModal() {
  ensureUnlockModal();
  bindUnlockModalEvents();

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
      startFullUnlockCheckout(); // later change to startFullUnlockCheckout()
    };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  ensureUnlockModal();
  bindUnlockModalEvents();

  // 🔥 SAFE CALL (no crash)
  try {
    syncUnlockWithServer();
  } catch (e) {
    console.log("Unlock sync error:", e);
  }
});
