import React, { useState, useEffect } from "react";

export default function useCommands(
  actions,
  setActions,
  socketDispatch,
  confirm,
  setConfirm
) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (actions && current < actions.length) {
      socketDispatch(actions[current], 0);
    } else {
      setActions(false);
      setCurrent(0);
      setConfirm(false);
    }
  }, [current, actions]);

  useEffect(() => {
    if (confirm) {
      setCurrent(current + 1);
    }
  }, [confirm]);
  return <div></div>;
}
