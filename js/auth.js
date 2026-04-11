function getFirebaseDb() {
  return window.firebaseDb || null;
}
// 🔐 DN Physics Auth System — Premium Organized Final Version
// Safe for your current modal IDs and current app flow.

(() => {
  "use strict";

  const APP_PATH = "";
  const OFFLINE_URL = `${APP_PATH}/offline.html`;
  const RESET_PASSWORD_URL = `${window.location.origin}${APP_PATH}/reset-password.html`;
  const USER_KEY = "dn_user";
  const PROFILE_KEY = "dn_profile";
  const DEFAULT_AVATAR = "avatar-01";

  function getEls() {
    return {
      authModal: document.getElementById("authModal"),
      authSubmitBtn: document.getElementById("authSubmitBtn"),
      authSecondaryBtn: document.getElementById("authSecondaryBtn"),
      switchAccountBtn: document.getElementById("switchAccountBtn"),
      authCloseBtn: document.getElementById("authCloseBtn"),

      authEmail: document.getElementById("authEmail"),
      authPassword: document.getElementById("authPassword"),
      authConfirmPassword: document.getElementById("authConfirmPassword"),

      authConfirmRow: document.getElementById("authConfirmRow"),
      authPasswordRow: document.getElementById("authPasswordRow"),

      authTitle: document.getElementById("authTitle"),
      authToggleText: document.getElementById("authToggleText"),

      togglePasswordBtn: document.getElementById("togglePasswordBtn"),
      eyeIcon: document.getElementById("eyeIcon"),
      toggleConfirmPasswordBtn: document.getElementById(
        "toggleConfirmPasswordBtn",
      ),
      confirmEyeIcon: document.getElementById("confirmEyeIcon"),
      forgotBtn: document.getElementById("forgotPasswordBtn"),

      loginBtn: document.getElementById("loginBtn"),

      profileEditorSection: document.getElementById("profileEditorSection"),
      profileNameInput: document.getElementById("profileNameInput"),
      profileBioInput: document.getElementById("profileBioInput"),
      presetAvatarGrid: document.getElementById("presetAvatarGrid"),
      profileAvatarPreview: document.getElementById("profileAvatarPreview"),

      openAvatarModalBtn: document.getElementById("openAvatarModalBtn"),

      confirmLogoutBtn: document.getElementById("confirmLogoutBtn"),
      cancelLogoutBtn: document.getElementById("cancelLogoutBtn"),
      logoutModal: document.getElementById("logoutModal"),
    };
  }

  function buildPresetAvatarUrl(avatarValue, version = "") {
    const safeValue = avatarValue || DEFAULT_AVATAR;
    const suffix = version ? `?v=${encodeURIComponent(version)}` : "";
    return `${APP_PATH}/assets/avatars/${safeValue}.png${suffix}`;
  }

  // =========================
  // CORE HELPERS
  // =========================

  function getFirebaseAuth() {
    return window.firebaseAuth || null;
  }

  function getConfigStorageKey(name, fallback = "") {
    try {
      return window.DN_CONFIG?.STORAGE_KEYS?.[name] || fallback;
    } catch {
      return fallback;
    }
  }

  function safeSetLocal(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`LocalStorage set failed for ${key}:`, error);
    }
  }

  function safeGetLocal(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`LocalStorage get failed for ${key}:`, error);
      return null;
    }
  }

  function safeRemoveLocal(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`LocalStorage remove failed for ${key}:`, error);
    }
  }

  function redirectOffline() {
    window.location.href = OFFLINE_URL;
  }

  function isOfflineError(error) {
    return !navigator.onLine || error instanceof TypeError;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function normalizeEmail(email) {
    return String(email || "")
      .trim()
      .toLowerCase();
  }

  function getPresetAvatarList() {
    return Array.from({ length: 30 }, (_, i) => {
      const index = String(i + 1).padStart(2, "0");
      return {
        id: `avatar-${index}`,
        url: buildPresetAvatarUrl(`avatar-${index}`),
      };
    });
  }

  function getUser() {
    try {
      return JSON.parse(safeGetLocal(USER_KEY)) || null;
    } catch {
      return null;
    }
  }

  function setUser(user) {
    safeSetLocal(USER_KEY, JSON.stringify(user || null));
  }

  function clearUser() {
    safeRemoveLocal(USER_KEY);
    safeRemoveLocal(PROFILE_KEY);
  }

  function getProfileCache() {
    try {
      return JSON.parse(safeGetLocal(PROFILE_KEY)) || null;
    } catch {
      return null;
    }
  }

  function setProfileCache(profile) {
    safeSetLocal(PROFILE_KEY, JSON.stringify(profile || {}));

    const configProfileKey = getConfigStorageKey("USER_PROFILE");
    if (configProfileKey) {
      safeSetLocal(configProfileKey, JSON.stringify(profile || {}));
    }
  }

  function clearProfileCache() {
    safeRemoveLocal(PROFILE_KEY);

    const configProfileKey = getConfigStorageKey("USER_PROFILE");
    if (configProfileKey) {
      safeRemoveLocal(configProfileKey);
    }
  }

  function setSessionToken(token) {
    const sessionKey = getConfigStorageKey("USER_SESSION_TOKEN");
    if (!sessionKey) return;
    safeSetLocal(sessionKey, token || "");
  }

  function clearSessionToken() {
    const sessionKey = getConfigStorageKey("USER_SESSION_TOKEN");
    if (!sessionKey) return;
    safeRemoveLocal(sessionKey);
  }

  function syncProfileUiEverywhere() {
    const user = getUser();
    if (typeof window.updateProfileUI === "function") {
      try {
        window.updateProfileUI(user);
      } catch (error) {
        console.warn("updateProfileUI failed:", error);
      }
    }
  }

  function updateAccountButton() {
    syncProfileUiEverywhere();
  }

  function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (!modal) return;

    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function openAuthModal() {
    const modal = document.getElementById("authModal");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function clearAuthError() {
    const errorBox = document.getElementById("authErrorBox");
    if (errorBox) errorBox.remove();
  }

  function showAuthError(message, isSuccess = false) {
    const authBox = document.querySelector("#authModal .auth-box");
    if (!authBox) return;

    let errorBox = document.getElementById("authErrorBox");

    if (!errorBox) {
      errorBox = document.createElement("div");
      errorBox.id = "authErrorBox";

      const submitBtn = document.getElementById("authSubmitBtn");
      if (submitBtn && submitBtn.parentNode === authBox) {
        authBox.insertBefore(errorBox, submitBtn);
      } else {
        authBox.appendChild(errorBox);
      }
    }

    errorBox.style.cssText = `
      margin: 10px 0 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background: ${isSuccess ? "rgba(34,197,94,0.12)" : "rgba(255,0,0,0.10)"};
      color: ${isSuccess ? "#86efac" : "#ff6b6b"};
      font-size: 14px;
      text-align: center;
      border: 1px solid ${isSuccess ? "rgba(34,197,94,0.25)" : "rgba(255,107,107,0.22)"};
      line-height: 1.45;
    `;

    errorBox.textContent = message;
  }

  function setEyeState(input, button, icon, show) {
    if (!input || !button || !icon) return;

    input.type = show ? "text" : "password";
    button.setAttribute("aria-label", show ? "Hide password" : "Show password");

    if (show) {
      icon.innerHTML = `
        <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.9C19 4.9 23 12 23 12C22.39 13.43 21.55 14.72 20.53 15.85" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M6.71 6.72C4.42 8.18 2.74 10.35 1 12C1 12 5 19.1 12 19.1C13.8 19.1 15.46 18.63 16.94 17.82" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      `;
    } else {
      icon.innerHTML = `
        <path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
      `;
    }
  }

  async function isUserLoggedIn() {
    const client = getFirebaseDb();
    if (!client) return false;

    const { data } = await client.auth.getSession();
    return !!data?.session?.user;
  }

  // =========================
  // PROFILE DATA
  // =========================

  async function loadUserProfile(userId) {
    const db = getFirebaseDb();
    if (!db || !userId) return null;
    try {
      const snapshot = await db.ref(`/profiles/${userId}`).get();
      const data = snapshot.exists() ? snapshot.val() : null;
      if (data) {
        if (!data.profile_photo_url && data.avatar_value) {
          data.profile_photo_url = buildPresetAvatarUrl(data.avatar_value);
        }
        setProfileCache(data);
        syncProfileUiEverywhere();
        return data;
      }
      return null;
    } catch (error) {
      console.warn("Profile fetch warning:", error);
      return null;
    }
  }

  async function ensureProfile(user) {
    const db = getFirebaseDb();
    if (!db || !user?.uid || !user?.email) return null;
    const existing = getProfileCache();
    const profilePayload = {
      id: user.uid,
      email: user.email,
      name: existing?.name || user.email.split("@")[0],
      bio: existing?.bio || null,
      avatar_type: existing?.avatar_type || "preset",
      avatar_value: existing?.avatar_value || DEFAULT_AVATAR,
      profile_photo_url:
        existing?.profile_photo_url ||
        buildPresetAvatarUrl(existing?.avatar_value || DEFAULT_AVATAR),
    };
    try {
      await db.ref(`/profiles/${user.uid}`).set(profilePayload);
      setProfileCache(profilePayload);
      syncProfileUiEverywhere();
      return profilePayload;
    } catch (error) {
      console.warn("Profile upsert failed:", error);
      const merged = { ...(existing || {}), ...profilePayload };
      setProfileCache(merged);
      syncProfileUiEverywhere();
      return merged;
    }
  }

  async function saveUserProfile(userId, payload) {
    const db = getFirebaseDb();
    if (!db) return { ok: false, message: "Firebase DB not ready." };
    if (!userId) return { ok: false, message: "User ID missing." };
    try {
      const finalPayload = {
        id: userId,
        ...payload,
        updated_at: new Date().toISOString(),
      };
      await db.ref(`/profiles/${userId}`).set(finalPayload);
      setProfileCache(finalPayload);
      syncProfileUiEverywhere();
      return { ok: true, data: finalPayload };
    } catch (error) {
      console.error("saveUserProfile failed:", error);
      return { ok: false, message: "Could not save profile." };
    }
  }

  // =========================
  // SESSION + AUTH
  // =========================

  async function syncProgressIfAvailable() {
    if (typeof window.syncCloudProgressToLocal === "function") {
      try {
        await window.syncCloudProgressToLocal();
      } catch (error) {
        console.warn("syncCloudProgressToLocal failed:", error);
      }
    }
  }

  async function applyAuthenticatedUser(user, accessToken = "") {
    // Expose for global use (e.g., from index.html onAuthStateChanged)
    window.applyAuthenticatedUser = applyAuthenticatedUser;
    if (!user) return;

    // Always use user.uid for Firebase Auth users
    const userObj = { ...user, id: user.uid };
    setUser(userObj);
    setSessionToken(accessToken || "");

    const profile = await ensureProfile(user);
    await loadUserProfile(user.uid);
    // 🔄 FULL SYNC (bi-directional)

    // 1. Pull cloud → local
    await syncProgressIfAvailable();

    // 2. Push local → cloud (important for offline users)
    if (typeof window.syncLocalProgressToCloud === "function") {
      try {
        await window.syncLocalProgressToCloud();
      } catch (error) {
        console.warn("syncLocalProgressToCloud failed:", error);
      }
    }

    try {
      const topProfileAvatarImg = document.getElementById(
        "topProfileAvatarImg",
      );
      const topProfileAvatar = document.getElementById("topProfileAvatar");
      const userEmailDisplay = document.getElementById("userEmailDisplay");

      const avatarUrl =
        profile?.profile_photo_url ||
        buildPresetAvatarUrl(
          profile?.avatar_value || DEFAULT_AVATAR,
          Date.now(),
        );

      if (topProfileAvatarImg) {
        topProfileAvatarImg.src = avatarUrl;
      }

      if (topProfileAvatar) {
        topProfileAvatar.classList.remove("is-hidden");
        topProfileAvatar.setAttribute("aria-hidden", "false");
      }

      if (userEmailDisplay) {
        userEmailDisplay.textContent = user.email || "";
      }
    } catch (error) {
      console.warn("Topbar applyAuthenticatedUser UI sync failed:", error);
    }

    syncProfileUiEverywhere();
  }

  async function clearAuthenticatedUser() {
    // Expose for global use (e.g., from index.html onAuthStateChanged)
    window.clearAuthenticatedUser = clearAuthenticatedUser;
    clearUser();
    clearSessionToken();
    clearProfileCache();

    if (typeof window.clearPaidAccess === "function") {
      try {
        window.clearPaidAccess();
      } catch (error) {
        console.warn("clearPaidAccess failed:", error);
      }
    }

    try {
      localStorage.removeItem("dn_user");
    } catch {}

    try {
      const topProfileAvatarImg = document.getElementById(
        "topProfileAvatarImg",
      );
      if (topProfileAvatarImg) {
        topProfileAvatarImg.src = buildPresetAvatarUrl(
          DEFAULT_AVATAR,
          Date.now(),
        );
      }

      const topProfileAvatar = document.getElementById("topProfileAvatar");
      if (topProfileAvatar) {
        topProfileAvatar.classList.add("is-hidden");
        topProfileAvatar.setAttribute("aria-hidden", "true");
      }

      const userEmailDisplay = document.getElementById("userEmailDisplay");
      if (userEmailDisplay) {
        userEmailDisplay.textContent = "";
      }
    } catch (error) {
      console.warn("UI reset after clearAuthenticatedUser failed:", error);
    }

    syncProfileUiEverywhere();
  }

  async function restoreUserSession() {
    const client = getClient();
    if (!client) return;

    try {
      const { data } = await client.auth.getSession();
      const session = data?.session;

      if (session?.user) {
        await applyAuthenticatedUser(session.user, session.access_token || "");
      } else {
        await clearAuthenticatedUser();
      }
    } catch (error) {
      console.error("Restore session failed:", error);
      await clearAuthenticatedUser();
    }
  }

  async function logout() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    const els = getEls();
    if (!navigator.onLine) {
      redirectOffline();
      return;
    }
    try {
      await auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
      if (!navigator.onLine) {
        redirectOffline();
        return;
      }
      showAuthError("Unable to log out right now. Please try again.");
      return;
    }
    await clearAuthenticatedUser();
    if (els.logoutModal) {
      els.logoutModal.classList.add("hidden");
    }
    closeAuthModal();
    syncProfileUiEverywhere();
    if (typeof window.showToast === "function") {
      window.showToast("👋 Logged out");
    }
  }

  async function switchAccount(renderAuthModeRef) {
    const client = getClient();
    if (!client) return;

    const els = getEls();

    if (!navigator.onLine) {
      redirectOffline();
      return;
    }

    try {
      await client.auth.signOut();
    } catch (error) {
      console.error("Switch account error:", error);

      if (!navigator.onLine) {
        redirectOffline();
        return;
      }

      showAuthError("Unable to switch account right now. Please try again.");
      return;
    }

    await clearAuthenticatedUser();

    if (els.logoutModal) {
      els.logoutModal.classList.add("hidden");
    }

    if (typeof renderAuthModeRef === "function") {
      renderAuthModeRef(true);
    } else {
      openAuthModal();
    }

    if (els.authEmail) els.authEmail.value = "";
    if (els.authPassword) els.authPassword.value = "";
    if (els.authConfirmPassword) els.authConfirmPassword.value = "";

    if (typeof window.showToast === "function") {
      window.showToast("🔄 Log in with another account");
    }

    setTimeout(() => {
      els.authEmail?.focus();
    }, 150);
  }

  // =========================
  // AVATAR MODAL
  // =========================

  function ensureAvatarModalExists() {
    let avatarModal = document.getElementById("avatarModal");
    if (avatarModal) return avatarModal;

    avatarModal = document.createElement("div");
    avatarModal.id = "avatarModal";
    avatarModal.className = "auth-modal hidden";
    avatarModal.innerHTML = `
      <div class="auth-box premium-auth-box" style="max-width:560px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px;">
          <h2 style="margin:0;">Choose Avatar</h2>
          <button id="closeAvatarModal" class="btn" type="button">Close</button>
        </div>
        <div
          id="avatarGridModal"
          class="preset-avatar-grid"
          style="display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:12px;"
        ></div>
      </div>
    `;
    document.body.appendChild(avatarModal);
    return avatarModal;
  }

  // =========================
  // INIT
  // =========================

  document.addEventListener("DOMContentLoaded", () => {
    // Firebase session restore: always update UI after refresh
    if (
      window.firebaseAuth &&
      typeof window.firebaseAuth.onAuthStateChanged === "function"
    ) {
      window.firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
          applyAuthenticatedUser(user);
        } else {
          clearAuthenticatedUser();
        }
      });
    }
    const els = {
      authModal: document.getElementById("authModal"),
      authSubmitBtn: document.getElementById("authSubmitBtn"),
      authSecondaryBtn: document.getElementById("authSecondaryBtn"),
      switchAccountBtn: document.getElementById("switchAccountBtn"),
      authCloseBtn: document.getElementById("authCloseBtn"),

      authEmail: document.getElementById("authEmail"),
      authPassword: document.getElementById("authPassword"),
      authConfirmPassword: document.getElementById("authConfirmPassword"),

      authConfirmRow: document.getElementById("authConfirmRow"),
      authPasswordRow: document.getElementById("authPasswordRow"),

      authTitle: document.getElementById("authTitle"),
      authToggleText: document.getElementById("authToggleText"),

      togglePasswordBtn: document.getElementById("togglePasswordBtn"),
      eyeIcon: document.getElementById("eyeIcon"),
      toggleConfirmPasswordBtn: document.getElementById(
        "toggleConfirmPasswordBtn",
      ),
      confirmEyeIcon: document.getElementById("confirmEyeIcon"),
      forgotBtn: document.getElementById("forgotPasswordBtn"),

      loginBtn: document.getElementById("loginBtn"),

      profileEditorSection: document.getElementById("profileEditorSection"),
      profileNameInput: document.getElementById("profileNameInput"),
      profileBioInput: document.getElementById("profileBioInput"),
      presetAvatarGrid: document.getElementById("presetAvatarGrid"),
      profileAvatarPreview: document.getElementById("profileAvatarPreview"),

      openAvatarModalBtn: document.getElementById("openAvatarModalBtn"),

      confirmLogoutBtn: document.getElementById("confirmLogoutBtn"),
      cancelLogoutBtn: document.getElementById("cancelLogoutBtn"),
      logoutModal: document.getElementById("logoutModal"),
    };

    let isLoginMode = true;
    let selectedAvatarValue = DEFAULT_AVATAR;
    let isSubmitting = false;

    function setSelectedAvatar(avatarId) {
      selectedAvatarValue = avatarId || DEFAULT_AVATAR;

      const freshUrl = buildPresetAvatarUrl(selectedAvatarValue, Date.now());

      if (els.profileAvatarPreview) {
        els.profileAvatarPreview.src = freshUrl;
      }

      const topProfileAvatarImg = document.getElementById(
        "topProfileAvatarImg",
      );
      if (topProfileAvatarImg) {
        topProfileAvatarImg.src = freshUrl;
      }

      if (!els.presetAvatarGrid) return;

      els.presetAvatarGrid
        .querySelectorAll("[data-avatar-id]")
        .forEach((btn) => {
          const active = btn.dataset.avatarId === selectedAvatarValue;
          btn.style.borderColor = active
            ? "rgba(78,161,255,0.8)"
            : "rgba(255,255,255,0.08)";
          btn.style.boxShadow = active
            ? "0 0 0 3px rgba(78,161,255,0.16), 0 12px 22px rgba(0,0,0,0.26)"
            : "0 8px 18px rgba(0,0,0,0.18)";
          btn.style.transform = active ? "scale(1.06)" : "scale(1)";
        });
    }

    function renderPresetAvatarGrid(selectedId = DEFAULT_AVATAR) {
      if (!els.presetAvatarGrid) return;

      const avatars = getPresetAvatarList();

      els.presetAvatarGrid.innerHTML = avatars
        .map(
          (avatar) => `
        <button
          type="button"
          data-avatar-id="${avatar.id}"
          aria-label="Choose ${avatar.id}"
          title="${avatar.id}"
          style="
            width:100%;
            aspect-ratio:1/1;
            border-radius:50%;
            overflow:hidden;
            border:2px solid rgba(255,255,255,0.08);
            background:rgba(255,255,255,0.04);
            padding:0;
            cursor:pointer;
            transition:transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
            box-shadow:0 8px 18px rgba(0,0,0,0.18);
          "
        >
          <img
            src="${avatar.url}"
            alt="${avatar.id}"
            style="width:100%; height:100%; object-fit:cover; display:block;"
          />
        </button>
      `,
        )
        .join("");

      els.presetAvatarGrid
        .querySelectorAll("[data-avatar-id]")
        .forEach((btn) => {
          btn.addEventListener("click", () =>
            setSelectedAvatar(btn.dataset.avatarId),
          );
        });

      setSelectedAvatar(selectedId);
    }

    function renderAvatarModalGrid() {
      const avatarModal = ensureAvatarModalExists();
      const avatarGridModal = avatarModal.querySelector("#avatarGridModal");
      const closeAvatarModalBtn =
        avatarModal.querySelector("#closeAvatarModal");

      if (!avatarGridModal) return;

      const avatars = getPresetAvatarList();

      avatarGridModal.innerHTML = avatars
        .map(
          (avatar) => `
        <button
          type="button"
          data-id="${avatar.id}"
          aria-label="Choose ${avatar.id}"
          title="${avatar.id}"
          style="
            width:100%;
            aspect-ratio:1/1;
            border-radius:50%;
            overflow:hidden;
            border:2px solid ${avatar.id === selectedAvatarValue ? "rgba(78,161,255,0.8)" : "rgba(255,255,255,0.08)"};
            background:rgba(255,255,255,0.04);
            padding:0;
            cursor:pointer;
            transition:transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
            box-shadow:${avatar.id === selectedAvatarValue ? "0 0 0 3px rgba(78,161,255,0.16), 0 12px 22px rgba(0,0,0,0.26)" : "0 8px 18px rgba(0,0,0,0.18)"};
          "
        >
          <img
            src="${avatar.url}"
            alt="${avatar.id}"
            style="width:100%; height:100%; object-fit:cover; display:block;"
          />
        </button>
      `,
        )
        .join("");

      avatarGridModal.querySelectorAll("[data-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
          setSelectedAvatar(btn.dataset.id);
          avatarModal.classList.add("hidden");
        });
      });

      if (closeAvatarModalBtn) {
        closeAvatarModalBtn.onclick = () => avatarModal.classList.add("hidden");
      }
    }

    function openAvatarModal() {
      const avatarModal = ensureAvatarModalExists();
      renderAvatarModalGrid();
      avatarModal.classList.remove("hidden");
    }

    function resetAuthFormToDefault() {
      if (els.authEmail) {
        els.authEmail.value = "";
        els.authEmail.disabled = false;
        els.authEmail.readOnly = false;
        els.authEmail.placeholder = "Email";
        els.authEmail.classList.remove("is-hidden");
      }

      if (els.authPassword) {
        els.authPassword.value = "";
        els.authPassword.disabled = false;
        els.authPassword.placeholder = "Password";
        els.authPassword.type = "password";
      }

      if (els.authConfirmPassword) {
        els.authConfirmPassword.value = "";
        els.authConfirmPassword.disabled = false;
        els.authConfirmPassword.placeholder = "Confirm Password";
        els.authConfirmPassword.type = "password";
      }

      if (els.profileNameInput) els.profileNameInput.value = "";
      if (els.profileBioInput) els.profileBioInput.value = "";

      if (els.profileEditorSection) {
        els.profileEditorSection.classList.add("is-hidden");
      }

      if (els.authPasswordRow) {
        els.authPasswordRow.classList.remove("is-hidden");
      }

      if (els.authConfirmRow) {
        els.authConfirmRow.classList.add("is-hidden");
      }

      if (els.togglePasswordBtn) {
        els.togglePasswordBtn.classList.remove("is-hidden");
      }

      if (els.toggleConfirmPasswordBtn) {
        els.toggleConfirmPasswordBtn.classList.remove("is-hidden");
      }

      if (els.authSubmitBtn) {
        els.authSubmitBtn.classList.remove("is-hidden");
        els.authSubmitBtn.textContent = "Login";
        els.authSubmitBtn.dataset.mode = "login";
        els.authSubmitBtn.disabled = false;
      }

      if (els.authSecondaryBtn) {
        els.authSecondaryBtn.classList.add("is-hidden");
        els.authSecondaryBtn.textContent = "Logout";
        els.authSecondaryBtn.disabled = false;
      }

      if (els.switchAccountBtn) {
        els.switchAccountBtn.classList.add("is-hidden");
        els.switchAccountBtn.textContent = "Switch Account";
        els.switchAccountBtn.disabled = false;
      }

      if (els.forgotBtn) {
        els.forgotBtn.parentElement?.classList.remove("is-hidden");
      }

      if (els.eyeIcon && els.authPassword && els.togglePasswordBtn) {
        setEyeState(
          els.authPassword,
          els.togglePasswordBtn,
          els.eyeIcon,
          false,
        );
      }

      if (
        els.confirmEyeIcon &&
        els.authConfirmPassword &&
        els.toggleConfirmPasswordBtn
      ) {
        setEyeState(
          els.authConfirmPassword,
          els.toggleConfirmPasswordBtn,
          els.confirmEyeIcon,
          false,
        );
      }

      renderPresetAvatarGrid(DEFAULT_AVATAR);
    }

    function renderAuthMode() {
      resetAuthFormToDefault();
      clearAuthError();

      if (els.authTitle) {
        els.authTitle.textContent = isLoginMode ? "Login" : "Create Account";
      }

      if (els.authSubmitBtn) {
        els.authSubmitBtn.textContent = isLoginMode
          ? "Login"
          : "Create Account";
        els.authSubmitBtn.dataset.mode = isLoginMode ? "login" : "signup";
      }

      if (els.authConfirmRow) {
        els.authConfirmRow.classList.toggle("is-hidden", isLoginMode);
      }

      if (els.forgotBtn) {
        els.forgotBtn.parentElement?.classList.toggle(
          "is-hidden",
          !isLoginMode,
        );
      }

      if (els.authToggleText) {
        els.authToggleText.innerHTML = isLoginMode
          ? `Don't have an account? <span id="authToggleBtn">Sign up</span>`
          : `Already have an account? <span id="authToggleBtn">Login</span>`;
      }

      attachAuthModalEventHandlers();
    }

    function attachAuthModalEventHandlers() {
      // Toggle between login/signup
      const toggle = document.getElementById("authToggleBtn");
      if (toggle) {
        toggle.onclick = () => {
          isLoginMode = !isLoginMode;
          clearAuthError();
          renderAuthMode();
        };
      }
      // Close button
      if (els.authCloseBtn) {
        els.authCloseBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          clearAuthError();
          closeAuthModal();
        };
      }
      // Submit button
      if (els.authSubmitBtn) {
        els.authSubmitBtn.onclick = handleAuthSubmit;
      }
      // Secondary button (Logout)
      if (els.authSecondaryBtn) {
        els.authSecondaryBtn.onclick = () => {
          closeAuthModal();
          els.logoutModal?.classList.remove("hidden");
          // Re-attach logout modal button handlers every time modal is shown
          const confirmBtn = document.getElementById("confirmLogoutBtn");
          const cancelBtn = document.getElementById("cancelLogoutBtn");
          const logoutModal = document.getElementById("logoutModal");
          if (cancelBtn && logoutModal) {
            cancelBtn.onclick = () => {
              logoutModal.classList.add("hidden");
            };
          }
          if (confirmBtn) {
            confirmBtn.onclick = async () => {
              await logout();
            };
          }
        };
      }
      // Forgot password
      if (els.forgotBtn) {
        els.forgotBtn.onclick = handleForgotPassword;
      }
      // Switch account
      if (els.switchAccountBtn) {
        els.switchAccountBtn.onclick = async () => {
          isLoginMode = true;
          await switchAccount(() => {
            isLoginMode = true;
            renderAuthMode();
            openAuthModal();
          });
        };
      }
      // Open avatar modal
      if (els.openAvatarModalBtn) {
        els.openAvatarModalBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          openAvatarModal();
        };
      }
      // Enter key for inputs
      [els.authEmail, els.authPassword, els.authConfirmPassword].forEach(
        (input) => {
          if (!input) return;
          input.onkeydown = async (e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              await handleAuthSubmit();
            }
          };
        },
      );
    }

    function renderProfileMode() {
      const user = getUser();
      const profile = getProfileCache();

      if (!user?.email) {
        isLoginMode = true;
        renderAuthMode();
        return;
      }

      clearAuthError();
      resetAuthFormToDefault();

      if (els.authTitle) {
        els.authTitle.textContent = "Your Profile";
      }

      if (els.authEmail) {
        els.authEmail.value = user.email;
        els.authEmail.disabled = true;
        els.authEmail.readOnly = true;
      }

      if (els.authPasswordRow) {
        els.authPasswordRow.classList.add("is-hidden");
      }

      if (els.authConfirmRow) {
        els.authConfirmRow.classList.add("is-hidden");
      }

      if (els.togglePasswordBtn) {
        els.togglePasswordBtn.classList.add("is-hidden");
      }

      if (els.toggleConfirmPasswordBtn) {
        els.toggleConfirmPasswordBtn.classList.add("is-hidden");
      }

      if (els.profileEditorSection) {
        els.profileEditorSection.classList.remove("is-hidden");
      }

      if (els.openAvatarModalBtn) {
        els.openAvatarModalBtn.style.display = "inline-block";
      }

      if (els.profileNameInput) {
        els.profileNameInput.value =
          profile?.name || user.email.split("@")[0] || "";
      }

      if (els.profileBioInput) {
        els.profileBioInput.value = profile?.bio || "";
      }

      const avatarToUse = profile?.avatar_value || DEFAULT_AVATAR;
      renderPresetAvatarGrid(avatarToUse);
      setSelectedAvatar(avatarToUse);

      if (els.authSubmitBtn) {
        els.authSubmitBtn.classList.remove("is-hidden");
        els.authSubmitBtn.disabled = false;
        els.authSubmitBtn.textContent = "Save Profile";
        els.authSubmitBtn.dataset.mode = "save-profile";
      }

      if (els.authSecondaryBtn) {
        els.authSecondaryBtn.classList.remove("is-hidden");
        els.authSecondaryBtn.disabled = false;
        els.authSecondaryBtn.textContent = "Logout";
      }

      if (els.switchAccountBtn) {
        els.switchAccountBtn.classList.remove("is-hidden");
        els.switchAccountBtn.disabled = false;
        els.switchAccountBtn.textContent = "Switch Account";
      }

      if (els.authToggleText) {
        els.authToggleText.innerHTML = `This account owns your synced profile, progress, and subscription access.`;
      }

      if (els.forgotBtn) {
        els.forgotBtn.parentElement?.classList.add("is-hidden");
      }
    }

    // Ensure all event handlers are attached after rendering profile mode
    attachAuthModalEventHandlers();

    async function handleSaveProfile() {
      const user = getUser();
      if (!user?.id) {
        showAuthError("Please log in again.");
        return;
      }

      const name = String(els.profileNameInput?.value || "").trim();
      const bio = String(els.profileBioInput?.value || "").trim();

      if (!name) {
        showAuthError("Please enter your display name.");
        return;
      }

      if (els.authSubmitBtn) {
        els.authSubmitBtn.disabled = true;
        els.authSubmitBtn.textContent = "Saving...";
      }

      try {
        const cacheVersion = Date.now().toString();

        const payload = {
          email: user.email,
          name,
          bio: bio || null,
          avatar_type: "preset",
          avatar_value: selectedAvatarValue,
          profile_photo_url: buildPresetAvatarUrl(
            selectedAvatarValue,
            cacheVersion,
          ),
        };

        const result = await saveUserProfile(user.id, payload);

        if (!result.ok) {
          showAuthError(result.message || "Could not save profile.");
          return;
        }

        const savedProfile = result.data || payload;
        setProfileCache(savedProfile);

        if (els.profileAvatarPreview) {
          els.profileAvatarPreview.src = savedProfile.profile_photo_url;
        }

        const topProfileAvatarImg = document.getElementById(
          "topProfileAvatarImg",
        );
        if (topProfileAvatarImg) {
          topProfileAvatarImg.src = savedProfile.profile_photo_url;
        }

        const topProfileAvatar = document.getElementById("topProfileAvatar");
        if (topProfileAvatar) {
          topProfileAvatar.classList.remove("is-hidden");
          topProfileAvatar.setAttribute("aria-hidden", "false");
        }

        syncProfileUiEverywhere();

        showAuthError("✅ Profile saved successfully.", true);

        setTimeout(() => {
          closeAuthModal();
        }, 700);
      } finally {
        if (els.authSubmitBtn) {
          els.authSubmitBtn.disabled = false;
          els.authSubmitBtn.textContent = "Save Profile";
        }
      }
    }

    async function handleLogin(email, password) {
      if (!navigator.onLine) {
        showAuthError(
          "You appear to be offline. Please check your internet connection and try again.",
        );
        return;
      }
      if (els.authSubmitBtn) {
        els.authSubmitBtn.disabled = true;
        els.authSubmitBtn.textContent = "Logging in...";
      }
      try {
        const auth = getFirebaseAuth();
        const userCredential = await window.signInWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;
        if (!user) {
          showAuthError("Incorrect email or password.");
          return;
        }
        try {
          await applyAuthenticatedUser(user);
        } catch (innerError) {
          console.warn("Post-login setup failed (non-critical):", innerError);
        }
        closeAuthModal();
        if (typeof window.showToast === "function") {
          window.showToast("✅ Logged in successfully");
        }
        syncProfileUiEverywhere();
      } catch (error) {
        console.error(
          "Login failed:",
          error,
          error && error.code,
          error && error.message,
        );
        if (!navigator.onLine) {
          showAuthError(
            "You appear to be offline. Please check your internet connection and try again.",
          );
          return;
        }
        const msg = String(error.message || "").toLowerCase();
        const code = error.code || "";
        if (
          code === "auth/user-not-found" ||
          msg.includes("user not found") ||
          msg.includes("no user record")
        ) {
          showAuthError("No account exists for this email.");
          return;
        }
        if (
          code === "auth/wrong-password" ||
          code === "auth/invalid-credential" ||
          msg.includes("wrong password") ||
          msg.includes("invalid password") ||
          msg.includes("invalid login")
        ) {
          showAuthError("Incorrect email or password.");
          return;
        }
        showAuthError("Login failed. Please try again.");
      } finally {
        if (els.authSubmitBtn) {
          els.authSubmitBtn.disabled = false;
          els.authSubmitBtn.textContent = "Login";
        }
      }
    }

    async function handleSignup(email, password, confirmPassword) {
      if (!confirmPassword) {
        showAuthError("Please confirm your password.");
        return;
      }
      if (password !== confirmPassword) {
        showAuthError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        showAuthError("Password must be at least 6 characters.");
        return;
      }
      if (!navigator.onLine) {
        showAuthError(
          "You appear to be offline. Please check your internet connection and try again.",
        );
        return;
      }
      if (els.authSubmitBtn) {
        els.authSubmitBtn.disabled = true;
        els.authSubmitBtn.textContent = "Creating account...";
      }
      try {
        const auth = getFirebaseAuth();
        const userCredential = await window.createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;
        if (!user) {
          showAuthError("Could not create account.");
          return;
        }
        // Do not auto-login or close modal. Show message and switch to login mode.
        showAuthError("✅ Account created. Please log in.", true);
        isLoginMode = true;
        renderAuthMode();
        // Optionally, clear password fields
        if (els.authPassword) els.authPassword.value = "";
        if (els.authConfirmPassword) els.authConfirmPassword.value = "";
        if (els.authSubmitBtn) {
          els.authSubmitBtn.disabled = false;
          els.authSubmitBtn.textContent = "Login";
        }
        if (typeof window.showToast === "function") {
          window.showToast("✅ Account created. Please log in.");
        }
        syncProfileUiEverywhere();
      } catch (error) {
        console.error("Signup failed:", error);
        if (!navigator.onLine) {
          showAuthError(
            "You appear to be offline. Please check your internet connection and try again.",
          );
          return;
        }
        let msg = String(error.message || "").toLowerCase();
        if (
          msg.includes("already") ||
          msg.includes("registered") ||
          msg.includes("exists") ||
          msg.includes("user already")
        ) {
          showAuthError(
            "An account with this email already exists. Please login.",
          );
          return;
        }
        // Only show length error if message is about length, otherwise show real error
        if (msg.includes("password") && msg.includes("6")) {
          showAuthError("Password must be at least 6 characters.");
          return;
        }
        if (msg.includes("password")) {
          showAuthError(error.message || "Password error.");
          return;
        }
        if (msg.includes("email")) {
          showAuthError("Enter a valid email address.");
          return;
        }
        showAuthError(error.message || "Could not create account.");
      } finally {
        if (els.authSubmitBtn) {
          els.authSubmitBtn.disabled = false;
          els.authSubmitBtn.textContent = "Create Account";
        }
      }
    }

    async function handleForgotPassword() {
      const email = normalizeEmail(els.authEmail?.value || "");
      if (!email) {
        showAuthError("Enter your email first.");
        return;
      }
      if (!isValidEmail(email)) {
        showAuthError("Enter a valid email address.");
        return;
      }
      if (!navigator.onLine) {
        showAuthError(
          "You appear to be offline. Please check your internet connection and try again.",
        );
        return;
      }
      try {
        const auth = getFirebaseAuth();
        await auth.sendPasswordResetEmail(email);
        showAuthError(
          `📩 If an account exists, a password reset link has been sent to ${email}. Please check your inbox.`,
          true,
        );
      } catch (error) {
        console.error("Forgot password failed:", error);
        if (!navigator.onLine) {
          showAuthError(
            "You appear to be offline. Please check your internet connection and try again.",
          );
          return;
        }
        showAuthError("Unable to send reset email. Please try again.");
      }
    }

    async function handleAuthSubmit() {
      if (isSubmitting) {
        return; // Prevent multiple submissions
      }

      const mode =
        els.authSubmitBtn?.dataset.mode || (isLoginMode ? "login" : "signup");

      clearAuthError();

      if (mode === "save-profile") {
        await handleSaveProfile();
        return;
      }

      const email = normalizeEmail(els.authEmail?.value || "");
      const password = String(els.authPassword?.value || "").trim();
      const confirmPassword = String(
        els.authConfirmPassword?.value || "",
      ).trim();

      console.log("Normalized email:", email); // Debug log

      if (!email || !password) {
        showAuthError("Please enter your email and password.");
        return;
      }

      if (!isValidEmail(email)) {
        showAuthError("Enter a valid email address.");
        return;
      }

      // Password confirmation checks BEFORE isSubmitting
      if (mode === "signup") {
        if (!confirmPassword) {
          showAuthError("Please confirm your password.");
          return;
        }
        if (password !== confirmPassword) {
          showAuthError("Passwords do not match.");
          return;
        }
        if (password.length < 6) {
          showAuthError("Password must be at least 6 characters.");
          return;
        }
      }

      isSubmitting = true;

      try {
        if (mode === "login") {
          await handleLogin(email, password);
          return;
        }
        if (mode === "signup") {
          await handleSignup(email, password, confirmPassword);
        }
      } catch (error) {
        console.error("Auth submit error:", error);
        if (!navigator.onLine) {
          showAuthError(
            "You appear to be offline. Please check your internet connection and try again.",
          );
          return;
        }
        showAuthError(
          "⚠️ A small issue happened after the action. Please try once more if needed.",
        );
      } finally {
        isSubmitting = false;
      }
    }

    // =========================
    // EVENTS
    // =========================

    if (els.togglePasswordBtn && els.authPassword && els.eyeIcon) {
      els.togglePasswordBtn.onclick = () => {
        const show = els.authPassword.type === "password";
        setEyeState(els.authPassword, els.togglePasswordBtn, els.eyeIcon, show);
      };
    }

    if (
      els.toggleConfirmPasswordBtn &&
      els.authConfirmPassword &&
      els.confirmEyeIcon
    ) {
      els.toggleConfirmPasswordBtn.onclick = () => {
        const show = els.authConfirmPassword.type === "password";
        setEyeState(
          els.authConfirmPassword,
          els.toggleConfirmPasswordBtn,
          els.confirmEyeIcon,
          show,
        );
      };
    }

    [els.authEmail, els.authPassword, els.profileNameInput, els.profileBioInput]
      .filter(Boolean)
      .forEach((el) => el.addEventListener("input", clearAuthError));

    // Improved real-time password match check (character-by-character)
    if (els.authConfirmPassword && els.authPassword) {
      els.authConfirmPassword.addEventListener("input", () => {
        const password = els.authPassword.value;
        const confirm = els.authConfirmPassword.value;
        if (!confirm) {
          clearAuthError();
          return;
        }
        // Only show error if confirm diverges from password at any character
        if (
          confirm.length > password.length ||
          password.slice(0, confirm.length) !== confirm
        ) {
          showAuthError("Passwords do not match.");
        } else {
          clearAuthError();
        }
      });
      els.authPassword.addEventListener("input", () => {
        const password = els.authPassword.value;
        const confirm = els.authConfirmPassword.value;
        if (!confirm) {
          clearAuthError();
          return;
        }
        if (
          confirm.length > password.length ||
          password.slice(0, confirm.length) !== confirm
        ) {
          showAuthError("Passwords do not match.");
        } else {
          clearAuthError();
        }
      });
    }

    if (els.loginBtn) {
      els.loginBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const user = getUser();
        clearAuthError();

        if (user?.email) {
          renderProfileMode();
          openAuthModal();
          return;
        }

        isLoginMode = true;
        renderAuthMode();
        openAuthModal();
        attachAuthModalEventHandlers();
      });
    }

    if (e.target === avatarModal) {
      avatarModal.classList.add("hidden");
    }
  });

  if (els.openAvatarModalBtn) {
    els.openAvatarModalBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openAvatarModal();
    });
  }

  if (els.cancelLogoutBtn) {
    els.cancelLogoutBtn.onclick = () => {
      els.logoutModal?.classList.add("hidden");
    };
  }

  if (els.confirmLogoutBtn) {
    els.confirmLogoutBtn.onclick = async () => {
      await logout();
    };
  }

  if (els.authCloseBtn) {
    els.authCloseBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearAuthError();
      closeAuthModal();
    };
  }

  if (els.authSecondaryBtn) {
    els.authSecondaryBtn.onclick = () => {
      closeAuthModal();
      els.logoutModal?.classList.remove("hidden");
      // Re-attach logout modal button handlers every time modal is shown
      const confirmBtn = document.getElementById("confirmLogoutBtn");
      const cancelBtn = document.getElementById("cancelLogoutBtn");
      const logoutModal = document.getElementById("logoutModal");
      if (cancelBtn && logoutModal) {
        cancelBtn.onclick = () => {
          logoutModal.classList.add("hidden");
        };
      }
      if (confirmBtn) {
        confirmBtn.onclick = async () => {
          await logout();
        };
      }
    };
  }

  if (els.authSubmitBtn) {
    els.authSubmitBtn.onclick = handleAuthSubmit;
  }

  if (els.forgotBtn) {
    els.forgotBtn.onclick = handleForgotPassword;
  }

  if (els.switchAccountBtn) {
    els.switchAccountBtn.onclick = async () => {
      isLoginMode = true;
      await switchAccount(() => {
        isLoginMode = true;
        renderAuthMode();
        openAuthModal();
      });
    };
  }

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;

    const avatarModal = document.getElementById("avatarModal");
    if (avatarModal && !avatarModal.classList.contains("hidden")) {
      avatarModal.classList.add("hidden");
      return;
    }

    if (els.logoutModal && !els.logoutModal.classList.contains("hidden")) {
      els.logoutModal.classList.add("hidden");
      return;
    }

    if (els.authModal && !els.authModal.classList.contains("hidden")) {
      closeAuthModal();
    }
  });

  [els.authEmail, els.authPassword, els.authConfirmPassword].forEach(
    (input) => {
      if (!input) return;
      input.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          await handleAuthSubmit();
        }
      });
    },
  );

  // Removed obsolete Supabase session and event logic. File now ends cleanly for Firebase-only setup.
})();
