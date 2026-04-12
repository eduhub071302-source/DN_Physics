// firebase-client.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

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

export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
