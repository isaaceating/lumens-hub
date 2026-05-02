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
    console.log("Login success:", result.user);
    return result.user;
  } catch (error) {
    console.error("Login error:", error);
  }
};

// 👉 登出
export const logout = async () => {
  await signOut(auth);
};