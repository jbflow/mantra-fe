import React, { useState, useEffect, useRef } from "react";

export default function useCommands(
  actions,
  setActions,
  confirm,
  setConfirm
) {
  const [current, setCurrent] = useState(0);
  const actionCount = useRef(0);
  const confirmCount = useRef(0);
  useEffect(() => {
    if (actions && current < actions.length) {
      if (actions[current].slice(-1) === "*") {
        // socketDispatch(actions[current].slice(0, -1), 0);
      } else {
        // socketDispatch(actions[current], 0);
        setCurrent(current + 1);
      }
      actionCount.current = actionCount.current + 1;
    } else {
      setActions(false);
      setCurrent(0);
      setConfirm([]);
      actionCount.current = 0;
      confirmCount.current = 0;
    }
  }, [current, actions]);

  useEffect(() => {
    if (confirm.length !== 0 && actionCount.current > 0) {
      confirmCount.current = confirmCount.current + 1;
    }
    if (confirmCount.current == actionCount.current) {
      setCurrent(confirmCount.current);
    }
  }, [confirm]);
  return <div></div>;
}
