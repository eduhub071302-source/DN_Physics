// 🔐 DN Physics Auth System — Finalized Production Version

function getClient() {
  return window.supabaseClient || null;
}

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("hidden");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
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

function clearAuthError() {
  const errorBox = document.getElementById("authErrorBox");
  if (errorBox) errorBox.remove();
}

function isOfflineError(error) {
  return !navigator.onLine || error instanceof TypeError;
}

// ----------------------------
// STORAGE HELPERS
// ----------------------------

function setUser(user) {
  localStorage.setItem("dn_user", JSON.stringify(user));
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("dn_user")) || null;
  } catch {
    return null;
  }
}

function clearUser() {
  localStorage.removeItem("dn_user");
  localStorage.removeItem("dn_profile");
}

function setSessionToken(token) {
  try {
    localStorage.setItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN, token || "");
  } catch {}
}

function clearSessionToken() {
  try {
    localStorage.removeItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN);
  } catch {}
}

function setProfileCache(profile) {
  try {
    localStorage.setItem("dn_profile", JSON.stringify(profile || {}));
    localStorage.setItem(
      DN_CONFIG.STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profile || {})
    );
  } catch {}
}

function getProfileCache() {
  try {
    return JSON.parse(localStorage.getItem("dn_profile")) || null;
  } catch {
    return null;
  }
}

function clearProfileCache() {
  try {
    localStorage.removeItem("dn_profile");
    localStorage.removeItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE);
  } catch {}
}

// ----------------------------
// AVATAR HELPERS
// ----------------------------

function buildPresetAvatarUrl(avatarValue) {
  const safe = avatarValue || "avatar-01";
  return `/DN_Physics/assets/avatars/${safe}.png`;
}

function getPresetAvatarList() {
  return Array.from({ length: 30 }, (_, i) => {
    const index = String(i + 1).padStart(2, "0");
    return {
      id: `avatar-${index}`,
      url: buildPresetAvatarUrl(`avatar-${index}`)
    };
  });
}

// ----------------------------
// GLOBAL UI SYNC
// ----------------------------

function syncProfileUiEverywhere() {
  const user = getUser();
  if (typeof window.updateProfileUI === "function") {
    window.updateProfileUI(user);
  }
}

// ----------------------------
// LOGOUT
// ----------------------------

async function logout() {
  const client = getClient();
  if (!client) return;

  if (!navigator.onLine) {
    window.location.href = "/DN_Physics/offline.html";
    return;
  }

  try {
    await client.auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);

    if (!navigator.onLine) {
      window.location.href = "/DN_Physics/offline.html";
      return;
    }

    showAuthError("Unable to log out right now. Please try again.");
    return;
  }

  clearUser();
  clearSessionToken();
  clearProfileCache();

  if (typeof clearPaidAccess === "function") {
    clearPaidAccess();
  }

  syncProfileUiEverywhere();
  location.reload();
}

// ----------------------------
// PROFILE
// ----------------------------

async function loadUserProfile(userId) {
  const client = getClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("Profile load warning:", error.message);
      return null;
    }

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
  const client = getClient();
  if (!client) return null;
  if (!user?.id || !user?.email) return null;

  const existing = getProfileCache();

  const profilePayload = {
    id: user.id,
    email: user.email,
    name: existing?.name || user.email.split("@")[0],
    bio: existing?.bio || null,
    avatar_type: existing?.avatar_type || "preset",
    avatar_value: existing?.avatar_value || "avatar-01",
    profile_photo_url:
      existing?.profile_photo_url ||
      buildPresetAvatarUrl(existing?.avatar_value || "avatar-01")
  };

  try {
    const { data, error } = await client
      .from("profiles")
      .upsert(profilePayload)
      .select()
      .single();

    if (error) {
      console.warn("Profile upsert warning:", error.message);
      const merged = { ...(existing || {}), ...profilePayload };
      setProfileCache(merged);
      syncProfileUiEverywhere();
      return merged;
    }

    const finalProfile = data || profilePayload;
    if (!finalProfile.profile_photo_url && finalProfile.avatar_value) {
      finalProfile.profile_photo_url = buildPresetAvatarUrl(finalProfile.avatar_value);
    }

    setProfileCache(finalProfile);
    syncProfileUiEverywhere();
    return finalProfile;
  } catch (error) {
    console.warn("Profile upsert failed:", error);
    const merged = { ...(existing || {}), ...profilePayload };
    setProfileCache(merged);
    syncProfileUiEverywhere();
    return merged;
  }
}

