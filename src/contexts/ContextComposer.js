import React from "react";
import CommandsProvider from "./CommandsContext";
import UserProvider from "./UserContext";
import MidiProvider from "./MidiContext";


export default function ContextComposer({ children, user, isMobile, paymentData }) {
  if (!isMobile) {
    return (
      <UserProvider user={user} paymentData={paymentData} >
        <MidiProvider>
          <CommandsProvider url={`/commands?userId=${user.attributes?.sub}`}>
            {children}
          </CommandsProvider>
        </MidiProvider>
      </UserProvider>
    );
  }
  else {
    return (
      <UserProvider user={user} paymentData={paymentData}>
          <CommandsProvider url={`/commands?userId=${user.attributes?.sub}`}>
            {children}
          </CommandsProvider>
      </UserProvider>
    )
  }
}
