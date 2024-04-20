import React from "react";
import { useGetFromApi } from "../hooks/useGetFromApi";


export const UserContext = React.createContext(null);

export default function UserProvider({ children, user, paymentData }) {
  const userId = user.attributes?.sub;
  const email = user.attributes?.email;
  
  return (
    <UserContext.Provider value={{ userId, email, paymentData }}>
      {children}
    </UserContext.Provider>
  );
}
