export type Listener<T> = (payload: T) => void;

export class TinyEmitter<Events extends object> {
  private listeners = new Map<keyof Events, Set<Listener<unknown>>>();

  on = <K extends keyof Events>(event: K, listener: Listener<Events[K]>) => {
    const set = this.listeners.get(event) ?? new Set<Listener<unknown>>();
    set.add(listener as unknown as Listener<unknown>);
    this.listeners.set(event, set);
  };

  off = <K extends keyof Events>(event: K, listener: Listener<Events[K]>) => {
    this.listeners.get(event)?.delete(listener as unknown as Listener<unknown>);
  };

  emit = <K extends keyof Events>(event: K, payload: Events[K]) => {
    this.listeners.get(event)?.forEach((listener) => listener(payload));
  };
}