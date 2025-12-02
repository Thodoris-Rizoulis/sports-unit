"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export function useUsernameCheck(initialUsername: string) {
  const [username, setUsername] = useState(initialUsername);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = useCallback(
    (value: string) => {
      // clear previous timer
      if (timer.current) {
        clearTimeout(timer.current);
      }

      // reset quickly if empty
      if (!value) {
        setAvailable(null);
        setError(null);
        setChecking(false);
        return;
      }

      // If the value matches the initial username, treat it as available
      if (value === initialUsername) {
        setAvailable(true);
        setError(null);
        setChecking(false);
        return;
      }

      setChecking(true);
      setError(null);

      timer.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/profile/check-username?username=${encodeURIComponent(value)}`
          );
          if (!res.ok) throw new Error("check failed");
          const data = await res.json();
          setAvailable(!!data.available);
          setError(data.available ? null : "Username is already taken");
        } catch (err) {
          // ignore
        } finally {
          setChecking(false);
        }
      }, 500);
    },
    [initialUsername]
  );

  useEffect(() => {
    checkAvailability(username);
  }, [username, checkAvailability]);

  return {
    username,
    setUsername,
    checking,
    available,
    error,
  };
}
