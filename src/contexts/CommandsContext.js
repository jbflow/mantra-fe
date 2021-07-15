import React from "react";
import { useGetFromApi } from "../hooks/useGetFromApi";

export const CommandsContext = React.createContext(null);

export default function CommandsProvider({ children, url }) {
  const { data, error, loading } = useGetFromApi(url);
  return (
    <CommandsContext.Provider value={{ data, error, loading }}>
      {children}
    </CommandsContext.Provider>
  );
}
