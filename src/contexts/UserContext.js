import React from "react";
import ReactGA from "react-ga";

export const UserContext = React.createContext(null);

export default function UserProvider({ children, user }) {
  const userId = user.attributes?.sub;
  const email = user.attributes.email;
  ReactGA.set({ userId: userId });
  return (
    <UserContext.Provider value={{ userId, email }}>
      {children}
    </UserContext.Provider>
  );
}
