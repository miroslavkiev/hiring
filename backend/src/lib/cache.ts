interface Entry<T> {
  value: T;
  expires: number;
}

const store = new Map<string, Entry<unknown>>();

export function set<T>(key: string, value: T, ttl: number) {
  store.set(key, { value, expires: Date.now() + ttl });
  setTimeout(() => {
    store.delete(key);
  }, ttl).unref();
}

export function get<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function clear(key: string) {
  store.delete(key);
}
