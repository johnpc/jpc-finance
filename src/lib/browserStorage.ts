// localStorage can throw (private mode, blocked storage); every access is
// best-effort so the app works without persistence.

export const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
};

export const writeJson = (key: string, value: unknown): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is a convenience; ignore failures.
  }
};

export const removeKey = (key: string): void => {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

/** Insert `item` when `on`, remove it otherwise; returns a sorted copy. */
export const toggleInList = (list: string[], item: string, on: boolean) => {
  const set = new Set(list);
  if (on) set.add(item);
  else set.delete(item);
  return [...set].sort();
};
