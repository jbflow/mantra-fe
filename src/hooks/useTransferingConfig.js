import React, { useRef, useState, useEffect } from 'react'

export default function useTransferingConfig() {
  const [configTimer, setConfigTimer] = useState(0)
  const interval = useRef()
  const [configState, setConfigState] = useState()


  useEffect(() => {
    // Effect for the config timer, if the timer has started, and there hasn't been a config message for 100 ms
    if (configTimer >= 100) {
      clearInterval(interval.current); // stop the interval
      interval.current = false; // and set it to false
      setConfigState(false)
      setConfigTimer(0); // now reset the timer reset the timer
    }
  }, [configTimer, interval]);


  const startTimer = () => {
    setConfigState(true)
    interval.current = setInterval(() => {
      console.log(configTimer)
      setConfigTimer((prevTime) => prevTime + 50);
    }, 50);

  }
  return [configState, startTimer, setConfigTimer]
}
