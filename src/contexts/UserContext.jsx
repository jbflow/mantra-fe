import React, { useEffect, useReducer } from "react";
import { useGetFromApi } from "../hooks/useGetFromApi";


export const UserContext = React.createContext(null);

export default function UserProvider({ children, url }) {
  const {data, loading} = useGetFromApi(url)


  const reducer = (state, action) => {
    if (loading) return state;
    switch (action.type) {
      case "INIT":
        return action.payload
      
    }
  };

  const [user, dispatch] = useReducer(reducer, null);

  useEffect(() => {
    dispatch({ type: "INIT", payload: data });
  }, [data]);
  
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  );
}
