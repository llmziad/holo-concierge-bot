'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * SSR-safe mounted flag: false during server render and the first client
 * render, true thereafter — without a setState-in-effect. Use to gate UI that
 * depends on client-only state (e.g. persisted stores, Date).
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
