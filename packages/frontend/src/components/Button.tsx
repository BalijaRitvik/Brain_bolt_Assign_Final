import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import tokens from '../styles/tokens';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
    loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            children,
            variant = 'primary',
            size = 'md',
            fullWidth = false,
            loading = false,
            disabled,
            className = '',
            ...props
        },
        ref
    ) => {
        // Base styles
        const baseStyles = {
            fontFamily: tokens.fontFamily.sans,
            fontWeight: tokens.fontWeight.medium,
            borderRadius: tokens.borderRadius.lg,
            transition: tokens.transition.base,
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            opacity: disabled || loading ? tokens.opacity[60] : tokens.opacity[100],
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            outline: 'none',
            width: fullWidth ? '100%' : 'auto',
        };

        // Variant styles
        const variantStyles = {
            primary: {
                background: `linear-gradient(135deg, ${tokens.colors.secondary[600]}, ${tokens.colors.secondary[700]})`,
                color: tokens.colors.gray[50],
                boxShadow: tokens.boxShadow.md,
            },
            secondary: {
                background: `linear-gradient(135deg, ${tokens.colors.primary[500]}, ${tokens.colors.primary[600]})`,
                color: tokens.colors.gray[50],
                boxShadow: tokens.boxShadow.md,
            },
            outline: {
                background: 'transparent',
                color: tokens.colors.secondary[600],
                border: `2px solid ${tokens.colors.secondary[600]}`,
            },
            ghost: {
                background: 'transparent',
                color: tokens.colors.gray[700],
            },
            danger: {
                background: tokens.colors.error[600],
                color: tokens.colors.gray[50],
                boxShadow: tokens.boxShadow.md,
            },
        };

        // Size styles
        const sizeStyles = {
            sm: {
                fontSize: tokens.fontSize.sm,
                padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
                minHeight: '32px',
            },
            md: {
                fontSize: tokens.fontSize.base,
                padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
                minHeight: '40px',
            },
            lg: {
                fontSize: tokens.fontSize.lg,
                padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
                minHeight: '48px',
            },
        };

        const combinedStyles = {
            ...baseStyles,
            ...variantStyles[variant],
            ...sizeStyles[size],
        };

        return (
            <button
                ref={ref}
                style={combinedStyles}
                disabled={disabled || loading}
                className={`button button--${variant} button--${size} ${className}`}
                {...props}
            >
                {loading && (
                    <span
                        style={{
                            marginRight: tokens.spacing[2],
                            display: 'inline-block',
                            width: '16px',
                            height: '16px',
                            border: '2px solid currentColor',
                            borderTopColor: 'transparent',
                            borderRadius: tokens.borderRadius.full,
                            animation: 'spin 0.6s linear infinite',
                        }}
                    />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
