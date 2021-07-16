import React from "react";
import CommandsProvider from "./CommandsContext";
import UserProvider from "./UserContext";
import UsageProvider from "./UsageContext";

export default function ContextComposer({ children, user }) {
  return (
    <UserProvider user={user}>
      <UsageProvider url={`/usage?userId=${user.attributes?.sub}`}>
        <CommandsProvider url={`/commands?userId=${user.attributes?.sub}`}>
          {children}
        </CommandsProvider>
      </UsageProvider>
    </UserProvider>
  );
}
