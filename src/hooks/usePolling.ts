import { useEffect, useRef, useCallback } from "react";

/**
 * Polls a callback at a given interval (ms).
 * Automatically pauses when the tab is hidden and resumes when visible.
 * Calls `callback` immediately on mount, then every `intervalMs`.
 */
export const usePolling = (callback: () => void | Promise<void>, intervalMs: number, enabled = true) => {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => savedCallback.current(), intervalMs);
  }, [intervalMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Initial call
    savedCallback.current();
    start();

    // Pause when tab is hidden, resume when visible
    const handleVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        savedCallback.current();
        start();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, start, stop]);

  return { stop, restart: start };
};
