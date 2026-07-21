import { useState, useEffect, useCallback } from 'react';

export const STORAGE_ERROR_EVENT = 'mermaid-storage-error';

export type StorageErrorDetail = {
  key: string;
  operation: 'read' | 'write' | 'sync';
  message: string;
};

const reportStorageError = (
  key: string,
  operation: StorageErrorDetail['operation'],
  error: unknown
) => {
  const message = error instanceof Error ? error.message : String(error);
  console.warn(`Error during localStorage ${operation} for key "${key}":`, error);
  if (typeof window !== 'undefined') {
    window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent<StorageErrorDetail>(STORAGE_ERROR_EVENT, {
          detail: { key, operation, message },
        })
      );
    }, 0);
  }
};

/**
 * A hook that persists state to localStorage.
 * Provides the same API as useState: [value, setValue] tuple.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get stored value or use initial
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      reportStorageError(key, 'read', error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Persist to localStorage whenever value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((previousValue) => {
        const valueToStore =
          value instanceof Function ? value(previousValue) : value;

        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        } catch (error) {
          reportStorageError(key, 'write', error);
        }
        return valueToStore;
      });
    },
    [key]
  );

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        if (event.newValue === null) {
          setStoredValue(initialValue);
          return;
        }
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch (error) {
          reportStorageError(key, 'sync', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [initialValue, key]);

  return [storedValue, setValue];
}
