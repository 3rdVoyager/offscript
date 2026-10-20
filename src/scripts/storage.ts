export function readStorageJson<T>(
  key: string,
  fallback: T,
  storage?: Storage,
): T {
  const target = getStorage(storage);
  if (!target) {
    return fallback;
  }

  try {
    const value = target.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorageJson<T>(
  key: string,
  value: T,
  storage?: Storage,
): boolean {
  const target = getStorage(storage);
  if (!target) {
    return false;
  }

  try {
    target.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(key: string, storage?: Storage): boolean {
  const target = getStorage(storage);
  if (!target) {
    return false;
  }

  try {
    target.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function getStorage(storage?: Storage): Storage | null {
  if (storage) {
    return storage;
  }

  return typeof localStorage === 'undefined' ? null : localStorage;
}
