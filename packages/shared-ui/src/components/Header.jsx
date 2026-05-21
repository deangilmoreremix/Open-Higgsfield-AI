'use client';

import React from 'react';

export default function Header({ activeTab, onTabChange, tabs = [], balance, apiKey }) {
    return (
        <header style={styles.header}>
            <div style={styles.brand}>
                <span style={styles.logo}>H</span>
                <span style={styles.brandText}>Higgsfield</span>
            </div>
            <nav style={styles.nav}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        style={{
                            ...styles.tab,
                            ...(activeTab === tab.id ? styles.tabActive : {}),
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
            <div style={styles.right}>
                {apiKey && balance !== undefined && (
                    <span style={styles.balance}>
                        ${typeof balance === 'number' ? balance.toFixed(2) : balance}
                    </span>
                )}
                <button style={styles.settingsBtn} aria-label="Settings">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                </button>
            </div>
        </header>
    );
}

const styles = {
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        padding: '0 20px',
        backgroundColor: '#030303',
        borderBottom: '1px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 100,
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    logo: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: '#d9ff00',
        color: '#030303',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 16,
    },
    brandText: {
        color: '#ffffff',
        fontWeight: 700,
        fontSize: 16,
        letterSpacing: '-0.02em',
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    tab: {
        padding: '8px 16px',
        border: 'none',
        background: 'transparent',
        color: '#888888',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        borderRadius: 6,
        transition: 'color 0.15s, background-color 0.15s',
    },
    tabActive: {
        color: '#d9ff00',
        backgroundColor: 'rgba(217, 255, 0, 0.08)',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    balance: {
        color: '#d9ff00',
        fontSize: 14,
        fontWeight: 600,
        fontFamily: 'monospace',
    },
    settingsBtn: {
        width: 32,
        height: 32,
        borderRadius: 6,
        border: 'none',
        background: 'transparent',
        color: '#888888',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'color 0.15s, background-color 0.15s',
    },
};
