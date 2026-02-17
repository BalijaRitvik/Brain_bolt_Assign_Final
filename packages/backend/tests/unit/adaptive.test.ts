import {
    compute_streak,
    compute_momentum,
    next_difficulty,
    calculate_score,
    MIN_DIFF,
    MAX_DIFF,
    MOMENTUM_WINDOW,
    MIN_STREAK_FOR_UP,
} from '../../src/algorithms/adaptive';

describe('Adaptive Difficulty Algorithm', () => {
    describe('compute_streak', () => {
        it('should return 0 for empty history', () => {
            expect(compute_streak([])).toBe(0);
        });

        it('should count consecutive True from most recent backwards', () => {
            // most recent is last
            expect(compute_streak([true, true])).toBe(2);
            expect(compute_streak([false, true, true])).toBe(2);
            expect(compute_streak([true, false, true])).toBe(1);
            expect(compute_streak([true, true, false])).toBe(0);
        });
    });

    describe('compute_momentum', () => {
        it('should sum +1 for correct and -1 for wrong over last MOMENTUM_WINDOW', () => {
            // MOMENTUM_WINDOW = 3
            expect(compute_momentum([true, true, true])).toBe(3); // 1+1+1
            expect(compute_momentum([true, true, false])).toBe(1); // 1+1-1
            expect(compute_momentum([false, false, false])).toBe(-3); // -1-1-1

            // Window check
            // history length > 3
            // [true, true, true, false] -> last 3 are true, true, false -> 1+1-1=1
            expect(compute_momentum([true, true, true, false])).toBe(1);
            // [false, false, false, true, true, true] -> last 3 are true, true, true -> 3
            expect(compute_momentum([false, false, false, true, true, true])).toBe(3);
        });

        it('should handle history smaller than window', () => {
            expect(compute_momentum([true])).toBe(1);
            expect(compute_momentum([false])).toBe(-1);
            expect(compute_momentum([true, false])).toBe(0);
        });
    });

    describe('next_difficulty', () => {
        it('should increase difficulty if momentum >= 2 and streak >= MIN_STREAK_FOR_UP', () => {
            // momentum >= 2 means at least 2 correct in last 3 (actually needs 3 correct to be 3 in window of 3, or 2 correct 1 wrong is 1+1-1=1, so momentum=2 requires e.g. window size allows it? 
            // Wait, MOMENTUM_WINDOW=3. 
            // All correct: 1+1+1 = 3.
            // 2 correct, 1 wrong: 1+1-1 = 1.
            // So to get momentum >= 2 with window 3, you MUST have 3 corrects?
            // No, if history has fewer than 3 items?
            // [true, true] -> momentum = 2. Streak = 2.
            // So increased.

            const currentDiff = 5;
            const history = [true, true];
            // momentum = 2, streak = 2. MIN_STREAK_FOR_UP=2.
            expect(next_difficulty(currentDiff, history)).toBe(6);
        });

        it('should NOT increase if momentum < 2', () => {
            const currentDiff = 5;
            // [true, false, true] -> last 3: 1-1+1 = 1. Streak = 1.
            // [true, true, false, true] -> last 3: true, false, true -> 1. Streak=1.
            // Let's try [true, true, true] -> momentum=3, streak=3 -> increase.
            expect(next_difficulty(5, [true, true, true])).toBe(6);

            // [false, true, true] -> momentum=1 (-1+1+1 ?? No window is 3. last 3 are false, true, true -> -1+1+1=1).
            // Wait, -1+1+1 = 1. So momentum is 1.
            // Threshold is 2. So it should not increase.
            expect(next_difficulty(5, [false, true, true])).toBe(5);
        });

        it('should NOT increase if streak < MIN_STREAK_FOR_UP', () => {
            // Need momentum >= 2 but streak < 2.
            // [true, false, true, true] -> last 3: false, true, true -> momentum=1.
            // [true, true, true] -> momentum=3, streak=3.
            // How to get momentum >= 2 and streak < 2?
            // If history = [true, true, false]? Streak=0. Momentum=1.
            // If history = [true, true]. Momentum=2. Streak=2.
            // It seems hard to have momentum >= 2 and streak < 2 with window 3?
            // window 3. Max momentum 3 (T,T,T). Streak 3.
            // T,T -> Mom 2, Streak 2.
            // T,F,T -> Mom 1.
            // F,T,T -> Mom 1.
            // So with window 3, obtaining momentum >= 2 implies streak >= 2?
            // Yes, because if last was False, streak is 0. If last 2 were T,T, streak is 2.
            // If last was T, but before was F (F, T), momentum 0.
            // So effectively momentum >= 2 implies streak >= 2 for window 3.
            // But the logic requires checking both variables explicitly.

            // What if history is [true, true] but current diff is MAX_DIFF?
            expect(next_difficulty(MAX_DIFF, [true, true])).toBe(MAX_DIFF);
        });

        it('should decrease difficulty if momentum <= -2', () => {
            // [false, false] -> momentum = -2.
            expect(next_difficulty(5, [false, false])).toBe(4);
            // [false, false, false] -> momentum = -3.
            expect(next_difficulty(5, [false, false, false])).toBe(4);
        });

        it('should NOT decrease if current diff is MIN_DIFF', () => {
            expect(next_difficulty(MIN_DIFF, [false, false])).toBe(MIN_DIFF);
        });

        it('Ping-pong stabilization', () => {
            // momentum between -2 and 2?
            // [true, false, true] -> momentum 1.
            expect(next_difficulty(5, [true, false, true])).toBe(5);
            // [false, true, false] -> momentum -1.
            expect(next_difficulty(5, [false, true, false])).toBe(5);
        });
    });

    describe('calculate_score', () => {
        it('should calculate correct score', () => {
            // base = diff * 10
            // streak_factor = 1.0 + min(streak, 5) * 0.2

            // diff 1, streak 0 -> 10 * 1.0 = 10
            expect(calculate_score(1, 0)).toBe(10);

            // diff 5, streak 5 -> 50 * (1 + 5*0.2) = 50 * 2.0 = 100
            expect(calculate_score(5, 5)).toBe(100);

            // diff 5, streak 10 -> capped at 5 -> 50 * 2.0 = 100
            expect(calculate_score(5, 10)).toBe(100);

            // diff 2, streak 2 -> 20 * (1 + 0.4) = 28
            expect(calculate_score(2, 2)).toBe(28);
        });
    });
});
