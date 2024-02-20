import React, { useState, useContext } from "react";
import Commands from "./Commands";
import Actions from "./Actions";
import CommandItem from "./CommandItem";
// import { UserContext } from "../../contexts/UserContext";
import { CommandsContext } from "../../contexts/CommandsContext";
import "./Commands.css";

export default function CommandBuilder() {
  const { commands, dispatch, postLoading } = useContext(CommandsContext);
  const [selected, setSelected] = useState(null);
  return (
    <div className="command-builder-container">
      <div>
        <div className="commands-container">
          <Commands
            commands={commands}
            selected={selected}
            setSelected={setSelected}
            dispatch={dispatch}
          />
        </div>
        <CommandItem addCommand dispatch={dispatch} />
      </div>
      <div className="actions-container">
        {selected ? (
          <Actions
            command={
              commands
                ? commands.filter((cmd) => {
                    if (cmd.id === selected) return cmd;
                    return null
                  })[0]
                : null
            }
            selected={selected}
            setSelected={setSelected}
            dispatch={dispatch}
            postLoading={postLoading}
          />
      
        ) : (
          <center>
            <div className="actions-placeholder">
              <p>Select a command to edit...</p>
              <img src="./images/menu-icons/command-dark.svg" alt="command" />
            </div>
          </center>
        )}
      </div>
    </div>
  );
}
