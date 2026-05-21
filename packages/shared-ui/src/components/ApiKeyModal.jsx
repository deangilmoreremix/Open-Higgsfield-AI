'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function ApiKeyModal({ open, onClose, onSave, initialKey = '' }) {
    const [key, setKey] = useState(initialKey);
    const inputRef = useRef(null);

    useEffect(() => {
        if (open) {
            setKey(initialKey);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open, initialKey]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (key.trim()) {
            onSave(key.trim());
            onClose();
        }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.title}>Enter API Key</h2>
                <p style={styles.subtitle}>Enter your MuAPI key to get started.</p>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="password"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="sk-..."
                        style={styles.input}
                    />
                    <div style={styles.actions}>
                        <button type="button" style={styles.cancelBtn} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" style={styles.saveBtn} disabled={!key.trim()}>
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },
    modal: {
        backgroundColor: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 16,
        padding: 28,
        width: 400,
        maxWidth: '90vw',
    },
    title: {
        margin: 0,
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 700,
    },
    subtitle: {
        margin: '8px 0 20px',
        color: '#666666',
        fontSize: 14,
    },
    input: {
        width: '100%',
        padding: '12px 14px',
        backgroundColor: '#111111',
        border: '1px solid #2a2a2a',
        borderRadius: 8,
        color: '#ffffff',
        fontSize: 14,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.15s',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 20,
    },
    cancelBtn: {
        padding: '10px 20px',
        backgroundColor: 'transparent',
        border: '1px solid #2a2a2a',
        borderRadius: 8,
        color: '#888888',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
    },
    saveBtn: {
        padding: '10px 20px',
        backgroundColor: '#d9ff00',
        border: 'none',
        borderRadius: 8,
        color: '#030303',
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
    },
};
