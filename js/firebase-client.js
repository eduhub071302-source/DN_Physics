// firebase-client.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA8MHkxCeD1hUkPFZA15mUpaB87B21ZZ04",
  authDomain: "dn-physics.firebaseapp.com",
  databaseURL: "https://dn-physics-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "dn-physics",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
