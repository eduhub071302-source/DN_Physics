// 🔐 AUTH SYSTEM (Final Production Version)

// ----------------------------
// Modal Controls
// ----------------------------

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("hidden");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
}

// ----------------------------
// Session
// ----------------------------

function setSessionToken(token) {
  localStorage.setItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN, token);
}

function getSessionToken() {
  return localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN) || "";
}

function clearSessionToken() {
  localStorage.removeItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN);
}

// ----------------------------
// User
// ----------------------------

function setUser(user) {
  localStorage.setItem(
    DN_CONFIG.STORAGE_KEYS.USER_PROFILE,
    JSON.stringify(user)
  );
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE)) || null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getUser();
}

// ----------------------------
// Logout
// ----------------------------

async function logout() {
  try {
    if (DN_CONFIG.BACKEND.AUTH_LOGOUT_URL) {
      await fetch(
        DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.AUTH_LOGOUT_URL,
        { method: "POST" }
      );
    }
  } catch {}

  clearSessionToken();
  localStorage.removeItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE);

  // 🔥 ALSO CLEAR UNLOCK (IMPORTANT)
  clearPaidAccess();

  location.reload();
}

// ----------------------------
// Request Helper
// ----------------------------

async function authRequest(url, options = {}) {
  const token = getSessionToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers
  });

  const data = await res.json();
  return { res, data };
}

// ----------------------------
// Restore Session
// ----------------------------

async function restoreUserSession() {
  const token = getSessionToken();

  if (!token || !DN_CONFIG.BACKEND.AUTH_ME_URL) return;

  try {
    const { res, data } = await authRequest(
      DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.AUTH_ME_URL,
      { method: "GET" }
    );

    if (res.ok && data.ok && data.user) {
      setUser(data.user);

      // 🔥 IMPORTANT: sync unlock after login
      await syncUnlockWithServer();

      return;
    }
  } catch (error) {
    console.log("Restore session failed:", error);
  }

  clearSessionToken();
  localStorage.removeItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE);
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
  } else {
    loginBtn.textContent = "👤 Login";
  }
}

// ----------------------------
// MAIN INIT
// ----------------------------

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authToggleBtn = document.getElementById("authToggleBtn");
  const authCloseBtn = document.getElementById("authCloseBtn");
  const authTitle = document.getElementById("authTitle");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authToggleText = document.getElementById("authToggleText");

  let isLoginMode = true;

  function updateAuthMode() {
    authTitle.textContent = isLoginMode ? "Login" : "Sign Up";
    authSubmitBtn.textContent = isLoginMode ? "Login" : "Create Account";
    authToggleText.innerHTML = isLoginMode
      ? `Don't have an account? <span id="authToggleBtn">Sign up</span>`
      : `Already have an account? <span id="authToggleBtn">Login</span>`;

    document.getElementById("authToggleBtn").onclick = () => {
      isLoginMode = !isLoginMode;
      updateAuthMode();
    };
  }

  loginBtn.onclick = () => {
    const user = getUser();

    if (user) {
      if (confirm(`Logged in as ${user.email}\n\nLogout?`)) {
        logout();
      }
      return;
    }

    openAuthModal();
  };

  authCloseBtn.onclick = closeAuthModal;

  authToggleBtn.onclick = () => {
    isLoginMode = !isLoginMode;
    updateAuthMode();
  };

  authSubmitBtn.onclick = async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();

    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    let url = "";
    let payload = { email, password };

    if (isLoginMode) {
      url = DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.AUTH_LOGIN_URL;
    } else {
      url = DN_CONFIG.BACKEND.API_BASE_URL + DN_CONFIG.BACKEND.AUTH_REGISTER_URL;
      payload.name = email.split("@")[0];
    }

    try {
      const { res, data } = await authRequest(url, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!res.ok || !data.ok) {
        alert(data.message || "Auth failed");
        return;
      }

      if (data.token) setSessionToken(data.token);
      if (data.user) setUser(data.user);

      // 🔥 IMPORTANT: sync unlock immediately
      await syncUnlockWithServer();

      closeAuthModal();
      updateAccountButton();

      location.reload();
    } catch (e) {
      alert("Network error");
    }
  };

  updateAuthMode();

  restoreUserSession().finally(() => {
    updateAccountButton();
  });
});
