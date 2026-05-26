'use client';

import { useState, useCallback, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            const item = localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch {
        }
    }, [key]);

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch {
        }
    }, [key, storedValue]);

    const removeValue = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setStoredValue(initialValue);
        } catch {
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}
