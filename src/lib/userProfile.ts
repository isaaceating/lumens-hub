import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createOrUpdateUserProfile = async (user: any) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      photo: user.photoURL || "",
      role: "user",
      region: "APAC",
      enabledModules: ["dashboard", "training"],
      modulePermissions: {
        dashboard: "view",
        training: "view",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else {
    await setDoc(
      userRef,
      {
        name: user.displayName || "",
        email: user.email || "",
        photo: user.photoURL || "",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }
};