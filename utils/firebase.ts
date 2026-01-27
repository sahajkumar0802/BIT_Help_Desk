import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration from your Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCRtHQgkNANgCxrFjlerBEjZh9GKdB0BN8",
  authDomain: "bit-student-desk.firebaseapp.com",
  projectId: "bit-student-desk",
  storageBucket: "bit-student-desk.firebasestorage.app",
  messagingSenderId: "665191698112",
  appId: "1:665191698112:web:8feb3e6a314345b2e96725",
  measurementId: "G-Z852VTREQT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
