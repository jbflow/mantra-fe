import React from "react";
import CommandsProvider from "./CommandsContext";
import UserProvider from "./UserContext";
import MidiProvider from "./MidiContext";
import { VoiceProvider } from "./VoiceContext";


export default function ContextComposer({ children, user, isMobile, paymentData }) {
  if (!isMobile) {
    return (
      <UserProvider user={user} url={`/user?userId=${user.userId}`} >
        <MidiProvider>
          <CommandsProvider url={`/commands?userId=${user.userId}`}>
            <VoiceProvider>
              {children}
            </VoiceProvider>
          </CommandsProvider>
        </MidiProvider>
      </UserProvider>
    );
  }
  else {
    return (
      <UserProvider user={user} paymentData={paymentData}>
        <CommandsProvider url={`/commands?userId=${user.userId}`}>
          <VoiceProvider>
            {children}
          </VoiceProvider>
        </CommandsProvider>
      </UserProvider>
    )
  }
}
