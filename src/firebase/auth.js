import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, isFirebaseConfigured } from "./config.js";

const normalizeUserProfile = (profile = {}, fallbackRole = "Tenant") => ({
  uid: profile.uid || profile.id || "",
  name: profile.name || "User",
  email: profile.email || "",
  photoURL: profile.photoURL || "",
  role: profile.role || fallbackRole,
  bookings: Number(profile.bookings || 0),
  wishlist: Number(profile.wishlist || 0),
  renewal: profile.renewal || "N/A",
});


export async function registerUserWithFirebase({ name, email, password, role = "Tenant" }) {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error("Firebase is not configured yet.");
  }

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const profile = normalizeUserProfile(
    {
      uid: credential.user.uid,
      name,
      email: credential.user.email,
      role,
      bookings: 0,
      wishlist: 0,
      renewal: "N/A",
    },
    role,
  );

  await setDoc(doc(db, "users", credential.user.uid), profile);
  await sendEmailVerification(credential.user);

  await signOut(auth);

  return {
    ...profile,
    emailVerified: false,
    verificationSent: true,
  };
}

export async function resendVerificationEmail({ email, password }) {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase is not configured yet.");
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);

  if (credential.user.emailVerified) {
    await signOut(auth);
    return { alreadyVerified: true };
  }

  await sendEmailVerification(credential.user);
  await signOut(auth);
  return { alreadyVerified: false, verificationSent: true };
}

export async function loginUserWithFirebase({ email, password }) {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error("Firebase is not configured yet.");
  }

  const credential = await signInWithEmailAndPassword(auth, email, password);

  if (!credential.user.emailVerified) {
    await signOut(auth);
    throw new Error("Please verify your email before logging in.");
  }

  const userDoc = await getDoc(doc(db, "users", credential.user.uid));

  if (userDoc.exists()) {
    return normalizeUserProfile(userDoc.data(), userDoc.data().role || "Tenant");
  }

  return normalizeUserProfile(
    {
      uid: credential.user.uid,
      name: credential.user.displayName || "User",
      email: credential.user.email,
      role: "Tenant",
      bookings: 0,
      wishlist: 0,
      renewal: "N/A",
    },
    "Tenant",
  );
}

export async function signInWithGoogleWithFirebase(role = "Tenant") {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error("Firebase is not configured yet.");
  }

  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  const userDoc = await getDoc(doc(db, "users", credential.user.uid));
  const existingProfile = userDoc.exists() ? userDoc.data() : {};
  const profile = normalizeUserProfile(
    {
      ...existingProfile,
      uid: credential.user.uid,
      name: existingProfile.name || credential.user.displayName || "User",
      email: credential.user.email || "",
      role: existingProfile.role || role,
      photoURL: credential.user.photoURL || existingProfile.photoURL || "",
    },
    role,
  );

  await setDoc(doc(db, "users", credential.user.uid), profile, { merge: true });
  return profile;
}

export async function logoutUserWithFirebase() {
  if (!isFirebaseConfigured || !auth) {
    return;
  }

  await signOut(auth);
}

export function subscribeToAuthState(callback) {
  if (!isFirebaseConfigured || !auth || !db) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null);
      return;
    }

    const userDoc = await getDoc(doc(db, "users", user.uid));
    const profile = userDoc.exists()
      ? normalizeUserProfile(userDoc.data(), userDoc.data().role || "Tenant")
      : normalizeUserProfile(
          {
            uid: user.uid,
            name: user.displayName || "User",
            email: user.email,
            role: "Tenant",
            bookings: 0,
            wishlist: 0,
            renewal: "N/A",
          },
          "Tenant",
        );

    callback(profile);
  });
}
