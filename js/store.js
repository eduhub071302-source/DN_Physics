const STORE_STATE = {
  tokens: 0,
  premium: {},
};

let LAST_RENDERED_TOKENS = null;

function getEl(id) {
  return document.getElementById(id);
}

function showStoreMessage(message) {
  if (typeof window.showToast === "function") {
    window.showToast(message);
    return;
  }

  alert(message);
}

function updateTokenDisplays(nextTokens) {
  const safeTokens = Number(nextTokens || 0);
  const previousTokens = LAST_RENDERED_TOKENS;
  const gain = previousTokens !== null ? safeTokens - previousTokens : 0;

  const storeBalance = getEl("dnTokenBalanceText");
  const topBalance = getEl("topTokenBalanceText");
  const topBalanceBtn = getEl("topTokenBalanceBtn");

  if (storeBalance) {
    storeBalance.innerHTML = `🪙 ${safeTokens}`;
  }

  if (topBalance) {
    topBalance.textContent = String(safeTokens);
  }

  if (gain > 0) {
    flashTokenGain(gain);
  }

  if (topBalanceBtn) {
    topBalanceBtn.classList.toggle("is-low", safeTokens < getWallpaperPrice());
  }

  LAST_RENDERED_TOKENS = safeTokens;
}

function flashTokenGain(amount) {
  const topBalanceBtn = getEl("topTokenBalanceBtn");
  const storeBalance = getEl("dnTokenBalanceText");

  [topBalanceBtn, storeBalance].forEach((el) => {
    if (!el) return;

    el.classList.remove("token-balance-flash");
    void el.offsetWidth;
    el.classList.add("token-balance-flash");
  });

  const bubble = document.createElement("div");
  bubble.className = "token-gain-bubble";
  bubble.textContent = `+${amount} 🪙`;
  document.body.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 1400);
}

function getWallpaperById(wallpaperId) {
  return getPremiumWallpapers().find((item) => item.id === wallpaperId) || null;
}

function showTokenPurchaseCard({ title, text, previewUrl, useText }) {
  const modal = getEl("tokenPurchaseModal");
  const titleEl = getEl("tokenPurchaseTitle");
  const textEl = getEl("tokenPurchaseText");
  const previewEl = getEl("tokenPurchasePreview");
  const useTextEl = getEl("tokenPurchaseUseText");

  if (!modal) {
    showStoreMessage(title || "Premium item unlocked.");
    return;
  }

  if (titleEl) titleEl.textContent = title || "Premium item unlocked";
  if (textEl) textEl.textContent = text || "Your premium item is ready.";
  if (useTextEl) useTextEl.textContent = useText || "Customize App → Wallpapers";

  if (previewEl) {
    if (previewUrl) {
      previewEl.style.backgroundImage = `linear-gradient(rgba(10,16,28,.12),rgba(10,16,28,.12)), url("${previewUrl}")`;
      previewEl.classList.remove("is-empty");
    } else {
      previewEl.style.backgroundImage = "";
      previewEl.classList.add("is-empty");
      previewEl.textContent = "Premium item";
    }
  }

  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeTokenPurchaseCard() {
  const modal = getEl("tokenPurchaseModal");
  if (!modal) return;

  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");

  const storeModal = getEl("storeModal");
  const topUpModal = getEl("topUpModal");

  if (
    (!storeModal || storeModal.classList.contains("hidden")) &&
    (!topUpModal || topUpModal.classList.contains("hidden"))
  ) {
    document.body.style.overflow = "";
  }
}

function getCurrentUser() {
  return window.firebaseAuth?.currentUser || null;
}

function requireLogin() {
  const user = getCurrentUser();

  if (user) return user;

  showStoreMessage("Please log in before using DN Store.");

  if (typeof window.openDnAuthModal === "function") {
    window.openDnAuthModal();
  }

  return null;
}

async function getFirebaseToken() {
  const user = requireLogin();
  if (!user) return "";

  if (typeof user.getIdToken === "function") {
    return user.getIdToken(true);
  }

  return "";
}

function getSdkReady() {
  return Boolean(
    window.firebaseSdk?.ref &&
    window.firebaseSdk?.get &&
    window.firebaseSdk?.onValue &&
    window.firebaseDb
  );
}

function syncPremiumWallpapersToThemeCache() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const activePremium = {};
    const now = Date.now();

    Object.entries(STORE_STATE.premium || {}).forEach(([wallpaperId, item]) => {
      const expiresAt = Number(item?.expiresAt || 0);

      if (expiresAt > now) {
        activePremium[wallpaperId] = item;
      }
    });

    localStorage.setItem(
      `dn_premium_wallpapers_${user.uid}`,
      JSON.stringify(activePremium)
    );
  } catch (error) {
    console.warn("Premium wallpaper theme cache sync failed:", error);
  }
}

