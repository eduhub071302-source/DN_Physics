function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("hidden");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
}

function ensureAuthMessageModal() {
  if (document.getElementById("authMessageModal")) return;

  const wrapper = document.createElement("div");
  wrapper.id = "authMessageModal";
  wrapper.className = "auth-modal hidden";

  wrapper.innerHTML = `
    <div class="auth-box auth-message-box">
      <h2 id="authMessageTitle">Notice</h2>
      <p id="authMessageText" class="auth-message-text"></p>

      <div id="authMessageActions" class="auth-message-actions">
        <button id="authMessageCancelBtn" class="btn" type="button">Cancel</button>
        <button id="authMessageOkBtn" class="btn btn-primary" type="button">OK</button>
      </div>
    </div>
  `;

  document.body.appendChild(wrapper);
}

function showAuthMessage(title, message) {
  ensureAuthMessageModal();

  const modal = document.getElementById("authMessageModal");
  const titleEl = document.getElementById("authMessageTitle");
  const textEl = document.getElementById("authMessageText");
  const cancelBtn = document.getElementById("authMessageCancelBtn");
  const okBtn = document.getElementById("authMessageOkBtn");

  if (!modal || !titleEl || !textEl || !cancelBtn || !okBtn) return;

  titleEl.textContent = title;
  textEl.textContent = message;

  cancelBtn.style.display = "none";
  okBtn.textContent = "OK";

  okBtn.onclick = () => {
    modal.classList.add("hidden");
    modal.style.display = "none";
  };

  modal.classList.remove("hidden");
  modal.style.display = "flex";
}

function showAuthConfirm(title, message, onOk) {
  ensureAuthMessageModal();

  const modal = document.getElementById("authMessageModal");
  const titleEl = document.getElementById("authMessageTitle");
  const textEl = document.getElementById("authMessageText");
  const cancelBtn = document.getElementById("authMessageCancelBtn");
  const okBtn = document.getElementById("authMessageOkBtn");

  if (!modal || !titleEl || !textEl || !cancelBtn || !okBtn) return;

  titleEl.textContent = title;
  textEl.textContent = message;

  cancelBtn.style.display = "inline-flex";
  okBtn.textContent = "Logout";

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    modal.style.display = "none";
  };

  okBtn.onclick = () => {
    modal.classList.add("hidden");
    modal.style.display = "none";

    if (typeof onOk === "function") {
      onOk();
    }
  };

  modal.classList.remove("hidden");
  modal.style.display = "flex";
}

function setSessionToken(token) {
  localStorage.setItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN, token);
}

function getSessionToken() {
  return localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN) || "";
}

function clearSessionToken() {
  localStorage.removeItem(DN_CONFIG.STORAGE_KEYS.USER_SESSION_TOKEN);
}

function setUser(user) {
  localStorage.setItem(
    DN_CONFIG.STORAGE_KEYS.USER_PROFILE,
    JSON.stringify(user)
  );
}

function getUser() {
  try {
    return JSON.parse(
      localStorage.getItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE)
    ) || null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getUser();
}

async function logout() {
  try {
    if (DN_CONFIG.BACKEND.AUTH_LOGOUT_URL) {
      await authRequest(DN_CONFIG.BACKEND.AUTH_LOGOUT_URL, {
        method: "POST"
      });
    }
  } catch (error) {
    console.log("Logout request failed:", error);
  }

  clearSessionToken();
  localStorage.removeItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE);
  location.reload();
}

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

async function restoreUserSession() {
  const token = getSessionToken();

  if (!token || !DN_CONFIG.BACKEND.AUTH_ME_URL) return;

  try {
    const { res, data } = await authRequest(
      DN_CONFIG.BACKEND.AUTH_ME_URL,
      { method: "GET" }
    );

    if (res.ok && data.ok && data.user) {
      setUser(data.user);
      return;
    }
  } catch (error) {
    console.log("Restore session failed:", error);
  }

  clearSessionToken();
  localStorage.removeItem(DN_CONFIG.STORAGE_KEYS.USER_PROFILE);
}

