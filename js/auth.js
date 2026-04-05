// 🔐 SUPABASE AUTH SYSTEM

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("hidden");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
}

// 🔥 PREMIUM ERROR UI
function showAuthError(message, isSuccess = false) {
  let errorBox = document.getElementById("authErrorBox");

  if (!errorBox) {
    errorBox = document.createElement("div");
    errorBox.id = "authErrorBox";

    const box = document.querySelector(".auth-box");
    if (box) box.insertBefore(errorBox, box.children[2]);
  }

  errorBox.style.cssText = `
    margin-top: 10px;
    padding: 10px;
    border-radius: 8px;
    background: ${isSuccess ? "rgba(34,197,94,0.12)" : "rgba(255,0,0,0.10)"};
    color: ${isSuccess ? "#86efac" : "#ff6b6b"};
    font-size: 14px;
    text-align: center;
    border: 1px solid ${isSuccess ? "rgba(34,197,94,0.25)" : "rgba(255,107,107,0.22)"};
  `;

  errorBox.textContent = message;
}

function clearAuthError() {
  const box = document.getElementById("authErrorBox");
  if (box) box.remove();
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
  await supabaseClient.auth.signOut();
  clearUser();
  if (typeof clearPaidAccess === "function") clearPaidAccess();
  location.reload();
}

// ----------------------------
// PROFILE
// ----------------------------

async function loadUserProfile(userId) {
  const { data } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    localStorage.setItem("dn_profile", JSON.stringify(data));
  }
}

// ----------------------------
// SESSION
// ----------------------------

async function restoreUserSession() {
  const { data } = await supabaseClient.auth.getSession();

  if (data?.session?.user) {
    setUser(data.session.user);
    await loadUserProfile(data.session.user.id);
  } else {
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

  btn.textContent = user ? `👤 ${user.email}` : "👤 Login";
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
    authTitle.textContent = isLoginMode ? "Login" : "Sign Up";
    authSubmitBtn.textContent = isLoginMode ? "Login" : "Create Account";

    authToggleText.innerHTML = isLoginMode
      ? `Don't have an account? <span id="authToggleBtn">Sign up</span>`
      : `Already have an account? <span id="authToggleBtn">Login</span>`;

    document.getElementById("authToggleBtn").onclick = () => {
      isLoginMode = !isLoginMode;
      clearAuthError();
      renderAuthMode();
    };
  }

  // 👁️ PASSWORD TOGGLE
  togglePasswordBtn.onclick = () => {
    const show = authPassword.type === "password";
    authPassword.type = show ? "text" : "password";

    eyeIcon.innerHTML = show
      ? `<path d="M1 1L23 23" stroke="currentColor" stroke-width="2"/>`
      : `<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>`;
  };

  authEmail.addEventListener("input", clearAuthError);
  authPassword.addEventListener("input", clearAuthError);

  // ACCOUNT BUTTON
  loginBtn.onclick = () => {
    const user = getUser();

    if (user) {
      if (confirm(`Logged in as ${user.email}\nLogout?`)) logout();
      return;
    }

    openAuthModal();
  };

  authCloseBtn.onclick = closeAuthModal;

  // 🔐 AUTH SUBMIT
  authSubmitBtn.onclick = async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();

    if (!email || !password) {
      return showAuthError("Enter email and password");
    }

    try {
      if (isLoginMode) {
        // 🔐 LOGIN
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            return showAuthError("Password incorrect or account not found");
          }
          return showAuthError("Login failed");
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

      } else {
        // 🆕 SIGNUP
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password
        });

        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            return showAuthError("Account already exists. Please login.");
          }
          return showAuthError(error.message);
        }

        await supabaseClient.from("profiles").upsert({
          id: data.user.id,
          email: data.user.email,
          name: email.split("@")[0]
        });

        showAuthError("✅ Account created. Please login.", true);

        authPassword.value = "";
        isLoginMode = true;
        renderAuthMode();
      }

    } catch (e) {
      console.error(e);
      showAuthError("Something went wrong");
    }
  };

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (session?.user) setUser(session.user);
    else clearUser();
    updateAccountButton();
  });

  renderAuthMode();
  restoreUserSession();
});