declare module 'bumblebee-hotword' {
  import { EventEmitter } from 'events';

  class Bumblebee extends EventEmitter {
    constructor();
    addHotword(name: string, data?: any, sensitivity?: number): void;
    setHotword(word: string | null): void;
    setSensitivity(sensitivity: number): void;
    setWorkersPath(path: string): void;
    start(): void;
    stop(): void;
    setMuted(muted: boolean): void;
    setMicVolume(volume: number): void;
    setMicrophone(id: string): void;
    getMicrophones(): Promise<Array<{ id: string; name: string }>>;
  }

  export default Bumblebee;
}
