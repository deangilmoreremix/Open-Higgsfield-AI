'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'higgsfield_api_key';

export function useApi() {
    const [apiKey, setApiKeyState] = useState(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) setApiKeyState(stored);
        } catch {
        }
        setLoaded(true);
    }, []);

    const setApiKey = useCallback((key) => {
        try {
            localStorage.setItem(STORAGE_KEY, key);
        } catch {
        }
        setApiKeyState(key);
    }, []);

    const clearApiKey = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
        }
        setApiKeyState(null);
    }, []);

    const isConfigured = !!apiKey;

    return { apiKey, setApiKey, clearApiKey, isConfigured, loaded };
}
