// 🔥 Firebase Client - Scalable Auth for Millions of Users
// Replace the config values with your Firebase project credentials

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your API key
  authDomain: "YOUR_PROJECT.firebaseapp.com", // Replace with your auth domain
  projectId: "YOUR_PROJECT_ID", // Replace with your project ID
  storageBucket: "YOUR_PROJECT.appspot.com", // Replace with your storage bucket
  messagingSenderId: "YOUR_MESSAGING_ID", // Replace with your messaging ID
  appId: "YOUR_APP_ID", // Replace with your app ID
};

// Import Firebase modules (using CDN version in HTML)
// Add this to your index.html <head>:
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js"></script>
// <script src="https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js"></script>

// Or use ES modules if you have a bundler

(() => {
  "use strict";

  // Initialize Firebase
  if (typeof firebase !== "undefined") {
    firebase.initializeApp(firebaseConfig);
    window.firebaseAuth = firebase.auth();
    window.firebaseDb = firebase.firestore();
    console.log("✅ Firebase initialized successfully");
  } else {
    console.error("❌ Firebase SDK not loaded. Add it to index.html");
  }
})();
