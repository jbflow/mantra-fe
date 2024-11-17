import React from 'react'
import BumbleBee from "bumblebee-hotword"

export default function useWakeWord() {

    const bumblebee = new BumbleBee();

    bumblebee.setSensitivity(0.5);

    bumblebee.setWorkersPath('bumblebee-workers');

    bumblebee.addHotword('jarvis');

    bumblebee.setHotword('jarvis')

    return [bumblebee]
}
