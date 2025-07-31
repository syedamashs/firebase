import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAEWFOZu_r5jW8EiLbd6ud8PzTUAb5-mMA",
  authDomain: "practice-7ccb6.firebaseapp.com",
  projectId: "practice-7ccb6",
  storageBucket: "practice-7ccb6.firebasestorage.app",
  messagingSenderId: "1085859454861",
  appId: "1:1085859454861:web:4e97169011a10b68da67c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);