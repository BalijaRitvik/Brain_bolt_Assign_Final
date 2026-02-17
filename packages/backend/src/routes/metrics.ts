import { Router } from 'express';
import { getUserMetrics } from '../services/engine';
import { PrismaClient } from '@prisma/client';
import { rateLimiters } from '../middleware/rateLimiter';

const prisma = new PrismaClient();
const router = Router();

router.get('/', rateLimiters.general, async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(400).json({ error: 'Missing x-user-id header' });
        }

        const state = await getUserMetrics(userId);

        // Calculate accuracy
        const answerStats = await prisma.answer_log.groupBy({
            by: ['isCorrect'],
            where: { userId },
            _count: { isCorrect: true }
        });

        const totalAnswers = answerStats.reduce((sum: number, stat) => sum + stat._count.isCorrect, 0);
        const correctAnswers = answerStats.find(s => s.isCorrect)?._count.isCorrect || 0;
        const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

        // Get recent performance (last 10 answers)
        const recentAnswers = await prisma.answer_log.findMany({
            where: { userId },
            orderBy: { answeredAt: 'desc' },
            take: 10,
            select: {
                isCorrect: true,
                scoreDelta: true,
                answeredAt: true
            }
        });

        const recentPerformance = recentAnswers.map((a: any) => ({
            correct: a.isCorrect,
            score: a.scoreDelta,
            timestamp: a.answeredAt
        }));

        res.json({
            currentDifficulty: state.currentDifficulty,
            streak: state.streak,
            maxStreak: state.maxStreak,
            totalScore: state.totalScore,
            accuracy: Math.round(accuracy * 100) / 100,
            totalQuestions: totalAnswers,
            correctQuestions: correctAnswers,
            wrongQuestions: totalAnswers - correctAnswers,
            recentPerformance
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
