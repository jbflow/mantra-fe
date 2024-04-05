import React from "react";
import CommandsProvider from "./CommandsContext";
import UserProvider from "./UserContext";
import MidiProvider from "./MidiContext";


export default function ContextComposer({ children, user, isMobile, paymentData }) {
  console.log("HELLO THERE", children, user, isMobile, paymentData)
  if (!isMobile) {
    console.log("TEST")
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
    console.log("HERE")
    return (
      
      <UserProvider user={user} paymentData={paymentData}>
          <CommandsProvider url={`/commands?userId=${user.attributes?.sub}`}>
            {children}
          </CommandsProvider>
      </UserProvider>
    )
  }
}
