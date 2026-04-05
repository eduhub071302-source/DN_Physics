// 🔐 SUPABASE AUTH SYSTEM

function openAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.remove("hidden");
}

function closeAuthModal() {
  const modal = document.getElementById("authModal");
  if (modal) modal.classList.add("hidden");
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
}

// ----------------------------
// LOGOUT
// ----------------------------

async function logout() {
  await supabase.auth.signOut();
  clearUser();
  clearPaidAccess();
  location.reload();
}

// ----------------------------
// LOAD SESSION
// ----------------------------

async function restoreUserSession() {
  const { data } = await supabase.auth.getSession();

  if (data?.session?.user) {
    setUser(data.session.user);

    // 🔥 load profile from DB
    await loadUserProfile(data.session.user.id);

    return;
  }

  clearUser();
}

// ----------------------------
// LOAD PROFILE
// ----------------------------

async function loadUserProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (data) {
    localStorage.setItem("dn_profile", JSON.stringify(data));
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
  } else {
    loginBtn.textContent = "👤 Login";
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

  let isLoginMode = true;

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

  document.getElementById("authToggleBtn").onclick = () => {
    isLoginMode = !isLoginMode;

    document.getElementById("authTitle").textContent =
      isLoginMode ? "Login" : "Sign Up";

    authSubmitBtn.textContent =
      isLoginMode ? "Login" : "Create Account";
  };

  authSubmitBtn.onclick = async () => {
    const email = authEmail.value.trim();
    const password = authPassword.value.trim();

    if (!email || !password) {
      alert("Enter email and password");
      return;
    }

    try {
      if (isLoginMode) {
        // 🔐 LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) return alert(error.message);

        setUser(data.user);
        await loadUserProfile(data.user.id);

      } else {
        // 🔐 SIGN UP
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });

        if (error) return alert(error.message);

        const user = data.user;

        if (user) {
          // 🔥 create profile row
          await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            name: email.split("@")[0]
          });
        }

        alert("Account created. You can now login.");
      }

      closeAuthModal();
      updateAccountButton();
      location.reload();

    } catch (e) {
      alert("Network error");
    }
  };

  restoreUserSession().then(() => {
    updateAccountButton();
  });
});