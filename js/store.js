const STORE_STATE = {
  tokens: 0,
  premium: {},
  glass: {},
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

function syncGlassCardsToThemeCache() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const activeGlass = {};
    const now = Date.now();

    Object.entries(STORE_STATE.glass || {}).forEach(([packId, item]) => {
      const expiresAt = Number(item?.expiresAt || 0);

      if (expiresAt > now) {
        activeGlass[packId] = item;
      }
    });

    localStorage.setItem(
      `dn_premium_glass_cards_${user.uid}`,
      JSON.stringify(activeGlass)
    );
  } catch (error) {
    console.warn("Glass card theme cache sync failed:", error);
  }
}

function getGlassCardPacks() {
  return window.DN_CONFIG?.STORE?.GLASS_CARD_PACKS || [];
}

function isGlassPackActive(packId) {
  const item = STORE_STATE.glass?.[packId];
  const expiresAt = Number(item?.expiresAt || 0);

  if (expiresAt && expiresAt > Date.now()) {
    return true;
  }

  const packLevel = getGlassPackLevel(packId);
  return Boolean(packLevel && getHighestActiveGlassLevel() >= packLevel);
}

function getGlassPackLevel(packId) {
  const pack = getGlassCardPacks().find((item) => item.id === packId);
  return Number(pack?.level || 0);
}

function getGlassPackCost(packId) {
  const pack = getGlassCardPacks().find((item) => item.id === packId);
  return Number(pack?.cost || 0);
}

function getHighestActiveGlassLevel() {
  let highest = 0;

  Object.entries(STORE_STATE.glass || {}).forEach(([packId, item]) => {
    const expiresAt = Number(item?.expiresAt || 0);
    const level = Number(item?.level || getGlassPackLevel(packId));

    if (expiresAt > Date.now() && level > highest) {
      highest = level;
    }
  });

  return highest;
}

function getHighestActiveGlassCost() {
  let highestCost = 0;

  getGlassCardPacks().forEach((pack) => {
    if (Number(pack.level || 0) <= getHighestActiveGlassLevel()) {
      highestCost = Math.max(highestCost, Number(pack.cost || 0));
    }
  });

  return highestCost;
}

function getGlassPackEffectivePrice(packId) {
  const packLevel = getGlassPackLevel(packId);
  const packCost = getGlassPackCost(packId);
  const highestLevel = getHighestActiveGlassLevel();
  const highestCost = getHighestActiveGlassCost();

  if (highestLevel >= packLevel) return 0;

  return Math.max(0, packCost - highestCost);
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
    STORE_STATE.glass = {};    

    try {
      localStorage.removeItem("dn_premium_wallpapers_guest");
    } catch {}

    renderStore();
    return;
  }

  const sdk = window.firebaseSdk;
  const db = window.firebaseDb;

  const [tokenSnap, premiumSnap, glassSnap] = await Promise.all([
    sdk.get(sdk.ref(db, `dn_tokens/${user.uid}`)),
    sdk.get(sdk.ref(db, `premium_wallpapers/${user.uid}`)),
    sdk.get(sdk.ref(db, `premium_glass_cards/${user.uid}`)),
  ]);

  STORE_STATE.tokens = Number(tokenSnap.exists() ? tokenSnap.val()?.balance || 0 : 0);
  STORE_STATE.premium = premiumSnap.exists() ? premiumSnap.val() || {} : {};
  STORE_STATE.glass = glassSnap.exists() ? glassSnap.val() || {} : {};

  syncPremiumWallpapersToThemeCache();
  syncGlassCardsToThemeCache();

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

