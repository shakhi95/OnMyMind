import { useEffect, useState } from 'react';

export function useSessionTab<T extends string>(key: string, allowed: readonly T[], fallback: T) {
  const [tab, setTab] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key) as T | null;
      if (stored && allowed.includes(stored)) return stored;
    } catch {
      /* ignore */
    }
    return fallback;
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, tab);
    } catch {
      /* ignore */
    }
  }, [key, tab]);

  return [tab, setTab] as const;
}
