import React from "react";
import CommandsProvider from "./CommandsContext";
import UserProvider from "./UserContext";
import UsageProvider from "./UsageContext";
import ServicesProvider from "./ServicesContext";

export default function ContextComposer({ children, user }) {
  return (
    <UserProvider user={user}>
      <UsageProvider url={`/usage?userId=${user.attributes?.sub}`}>
        <CommandsProvider url={`/commands?userId=${user.attributes?.sub}`}>
          <ServicesProvider>{children}</ServicesProvider>
        </CommandsProvider>
      </UsageProvider>
    </UserProvider>
  );
}
