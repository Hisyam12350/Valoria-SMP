'use client';

import { useEffect, useState } from 'react';

// Cache sederhana agar tidak fetch berkali-kali
const cache: Record<string, { value: unknown; ts: number }> = {};
const CACHE_TTL = 30_000; // 30 detik

export async function fetchContent<T>(key: string, fallback: T): Promise<T> {
  const now = Date.now();
  if (cache[key] && now - cache[key].ts < CACHE_TTL) {
    return cache[key].value as T;
  }

  try {
    const res = await fetch(`/api/site-content?key=${encodeURIComponent(key)}`, {
      cache: 'no-store',
      credentials: 'same-origin',
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    // Kalau null atau undefined, pakai fallback
    const value = data.value ?? fallback;
    cache[key] = { value, ts: now };
    return value as T;
  } catch {
    return fallback;
  }
}

export function useSiteContent<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchContent<T>(key, fallback)
      .then(v => {
        if (!cancelled) setValue(v ?? fallback);
      })
      .catch(() => {
        if (!cancelled) setValue(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [key]);

  return { value: value ?? fallback, loading };
}
