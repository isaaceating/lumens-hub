import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let isSigningIn = false;

export const signInWithGoogle = async () => {
  if (isSigningIn) return null;

  try {
    isSigningIn = true;

    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    const errorCode = error?.code;

    const ignoredErrors = [
      "auth/cancelled-popup-request",
      "auth/popup-closed-by-user",
    ];

    if (ignoredErrors.includes(errorCode)) {
      return null;
    }

    console.error("Login error:", error);
    return null;
  } finally {
    isSigningIn = false;
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const onUserChange = (callback: any) => {
  return onAuthStateChanged(auth, callback);
};