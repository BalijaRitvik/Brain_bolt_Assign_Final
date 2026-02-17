"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import tokens from '../styles/tokens';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh',
                        padding: tokens.spacing[8],
                        background: tokens.colors.background.dark,
                        color: tokens.colors.text.primary.dark,
                        fontFamily: tokens.fontFamily.sans,
                    }}
                >
                    <div
                        style={{
                            background: `rgba(${parseInt(tokens.colors.error[500].slice(1, 3), 16)}, ${parseInt(tokens.colors.error[500].slice(3, 5), 16)}, ${parseInt(tokens.colors.error[500].slice(5, 7), 16)}, 0.1)`,
                            border: `1px solid ${tokens.colors.error[500]}`,
                            borderRadius: tokens.borderRadius['2xl'],
                            padding: tokens.spacing[8],
                            maxWidth: '500px',
                            textAlign: 'center',
                        }}
                    >
                        <h1
                            style={{
                                fontSize: tokens.fontSize['3xl'],
                                fontWeight: tokens.fontWeight.bold,
                                marginBottom: tokens.spacing[4],
                                color: tokens.colors.error[400],
                            }}
                        >
                            Oops! Something went wrong
                        </h1>
                        <p
                            style={{
                                fontSize: tokens.fontSize.base,
                                color: tokens.colors.text.secondary.dark,
                                marginBottom: tokens.spacing[6],
                            }}
                        >
                            We encountered an unexpected error. Please refresh the page or try again later.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: tokens.colors.secondary[600],
                                color: tokens.colors.gray[50],
                                padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
                                borderRadius: tokens.borderRadius.lg,
                                fontSize: tokens.fontSize.base,
                                fontWeight: tokens.fontWeight.medium,
                                border: 'none',
                                cursor: 'pointer',
                                transition: tokens.transition.base,
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
