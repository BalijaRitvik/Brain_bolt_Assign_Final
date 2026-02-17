import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Configuration for streak decay
 */
const STREAK_DECAY_CONFIG = {
    INACTIVITY_THRESHOLD_HOURS: 24,  // Decay after 24 hours of inactivity
    DECAY_RATE: 0.5,  // Reduce streak by 50% when decaying
    MIN_STREAK_FOR_DECAY: 3  // Only decay if streak is 3 or more
};

/**
 * Check if user's streak should decay due to inactivity
 * Called when user accesses the system
 */
export const checkAndApplyStreakDecay = async (userId: string): Promise<{
    streakDecayed: boolean;
    oldStreak: number;
    newStreak: number;
}> => {
    const state = await prisma.user_state.findUnique({
        where: { userId }
    });

    if (!state || !state.lastAnswerAt) {
        return { streakDecayed: false, oldStreak: 0, newStreak: 0 };
    }

    const currentStreak = state.streak;

    // Don't decay if streak is too low
    if (currentStreak < STREAK_DECAY_CONFIG.MIN_STREAK_FOR_DECAY) {
        return { streakDecayed: false, oldStreak: currentStreak, newStreak: currentStreak };
    }

    // Calculate time since last answer
    const now = new Date();
    const lastAnswer = new Date(state.lastAnswerAt);
    const hoursSinceLastAnswer = (now.getTime() - lastAnswer.getTime()) / (1000 * 60 * 60);

    // Check if decay threshold exceeded
    if (hoursSinceLastAnswer > STREAK_DECAY_CONFIG.INACTIVITY_THRESHOLD_HOURS) {
        // Calculate new streak (round down)
        const newStreak = Math.floor(currentStreak * STREAK_DECAY_CONFIG.DECAY_RATE);

        // Update database
        await prisma.user_state.update({
            where: { userId },
            data: { streak: newStreak }
        });

        return {
            streakDecayed: true,
            oldStreak: currentStreak,
            newStreak
        };
    }

    return { streakDecayed: false, oldStreak: currentStreak, newStreak: currentStreak };
};

/**
 * Get decay configuration (for documentation/testing)
 */
export const getStreakDecayConfig = () => STREAK_DECAY_CONFIG;
