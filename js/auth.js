function openAuthModal() {
  document.getElementById("authModal").classList.remove("hidden");
}

function closeAuthModal() {
  document.getElementById("authModal").classList.add("hidden");
}

function isLoggedIn() {
  return localStorage.getItem("dn_user") !== null;
}

function setUser(user) {
  localStorage.setItem("dn_user", JSON.stringify(user));
}

function getUser() {
  return JSON.parse(localStorage.getItem("dn_user"));
}

function logout() {
  localStorage.removeItem("dn_user");
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const authSubmitBtn = document.getElementById("authSubmitBtn");
  const authToggleBtn = document.getElementById("authToggleBtn");
  const authCloseBtn = document.getElementById("authCloseBtn");

  let isLogin = true;

  loginBtn.onclick = () => openAuthModal();
  authCloseBtn.onclick = () => closeAuthModal();

  authToggleBtn.onclick = () => {
    isLogin = !isLogin;
    document.getElementById("authTitle").textContent = isLogin ? "Login" : "Sign Up";
    authSubmitBtn.textContent = isLogin ? "Login" : "Sign Up";
  };

  authSubmitBtn.onclick = () => {
    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;

    if (!email || !password) {
      alert("Fill all fields");
      return;
    }

    // TEMP local system (later connect backend)
    setUser({ email });

    closeAuthModal();
    location.reload();
  };
});
