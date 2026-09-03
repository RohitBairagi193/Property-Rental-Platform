
import { createContext, useState, useContext } from "react";
export const DetailedProperty = createContext();

const DetailedPropertyProvider = ({ children }) => {
  const [detailproperty, setDetailProperty] = useState([]);
 
  return (
    <DetailedProperty.Provider value={{ detailproperty, setDetailProperty }}>
      {children}
    </DetailedProperty.Provider>
  );
};

export default DetailedPropertyProvider;
