import { PrismaClient } from '@prisma/client';
import redis from '../lib/redis';

const prisma = new PrismaClient();

/**
 * Redis key for question pools by difficulty
 */
const QUESTION_POOL_KEY = (difficulty: number) => `questions:pool:${difficulty}`;

/**
 * Cache TTL for question pools (1 hour)
 */
const POOL_TTL = 3600;

/**
 * Populate Redis question pool for a specific difficulty level
 * Stores ALL question IDs for that difficulty
 */
export const populateQuestionPool = async (difficulty: number): Promise<void> => {
    const questions = await prisma.questions.findMany({
        where: { difficulty },
        select: { id: true }
    });

    if (questions.length === 0) {
        console.warn(`No questions found for difficulty ${difficulty}`);
        return;
    }

    const key = QUESTION_POOL_KEY(difficulty);
    const questionIds = questions.map(q => q.id);

    // Use Redis SET for O(1) random selection
    await redis.del(key);  // Clear existing
    for (const id of questionIds) {
        await redis.sadd(key, id);
    }

    await redis.expire(key, POOL_TTL);
    console.log(`Populated pool for difficulty ${difficulty}: ${questionIds.length} questions`);
};

/**
 * Get a random question ID from the pool, excluding answered ones
 * Falls back to DB if pool is empty or all questions answered
 */
export const getQuestionFromPool = async (
    difficulty: number,
    excludeIds: string[]
): Promise<string | null> => {
    const key = QUESTION_POOL_KEY(difficulty);

    // Check if pool exists
    const poolSize = await redis.scard(key);

    if (poolSize === 0) {
        // Pool not populated or expired, populate it
        await populateQuestionPool(difficulty);
    }

    // Get all IDs from pool
    const allIds = await redis.smembers(key);

    // Filter out answered questions
    const availableIds = allIds.filter(id => !excludeIds.includes(id));

    if (availableIds.length === 0) {
        // No unanswered questions, return random from pool (allow repeats)
        if (allIds.length > 0) {
            const randomIndex = Math.floor(Math.random() * allIds.length);
            return allIds[randomIndex];
        }
        return null;
    }

    // Return random unanswered question
    const randomIndex = Math.floor(Math.random() * availableIds.length);
    return availableIds[randomIndex];
};

/**
 * Initialize question pools for all difficulty levels on startup
 */
export const initializeAllQuestionPools = async (): Promise<void> => {
    console.log('Initializing question pools...');

    // Get all unique difficulty levels
    const difficulties = await prisma.questions.groupBy({
        by: ['difficulty']
    });

    for (const { difficulty } of difficulties) {
        await populateQuestionPool(difficulty);
    }

    console.log(`Initialized ${difficulties.length} question pools`);
};

/**
 * Invalidate a specific difficulty pool (call when questions are added/removed)
 */
export const invalidateQuestionPool = async (difficulty: number): Promise<void> => {
    const key = QUESTION_POOL_KEY(difficulty);
    await redis.del(key);
    console.log(`Invalidated pool for difficulty ${difficulty}`);
};
