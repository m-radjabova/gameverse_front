// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "",
  authDomain: "perfect-breakfast-645dc.firebaseapp.com",
  projectId: "perfect-breakfast-645dc",
  storageBucket: "perfect-breakfast-645dc.firebasestorage.app",
  messagingSenderId: "921904040916",
  appId: "1:921904040916:web:0c8052cb5c1c1f2f63a441",
  measurementId: "G-DN7EX7DZSQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
// const analytics = getAnalytics(app);