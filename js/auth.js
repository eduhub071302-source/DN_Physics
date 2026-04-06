// 🔐 SUPABASE AUTH SYSTEM — FINAL PREMIUM VERSION

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
  if (errorBox) {
    errorBox.remove();
  }
}

// ----------------------------
// USER
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
      localStorage.setItem("dn_profile", JSON.stringify(data));
      return data;
    }

    return null;
  } catch (error) {
    console.warn("Profile fetch warning:", error);
    return null;
  }
}

async function ensureProfile(user) {
  if (!user?.id || !user?.email) return;

  try {
    const { error } = await supabaseClient.from("profiles").upsert({
      id: user.id,
      email: user.email,
      name: user.email.split("@")[0]
    });

    if (error) {
      console.warn("Profile upsert warning:", error.message);
    }
  } catch (error) {
    console.warn("Profile upsert failed:", error);
  }
}

// ----------------------------
// SESSION
// ----------------------------

async function restoreUserSession() {
  try {
    const { data } = await supabaseClient.auth.getSession();

    if (data?.session?.user) {
      setUser(data.session.user);
      await loadUserProfile(data.session.user.id);
    } else {
      clearUser();
    }
  } catch (error) {
    console.error("Restore session failed:", error);
    clearUser();
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
  const loginBtn = document.getElementById("loginBtn");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authCloseBtn = document.getElementById("authCloseBtn");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authTitle = document.getElementById("authTitle");
  const authToggleText = document.getElementById("authToggleText");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");
  const eyeIcon = document.getElementById("eyeIcon");

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
          renderAuthMode();
        };
      }
    }
  }

  // 👁️ Premium eye toggle
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

  document.addEventListener("click", (e) => {
    if (e.target.id === "loginBtn") {
      const user = getUser();

      if (user) {
        const logoutModal = document.getElementById("logoutModal");
        if (logoutModal) logoutModal.classList.remove("hidden");
        return;
      }
   
      clearAuthError();
      openAuthModal();
    }
  });

  // logout modal buttons
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
    document.addEventListener("click", async (e) => {
      if (e.target.id === "authSubmitBtn") {
      const email = authEmail?.value.trim() || "";
      const password = authPassword?.value.trim() || "";

      clearAuthError();

      if (!email || !password) {
        return showAuthError("Please enter your email and password.");
      }

      try {
        if (isLoginMode) {
          // LOGIN ONLY
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            const msg = (error.message || "").toLowerCase();

            if (msg.includes("invalid login credentials")) {
              return showAuthError("Incorrect email or password.");
            }

            if (msg.includes("email not confirmed")) {
              return showAuthError("Please verify your email before logging in.");
            }
 
            if (msg.includes("rate limit")) {
              return showAuthError("Too many login attempts. Please try again later.");
            }

            return showAuthError("Login failed. Please try again.");
          }

          if (!data?.user) {
            return showAuthError("Login failed. Please try again.");
          }

          setUser(data.user);

          await ensureProfile(data.user);
          await loadUserProfile(data.user.id);

          closeAuthModal();
          updateAccountButton();
          location.reload();
          return;
        }  

        // 🔐 TRY LOGIN FIRST (detect existing account)
        const { data: loginTest } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        // If login works → account already exists
        if (loginTest?.user) {
          return showAuthError("Account already exists. Please login.");
        }

        // If login fails → proceed signup
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password
        });

        if (error) {
          const msg = (error.message || "").toLowerCase();

          if (msg.includes("already") || msg.includes("registered")) {
            return showAuthError("Account already exists. Please login.");
          }

          if (msg.includes("rate limit")) {
            return showAuthError("Too many attempts. Please try again later.");
          }

          return showAuthError("Unable to create account.");
        }

        showAuthError("✅ Account created successfully. Please login.", true);

        // 🔐 PROCEED WITH SIGNUP
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password
        });

        if (error) {
          const msg = (error.message || "").toLowerCase();

          if (
            msg.includes("already registered") ||
            msg.includes("already exists") ||
            msg.includes("duplicate") ||
            msg.includes("unique")
          ) {
            return showAuthError("An account with this email already exists. Please login.");
          }

          if (msg.includes("rate limit")) {
            return showAuthError("Too many attempts. Please try again later.");
          }

          if (msg.includes("password")) {
            return showAuthError("Password is too weak. Use a stronger password.");
          }

          return showAuthError("Unable to create account right now.");
        }

        if (data?.user) {
          await ensureProfile(data.user);
        }

        showAuthError("✅ Account created successfully. Please login.", true);

        if (authPassword) authPassword.value = "";
        isLoginMode = true;
        renderAuthMode();
      } catch (e) {
        console.error("Auth error:", e);
        showAuthError("Something went wrong. Please try again.");
      }
    };
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      setUser(session.user);
    } else {
      clearUser();
    }
    updateAccountButton();
  });

  renderAuthMode();
  restoreUserSession().then(() => {
    updateAccountButton();
  });

  const forgotBtn = document.getElementById("forgotPasswordBtn");

  if (forgotBtn) {
    document.addEventListener("click", async (e) => {
      if (e.target.id === "forgotPasswordBtn") {
      const email = authEmail?.value.trim();

      if (!email) {
        return showAuthError("Enter your email first.");
      }

      // Optional: simple email format check
      if (!email.includes("@")) {
        return showAuthError("Enter a valid email address.");
      }

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/DN_Physics/reset-password.html"
      });

      if (error) {
        return showAuthError("Unable to send reset email. Try again later.");
      }

      // 🔥 Premium UX (do NOT reveal if account exists)
      showAuthError("📩 If an account exists, a reset link has been sent.", true);
    };
  }
  
  // 🔥 HANDLE EMAIL CONFIRMATION REDIRECT (FIXED)
  (async () => {
    const hash = window.location.hash;

    if (hash && hash.includes("access_token")) {
      try {
        // wait for session to be ready
        await new Promise(r => setTimeout(r, 500));

        const { data } = await supabaseClient.auth.getSession();

        if (data?.session?.user) {
          setUser(data.session.user);
          await ensureProfile(data.session.user);

          alert("✅ Email verified successfully! You can now use the app.");

          // clean URL
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