import BumbleBee from "bumblebee-hotword"

export default function useWakeWord() {

    const bumblebee = new BumbleBee();

    bumblebee.setSensitivity(0.5);

    bumblebee.setWorkersPath('bumblebee-workers');

    bumblebee.addHotword('computer');

    bumblebee.setHotword('computer')

    return [bumblebee]
}
