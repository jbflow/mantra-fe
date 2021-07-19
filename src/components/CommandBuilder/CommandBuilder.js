import React, { useState, useContext } from "react";
import Commands from "./Commands";
import Actions from "./Actions";
import { UserContext } from "../../contexts/UserContext";
import { CommandsContext } from "../../contexts/CommandsContext";
import "./Commands.css";

export default function CommandBuilder() {
  const { commands, dispatch } = useContext(CommandsContext);
  const [selected, setSelected] = useState(null);
  return (
    <>
      <div className="commands-container">
        <Commands
          commands={commands}
          selected={selected}
          setSelected={setSelected}
          dispatch={dispatch}
        />
      </div>
      <Actions />
    </>
  );
}
