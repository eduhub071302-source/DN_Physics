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

function getOfflineMessage(actionText = "continue") {
  return `No internet connection. Please reconnect and try again to ${actionText}.`;
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
  if (!navigator.onLine) {
    window.location.href = "/DN_Physics/offline.html";
    return;
  }

  try {
    await supabaseClient.auth.signOut();
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

// ----------------------------
// MAIN
// ----------------------------

document.addEventListener("DOMContentLoaded", () => {
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authCloseBtn = document.getElementById("authCloseBtn");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authConfirmPassword = document.getElementById("authConfirmPassword");
  const authConfirmRow = document.getElementById("authConfirmRow");
  const authTitle = document.getElementById("authTitle");
  const authToggleText = document.getElementById("authToggleText");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const eyeIcon = document.getElementById("eyeIcon");
  const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPasswordBtn");
  const confirmEyeIcon = document.getElementById("confirmEyeIcon");
  const forgotBtn = document.getElementById("forgotPasswordBtn");

  let isLoginMode = true;

  function renderAuthMode() {
    if (authTitle) {
      authTitle.textContent = isLoginMode ? "Login" : "Create Account";
    }

    if (authSubmitBtn) {
      authSubmitBtn.textContent = isLoginMode ? "Login" : "Create Account";
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

          if (authPassword) authPassword.value = "";
          if (authConfirmPassword) authConfirmPassword.value = "";

          renderAuthMode();
        };
      }
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

  document.addEventListener("click", (e) => {
    const loginButton = e.target.closest("#loginBtn");
    if (!loginButton) return;

    e.preventDefault();
    e.stopPropagation();

    const user = getUser();

    if (user) {
      const logoutModal = document.getElementById("logoutModal");
      if (logoutModal) logoutModal.classList.remove("hidden");
      return;
    }

    clearAuthError();
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

  if (authSubmitBtn) {
    authSubmitBtn.onclick = async () => {
      const email = authEmail?.value.trim().toLowerCase() || "";
      const password = authPassword?.value.trim() || "";
      const confirmPassword = authConfirmPassword?.value.trim() || "";

      clearAuthError();

      if (!email || !password) {
        return showAuthError("Please enter your email and password.");
      }

      if (!isLoginMode) {
        if (!confirmPassword) {
          return showAuthError("Please confirm your password.");
        }

        if (password !== confirmPassword) {
          return showAuthError("Passwords do not match.");
        }
      }

      try {
        if (isLoginMode) {
          if (!navigator.onLine) {
            return window.location.href = "/DN_Physics/offline.html";
          }

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

        if (!navigator.onLine) {
          return window.location.href = "/DN_Physics/offline.html";
        }

        let res;
        let result = {};

        try {
          res = await fetch(
            DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.AUTH_REGISTER_URL,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ email, password })
            }
          );

          result = await res.json().catch(() => ({}));

        } catch (err) {
          console.error("Fetch failed:", err);

          if (!navigator.onLine) {
            return showAuthError("No internet connection. Please reconnect and try again.");
          }

          return showAuthError("Unable to reach server. Please try again.");
        }

        if (!res || !res.ok || !result.ok) {
          const serverCode = result?.code || "";
          const serverMessage = String(result?.message || "").toLowerCase();

          if (
            serverCode === "ACCOUNT_EXISTS" ||
            res?.status === 409 ||
            serverMessage.includes("already") ||
            serverMessage.includes("registered") ||
            serverMessage.includes("exists")
          ) {
            return showAuthError("An account with this email already exists. Please login.");
          }

          if (serverCode === "WEAK_PASSWORD") {
            return showAuthError("Password must be at least 6 characters.");
          }

          if (serverCode === "INVALID_EMAIL") {
            return showAuthError("Enter a valid email address.");
          }

          if (serverCode === "MISSING_FIELDS") {
            return showAuthError("Email and password are required.");
          }

          return showAuthError("Server error. Please try again.");
        }

        showAuthError("✅ Account created successfully. Please login.", true);

        if (authPassword) authPassword.value = "";
        if (authConfirmPassword) authConfirmPassword.value = "";
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

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
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

          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (e) {
        console.error("Verification error:", e);
      }
    }
  })();
});