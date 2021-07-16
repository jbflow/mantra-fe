import React from "react";
import { useGetFromApi } from "../hooks/useGetFromApi";
export const UsageContext = React.createContext(null);

export default function UsageProvider({ children, url }) {
  const { data } = useGetFromApi(url);
  //   const updateTime = (newTime) => {
  //     time = time + newTime;
  //   };
  //   const updateTotalCommands = (newTotalCommands) => {
  //     totalCommands = totalCommands + newTotalCommands;
  //   };

  //   UserProvider.updateTime = updateTime;
  //   UserProvider.updateTotalCommands = updateTotalCommands;

  return (
    <UsageContext.Provider value={{ data }}>{children}</UsageContext.Provider>
  );
}
