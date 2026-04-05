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
  let errorBox = document.getElementById("authErrorBox");

  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.id = "authErrorBox";

    const box = document.querySelector(".auth-box");
    if (box) {
      box.insertBefore(errorBox, box.children[2]);
    }
  }

  errorBox.style.cssText = `
    margin-top: 10px;
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

  if (loginBtn) {
    loginBtn.onclick = () => {
      const user = getUser();

      if (user) {
        if (confirm(`Logged in as ${user.email}\n\nLogout?`)) {
          logout();
        }
        return;
      }

      clearAuthError();
      openAuthModal();
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
              return showAuthError("Email or password is incorrect.");
            }

            if (msg.includes("email not confirmed")) {
              return showAuthError("Account created. Please check your email inbox and verify your account.");
            }

            if (msg.includes("rate limit")) {
              return showAuthError("An account with this email likely already exists. Try logging in instead.");
            }

            return showAuthError("Unable to login right now. Please try again.");
          }

          if (!data?.user) {
            return showAuthError("Unable to login right now. Please try again.");
          }

          setUser(data.user);

          // Do not let profile sync break login
          await ensureProfile(data.user);
          await loadUserProfile(data.user.id);

          closeAuthModal();
          updateAccountButton();
          location.reload();
          return;
        }

        // SIGNUP ONLY
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password
        });

        if (error) {
          const msg = (error.message || "").toLowerCase();

          if (msg.includes("already registered") || msg.includes("already been registered")) {
            return showAuthError("An account with this email likely already exists. Try logging in instead.");
          }

          if (msg.includes("rate limit")) {
            return showAuthError("Too many signup attempts. Please wait a little and try again.");
          }

          if (msg.includes("password")) {
            return showAuthError("Password is too weak. Use a stronger password.");
          }

          return showAuthError(error.message || "Unable to create account right now.");
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
    forgotBtn.onclick = async () => {
      const email = authEmail?.value.trim();

      if (!email) {
        return showAuthError("Enter your email first.");
      }

      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (error) {
        return showAuthError("Failed to send reset email.");
      }

      showAuthError("📩 Password reset email sent. Check your inbox.", true);
    };
  }
});