async function buyGlassCardPack(packId) {
  const user = requireLogin();
  if (!user) return;

  const pack = getGlassCardPacks().find((item) => item.id === packId);
  const buyBtn = document.querySelector(`[data-glass-pack-id="${packId}"]`);
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
      window.DN_CONFIG.BACKEND.API_BASE_URL + window.DN_CONFIG.BACKEND.BUY_GLASS_CARD_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          packId,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.ok) {
      if (data.message && data.message.includes("Not enough")) {
        showStoreMessage("❌ Not enough DN Tokens. Please top up!");
        setTopUpOpen(true);
      } else {
        showStoreMessage(data.message || "Could not buy glass card pack.");
      }

      return;
    }

    if (data.alreadyOwned) {
      showStoreMessage("Already unlocked. Use it in Customize App → Glass Cards.");
      await loadStoreState();
      return;
    }

    const upgradeCost = Number(data.upgradeCost || pack?.cost || 0);

    showTokenPurchaseCard({
      title: "Glass card pack unlocked",
      text: `${pack?.label || "Glass Cards"} is now yours for 30 days. Cost: ${upgradeCost} DN Tokens.`,
      previewUrl: "",
      useText: "Customize App → Glass Cards",
    });

    await loadStoreState();

    try {
      window.dispatchEvent(new Event("dnPremiumGlassChanged"));
    } catch {}
  } catch (error) {
    console.error("Glass card purchase error:", error);
    showStoreMessage("Could not buy glass card pack. Please try again.");
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

function renderGlassCardStore() {
  const grid = getEl("glassCardStoreGrid");
  if (!grid) return;

  grid.innerHTML = getGlassCardPacks()
    .map((pack) => {
      const active = isGlassPackActive(pack.id);
      const expiresAt = Number(STORE_STATE.glass?.[pack.id]?.expiresAt || 0);
      const effectivePrice = getGlassPackEffectivePrice(pack.id);
      const originalCost = Number(pack.cost || 0);
      const hasDiscount = !active && effectivePrice > 0 && effectivePrice < originalCost;

      return `
        <article class="glass-store-card glass-store-card-${pack.level}">
          <div class="glass-store-demo">
            <div class="glass-demo-card">Card</div>
            ${pack.level >= 2 ? `<div class="glass-demo-button">Button</div>` : ``}
            ${pack.level >= 3 ? `<div class="glass-demo-colors"><span></span><span></span><span></span></div>` : ``}
          </div>

          <div class="premium-wallpaper-info">
            <strong>${pack.label}</strong>
            <span>${pack.description}</span>
            <small>
              ${
                active
                  ? `Active until ${formatDate(expiresAt)}`
                  : hasDiscount
                    ? `<span class="price-old">${originalCost}</span> <span class="price-new">${effectivePrice} DN Tokens</span> / 30 days`
                    : `${originalCost} DN Tokens / 30 days`
              }
            </small>
          </div>

          <button
            class="btn ${active ? "btn-primary" : ""}"
            type="button"
            data-glass-pack-id="${pack.id}"
            data-glass-action="${active ? "owned" : "buy"}"
          >
            ${active ? "Unlocked" : "Buy"}
          </button>
        </article>
      `;
    })
    .join("");

  grid.querySelectorAll("[data-glass-pack-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const packId = btn.dataset.glassPackId;
      const action = btn.dataset.glassAction;

      if (action === "owned") {
        showStoreMessage("Already unlocked. Use it in Customize App → Glass Cards.");
      } else {
        buyGlassCardPack(packId);
      }
    });
  });
}

function renderStore() {
  updateTokenDisplays(STORE_STATE.tokens);
  renderTokenPackages();
  renderPremiumWallpapers();
  renderGlassCardStore();
}

function bindStore() {
  getEl("openStoreBtn")?.addEventListener("click", () => setStoreOpen(true));
  getEl("closeStoreBtn")?.addEventListener("click", () => setStoreOpen(false));
  getEl("refreshStoreBtn")?.addEventListener("click", loadStoreState);

  getEl("openWallpaperStoreBtn")?.addEventListener("click", () => {
    getEl("storeModal")?.classList.add("hidden");
    getEl("wallpaperStoreModal")?.classList.remove("hidden");
    getEl("wallpaperStoreModal")?.setAttribute("aria-hidden", "false");
    renderPremiumWallpapers();
  });

  getEl("openGlassStoreBtn")?.addEventListener("click", () => {
    getEl("storeModal")?.classList.add("hidden");
    getEl("glassStoreModal")?.classList.remove("hidden");
    getEl("glassStoreModal")?.setAttribute("aria-hidden", "false");
    renderGlassCardStore();
  });

  getEl("backToStoreFromWallpaperBtn")?.addEventListener("click", () => {
    getEl("wallpaperStoreModal")?.classList.add("hidden");
    setStoreOpen(true);
  });

  getEl("backToStoreFromGlassBtn")?.addEventListener("click", () => {
    getEl("glassStoreModal")?.classList.add("hidden");
    setStoreOpen(true);
  });

  getEl("closeWallpaperStoreBtn")?.addEventListener("click", () => {
    getEl("wallpaperStoreModal")?.classList.add("hidden");
    document.body.style.overflow = "";
  });

  getEl("closeGlassStoreBtn")?.addEventListener("click", () => {
    getEl("glassStoreModal")?.classList.add("hidden");
    document.body.style.overflow = "";
  });  

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
window.dnStoreIsGlassPackActive = isGlassPackActive;
window.dnStoreGetGlassCardPacks = getGlassCardPacks;
window.dnStoreGetHighestActiveGlassLevel = getHighestActiveGlassLevel;
window.dnStoreGetGlassPackEffectivePrice = getGlassPackEffectivePrice;
window.dnStoreLoadState = loadStoreState;
window.openDnStore = () => setStoreOpen(true);

document.addEventListener("DOMContentLoaded", () => {
  bindStore();
  loadStoreState();
});
