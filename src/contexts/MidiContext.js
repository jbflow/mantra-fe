import React from "react";
// import useMidi from "react-midi-hooks"




export const MidiContext = React.createContext(null);

export default function CommandsProvider({ children, url }) {

  return (
    <MidiContext.Provider value={{"hello": "test"}}>
      {children}
    </MidiContext.Provider>
  );
}