function updateAccountButton() {
  const loginBtn = document.getElementById("loginBtn");
  const user = getUser();

  if (!loginBtn) return;

  if (user && user.email) {
    loginBtn.textContent = "👤 " + user.email;
    loginBtn.title = "Open account";
  } else {
    loginBtn.textContent = "👤 Login";
    loginBtn.title = "Login or sign up";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authToggleBtn = document.getElementById("authToggleBtn");
  const authCloseBtn = document.getElementById("authCloseBtn");
  const authTitle = document.getElementById("authTitle");
  const authEmail = document.getElementById("authEmail");
  const authPassword = document.getElementById("authPassword");
  const authToggleText = document.getElementById("authToggleText");
  const togglePasswordBtn = document.getElementById("togglePasswordBtn");

  let isLoginMode = true;

    if (togglePasswordBtn && authPassword) {
      togglePasswordBtn.onclick = () => {
        const isHidden = authPassword.type === "password";

        authPassword.type = isHidden ? "text" : "password";

        togglePasswordBtn.innerHTML = isHidden
          ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M17.94 17.94C16.19 19.17 14.17 20 12 20C5 20 1 12 1 12C2.06 9.94 3.63 7.96 5.59 6.44M9.9 4.24C10.58 4.08 11.29 4 12 4C19 4 23 12 23 12C22.36 13.18 21.56 14.28 20.64 15.24M1 1L23 23"
              stroke="currentColor" stroke-width="2"/>
            </svg>`
          : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M1 12C1 12 5 5 12 5C19 5 23 12 23 12C23 12 19 19 12 19C5 19 1 12 1 12Z"
              stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
            </svg>`;

        togglePasswordBtn.setAttribute(
          "aria-label",
          isHidden ? "Hide password" : "Show password"
        );
      };
    }

  function updateAuthMode() {
    if (!authTitle || !authSubmitBtn || !authToggleText) return;

    authTitle.textContent = isLoginMode ? "Login" : "Sign Up";
    authSubmitBtn.textContent = isLoginMode ? "Login" : "Create Account";
    authToggleText.innerHTML = isLoginMode
      ? `Don't have an account? <span id="authToggleBtn">Sign up</span>`
      : `Already have an account? <span id="authToggleBtn">Login</span>`;

    const newToggleBtn = document.getElementById("authToggleBtn");
    if (newToggleBtn) {
      newToggleBtn.onclick = () => {
        isLoginMode = !isLoginMode;
        updateAuthMode();
      };
    }
  }

  if (loginBtn) {
    loginBtn.onclick = () => {
      const user = getUser();

      if (user) {
        showAuthConfirm(
          "Account",
          `Logged in as ${user.email}`,
          () => logout()
        );
        return;
      }

      openAuthModal();
    };
  }

  if (authCloseBtn) {
    authCloseBtn.onclick = closeAuthModal;
  }

  if (authToggleBtn) {
    authToggleBtn.onclick = () => {
      isLoginMode = !isLoginMode;
      updateAuthMode();
    };
  }

  if (authSubmitBtn) {
    authSubmitBtn.onclick = async () => {
      const email = authEmail ? authEmail.value.trim() : "";
      const password = authPassword ? authPassword.value.trim() : "";

      if (!email || !password) {
        showAuthMessage("Missing Details", "Please fill email and password.");
        return;
      }

      if (!email.includes("@")) {
        showAuthMessage("Invalid Email", "Please enter a valid email address.");
        return;
      }

      let requestUrl = "";
      let payload = { email, password };

      if (isLoginMode) {
        requestUrl = DN_CONFIG.BACKEND.AUTH_LOGIN_URL;
      } else {
        requestUrl = DN_CONFIG.BACKEND.AUTH_REGISTER_URL;
        payload.name = email.split("@")[0];
      }

      console.log("Auth mode:", isLoginMode ? "LOGIN" : "REGISTER");
      console.log("Request URL:", requestUrl);

      if (!requestUrl) {
        showAuthMessage("Setup Missing", "Backend auth URL is not added yet.");
        return;
      }

      try {
        const { res, data } = await authRequest(requestUrl, {
          method: "POST",
          body: JSON.stringify(payload)
        });

        if (!res.ok || !data.ok) {
          showAuthMessage("Auth Failed", data.message || "Authentication failed.");
          return;
        }

        if (data.token) {
          setSessionToken(data.token);
        }

        if (data.user) {
          setUser(data.user);
        }

        closeAuthModal();
        updateAccountButton();
        location.reload();
      } catch (error) {
        showAuthMessage("Network Error", error.message || "Could not connect to server.");
      }
    };
  }

updateAuthMode();

restoreUserSession().finally(() => {
  updateAccountButton();
});
