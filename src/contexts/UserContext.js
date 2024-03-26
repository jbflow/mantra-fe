import React from "react";
import { useGetFromApi } from "../hooks/useGetFromApi";


export const UserContext = React.createContext(null);

export default function UserProvider({ children, user, url }) {
  const userId = user.attributes?.sub;
  const email = user.attributes?.email;

  return (
    <UserContext.Provider value={{ userId, email }}>
      {children}
    </UserContext.Provider>
  );
}
