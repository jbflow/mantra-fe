import { useRef } from "react";

const useConstructor = (callback = () => {}) => {
  const wasCalled = useRef(false);
  if (wasCalled.current) return;
  callback();
  wasCalled.current = true;
};

export default useConstructor;
