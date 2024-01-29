import React from "react";
import CommandsProvider from "./CommandsContext";
import UserProvider from "./UserContext";
import MidiProvider from "./MidiContext";


export default function ContextComposer({ children, user }) {
  return (
    <UserProvider user={user}>
      <MidiProvider>
        <CommandsProvider url={`/commands?userId=${user.attributes?.sub}`}>
          {children}
        </CommandsProvider>
      </MidiProvider>ƒ
    </UserProvider>
  );
}
