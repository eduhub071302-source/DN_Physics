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

  cancelBtn.style.display = "inline-flex";
  okBtn.textContent = "Logout";

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
    modal.style.display = "none";
  };

  okBtn.onclick = () => {
    modal.classList.add("hidden");
    modal.style.display = "none";
    if (typeof onOk === "function") onOk();
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

  cancelBtn.style.display = "none";
  okBtn.textContent = "Logout";

  cancelBtn.onclick = () => {
    modal.classList.add("hidden");
  };

  okBtn.onclick = () => {
    modal.classList.add("hidden");
    modal.style.display = "none";
  };

  modal.classList.remove("hidden");
  modal.style.display = "flex";
}

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

function isLoggedIn() {
  return !!getUser();
}

function logout() {
  localStorage.removeItem("dn_user");
  location.reload();
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

  let isLoginMode = true;

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
    authSubmitBtn.onclick = () => {
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

      // TEMP local system for now
      setUser({ email });

      closeAuthModal();
      updateAccountButton();
      location.reload();
    };
  }

  updateAuthMode();
  updateAccountButton();
});
