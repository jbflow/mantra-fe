import React, { useEffect } from "react";
import { useGetFromApi } from "../hooks/useGetFromApi";


export const UserContext = React.createContext(null);

export default function UserProvider({ children, user, url }) {
  const {data} = useGetFromApi(url)
  const userId = user.attributes?.sub;
  const email = user.attributes?.email;

  useEffect(() => {
    console.log("DATA:", data)
  }, [data]);
  
  return (
    <UserContext.Provider value={{ userId, email, data }}>
      {children}
    </UserContext.Provider>
  );
}
