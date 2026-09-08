import React from "react";

import MyContextProvider from "./MyContextProvder";
import DetailedPropertyProvider from "./DetailedProperty";

const AppProvider = ({ children }) => {
  return (
    <MyContextProvider>
      <DetailedPropertyProvider>{children}</DetailedPropertyProvider>
    </MyContextProvider>
  );
};

export default AppProvider;
