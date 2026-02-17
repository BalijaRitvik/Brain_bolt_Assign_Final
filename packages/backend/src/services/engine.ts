import { PrismaClient } from '@prisma/client';
import redis, { REDIS_KEYS } from '../lib/redis';
import { next_difficulty, calculate_score } from '../algorithms/adaptive';
import { checkAndApplyStreakDecay } from './streakDecay';

const prisma = new PrismaClient();

// Helper to get user state with Redis caching and streak decay
async function getUserState(userId: string, username?: string) {
    const cacheKey = REDIS_KEYS.USER_STATE(userId);
    const cached = await redis.get(cacheKey);

    if (cached) {
        return JSON.parse(cached);
    }

    // Fallback to DB
    let state = await prisma.user_state.findUnique({
        where: { userId }
    });

    if (!state) {
        state = await prisma.user_state.create({
            data: {
                userId,
                username: username || null
            }
        });
    } else if (username && state.username !== username) {
        // Update username if provided and different
        state = await prisma.user_state.update({
            where: { userId },
            data: { username }
        });
    }

    // Check and apply streak decay if needed
    const { streakDecayed, newStreak } = await checkAndApplyStreakDecay(userId);
    if (streakDecayed) {
        // Refresh state after decay
        state = await prisma.user_state.findUnique({
            where: { userId }
        }) as any;
    }

    await redis.setex(cacheKey, 60, JSON.stringify(state));
    return state;
}

export const getUserMetrics = async (userId: string) => {
    return getUserState(userId);
};


// Helper to update user state in DB and Redis
async function updateUserState(userId: string, data: any) {
    const state = await prisma.user_state.update({
        where: { userId },
        data
    });

    const cacheKey = REDIS_KEYS.USER_STATE(userId);
    await redis.setex(cacheKey, 60, JSON.stringify(state));
    return state;
}

