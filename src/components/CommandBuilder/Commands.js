import React, { useState } from "react";
import CommandItem from "./CommandItem";

export default function Commands({
  commands,
  selected,
  setSelected,
  dispatch,
}) {
  const [editing, setEditing] = useState(null);
  return (
    <>
      {commands
        ? commands.map((command) => (
            <CommandItem
              key={command.id}
              command={command}
              selected={selected === command.id}
              editing={editing == command.id}
              setSelected={setSelected}
              setEditing={setEditing}
              dispatch={dispatch}
            />
          ))
        : "no commands"}

      <CommandItem addCommand dispatch={dispatch} />
    </>
  );
}
