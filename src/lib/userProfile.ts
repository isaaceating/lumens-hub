import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

export const createOrUpdateUserProfile = async (user: any) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  const googleName = user.displayName || "";
  const email = user.email || "";
  const photo = user.photoURL || "";
  const now = new Date().toISOString();

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,

      name: googleName,
      googleName,
      email,
      photo,
      isNameManuallyEdited: false,

      // Portal permission
      role: "user",

      // User profile
      accountType: "Lumens",
      region: "APAC",
      department: "SAL",
      jobRole: "Other",
      customJobRole: "",

      // Audit
      knowledgeCenterAuditEnabled: false,
      auditSettings: {
        knowledgeCenter: false,
      },

      enabledModules: ["dashboard", "training"],
      modulePermissions: {
        dashboard: "view",
        training: "view",
      },

      createdAt: now,
      updatedAt: now,
    });

    return;
  }

  const current = userSnap.data();
  const isNameManuallyEdited = current.isNameManuallyEdited === true;

  await setDoc(
    userRef,
    {
      ...(isNameManuallyEdited ? {} : { name: googleName }),
      googleName,
      email,
      photo,
      updatedAt: now,
    },
    { merge: true },
  );
};
