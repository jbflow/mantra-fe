import React from "react";
import CommandsProvider from "./CommandsContext";
import UserProvider from "./UserContext";
import MidiProvider from "./MidiContext";


export default function ContextComposer({ children, user, isMobile, paymentData }) {
  console.log(user)
  if (!isMobile) {
    return (
      <UserProvider user={user} paymentData={paymentData} >
        <MidiProvider>
          <CommandsProvider url={`/commands?userId=${user.userId}`}>
            {children}
          </CommandsProvider>
        </MidiProvider>
      </UserProvider>
    );
  }
  else {
    return (
      <UserProvider user={user} paymentData={paymentData}>
          <CommandsProvider url={`/commands?userId=${user.userId}`}>
            {children}
          </CommandsProvider>
      </UserProvider>
    )
  }
}
