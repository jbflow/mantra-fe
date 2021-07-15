import React from "react";

export const UserContext = React.createContext(null);

export default function UserProvider({ children, user }) {
  const userId = user.attributes?.sub;
  const email = user.attributes.email;
  return (
    <UserContext.Provider value={{ userId, email }}>
      {children}
    </UserContext.Provider>
  );
}
