import React, { HTMLAttributes, ReactNode } from 'react';
import tokens from '../styles/tokens';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outlined' | 'glass';
    padding?: keyof typeof tokens.spacing;
    children: ReactNode;
}

const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 6,
    className = '',
    style,
    ...props
}) => {
    // Base styles
    const baseStyles: React.CSSProperties = {
        borderRadius: tokens.borderRadius.xl,
        padding: tokens.spacing[padding],
        transition: tokens.transition.base,
        fontFamily: tokens.fontFamily.sans,
    };

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
        default: {
            background: `rgba(${parseInt(tokens.colors.gray[800].slice(1, 3), 16)}, ${parseInt(tokens.colors.gray[800].slice(3, 5), 16)}, ${parseInt(tokens.colors.gray[800].slice(5, 7), 16)}, 0.03)`,
            border: `1px solid rgba(${parseInt(tokens.colors.gray[700].slice(1, 3), 16)}, ${parseInt(tokens.colors.gray[700].slice(3, 5), 16)}, ${parseInt(tokens.colors.gray[700].slice(5, 7), 16)}, 0.1)`,
        },
        elevated: {
            background: tokens.colors.background.dark,
            boxShadow: tokens.boxShadow.lg,
        },
        outlined: {
            background: 'transparent',
            border: `1px solid ${tokens.colors.gray[700]}`,
        },
        glass: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: `1px solid rgba(255, 255, 255, 0.1)`,
        },
    };

    const combinedStyles = {
        ...baseStyles,
        ...variantStyles[variant],
        ...style,
    };

    return (
        <div
            style={combinedStyles}
            className={`card card--${variant} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