function getWallpaperPrice() {
  return Number(window.DN_CONFIG?.STORE?.WALLPAPER_PRICE || 25);
}

function getTokenPackages() {
  return window.DN_CONFIG?.STORE?.TOKEN_PACKAGES || [];
}

function getPremiumWallpapers() {
  return (window.DN_THEME_WALLPAPERS || []).filter((item) => item.premium);
}

function isWallpaperActive(wallpaperId) {
  const item = STORE_STATE.premium?.[wallpaperId];
  const expiresAt = Number(item?.expiresAt || 0);
  return Boolean(expiresAt && expiresAt > Date.now());
}

function formatDate(ms) {
  const value = Number(ms || 0);
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

async function loadStoreState() {
  const user = getCurrentUser();

  if (!user || !getSdkReady()) {
    STORE_STATE.tokens = 0;
    STORE_STATE.premium = {};

    try {
      localStorage.removeItem("dn_premium_wallpapers_guest");
    } catch {}

    renderStore();
    return;
  }

  const sdk = window.firebaseSdk;
  const db = window.firebaseDb;

  const [tokenSnap, premiumSnap] = await Promise.all([
    sdk.get(sdk.ref(db, `dn_tokens/${user.uid}`)),
    sdk.get(sdk.ref(db, `premium_wallpapers/${user.uid}`)),
  ]);

  STORE_STATE.tokens = Number(tokenSnap.exists() ? tokenSnap.val()?.balance || 0 : 0);
  STORE_STATE.premium = premiumSnap.exists() ? premiumSnap.val() || {} : {};

  syncPremiumWallpapersToThemeCache();

  if (typeof window.dnThemeApplyToCurrentPage === "function") {
    window.dnThemeApplyToCurrentPage();
  }

  renderStore();
}

function setStoreOpen(open) {
  const modal = getEl("storeModal");
  const settingsModal = getEl("settingsModal");

  if (!modal) return;

  if (open) {
    if (settingsModal) {
      settingsModal.classList.add("hidden");
      settingsModal.setAttribute("aria-hidden", "true");
    }

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    loadStoreState();
  } else {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
}

function setTopUpOpen(open) {
  const modal = getEl("topUpModal");
  if (!modal) return;

  if (open) {
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    renderTokenPackages();

    const grid = getEl("tokenPackageGrid");
    if (grid && !grid.innerHTML.trim()) {
      grid.innerHTML = `
        <div class="empty-state">
          Token packages could not load. Please refresh the app.
        </div>
      `;
    }
  } else {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");

    const storeModal = getEl("storeModal");
    if (!storeModal || storeModal.classList.contains("hidden")) {
      document.body.style.overflow = "";
    }
  }
}

async function startTokenCheckout(packageId) {
  const user = requireLogin();
  if (!user) return;

  const packageBtn = document.querySelector(`[data-package-id="${packageId}"]`);
  const oldText = packageBtn ? packageBtn.innerHTML : "";

  if (packageBtn) {
    packageBtn.disabled = true;
    packageBtn.classList.add("is-loading");
    packageBtn.innerHTML = `
      <strong>Opening PayHere...</strong>
      <span>Please wait</span>
      <small>Securing checkout</small>
    `;
  }

  try {
    const idToken = await getFirebaseToken();
    if (!idToken) {
      showStoreMessage("Login token missing. Please refresh and log in again.");
      return;
    }

    const profile = JSON.parse(localStorage.getItem("dn_profile") || "{}");

    const res = await fetch(
      window.DN_CONFIG.BACKEND.API_BASE_URL + window.DN_CONFIG.BACKEND.CREATE_TOKEN_ORDER_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          packageId,
          uid: user.uid,
          email: user.email || profile.email || "",
          first_name: profile.name || "DN",
          last_name: "User",
          phone: profile.phone || "0770000000",
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {

      if (data.message && data.message.includes("Not enough")) {

        showStoreMessage("❌ Not enough DN Tokens. Please top up!");

        // open top-up modal automatically
        setTopUpOpen(true);

      } else {
        showStoreMessage(data.message || "Could not buy wallpaper.");
      }

      return;
    }

    const orderId = data.fields?.order_id || "";
    const selectedPack = getTokenPackages().find((pack) => pack.id === packageId);

    if (typeof window.setPendingOrderId === "function") {
      window.setPendingOrderId(orderId);
    }

    try {
      localStorage.setItem("dn_pending_payment_type", "dn_tokens");
      localStorage.setItem("dn_pending_token_package_id", packageId);
      localStorage.setItem("dn_pending_token_amount", String(selectedPack?.tokens || 0));
    } catch {}

    if (typeof window.showCheckoutLoading === "function") {
      window.showCheckoutLoading();
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.checkout_url;
    form.style.display = "none";

    Object.entries(data.fields || {}).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error("Token checkout error:", error);
    showStoreMessage("Could not open PayHere. Please try again.");
  } finally {
    if (packageBtn) {
      packageBtn.disabled = false;
      packageBtn.classList.remove("is-loading");
      packageBtn.innerHTML = oldText;
    }
  }
}

async function buyPremiumWallpaper(wallpaperId) {
  const user = requireLogin();
  if (!user) return;

  const wallpaper = getWallpaperById(wallpaperId);
  const buyBtn = document.querySelector(`[data-wallpaper-id="${wallpaperId}"]`);
  const oldText = buyBtn ? buyBtn.textContent : "";

  if (buyBtn) {
    buyBtn.disabled = true;
    buyBtn.textContent = "Buying...";
  }

  try {
    const idToken = await getFirebaseToken();
    if (!idToken) {
      showStoreMessage("Login token missing. Please refresh and log in again.");
      return;
    }

    const res = await fetch(
      window.DN_CONFIG.BACKEND.API_BASE_URL + window.DN_CONFIG.BACKEND.BUY_WALLPAPER_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          wallpaperId,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      if (data.message && data.message.includes("Not enough")) {
        showStoreMessage("❌ Not enough DN Tokens. Please top up!");
        setTopUpOpen(true);
      } else {
        showStoreMessage(data.message || "Could not buy wallpaper.");
      }

      return;
    }

    showTokenPurchaseCard({
      title: "Premium wallpaper unlocked",
      text: `${wallpaper?.pack || "Premium wallpaper"} is now yours for 30 days.`,
      previewUrl: wallpaper?.src || "",
      useText: "Customize App → Wallpapers → Premium Wallpapers",
    });

    await loadStoreState();

    try {
      window.dispatchEvent(new Event("dnPremiumAccessChanged"));
    } catch {}
  } catch (error) {
    console.error("Wallpaper purchase error:", error);
    showStoreMessage("Could not buy wallpaper. Please try again.");
  } finally {
    if (buyBtn) {
      buyBtn.disabled = false;
      buyBtn.textContent = oldText || "Buy";
    }
  }
}
function applyWallpaper(wallpaperId) {
  const settings = window.dnThemeLoadSettings?.();
  if (!settings) return;

  const scope = window.dnThemeGetPageScope?.() || "home";

  if (!settings[scope]) {
    settings[scope] = { wallpaper: "", accent: "blue" };
  }

  settings[scope].wallpaper = wallpaperId;

  window.dnThemeSaveSettings?.(settings);
  window.dnThemeApplyToCurrentPage?.();

  showStoreMessage("Wallpaper applied.");
}

function renderTokenPackages() {
  const grid = getEl("tokenPackageGrid");
  if (!grid) return;

  grid.innerHTML = getTokenPackages()
    .map((pack) => {
      return `
        <button class="token-package-card" type="button" data-package-id="${pack.id}">
          <strong>${pack.label}</strong>
          <span>Rs. ${pack.price}</span>
          <small>PayHere checkout</small>
        </button>
      `;
    })
    .join("");

  grid.querySelectorAll("[data-package-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      startTokenCheckout(btn.dataset.packageId);
    });
  });
}

function renderPremiumWallpapers() {
  const grid = getEl("premiumWallpaperGrid");
  if (!grid) return;

  const price = getWallpaperPrice();

  grid.innerHTML = getPremiumWallpapers()
    .map((wallpaper) => {
      const active = isWallpaperActive(wallpaper.id);
      const expiresAt = Number(STORE_STATE.premium?.[wallpaper.id]?.expiresAt || 0);

      return `
        <article class="premium-wallpaper-card">
          <div
            class="premium-wallpaper-preview"
            style="background-image:linear-gradient(rgba(10,16,28,.12),rgba(10,16,28,.12)),url('${wallpaper.src}')"
          ></div>

          <div class="premium-wallpaper-info">
            <strong>${wallpaper.pack}</strong>
            <span>${active ? `Active until ${formatDate(expiresAt)}` : `${price} DN Tokens / 30 days`}</span>
          </div>

          <button
            class="btn ${active ? "btn-primary" : ""}"
            type="button"
            data-wallpaper-action="${active ? "apply" : "buy"}"
            data-wallpaper-id="${wallpaper.id}"
          >
            ${active ? "Apply" : "Buy"}
          </button>
        </article>
      `;
    })
    .join("");

  grid.querySelectorAll("[data-wallpaper-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wallpaperId = btn.dataset.wallpaperId;
      const action = btn.dataset.wallpaperAction;

      if (action === "apply") {
        applyWallpaper(wallpaperId);
      } else {
        buyPremiumWallpaper(wallpaperId);
      }
    });
  });
}

