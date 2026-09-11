import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
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
  available: property.available === false ? false : true,
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
  createdByUid: property.createdByUid || "",
  createdByEmail: String(property.createdByEmail || "").trim().toLowerCase(),
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

  let snapshot;
  try {
    snapshot = await getDocs(query(propertiesRef(), orderBy("title", "asc")));
  } catch (error) {
    console.error("Ordered property query failed; loading properties without ordering", error);
    snapshot = await getDocs(propertiesRef());
  }

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

// Lightweight helper that only flips the `available` flag, without touching
// any other property field. This matches the Firestore rule that lets a
// booking user mark a property unavailable/available without owning it.
export async function setPropertyAvailability(propertyId, available) {
  if (!isFirebaseConfigured || !db || !propertyId) {
    return;
  }

  const refToDoc = doc(db, "properties", propertyId);
  await updateDoc(refToDoc, { available: Boolean(available) });
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
  if (!bookingData.userId || !bookingData.propertyId || !bookingData.type) {
    throw new Error("Booking is missing required identity or property details");
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

export async function getBookingsForPropertyOwner(userId, userEmail = "") {
  if (!isFirebaseConfigured || !db || !userId) {
    return [];
  }

  const normalizedEmail = String(userEmail || "").trim().toLowerCase();
  const snapshots = [];
  const ownerQueries = [
    ["UID", query(bookingsRef(), where("propertyCreatedByUid", "==", userId))],
  ];

  if (normalizedEmail) {
    ownerQueries.push([
      "creator email",
      query(bookingsRef(), where("propertyCreatedByEmail", "==", normalizedEmail)),
    ]);
    ownerQueries.push([
      "property owner email",
      query(bookingsRef(), where("propertyOwnerEmail", "==", normalizedEmail)),
    ]);
  }

  for (const [identifier, ownerQuery] of ownerQueries) {
    try {
      snapshots.push(await getDocs(ownerQuery));
    } catch (error) {
      console.error(`Failed to load property owner bookings by ${identifier}`, error);
    }
  }

  const records = snapshots.flatMap((snapshot) =>
    snapshot.docs.map((docSnap) => ({ ...docSnap.data(), id: docSnap.id })),
  );

  return Array.from(new Map(records.map((record) => [record.id, record])).values())
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export async function deleteBookingFromFirebase(bookingId) {
  if (!isFirebaseConfigured || !db || !bookingId) {
    return;
  }

  const refToDoc = doc(db, "bookings", bookingId);
  await deleteDoc(refToDoc);
}

export async function saveAdminPayoutDetails(adminUid, details) {
  if (!isFirebaseConfigured || !db || !adminUid) {
    throw new Error("Firebase is not configured");
  }

  await setDoc(doc(db, "adminPayoutDetails", adminUid), {
    adminUid,
    accountHolder: details.accountHolder.trim(),
    accountNumber: details.accountNumber.trim(),
    ifsc: details.ifsc.trim().toUpperCase(),
    bankName: details.bankName.trim(),
    updatedAt: new Date().toISOString(),
  });
}