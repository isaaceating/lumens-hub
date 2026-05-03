import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 👉 Google 登入
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Login error:", error);
  }
};

// 👉 登出
export const logout = async () => {
  await signOut(auth);
};

import { onAuthStateChanged } from "firebase/auth";

export const onUserChange = (callback: any) => {
  const auth = getAuth(app);
  return onAuthStateChanged(auth, callback);
};