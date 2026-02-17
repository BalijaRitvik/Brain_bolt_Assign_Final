'use client';

import React, { memo } from 'react';
import { LeaderboardEntry } from '../lib/types';
import tokens from '../styles/tokens';

interface LeaderboardTableProps {
    title: string;
    data: LeaderboardEntry[];
    type: 'score' | 'streak';
}

export const LeaderboardTable = memo(({ title, data, type }: LeaderboardTableProps) => {
    return (
        <div
            style={{
                width: '100%',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                borderRadius: tokens.borderRadius['2xl'],
                padding: tokens.spacing[6],
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
            role="region"
            aria-label={`${title} leaderboard`}
        >
            <h3
                style={{
                    fontSize: tokens.fontSize['2xl'],
                    fontWeight: tokens.fontWeight.extrabold,
                    marginBottom: tokens.spacing[6],
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                }}
            >
                {title}
            </h3>
            <div style={{ overflow: 'hidden', borderRadius: tokens.borderRadius.xl }}>
                <table
                    style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}
                    role="table"
                    aria-label={`${type === 'score' ? 'Scores' : 'Streaks'} rankings`}
                >
                    <thead
                        style={{
                            background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                            textTransform: 'uppercase',
                            fontSize: tokens.fontSize.xs,
                            fontWeight: tokens.fontWeight.bold,
                            color: '#6b7280',
                        }}
                    >
                        <tr>
                            <th
                                style={{ padding: `${tokens.spacing[4]} ${tokens.spacing[5]}`, textAlign: 'left' }}
                                scope="col"
                            >
                                Rank
                            </th>
                            <th
                                style={{ padding: `${tokens.spacing[4]} ${tokens.spacing[5]}`, textAlign: 'left' }}
                                scope="col"
                            >
                                User
                            </th>
                            <th
                                style={{ padding: `${tokens.spacing[4]} ${tokens.spacing[5]}`, textAlign: 'right' }}
                                scope="col"
                            >
                                {type === 'score' ? 'Score' : 'Streak'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((entry, idx) => (
                            <tr
                                key={`${entry.username}-${idx}`}
                                style={{
                                    borderBottom: idx < data.length - 1 ? `1px solid ${tokens.colors.gray[200]}` : 'none',
                                    transition: tokens.transition.base,
                                    background: '#ffffff',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#ffffff';
                                }}
                            >
                                <td
                                    style={{
                                        padding: `${tokens.spacing[4]} ${tokens.spacing[5]}`,
                                        fontWeight: tokens.fontWeight.bold,
                                        color: idx < 3 ? '#7c3aed' : '#6b7280',
                                        fontSize: idx < 3 ? tokens.fontSize.lg : tokens.fontSize.base,
                                    }}
                                >
                                    {idx === 0 && '🥇'}
                                    {idx === 1 && '🥈'}
                                    {idx === 2 && '🥉'}
                                    {idx >= 3 && `#${idx + 1}`}
                                </td>
                                <td
                                    style={{
                                        padding: `${tokens.spacing[4]} ${tokens.spacing[5]}`,
                                        fontWeight: tokens.fontWeight.semibold,
                                        color: '#1f2937',
                                        fontSize: tokens.fontSize.base,
                                    }}
                                >
                                    {entry.username}
                                </td>
                                <td
                                    style={{
                                        padding: `${tokens.spacing[4]} ${tokens.spacing[5]}`,
                                        textAlign: 'right',
                                        fontWeight: tokens.fontWeight.bold,
                                        color: type === 'score' ? '#7c3aed' : '#f97316',
                                        fontSize: tokens.fontSize.lg,
                                    }}
                                >
                                    {type === 'score' ? entry.score : entry.streak}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={3}
                                    style={{
                                        padding: `${tokens.spacing[12]} ${tokens.spacing[5]}`,
                                        textAlign: 'center',
                                        color: tokens.colors.gray[500],
                                        fontSize: tokens.fontSize.base,
                                    }}
                                >
                                    No records yet. Be the first!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
});

LeaderboardTable.displayName = 'LeaderboardTable';
