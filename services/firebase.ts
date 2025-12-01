import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Default config or fallback
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA-5Z_HVVwHn14czFkt14__srZ4U14ypXw",
  authDomain: "rental1-7718e.firebaseapp.com",
  projectId: "rental1-7718e",
  storageBucket: "rental1-7718e.firebasestorage.app",
  messagingSenderId: "280685899242",
  appId: "1:280685899242:web:d49d07717fac7989e21693"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const signIn = async () => {
  try {
    await signInAnonymously(auth);
  } catch (error) {
    console.error("Auth error", error);
  }
};