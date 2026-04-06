// 🔐 DN Physics Auth System — Finalized Production Version

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

    const passwordWrap = document.querySelector("#authModal .auth-password-wrap");
    if (passwordWrap && passwordWrap.parentNode === authBox) {
      authBox.insertBefore(errorBox, passwordWrap.nextSibling);
    } else {
      authBox.appendChild(errorBox);
    }
  }

  errorBox.style.cssText = `
    margin-top: 10px;
    margin-bottom: 10px;
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

function clearProfileCache() {
  try {
    localStorage.removeItem("dn_profile");
    localStorage.removeItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE);
  } catch {}
}

// ----------------------------
// LOGOUT
// ----------------------------

async function logout() {
  try {
    await supabaseClient.auth.signOut();
  } catch (error) {
    console.error("Logout error:", error);
  }

  clearUser();
  clearSessionToken();
  clearProfileCache();

  if (typeof clearPaidAccess === "function") {
    clearPaidAccess();
  }

  location.reload();
}

// ----------------------------
// PROFILE
// ----------------------------

async function loadUserProfile(userId) {
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("Profile load warning:", error.message);
      return null;
    }

    if (data) {
      setProfileCache(data);
      return data;
    }

    return null;
  } catch (error) {
    console.warn("Profile fetch warning:", error);
    return null;
  }
}

async function ensureProfile(user) {
  if (!user?.id || !user?.email) return null;

  const profilePayload = {
    id: user.id,
    email: user.email,
    name: user.email.split("@")[0]
  };

  try {
    const { error } = await supabaseClient.from("profiles").upsert(profilePayload);

    if (error) {
      console.warn("Profile upsert warning:", error.message);
    }

    setProfileCache(profilePayload);
    return profilePayload;
  } catch (error) {
    console.warn("Profile upsert failed:", error);
    return null;
  }
}

// ----------------------------
// SESSION
// ----------------------------

async function restoreUserSession() {
  try {
    const { data } = await supabaseClient.auth.getSession();
    const session = data?.session;

    if (session?.user) {
      setUser(session.user);
      setSessionToken(session.access_token || "");
      await loadUserProfile(session.user.id);
    } else {
      clearUser();
      clearSessionToken();
      clearProfileCache();
    }
  } catch (error) {
    console.error("Restore session failed:", error);
    clearUser();
    clearSessionToken();
    clearProfileCache();
  }
}

// ----------------------------
// UI
// ----------------------------

function updateAccountButton() {
  const btn = document.getElementById("loginBtn");
  const user = getUser();

  if (!btn) return;

  if (user?.email) {
    btn.textContent = `👤 ${user.email}`;
    btn.title = user.email;
  } else {
    btn.textContent = "👤 Login";
    btn.title = "Login or sign up";
  }
}

// ----------------------------
// MAIN
// ----------------------------

document.addEventListener("DOMContentLoaded", () => {
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authCloseBtn = document.getElementById("authCloseBtn");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authTitle = document.getElementById("authTitle");
  const authToggleText = document.getElementById("authToggleText");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const eyeIcon = document.getElementById("eyeIcon");
  const forgotBtn = document.getElementById("forgotPasswordBtn");

  let isLoginMode = true;

  function renderAuthMode() {
    if (authTitle) {
      authTitle.textContent = isLoginMode ? "Login" : "Create Account";
    }

    if (authSubmitBtn) {
      authSubmitBtn.textContent = isLoginMode ? "Login" : "Create Account";
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

          if (authPassword) authPassword.value = "";
          renderAuthMode();
        };
      }
    }
  }

  // 👁 Password eye toggle
  if (togglePasswordBtn && authPassword && eyeIcon) {
    togglePasswordBtn.onclick = () => {
      const show = authPassword.type === "password";
      authPassword.type = show ? "text" : "password";
      togglePasswordBtn.setAttribute("aria-label", show ? "Hide password" : "Show password");

      if (show) {
        eyeIcon.innerHTML = `
          <path d="M2 2L22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M10.58 10.58A2 2 0 0 0 13.42 13.42" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4.9C19 4.9 23 12 23 12C22.39 13.43 21.55 14.72 20.53 15.85" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M6.71 6.72C4.42 8.18 2.74 10.35 1 12C1 12 5 19.1 12 19.1C13.8 19.1 15.46 18.63 16.94 17.82" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
      } else {
        eyeIcon.innerHTML = `
          <path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        `;
      }
    };
  }

  if (authEmail) authEmail.addEventListener("input", clearAuthError);
  if (authPassword) authPassword.addEventListener("input", clearAuthError);

  // Open auth modal from account button
  document.addEventListener("click", (e) => {
    const loginButton = e.target.closest("#loginBtn");
    if (!loginButton) return;

    e.preventDefault();
    e.stopPropagation();

    const user = getUser();

    if (user) {
      const logoutModal = document.getElementById("logoutModal");
      if (logoutModal) {
        logoutModal.classList.remove("hidden");
      }
      return;
    }

    clearAuthError();
    openAuthModal();
  });

  // Logout modal buttons
  const confirmLogoutBtn = document.getElementById("confirmLogoutBtn");
  const cancelLogoutBtn = document.getElementById("cancelLogoutBtn");

  if (cancelLogoutBtn) {
    cancelLogoutBtn.onclick = () => {
      document.getElementById("logoutModal")?.classList.add("hidden");
    };
  }

  if (confirmLogoutBtn) {
    confirmLogoutBtn.onclick = () => {
      logout();
    };
  }

  if (authCloseBtn) {
    authCloseBtn.onclick = () => {
      clearAuthError();
      closeAuthModal();
    };
  }

  if (authSubmitBtn) {
    authSubmitBtn.onclick = async () => {
      const email = authEmail?.value.trim().toLowerCase() || "";
      const password = authPassword?.value.trim() || "";

      clearAuthError();

      if (!email || !password) {
        return showAuthError("Please enter your email and password.");
      }

      try {
        // ----------------------------
        // LOGIN
        // ----------------------------
        if (isLoginMode) {
          const { data, error } = await supabaseClient.auth.signInWithPassword({
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

          closeAuthModal();
          updateAccountButton();
          location.reload();
          return;
        }

        // ----------------------------
        // REGISTER (BACKEND)
        // ----------------------------
        const res = await fetch(
          DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.AUTH_REGISTER_URL,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
          }
        );

        const result = await res.json();

        if (!res.ok || !result.ok) {
          const serverCode = result?.code || "";
          const serverMessage = result?.message || "";

          if (serverCode === "ACCOUNT_EXISTS") {
            return showAuthError("An account with this email already exists. Please login.");
          }

          if (serverCode === "WEAK_PASSWORD") {
            return showAuthError("Password must be at least 6 characters.");
          }

          if (serverCode === "INVALID_EMAIL") {
            return showAuthError("Enter a valid email address.");
          }

          if (res.status === 409) {
            return showAuthError("An account with this email already exists. Please login.");
          }

          if (serverMessage.toLowerCase().includes("already")) {
            return showAuthError("An account with this email already exists. Please login.");
          }

          return showAuthError(serverMessage || "Unable to create account right now. Please try again.");
        }

        showAuthError("✅ Account created. Please login.", true);

        if (authPassword) authPassword.value = "";
        isLoginMode = true;
        renderAuthMode();
      } catch (e) {
        console.error("Auth submit error:", e);
        showAuthError("Unable to connect right now. Please check your internet and try again.");
      }
    };
  }

  // Forgot password
  if (forgotBtn) {
    forgotBtn.onclick = async () => {
      const email = authEmail?.value.trim().toLowerCase();

      if (!email) {
        return showAuthError("Enter your email first.");
      }

      if (!email.includes("@")) {
        return showAuthError("Enter a valid email address.");
      }

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/DN_Physics/reset-password.html"
      });

      if (error) {
        return showAuthError("Unable to send reset email. Try again later.");
      }

      showAuthError(`📩 If an account exists, a password reset link has been sent to ${email}. Please check your inbox.`, true);
    };
  }

  // Auth state sync
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      setUser(session.user);
      setSessionToken(session.access_token || "");
    } else {
      clearUser();
      clearSessionToken();
      clearProfileCache();
    }
    updateAccountButton();
  });

  renderAuthMode();

  restoreUserSession().then(() => {
    updateAccountButton();
  });

  // Email verification redirect handler
  (async () => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      try {
        await new Promise((r) => setTimeout(r, 500));

        const { data } = await supabaseClient.auth.getSession();

        if (data?.session?.user) {
          setUser(data.session.user);
          setSessionToken(data.session.access_token || "");
          await ensureProfile(data.session.user);

          alert("✅ Email verified successfully!");

          window.history.replaceState({}, document.title, window.location.pathname);
          location.reload();
        } else {
          alert("Email verified. Please login now.");
        }
      } catch (e) {
        console.error("Verification error:", e);
      }
    }
  })();
});