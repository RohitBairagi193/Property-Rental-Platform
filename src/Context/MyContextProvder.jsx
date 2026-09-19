import React, { createContext, useCallback, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "../firebase/config";
import { subscribeToAuthState } from "../firebase/auth";

export const MyContext = createContext();

const MyContextProvider = ({ children }) => {
  const [wishlist, setWishlistState] = useState([]);
  const [userId, setUserId] = useState(null);

  
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthState((user) => {
      setUserId(user ? user.uid : null);
      if (!user) {
        setWishlistState([]);
      }
    });
    return () => unsubscribeAuth();
  }, []);


  useEffect(() => {
    if (!userId || !isFirebaseConfigured || !db) {
      return undefined;
    }

    const unsubscribeWishlist = onSnapshot(
      doc(db, "users", userId),
      (snapshot) => {
        setWishlistState(snapshot.exists() ? snapshot.data().wishlistItems || [] : []);
      },
      (error) => {
        console.error("Failed to load saved wishlist", error);
      },
    );

    return () => unsubscribeWishlist();
  }, [userId]);


  const setWishlist = useCallback(
    (updater) => {
      setWishlistState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;

        if (userId && isFirebaseConfigured && db) {
          setDoc(
            doc(db, "users", userId),
            { wishlistItems: next, wishlist: next.length },
            { merge: true },
          ).catch((error) => {
            console.error("Failed to save wishlist", error);
          });
        }

        return next;
      });
    },
    [userId],
  );

  return (
    <MyContext.Provider value={{ wishlist, setWishlist }}>
      {children}
    </MyContext.Provider>
  );
}


export default MyContextProvider;