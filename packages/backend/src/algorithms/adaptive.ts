export const MIN_DIFF = 1;
export const MAX_DIFF = 20;
export const MOMENTUM_WINDOW = 3;
export const MIN_STREAK_FOR_UP = 2;

export function compute_streak(history: boolean[]): number {
    let streak = 0;
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i]) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}

export function compute_momentum(history: boolean[]): number {
    let momentum = 0;
    const start = Math.max(0, history.length - MOMENTUM_WINDOW);
    for (let i = start; i < history.length; i++) {
        momentum += history[i] ? 1 : -1;
    }
    return momentum;
}

export function next_difficulty(current_diff: number, history: boolean[]): number {
    const momentum = compute_momentum(history);
    const streak = compute_streak(history);

    if (momentum >= 2 && streak >= MIN_STREAK_FOR_UP && current_diff < MAX_DIFF) {
        return current_diff + 1;
    }
    if (momentum <= -2 && current_diff > MIN_DIFF) {
        return current_diff - 1;
    }
    return current_diff;
}

export function calculate_score(difficulty: number, streak: number): number {
    const base = difficulty * 10;
    const streak_factor = 1.0 + Math.min(streak, 5) * 0.2; // capped => max 2.0 multiplier
    return Math.round(base * streak_factor);
}
