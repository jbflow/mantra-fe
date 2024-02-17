import React from "react";
import CommandsProvider from "./CommandsContext";
import UserProvider from "./UserContext";
import ServicesProvider from "./ServicesContext";

export default function ContextComposer({ children, user }) {
  return (
    <UserProvider user={user}>
      <CommandsProvider url={`/commands?userId=${user.attributes?.sub}`}>
        <ServicesProvider>{children}</ServicesProvider>
      </CommandsProvider>
    </UserProvider>
  );
}
