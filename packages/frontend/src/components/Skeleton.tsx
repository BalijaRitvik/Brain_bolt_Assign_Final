import React from 'react';
import tokens from '../styles/tokens';

interface SkeletonProps {
    width?: string;
    height?: string;
    borderRadius?: string;
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1rem',
    borderRadius = tokens.borderRadius.base,
    className = '',
}) => {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                width,
                height,
                borderRadius,
                background: `linear-gradient(90deg, ${tokens.colors.gray[800]} 25%, ${tokens.colors.gray[700]} 50%, ${tokens.colors.gray[800]} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
            }}
        />
    );
};

export const QuizCardSkeleton: React.FC = () => {
    return (
        <div
            style={{
                width: '100%',
                maxWidth: '48rem',
                padding: tokens.spacing[6],
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: tokens.borderRadius.xl,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: tokens.boxShadow.xl,
            }}
        >
            {/* Question prompt skeleton */}
            <Skeleton height={tokens.spacing[8]} borderRadius={tokens.borderRadius.lg} />
            <div style={{ marginTop: tokens.spacing[4] }}>
                <Skeleton height={tokens.spacing[6]} width="80%" borderRadius={tokens.borderRadius.lg} />
            </div>

            {/* Answer choices skeleton */}
            <div style={{ marginTop: tokens.spacing[6], display: 'grid', gap: tokens.spacing[4] }}>
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton
                        key={i}
                        height="56px"
                        borderRadius={tokens.borderRadius.lg}
                    />
                ))}
            </div>
        </div>
    );
};

export const LeaderboardSkeleton: React.FC = () => {
    return (
        <div style={{ display: 'grid', gap: tokens.spacing[4] }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <div
                    key={i}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: tokens.spacing[4],
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: tokens.borderRadius.lg,
                    }}
                >
                    <Skeleton width="150px" height="24px" />
                    <Skeleton width="60px" height="24px" />
                </div>
            ))}
        </div>
    );
};

export default Skeleton;
