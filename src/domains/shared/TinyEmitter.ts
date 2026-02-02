export type Listener<T> = (payload: T) => void;

export class TinyEmitter<Events extends Record<string, any>> {
  private listeners = new Map<keyof Events, Set<Listener<any>>>();

  on = <K extends keyof Events>(event: K, listener: Listener<Events[K]>) => {
    const set = this.listeners.get(event) ?? new Set();
    set.add(listener);
    this.listeners.set(event, set);
  };

  off = <K extends keyof Events>(event: K, listener: Listener<Events[K]>) => {
    this.listeners.get(event)?.delete(listener);
  };

  emit = <K extends keyof Events>(event: K, payload: Events[K]) => {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  };
}