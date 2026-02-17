import { Router } from 'express';
import { getNextQuestion, processAnswer, getUserMetrics } from '../services/engine';
import { rateLimiters } from '../middleware/rateLimiter';

const router = Router();

// GET /v1/quiz/next - Get next question with rate limiting
router.get('/next', rateLimiters.getQuestion, async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const username = req.headers['x-user-name'] as string;
        if (!userId) {
            return res.status(400).json({ error: 'Missing x-user-id header' });
        }

        const { question, state } = await getNextQuestion(userId, username);

        // Map to response format
        // Implicit requirement: question details + user state context
        res.json({
            questionId: question.id,
            difficulty: question.difficulty,
            prompt: question.prompt,
            choices: question.choices,
            // User state context
            currentDifficulty: state.currentDifficulty,
            currentScore: state.totalScore,
            currentStreak: state.streak,
            maxStreak: state.maxStreak
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST /v1/quiz/answer - Submit answer with stricter rate limiting
router.post('/answer', rateLimiters.answerSubmit, async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const { questionId, answer, answerIdempotencyKey } = req.body;

        if (!userId || !questionId || !answer || !answerIdempotencyKey) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await processAnswer(userId, questionId, answer, answerIdempotencyKey);

        // Notify via Socket.IO if available (optional enhancement)
        const io = req.app.get('io');
        if (io && (result as any).totalScore) {
            io.to('leaderboard').emit('score-update', { userId, score: (result as any).totalScore });
        }

        res.json(result);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/metrics', async (req, res) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        if (!userId) {
            return res.status(400).json({ error: 'Missing x-user-id header' });
        }

        const metrics = await getUserMetrics(userId);
        res.json(metrics);
    } catch (err: any) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