async function saveUserProfile(userId, payload) {
  const client = getClient();
  if (!client) return { ok: false, message: "Supabase client not ready." };

  try {
    const finalPayload = {
      id: userId,
      ...payload,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await client
      .from("profiles")
      .upsert(finalPayload)
      .select()
      .single();

    if (error) {
      return { ok: false, message: error.message || "Could not save profile." };
    }

    const finalProfile = data || finalPayload;
    if (!finalProfile.profile_photo_url && finalProfile.avatar_value) {
      finalProfile.profile_photo_url = buildPresetAvatarUrl(finalProfile.avatar_value);
    }

    setProfileCache(finalProfile);
    syncProfileUiEverywhere();

    return { ok: true, data: finalProfile };
  } catch (error) {
    return { ok: false, message: "Could not save profile." };
  }
}

// ----------------------------
// SESSION
// ----------------------------

async function restoreUserSession() {
  const client = getClient();
  if (!client) return;

  try {
    const { data } = await client.auth.getSession();
    const session = data?.session;

    if (session?.user) {
      setUser(session.user);
      setSessionToken(session.access_token || "");
      await ensureProfile(session.user);
      await loadUserProfile(session.user.id);

      if (typeof syncCloudProgressToLocal === "function") {
        await syncCloudProgressToLocal();
      }

      syncProfileUiEverywhere();
    } else {
      clearUser();
      clearSessionToken();
      clearProfileCache();
      syncProfileUiEverywhere();
    }
  } catch (error) {
    console.error("Restore session failed:", error);
    clearUser();
    clearSessionToken();
    clearProfileCache();
    syncProfileUiEverywhere();
  }
}

// ----------------------------
// UI
// ----------------------------

function updateAccountButton() {
  syncProfileUiEverywhere();
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

document.addEventListener("DOMContentLoaded", () => {
  const client = getClient();
  if (!client) return;

  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authSecondaryBtn = document.getElementById("authSecondaryBtn");
  const authCloseBtn = document.getElementById("authCloseBtn");

  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authConfirmPassword = document.getElementById("authConfirmPassword");

  const authConfirmRow = document.getElementById("authConfirmRow");
  const authPasswordRow = document.getElementById("authPasswordRow");

  const authTitle = document.getElementById("authTitle");
  const authToggleText = document.getElementById("authToggleText");

  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const eyeIcon = document.getElementById("eyeIcon");
  const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPasswordBtn");
  const confirmEyeIcon = document.getElementById("confirmEyeIcon");
  const forgotBtn = document.getElementById("forgotPasswordBtn");

  const profileEditorSection = document.getElementById("profileEditorSection");
  const profileNameInput = document.getElementById("profileNameInput");
  const profileBioInput = document.getElementById("profileBioInput");
  const presetAvatarGrid = document.getElementById("presetAvatarGrid");
  const profileAvatarPreview = document.getElementById("profileAvatarPreview");

  let isLoginMode = true;
  let selectedAvatarValue = "avatar-01";

  function setSelectedAvatar(avatarId) {
    selectedAvatarValue = avatarId || "avatar-01";

    if (profileAvatarPreview) {
      profileAvatarPreview.src = buildPresetAvatarUrl(selectedAvatarValue);
    }

    if (!presetAvatarGrid) return;

    presetAvatarGrid.querySelectorAll("[data-avatar-id]").forEach((btn) => {
      const isActive = btn.dataset.avatarId === selectedAvatarValue;
      btn.style.borderColor = isActive ? "rgba(78,161,255,0.8)" : "rgba(255,255,255,0.08)";
      btn.style.boxShadow = isActive
        ? "0 0 0 3px rgba(78,161,255,0.16), 0 12px 22px rgba(0,0,0,0.26)"
        : "0 8px 18px rgba(0,0,0,0.18)";
      btn.style.transform = isActive ? "scale(1.06)" : "scale(1)";
    });
  }

  function renderPresetAvatarGrid(selectedId = "avatar-01") {
    if (!presetAvatarGrid) return;

    const avatars = getPresetAvatarList();

    presetAvatarGrid.innerHTML = avatars
      .map(
        (avatar) => `
          <button
            type="button"
            data-avatar-id="${avatar.id}"
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
            aria-label="Choose ${avatar.id}"
            title="${avatar.id}"
          >
            <img
              src="${avatar.url}"
              alt="${avatar.id}"
              style="width:100%; height:100%; object-fit:cover; display:block;"
            />
          </button>
        `
      )
      .join("");

    presetAvatarGrid.querySelectorAll("[data-avatar-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setSelectedAvatar(btn.dataset.avatarId);
      });
    });

    setSelectedAvatar(selectedId);
  }

  function resetAuthFormToDefault() {
    if (authEmail) {
      authEmail.value = "";
      authEmail.disabled = false;
      authEmail.placeholder = "Email";
      authEmail.classList.remove("is-hidden");
    }

    if (authPassword) {
      authPassword.value = "";
      authPassword.disabled = false;
      authPassword.placeholder = "Password";
      authPassword.type = "password";
    }

    if (authConfirmPassword) {
      authConfirmPassword.value = "";
      authConfirmPassword.disabled = false;
      authConfirmPassword.placeholder = "Confirm Password";
      authConfirmPassword.type = "password";
    }

    if (profileNameInput) profileNameInput.value = "";
    if (profileBioInput) profileBioInput.value = "";

    if (profileEditorSection) profileEditorSection.classList.add("is-hidden");

    if (authPasswordRow) authPasswordRow.classList.remove("is-hidden");
    if (authConfirmRow) authConfirmRow.classList.add("is-hidden");

    if (togglePasswordBtn) togglePasswordBtn.classList.remove("is-hidden");
    if (toggleConfirmPasswordBtn) toggleConfirmPasswordBtn.classList.remove("is-hidden");

    if (authSubmitBtn) {
      authSubmitBtn.classList.remove("is-hidden");
      authSubmitBtn.textContent = "Login";
      authSubmitBtn.dataset.mode = "login";
    }

    if (authSecondaryBtn) {
      authSecondaryBtn.classList.add("is-hidden");
      authSecondaryBtn.textContent = "Logout";
    }

    if (forgotBtn) {
      forgotBtn.parentElement?.classList.remove("is-hidden");
    }

    if (eyeIcon && authPassword && togglePasswordBtn) {
      setEyeState(authPassword, togglePasswordBtn, eyeIcon, false);
    }

    if (confirmEyeIcon && authConfirmPassword && toggleConfirmPasswordBtn) {
      setEyeState(authConfirmPassword, toggleConfirmPasswordBtn, confirmEyeIcon, false);
    }

    renderPresetAvatarGrid("avatar-01");
  }

  function renderAuthMode() {
    resetAuthFormToDefault();

    if (authTitle) {
      authTitle.textContent = isLoginMode ? "Login" : "Create Account";
    }

    if (authSubmitBtn) {
      authSubmitBtn.textContent = isLoginMode ? "Login" : "Create Account";
      authSubmitBtn.dataset.mode = isLoginMode ? "login" : "signup";
    }

    if (authConfirmRow) {
      authConfirmRow.classList.toggle("is-hidden", isLoginMode);
    }

    if (forgotBtn) {
      forgotBtn.parentElement?.classList.toggle("is-hidden", !isLoginMode);
    }

    if (authToggleText) {
      authToggleText.innerHTML = isLoginMode
        ? `Don't have an account? <span id="authToggleBtn">Sign up</span>`
        : `Already have an account? <span id="authToggleBtn">Login</span>`;

      const toggle = document.getElementById("authToggleBtn");
      if (toggle) {
        toggle.onclick = () => {
          isLoginMode = !isLoginMode;
          clearAuthError();
          renderAuthMode();
        };
      }
    }
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

    if (authTitle) authTitle.textContent = "Your Profile";

    if (authEmail) {
      authEmail.value = user.email;
      authEmail.disabled = true;
    }

    if (authPasswordRow) authPasswordRow.classList.add("is-hidden");
    if (authConfirmRow) authConfirmRow.classList.add("is-hidden");
    if (togglePasswordBtn) togglePasswordBtn.classList.add("is-hidden");
    if (toggleConfirmPasswordBtn) toggleConfirmPasswordBtn.classList.add("is-hidden");

    if (profileEditorSection) profileEditorSection.classList.remove("is-hidden");

    if (profileNameInput) {
      profileNameInput.value =
        profile?.name ||
        user.email.split("@")[0] ||
        "";
    }

    if (profileBioInput) {
      profileBioInput.value = profile?.bio || "";
    }

    renderPresetAvatarGrid(profile?.avatar_value || "avatar-01");

    if (authSubmitBtn) {
      authSubmitBtn.textContent = "Save Profile";
      authSubmitBtn.dataset.mode = "save-profile";
    }

    if (authSecondaryBtn) {
      authSecondaryBtn.classList.remove("is-hidden");
      authSecondaryBtn.textContent = "Logout";
    }

    if (authToggleText) {
      authToggleText.innerHTML = `This account owns your profile and future synced app data.`;
    }

    if (forgotBtn) {
      forgotBtn.parentElement?.classList.add("is-hidden");
    }
  }

  if (togglePasswordBtn && authPassword && eyeIcon) {
    togglePasswordBtn.onclick = () => {
      const show = authPassword.type === "password";
      setEyeState(authPassword, togglePasswordBtn, eyeIcon, show);
    };
  }

  if (toggleConfirmPasswordBtn && authConfirmPassword && confirmEyeIcon) {
    toggleConfirmPasswordBtn.onclick = () => {
      const show = authConfirmPassword.type === "password";
      setEyeState(authConfirmPassword, toggleConfirmPasswordBtn, confirmEyeIcon, show);
    };
  }

  if (authEmail) authEmail.addEventListener("input", clearAuthError);
  if (authPassword) authPassword.addEventListener("input", clearAuthError);
  if (authConfirmPassword) authConfirmPassword.addEventListener("input", clearAuthError);
  if (profileNameInput) profileNameInput.addEventListener("input", clearAuthError);
  if (profileBioInput) profileBioInput.addEventListener("input", clearAuthError);

  document.addEventListener("click", (e) => {
    const loginButton = e.target.closest("#loginBtn");
    if (!loginButton) return;

    e.preventDefault();
    e.stopPropagation();

    const user = getUser();

    clearAuthError();

    if (user) {
      renderProfileMode();
      openAuthModal();
      return;
    }

    isLoginMode = true;
    renderAuthMode();
    openAuthModal();
  });

  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

  if (cancelLogoutBtn) {
    cancelLogoutBtn.onclick = () => {
      document.getElementById("logoutModal")?.classList.add("hidden");
    };
  }

  if (confirmLogoutBtn) {
    confirmLogoutBtn.onclick = () => logout();
  }

  if (authCloseBtn) {
    authCloseBtn.onclick = () => {
      clearAuthError();
      closeAuthModal();
    };
  }

  if (authSecondaryBtn) {
    authSecondaryBtn.onclick = () => {
      closeAuthModal();
      document.getElementById("logoutModal")?.classList.remove("hidden");
    };
  }

  if (authSubmitBtn) {
    authSubmitBtn.onclick = async () => {
      const mode = authSubmitBtn.dataset.mode || (isLoginMode ? "login" : "signup");

      if (mode === "save-profile") {
        const user = getUser();
        if (!user?.id) {
          return showAuthError("Please log in again.");
        }

        const name = (profileNameInput?.value || "").trim();
        const bio = (profileBioInput?.value || "").trim();

        if (!name) {
          return showAuthError("Please enter your display name.");
        }

        const payload = {
          email: user.email,
          name,
          bio: bio || null,
          avatar_type: "preset",
          avatar_value: selectedAvatarValue,
          profile_photo_url: buildPresetAvatarUrl(selectedAvatarValue)
        };

        const result = await saveUserProfile(user.id, payload);

        if (!result.ok) {
          return showAuthError(result.message || "Could not save profile.");
        }

        updateAccountButton();
        showAuthError("✅ Profile saved successfully.", true);

        setTimeout(() => {
          closeAuthModal();
          window.location.reload();
        }, 700);

        return;
      }

      const email = authEmail?.value.trim().toLowerCase() || "";
      const password = authPassword?.value.trim() || "";
      const confirmPassword = authConfirmPassword?.value.trim() || "";

      clearAuthError();

      if (!email || !password) {
        return showAuthError("Please enter your email and password.");
      }

      if (mode === "signup") {
        if (!confirmPassword) {
          return showAuthError("Please confirm your password.");
        }

        if (password !== confirmPassword) {
          return showAuthError("Passwords do not match.");
        }
      }

      try {
        if (mode === "login") {
          if (!navigator.onLine) {
            window.location.href = "/DN_Physics/offline.html";
            return;
          }

          const { data, error } = await client.auth.signInWithPassword({
            email,
            password
          });

          if (error || !data?.user) {
            return showAuthError("Incorrect email or password.");
          }

          setUser(data.user);
          setSessionToken(data.session?.access_token || "");
          await ensureProfile(data.user);
          await loadUserProfile(data.user.id);

          if (typeof syncCloudProgressToLocal === "function") {
            await syncCloudProgressToLocal();
          }

          syncProfileUiEverywhere();
          closeAuthModal();
          location.reload();
          return;
        }

        if (!navigator.onLine) {
          window.location.href = "/DN_Physics/offline.html";
          return;
        }

        // SIGN UP DIRECTLY WITH SUPABASE AUTH
        const { data, error } = await client.auth.signUp({
          email,
          password
        });

        if (error) {
          const msg = String(error.message || "").toLowerCase();

          if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
            return showAuthError("An account with this email already exists. Please login.");
          }

          if (msg.includes("password")) {
            return showAuthError("Password must be at least 6 characters.");
          }

          if (msg.includes("email")) {
            return showAuthError("Enter a valid email address.");
          }

          return showAuthError(error.message || "Could not create account.");
        }

        const signedUpUser = data?.user || null;
        const signedUpSession = data?.session || null;

        if (!signedUpUser) {
          return showAuthError("Account created, but user details were not returned. Please try logging in.");
        }

        // if session is returned, user is already signed in
        if (signedUpSession?.user) {
          setUser(signedUpSession.user);
          setSessionToken(signedUpSession.access_token || "");
          await ensureProfile(signedUpSession.user);
          await loadUserProfile(signedUpSession.user.id);

          if (typeof syncCloudProgressToLocal === "function") {
            await syncCloudProgressToLocal();
          }

          syncProfileUiEverywhere();
          closeAuthModal();
          location.reload();
          return;
        }

        // fallback: try immediate login
        const loginRetry = await client.auth.signInWithPassword({
          email,
          password
        });

        if (loginRetry?.data?.user) {
          setUser(loginRetry.data.user);
          setSessionToken(loginRetry.data.session?.access_token || "");
          await ensureProfile(loginRetry.data.user);
          await loadUserProfile(loginRetry.data.user.id);

          if (typeof syncCloudProgressToLocal === "function") {
            await syncCloudProgressToLocal();
          }

          syncProfileUiEverywhere();
          closeAuthModal();
          location.reload();
          return;
        }

        // If email confirmation is required in your Supabase settings
        showAuthError("✅ Account created. Please check your email to confirm your account, then log in.", true);
        isLoginMode = true;
        renderAuthMode();
      } catch (e) {
        console.error("Auth submit error:", e);

        if (isOfflineError(e)) {
          window.location.href = "/DN_Physics/offline.html";
          return;
        }

        showAuthError("Something went wrong. Please try again.");
      }
    };
  }

  if (forgotBtn) {
    forgotBtn.onclick = async () => {
      const email = authEmail?.value.trim().toLowerCase();

      if (!email) {
        return showAuthError("Enter your email first.");
      }

      if (!email.includes("@")) {
        return showAuthError("Enter a valid email address.");
      }

      if (!navigator.onLine) {
        window.location.href = "/DN_Physics/offline.html";
        return;
      }

      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/DN_Physics/reset-password.html"
      });

      if (error) {
        return showAuthError("Unable to send reset email. Please try again.");
      }

      showAuthError(
        `📩 If an account exists, a password reset link has been sent to ${email}. Please check your inbox.`,
        true
      );
    };
  }

  client.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      setUser(session.user);
      setSessionToken(session.access_token || "");
    } else {
      clearUser();
      clearSessionToken();
      clearProfileCache();
    }

    syncProfileUiEverywhere();
  });

  renderAuthMode();

  restoreUserSession().then(() => {
    syncProfileUiEverywhere();
  });

  (async () => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      try {
        await new Promise((r) => setTimeout(r, 500));

        const { data } = await client.auth.getSession();

        if (data?.session?.user) {
          setUser(data.session.user);
          setSessionToken(data.session.access_token || "");
          await ensureProfile(data.session.user);
          await loadUserProfile(data.session.user.id);

          window.history.replaceState({}, document.title, window.location.pathname);
          syncProfileUiEverywhere();
        }
      } catch (e) {
        console.error("Verification error:", e);
      }
    }
  })();
});