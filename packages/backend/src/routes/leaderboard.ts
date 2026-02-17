import { Router } from 'express';
import redis, { REDIS_KEYS } from '../lib/redis';
import { rateLimiters } from '../middleware/rateLimiter';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Combined leaderboard endpoint with rate limiting
router.get('/', rateLimiters.general, async (req, res) => {
    try {
        // Get top scores
        const scoreData = await redis.zrevrange(REDIS_KEYS.LEADERBOARD_SCORE, 0, 9, 'WITHSCORES');
        const topScores = [];
        for (let i = 0; i < scoreData.length; i += 2) {
            const userId = scoreData[i];
            const score = parseInt(scoreData[i + 1], 10);

            // Fetch username from database
            const userState = await prisma.user_state.findUnique({
                where: { userId },
                select: { username: true, streak: true }
            });


            topScores.push({
                username: userState?.username || `User ${userId.substring(0, 8)}`,
                score,
                streak: userState?.streak || 0
            });
        }

        // Get top streaks
        const streakData = await redis.zrevrange(REDIS_KEYS.LEADERBOARD_STREAK, 0, 9, 'WITHSCORES');
        const topStreaks = [];
        for (let i = 0; i < streakData.length; i += 2) {
            const userId = streakData[i];
            const streak = parseInt(streakData[i + 1], 10);

            // Fetch username from database
            const userState = await prisma.user_state.findUnique({
                where: { userId },
                select: { username: true, totalScore: true }
            });


            topStreaks.push({
                username: userState?.username || `User ${userId.substring(0, 8)}`,
                score: userState?.totalScore || 0,
                streak
            });
        }

        res.json({
            topScores,
            topStreaks
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


router.get('/score', async (req, res) => {
    try {
        const data = await redis.zrevrange(REDIS_KEYS.LEADERBOARD_SCORE, 0, 9, 'WITHSCORES');
        const leaderboard = [];
        for (let i = 0; i < data.length; i += 2) {
            leaderboard.push({
                userId: data[i],
                score: parseInt(data[i + 1], 10),
                rank: (i / 2) + 1
            });
        }
        res.json(leaderboard);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/streak', async (req, res) => {
    try {
        const data = await redis.zrevrange(REDIS_KEYS.LEADERBOARD_STREAK, 0, 9, 'WITHSCORES');
        const leaderboard = [];
        for (let i = 0; i < data.length; i += 2) {
            leaderboard.push({
                userId: data[i],
                streak: parseInt(data[i + 1], 10),
                rank: (i / 2) + 1
            });
        }
        res.json(leaderboard);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
