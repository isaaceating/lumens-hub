import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHFwGuA_S1w2KavvMZkD9rls4LCWc9tMg",
  authDomain: "lumens-hub.firebaseapp.com",
  projectId: "lumens-hub",
  storageBucket: "lumens-hub.firebasestorage.app",
  messagingSenderId: "67758380566",
  appId: "1:67758380566:web:de27b6490021cc72fc4737",
};

const app = initializeApp(firebaseConfig);

// 👉 Firestore 用
export const db = getFirestore(app);

// 👉 Auth 用（你之前已經在用）
export default app;