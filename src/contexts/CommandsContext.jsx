import React, { useReducer, useEffect } from "react";
import { useGetFromApi } from "../hooks/useGetFromApi";
import { usePostToApi } from "../hooks/usePostToApi";
import * as uuid from "uuid";

export const CommandsContext = React.createContext(null);

export default function CommandsProvider({ children, url }) {
  const { data, loading } = useGetFromApi(url);
  const reducer = (state, action) => {
    if (loading) return state;
    switch (action.type) {
      case "INIT":
        return action.payload;
      case "ADD_CMD":
        const newCommand = {
          command: action.payload,
          actions: [],
          id: uuid.v4(),
        };
        return [...state, newCommand];
      case "UPDATE_CMD":
        const command = action.payload.command;
        return state.map((cmd) =>
          cmd.id === action.payload.id ? { ...cmd, command } : cmd
        );
      case "DELETE_CMD":
        return state.filter((cmd) => cmd.id !== action.payload.id);
      case "UPDATE_ACTIONS":
        const actions = action.payload.actions;
        return state.map((cmd) =>
          cmd.id === action.payload.id ? { ...cmd, actions } : cmd
        );
      default:
        return
    }
  };

  const [commands, dispatch] = useReducer(reducer, null);


  const { postLoading } = usePostToApi(commands, url);

  useEffect(() => {
    dispatch({ type: "INIT", payload: data });
  }, [data]);

  return (
    <CommandsContext.Provider value={{ commands, dispatch, postLoading }}>
      {children}
    </CommandsContext.Provider>
  );
}
