'use client';

import React, { memo } from 'react';
import { Question } from '../lib/types';
import tokens from '../styles/tokens';

interface QuizCardProps {
    question: Question;
    onAnswer: (index: number) => void;
    loading: boolean;
}

export const QuizCard = memo<QuizCardProps>(({ question, onAnswer, loading }) => {
    return (
        <div
            style={{
                width: '100%',
                maxWidth: '56rem',
                padding: tokens.spacing[8],
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(16px)',
                borderRadius: tokens.borderRadius['2xl'],
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            }}
        >
            {/* Difficulty Badge */}
            <div style={{ marginBottom: tokens.spacing[4] }}>
                <span
                    style={{
                        display: 'inline-block',
                        padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        borderRadius: tokens.borderRadius.full,
                        fontSize: tokens.fontSize.xs,
                        fontWeight: tokens.fontWeight.bold,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    Difficulty: {question.difficulty}
                </span>
            </div>

            {/* Question */}
            <h2
                style={{
                    fontSize: tokens.fontSize['3xl'],
                    fontWeight: tokens.fontWeight.extrabold,
                    marginBottom: tokens.spacing[8],
                    color: '#1f2937',
                    lineHeight: '1.3',
                }}
                aria-live="polite"
            >
                {question.prompt}
            </h2>

            {/* Choices */}
            <div
                style={{
                    display: 'grid',
                    gap: tokens.spacing[4],
                }}
                role="group"
                aria-label="Answer choices"
            >
                {question.choices.map((choice, idx) => (
                    <button
                        key={idx}
                        onClick={() => onAnswer(idx)}
                        disabled={loading}
                        style={{
                            padding: tokens.spacing[5],
                            fontSize: tokens.fontSize.lg,
                            fontWeight: tokens.fontWeight.semibold,
                            textAlign: 'left',
                            borderRadius: tokens.borderRadius.xl,
                            transition: 'all 0.2s ease',
                            background: loading ? '#e5e7eb' : '#f9fafb',
                            border: '2px solid #d1d5db',
                            color: '#1f2937',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}
                        aria-label={`Option ${idx + 1}: ${choice}`}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.borderColor = '#667eea';
                                e.currentTarget.style.transform = 'translateX(8px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.3)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f9fafb';
                            e.currentTarget.style.color = '#1f2937';
                            e.currentTarget.style.borderColor = '#d1d5db';
                            e.currentTarget.style.transform = 'translateX(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                        }}
                    >
                        <span
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                marginRight: tokens.spacing[4],
                                borderRadius: tokens.borderRadius.full,
                                background: 'rgba(102, 126, 234, 0.15)',
                                fontSize: tokens.fontSize.base,
                                fontWeight: tokens.fontWeight.bold,
                                flexShrink: 0,
                            }}
                        >
                            {String.fromCharCode(65 + idx)}
                        </span>
                        <span style={{ flex: 1 }}>{choice}</span>
                    </button>
                ))}
            </div>

            {/* Loading State */}
            {loading && (
                <div style={{
                    marginTop: tokens.spacing[6],
                    textAlign: 'center',
                    color: '#7c3aed',
                    fontSize: tokens.fontSize.sm,
                    fontWeight: tokens.fontWeight.medium,
                }}>
                    Processing your answer...
                </div>
            )}
        </div>
    );
});

QuizCard.displayName = 'QuizCard';
