import React, { createContext, useState } from 'react';

export const MyContext = createContext();

const MyContextProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  return (
    <MyContext.Provider value={{ wishlist, setWishlist }}>
      {children}
    </MyContext.Provider>
  );
}


export default MyContextProvider;