function renderStore() {
  updateTokenDisplays(STORE_STATE.tokens);
  renderTokenPackages();
  renderPremiumWallpapers();
}

function bindStore() {
  getEl("openStoreBtn")?.addEventListener("click", () => setStoreOpen(true));
  getEl("closeStoreBtn")?.addEventListener("click", () => setStoreOpen(false));
  getEl("refreshStoreBtn")?.addEventListener("click", loadStoreState);

  getEl("openTopUpBtn")?.addEventListener("click", () => setTopUpOpen(true));
  getEl("closeTopUpBtn")?.addEventListener("click", () => setTopUpOpen(false));

  getEl("topTokenBalanceBtn")?.addEventListener("click", () => setStoreOpen(true));
  getEl("closeTokenPurchaseBtn")?.addEventListener("click", closeTokenPurchaseCard);

  getEl("tokenPurchaseModal")?.addEventListener("click", (event) => {
    if (event.target?.id === "tokenPurchaseModal") {
      closeTokenPurchaseCard();
    }
  });

  getEl("topUpModal")?.addEventListener("click", (event) => {
    if (event.target?.id === "topUpModal") {
      setTopUpOpen(false);
    }
  });

  getEl("storeModal")?.addEventListener("click", (event) => {
    if (event.target?.id === "storeModal") {
      setStoreOpen(false);
    }
  });

  window.addEventListener("dnPremiumAccessChanged", loadStoreState);
}

window.dnStoreIsWallpaperActive = isWallpaperActive;
window.dnStoreLoadState = loadStoreState;
window.openDnStore = () => setStoreOpen(true);

document.addEventListener("DOMContentLoaded", () => {
  bindStore();
  loadStoreState();
});
