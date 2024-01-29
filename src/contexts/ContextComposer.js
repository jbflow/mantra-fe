import React from "react";
import CommandsProvider from "./CommandsContext";
import UserProvider from "./UserContext";


export default function ContextComposer({ children, user }) {
  return (
    <UserProvider user={user}>
      <CommandsProvider url={`/commands?userId=${user.attributes?.sub}`}>
        {children}
      </CommandsProvider>
    </UserProvider>
  );
}
