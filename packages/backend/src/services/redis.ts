import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('error', (err) => {
    console.error('Redis Error:', err);
});

export const LEADERBOARD_SCORE_KEY = 'leaderboard:score';
export const LEADERBOARD_STREAK_KEY = 'leaderboard:streak';

export default redis;
