// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHFwGuA_S1w2KavvMZkD9rls4LCWc9tMg",
  authDomain: "lumens-hub.firebaseapp.com",
  projectId: "lumens-hub",
  storageBucket: "lumens-hub.firebasestorage.app",
  messagingSenderId: "67758380566",
  appId: "1:67758380566:web:de27b6490021cc72fc4737"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;