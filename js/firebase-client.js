// firebase-client.js

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8MHkxCeD1hUkPFZA15mUpaB87B21ZZ04",
  authDomain: "dn-physics.firebaseapp.com",
  databaseURL: "https://dn-physics-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dn-physics",
  storageBucket: "dn-physics.firebasestorage.app",
  messagingSenderId: "550016753421",
  appId: "1:550016753421:web:8c68d2471cb87192809a44",
  measurementId: "G-JB216F8CQ9",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;

window.firebaseSdk = {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  ref,
  get,
  set,
  onValue,
};

export { app, auth, db };
export default app;
