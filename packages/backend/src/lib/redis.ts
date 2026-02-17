import Redis from 'ioredis';

const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    lazyConnect: true // only connect when first command is sent
});

export const REDIS_KEYS = {
    USER_STATE: (userId: string) => `user_state:${userId}`,
    QUESTION_POOL: (difficulty: number) => `questions:pool:${difficulty}`,
    LEADERBOARD_SCORE: 'leaderboard:score',
    LEADERBOARD_STREAK: 'leaderboard:streak',
    QUESTION_DATA: (questionId: string) => `question:${questionId}`
};

export default redis;
