'use client';

import React, { useState } from 'react';

export default function Sidebar({ apps = [], activeApp, onAppSelect, collapsed = false, onToggle }) {
    return (
        <aside style={{ ...styles.sidebar, ...(collapsed ? styles.sidebarCollapsed : {}) }}>
            <button style={styles.toggleBtn} onClick={onToggle} aria-label="Toggle sidebar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
            </button>
            <div style={styles.appList}>
                {apps.map((app) => (
                    <button
                        key={app.id}
                        onClick={() => onAppSelect(app.id)}
                        style={{
                            ...styles.appItem,
                            ...(activeApp === app.id ? styles.appItemActive : {}),
                        }}
                        title={app.name}
                    >
                        <span style={styles.appIcon}>{app.icon}</span>
                        {!collapsed && <span style={styles.appName}>{app.name}</span>}
                    </button>
                ))}
            </div>
        </aside>
    );
}

const styles = {
    sidebar: {
        width: 200,
        minHeight: '100vh',
        backgroundColor: '#030303',
        borderRight: '1px solid #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        padding: 12,
        transition: 'width 0.2s ease',
        overflow: 'hidden',
    },
    sidebarCollapsed: {
        width: 56,
    },
    toggleBtn: {
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
        marginBottom: 12,
        alignSelf: 'flex-end',
        transition: 'color 0.15s',
    },
    appList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
    },
    appItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 12px',
        border: 'none',
        background: 'transparent',
        color: '#888888',
        fontSize: 14,
        fontWeight: 500,
        cursor: 'pointer',
        borderRadius: 8,
        transition: 'color 0.15s, background-color 0.15s',
        width: '100%',
        textAlign: 'left',
        whiteSpace: 'nowrap',
    },
    appItemActive: {
        color: '#d9ff00',
        backgroundColor: 'rgba(217, 255, 0, 0.08)',
    },
    appIcon: {
        width: 20,
        height: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: 16,
    },
    appName: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
};
