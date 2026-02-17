import { Request, Response, NextFunction } from 'express';
import redis from '../lib/redis';

interface RateLimitConfig {
    windowMs: number;  // Time window in milliseconds
    maxRequests: number;  // Max requests per window
}

/**
 * Redis-based rate limiting middleware
 * Uses sliding window algorithm
 */
export const createRateLimiter = (config: RateLimitConfig) => {
    const { windowMs, maxRequests } = config;

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Use user ID or IP address as identifier
            const userId = req.headers['x-user-id'] as string;
            const identifier = userId || req.ip || 'anonymous';

            const key = `ratelimit:${identifier}:${req.path}`;
            const now = Date.now();
            const windowStart = now - windowMs;

            // Remove old entries outside the window
            await redis.zremrangebyscore(key, 0, windowStart);

            // Count requests in current window  
            const requestCount = await redis.zcard(key);

            if (requestCount >= maxRequests) {
                return res.status(429).json({
                    error: 'Too many requests',
                    message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000} seconds.`,
                    retryAfter: Math.ceil(windowMs / 1000)
                });
            }

            // Add current request
            await redis.zadd(key, now, `${now}`);

            // Set expiry on the key
            await redis.expire(key, Math.ceil(windowMs / 1000));

            // Add rate limit headers
            res.setHeader('X-RateLimit-Limit', maxRequests.toString());
            res.setHeader('X-RateLimit-Remaining', (maxRequests - requestCount - 1).toString());
            res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

            next();
        } catch (err) {
            // If Redis fails, allow the request but log error
            console.error('Rate limiter error:', err);
            next();
        }
    };
};

// Preset rate limiters for different endpoints
export const rateLimiters = {
    // Strict limit for answer submission (prevent rapid spam)
    answerSubmit: createRateLimiter({
        windowMs: 60 * 1000,  // 1 minute
        maxRequests: 30  // 30 answers per minute max
    }),

    // Moderate limit for getting questions
    getQuestion: createRateLimiter({
        windowMs: 60 * 1000,  // 1 minute
        maxRequests: 100  // 100 questions per minute
    }),

    // Lenient limit for metrics/leaderboard
    general: createRateLimiter({
        windowMs: 60 * 1000,  // 1 minute
        maxRequests: 200  // 200 requests per minute
    })
};