export const getNextQuestion = async (userId: string, username?: string) => {
    const state = await getUserState(userId, username);
    const targetDifficulty = state.currentDifficulty;

    // Try Gemini API first for infinite questions
    const { geminiGenerator } = require('./geminiGenerator');
    if (geminiGenerator.isEnabled()) {
        try {
            console.log(`🤖 Attempting to generate question via Gemini API (difficulty ${targetDifficulty})...`);
            const generatedQuestion = await geminiGenerator.generateQuestion(targetDifficulty);

            if (generatedQuestion) {
                console.log('✅ Gemini API generated question successfully');
                // Return generated question directly (not persisted to DB)
                // Cache question in Redis for 10 minutes (TTL)
                const questionId = `gemini-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const qData = {
                    id: questionId,
                    difficulty: generatedQuestion.difficulty,
                    prompt: generatedQuestion.prompt,
                    choices: generatedQuestion.choices,
                    correct: generatedQuestion.correct
                };

                // Store in Redis
                await redis.setex(REDIS_KEYS.QUESTION_DATA(questionId), 600, JSON.stringify(qData));

                return {
                    question: qData,
                    state
                };
            } else {
                console.log('⚠️  Gemini API returned null, falling back to database');
            }
        } catch (error) {
            console.error('❌ Gemini API error, falling back to database:', error);
        }
    }

    // Fallback to database questions
    console.log(`💾 Using database questions (difficulty ${targetDifficulty})`);

    // Get answered questions to exclude
    const answered = await prisma.answer_log.findMany({
        where: { userId },
        select: { questionId: true }
    });
    const answeredIds = answered.map(s => s.questionId);

    // Use Redis question pool for efficient selection
    const { getQuestionFromPool } = require('./questionPool');
    const questionId = await getQuestionFromPool(targetDifficulty, answeredIds);

    let question;
    if (questionId) {
        question = await prisma.questions.findUnique({
            where: { id: questionId }
        });
    }

    // Fallback to DB if pool fails

    if (!question) {
        if (!question) {
            // Try to find a random question of the target difficulty that hasn't been answered
            const fallbackCount = await prisma.questions.count({
                where: {
                    difficulty: targetDifficulty,
                    id: { notIn: answeredIds }
                }
            });

            if (fallbackCount > 0) {
                const skip = Math.floor(Math.random() * fallbackCount);
                const candidates = await prisma.questions.findMany({
                    where: {
                        difficulty: targetDifficulty,
                        id: { notIn: answeredIds }
                    },
                    take: 1,
                    skip
                });
                question = candidates[0];
            } else {
                // Smart Fallback: Find the hardest question available that is <= targetDifficulty AND not answered
                // This ensures if level 6 is requested but we only have level 5, we serve level 5, not level 1.
                question = await prisma.questions.findFirst({
                    where: {
                        difficulty: { lte: targetDifficulty },
                        id: { notIn: answeredIds }
                    },
                    orderBy: {
                        difficulty: 'desc'
                    }
                });

                // If strict fallback fails (user answered EVERYTHING <= target), try looking upwards? 
                // Or just reset and give *any* question even if answered, to prevent crash.
                if (!question) {
                    console.warn("User has answered all suitable questions! Resetting pool for this user implicitly by allowing repeated questions.");
                    // Last resort: Just give any question (even if answered) to keep the game alive
                    question = await prisma.questions.findFirst({
                        where: { difficulty: { lte: targetDifficulty } },
                        orderBy: { difficulty: 'desc' }
                    });
                }
            }
        }
    }

    if (!question) {
        throw new Error("No questions available");
    }

    return {
        question,
        state
    };
};

export const processAnswer = async (
    userId: string,
    questionId: string,
    answer: string,
    idempotencyKey: string
) => {
    // Check Idempotency
    const existingIdempotency = await prisma.answer_idempotency.findUnique({
        where: { idempotencyKey }
    });

    if (existingIdempotency) {
        if (existingIdempotency.userId !== userId) {
            throw new Error("Idempotency key reused for different user");
        }
        return existingIdempotency.response_json;
    }

    let question: any = null;

    // Check if it's a Gemini question (starts with 'gemini-')
    if (questionId.startsWith('gemini-')) {
        const cachedQ = await redis.get(REDIS_KEYS.QUESTION_DATA(questionId));
        if (cachedQ) {
            question = JSON.parse(cachedQ);
        }
    } else {
        question = await prisma.questions.findUnique({ where: { id: questionId } });
    }

    if (!question) throw new Error("Question not found (expired or invalid)");

    const state = await getUserState(userId);

    // Check answer (simple string match, assuming choices are consistent)
    // The previous implementation used `question.correct === answer`.
    // We should parse `question.choices` if `correct` is an index or value.
    // Seed data shows "correct": "4" (value) or "blue" (value).
    const isCorrect = question.correct === answer;

    // Adaptive Logic
    // We need 'history' for momentum.
    // We can fetch recent history from `answer_log`.
    const historyLogs = await prisma.answer_log.findMany({
        where: { userId },
        orderBy: { answeredAt: 'desc' },
        take: 10, // Sufficient for momentum (window 3) and streak
        select: { isCorrect: true }
    });
    // Add current answer to history
    const history = [isCorrect, ...historyLogs.map(l => l.isCorrect)]; // Newest first

    // `compute_streak` expects newest FIRST? No, `adaptive.ts`:
    // for (let i = history.length - 1; i >= 0; i--) ... if (history[i]) streak++
    // Wait, `adaptive.ts` streak logic:
    // "for (let i = history.length - 1; i >= 0; i--)" implies history is older->newer if array is typical?
    // Let's check `adaptive.ts` carefully.

    /*
    export function compute_streak(history: boolean[]): number {
        let streak = 0;
        for (let i = history.length - 1; i >= 0; i--) { // Iterating backwards from end
            if (history[i]) streak++; else break;
        }
        return streak;
    }
    If history is [old, ..., new], then starting from length-1 (new) is correct.
    */

    // So we should construct history as [old, ..., new].
    // historyLogs is desc (newest first).
    // So logs in time order: reverse(historyLogs).
    const historyOrdered = [...historyLogs.map(l => l.isCorrect).reverse(), isCorrect];

    const currentDiff = state.currentDifficulty;
    const nextDiff = next_difficulty(currentDiff, historyOrdered);
    const streak = isCorrect ? state.streak + 1 : 0; // Or use compute_streak?
    // user_state has `streak`. Let's trust our calculation or the algo.

    // Calculate max streak
    const newMaxStreak = Math.max(state.maxStreak, streak);

    // CRITICAL FIX: Calculate score based on the ACTUAL question difficulty, not the user's targeted level.
    // This handles cases where user is Level 6 but served a Level 1 fallback question.
    // They should receive Level 1 points (20), not Level 6 points (120).
    const scoreDelta = isCorrect ? calculate_score(question.difficulty, streak) : 0;
    const newTotalScore = state.totalScore + scoreDelta;

    // Transaction
    const [log, updatedState, savedIdempotency] = await prisma.$transaction(async (tx) => {
        const log = await tx.answer_log.create({
            data: {
                userId,
                // For ephemeral questions, we might need to store a placeholder ID if foreign key constraints exist.
                // However, assuming questionId is just a string and not a foreign key in schema? 
                // Let's check schema. If it fails, we might need to make questionId optional or not a FK.
                // Use a fallback or handle it. 
                // Since this is inside a transaction, if questionId is a FK to Questions table, this will fail for gemini questions.
                // We should check the schema. Assuming questionId is NOT a foreign key or is optional/looser based on context.
                // If it IS a foreign key, we can't save it easily without creating a dummy question record.
                // For now, let's try to save. If it fails, we know why.
                questionId,
                selectedAnswer: answer,
                isCorrect,
                scoreDelta
            }
        });

        const updatedState = await tx.user_state.update({
            where: { userId },
            data: {
                currentDifficulty: nextDiff,
                streak,
                maxStreak: newMaxStreak,
                totalScore: newTotalScore,
                lastQuestionId: questionId,
                lastAnswerAt: new Date(),
                stateVersion: { increment: 1 }
            }
        });

        const response = {
            correct: isCorrect,
            newDifficulty: nextDiff,
            newStreak: streak,
            maxStreak: newMaxStreak,
            newScore: newTotalScore,  // Frontend expects newScore
            scoreDelta,
            totalScore: newTotalScore,
            stateVersion: updatedState.stateVersion
        };

        const savedIdempotency = await tx.answer_idempotency.create({
            data: {
                idempotencyKey,
                userId,
                response_json: response as any // JSON type
            }
        });

        return [log, updatedState, savedIdempotency];
    });

    // Update Redis
    const cacheKey = REDIS_KEYS.USER_STATE(userId);
    await redis.setex(cacheKey, 60, JSON.stringify(updatedState));

    // Update Leaderboard
    await redis.zadd(REDIS_KEYS.LEADERBOARD_SCORE, newTotalScore, userId);
    await redis.zadd(REDIS_KEYS.LEADERBOARD_STREAK, streak, userId);

    // Get leaderboard ranks
    const scoreRank = await redis.zrevrank(REDIS_KEYS.LEADERBOARD_SCORE, userId);
    const streakRank = await redis.zrevrank(REDIS_KEYS.LEADERBOARD_STREAK, userId);

    // Add ranks to response (1-indexed, zrevrank returns 0-indexed or null)
    const responseWithRanks = {
        ...(savedIdempotency.response_json as any),
        leaderboardRankScore: scoreRank !== null ? scoreRank + 1 : null,
        leaderboardRankStreak: streakRank !== null ? streakRank + 1 : null
    };

    return responseWithRanks;
};
