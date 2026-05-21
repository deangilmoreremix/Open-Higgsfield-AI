'use client';

import React from 'react';

export default function LoadingSpinner({ size = 32, color = '#d9ff00' }) {
    return (
        <div style={{ ...styles.container, width: size, height: size }}>
            <div style={{ ...styles.spinner, borderColor: `${color}22`, borderTopColor: color }} />
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    spinner: {
        width: '100%',
        height: '100%',
        border: '3px solid',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
};
