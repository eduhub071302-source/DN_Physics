function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("hidden");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
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
        const shouldLogout = confirm(`Logged in as ${user.email}\n\nPress OK to logout.\nPress Cancel to stay logged in.`);
        if (shouldLogout) logout();
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
        alert("Please fill email and password.");
        return;
      }

      if (!email.includes("@")) {
        alert("Enter a valid email.");
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
