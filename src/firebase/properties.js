import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./config.js";

const normalizeProperty = (property) => ({
  id: property.id || property._id || Date.now(),
  type: property.type || "Apartment",
  title: property.title || "New Property",
  price: Number(property.price || 0),
  location: property.location || "",
  image: property.image || "",
  feats: Array.isArray(property.feats)
    ? property.feats
    : typeof property.feats === "string"
      ? property.feats.split(",").map((item) => item.trim()).filter(Boolean)
      : ["2 BHK", "2 Bath", "1200 sq.ft"],
  available: property.available !== undefined ? Boolean(property.available) : true,
  isLiked: Boolean(property.isLiked),
  description: property.description || "",
  amenities: Array.isArray(property.amenities)
    ? property.amenities
    : typeof property.amenities === "string"
      ? property.amenities.split(",").map((item) => item.trim()).filter(Boolean)
      : [],
  owner: property.owner || "Owner",
  ownerPhone: property.ownerPhone || "",
  ownerEmail: property.ownerEmail || "",
  memberSince: property.memberSince || "N/A",
  serviceFee: Number(property.serviceFee || 0),
  securityDeposit: Number(property.securityDeposit || 0),
});

const propertiesRef = () => (db ? collection(db, "properties") : null);
const bookingsRef = () => (db ? collection(db, "bookings") : null);

export async function addPropertyToFirebase(propertyData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured");
  }

  const normalized = normalizeProperty(propertyData);
  const docRef = await addDoc(propertiesRef(), normalized);
  return { ...normalized, id: docRef.id };
}

export async function getPropertiesFromFirebase() {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  const q = query(propertiesRef(), orderBy("title", "asc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    ...normalizeProperty(docSnap.data()),
    id: docSnap.id,
  }));
}

export async function updatePropertyInFirebase(propertyId, propertyData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured");
  }

  const refToDoc = doc(db, "properties", propertyId);
  await updateDoc(refToDoc, normalizeProperty(propertyData));
  return { ...normalizeProperty(propertyData), id: propertyId };
}

export async function deletePropertyFromFirebase(propertyId) {
  if (!isFirebaseConfigured || !db) {
    return;
  }

  const refToDoc = doc(db, "properties", propertyId);
  await deleteDoc(refToDoc);

}

export async function addBookingToFirebase(bookingData) {
  if (!isFirebaseConfigured || !db) {
    throw new Error("Firebase is not configured");
  }

  const normalized = {
    ...bookingData,
    createdAt: bookingData.createdAt || new Date().toISOString(),
  };

  const docRef = await addDoc(bookingsRef(), normalized);
  return { ...normalized, id: docRef.id };
}

export async function getBookingsForUser(userId) {
  if (!isFirebaseConfigured || !db || !userId) {
    return [];
  }

  const q = query(bookingsRef(), where("userId", "==", userId));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
    }))
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export async function getAllBookingsFromFirebase() {
  if (!isFirebaseConfigured || !db) {
    return [];
  }

  const snapshot = await getDocs(query(bookingsRef(), orderBy("createdAt", "desc")));
  return snapshot.docs.map((docSnap) => ({
    ...docSnap.data(),
    id: docSnap.id,
  }));
}

export async function deleteBookingFromFirebase(bookingId) {
  if (!isFirebaseConfigured || !db || !bookingId) {
    return;
  }

  const refToDoc = doc(db, "bookings", bookingId);
  await deleteDoc(refToDoc);
}
