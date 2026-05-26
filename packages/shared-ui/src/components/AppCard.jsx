'use client';

import React from 'react';

export default function AppCard({ name, description, thumbnail, onClick }) {
    return (
        <div style={styles.card} onClick={onClick} role="button" tabIndex={0}>
            <div style={styles.thumbnail}>
                {thumbnail ? (
                    <img src={thumbnail} alt={name} style={styles.image} />
                ) : (
                    <div style={styles.placeholder}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                )}
            </div>
            <div style={styles.info}>
                <h3 style={styles.name}>{name}</h3>
                {description && <p style={styles.description}>{description}</p>}
            </div>
        </div>
    );
}

const styles = {
    card: {
        backgroundColor: '#0a0a0a',
        border: '1px solid #1a1a1a',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
    },
    thumbnail: {
        width: '100%',
        aspectRatio: '16/9',
        overflow: 'hidden',
        backgroundColor: '#111111',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#333333',
    },
    info: {
        padding: 14,
    },
    name: {
        margin: 0,
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 600,
    },
    description: {
        margin: '4px 0 0',
        color: '#666666',
        fontSize: 13,
        lineHeight: 1.4,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
};
