import React, { useRef, useState, useEffect } from 'react'

export default function useTransferingConfig(configRef) {
  const [configTimer, setConfigTimer] = useState(0)
  const interval = useRef()
  const [configState, setConfigState] = useState()


  useEffect(() => {
    // Effect for the config timer, if the timer has started, and there hasn't been a config message for 100 ms
    if (configTimer >= 1000) {
      clearInterval(interval.current); // stop the interval
      interval.current = false; // and set it to false
      setConfigState(false)
      setConfigTimer(0); // now reset the timer reset the timer
      sessionStorage.setItem("config", JSON.stringify(configRef.current))
      // console.log("config updated in less than", configTimer)
      
    }
  }, [configTimer, interval]);


  const startTimer = () => {
    setConfigState(true)
    interval.current = setInterval(() => {
      setConfigTimer((prevTime) => prevTime + 50);
      
    }, 50);

  }
  return [configState, startTimer, setConfigTimer]
}
