// 🔐 SUPABASE AUTH SYSTEM

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
    padding: 10px;
    border-radius: 8px;
    background: ${isSuccess ? "rgba(34, 197, 94, 0.12)" : "rgba(255, 0, 0, 0.10)"};
    color: ${isSuccess ? "#86efac" : "#ff6b6b"};
    font-size: 14px;
    text-align: center;
    border: 1px solid ${isSuccess ? "rgba(34, 197, 94, 0.25)" : "rgba(255, 107, 107, 0.22)"};
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
// LOAD SESSION
// ----------------------------

async function restoreUserSession() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
      console.error("Restore session error:", error);
      clearUser();
      return;
    }

    if (data?.session?.user) {
      setUser(data.session.user);
      await loadUserProfile(data.session.user.id);
      return;
    }

    clearUser();
  } catch (error) {
    console.error("Restore session failed:", error);
    clearUser();
  }
}

// ----------------------------
// LOAD PROFILE
// ----------------------------

async function loadUserProfile(userId) {
  try {
    const { data, error } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Load profile error:", error);
      return null;
    }

    if (data) {
      localStorage.setItem("dn_profile", JSON.stringify(data));
      return data;
    }

    return null;
  } catch (error) {
    console.error("Profile fetch failed:", error);
    return null;
  }
}

// ----------------------------
// UI
// ----------------------------

function updateAccountButton() {
  const loginBtn = document.getElementById("loginBtn");
  const user = getUser();

  if (!loginBtn) return;

  if (user && user.email) {
    loginBtn.textContent = "👤 " + user.email;
    loginBtn.title = user.email;
  } else {
    loginBtn.textContent = "👤 Login";
    loginBtn.title = "Login or sign up";
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
    // ✅ update title
    if (authTitle) {
      authTitle.textContent = isLoginMode ? "Login" : "Sign Up";
    }

    // ✅ update button
    if (authSubmitBtn) {
      authSubmitBtn.textContent = isLoginMode ? "Login" : "Create Account";
    }

    // ✅ update toggle text
    if (authToggleText) {
      authToggleText.innerHTML = isLoginMode
        ? `Don't have an account? <span id="authToggleBtn">Sign up</span>`
        : `Already have an account? <span id="authToggleBtn">Login</span>`;

      const newToggleBtn = document.getElementById("authToggleBtn");

      if (newToggleBtn) {
        newToggleBtn.addEventListener("click", () => {
          isLoginMode = !isLoginMode;
          clearAuthError();
          renderAuthMode();
        });
      }
    }
  }

  if (togglePasswordBtn && authPassword && eyeIcon) {
    togglePasswordBtn.addEventListener("click", () => {
      const isPassword = authPassword.type === "password";

      if (isPassword) {
        authPassword.type = "text";
        togglePasswordBtn.setAttribute("aria-label", "Hide password");

        eyeIcon.innerHTML = `
          <path d="M17.94 17.94C16.12 19.17 14.12 20 12 20C5 20 1 12 1 12C2.01 9.62 3.63 7.56 5.63 6.05M9.9 4.24C10.59 4.08 11.29 4 12 4C19 4 23 12 23 12C22.34 13.58 21.44 15.02 20.36 16.27M1 1L23 23"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        `;
      } else {
        authPassword.type = "password";
        togglePasswordBtn.setAttribute("aria-label", "Show password");

        eyeIcon.innerHTML = `
          <path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z"
          stroke="currentColor" stroke-width="2"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        `;
      }
    });
  }

  if (authEmail) {
    authEmail.addEventListener("input", clearAuthError);
  }

  if (authPassword) {
    authPassword.addEventListener("input", clearAuthError);
  }

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
      const email = authEmail ? authEmail.value.trim() : "";
      const password = authPassword ? authPassword.value.trim() : "";

      clearAuthError();

      if (!email || !password) {
        showAuthError("Please enter email and password.");
        return;
      }

      try {
        if (isLoginMode) {
          const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            console.error("Login error:", error);

            if (error.message.includes("Invalid login credentials")) {
              return showAuthError("No account found or password incorrect.");
            }

            return showAuthError("Login failed. Please try again.");
          }

          if (!data?.user) {
            return showAuthError("Login failed. Please try again.");
          }

          setUser(data.user);

          await supabaseClient.from("profiles").upsert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.email.split("@")[0]
          });

          await loadUserProfile(data.user.id);

          closeAuthModal();
          updateAccountButton();
          location.reload();
          return;
        }

        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password
        });

        if (error) {
          console.error("Signup error:", error);

          if (error.message.includes("User already registered")) {
            return showAuthError("This email is already registered. Try logging in.");
          }

          if (error.message.toLowerCase().includes("password")) {
            return showAuthError("Password is too weak. Use a stronger password.");
          }

          return showAuthError("Signup failed. Please try again.");
        }

        const user = data?.user;

        if (user) {
          await supabaseClient.from("profiles").upsert({
            id: user.id,
            email: user.email,
            name: email.split("@")[0]
          });
        }

        showAuthError("✅ Account created successfully. Please login.", true);

        if (authPassword) authPassword.value = "";
        isLoginMode = true;
        renderAuthMode();

        } catch (e) {
          console.error("Auth error:", e);

          if (e.message) {
            return showAuthError(e.message);
          }

          showAuthError("Connection issue. Please try again.");
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
});