export interface Question {
    questionId: string;  // Backend returns questionId, not id
    prompt: string;      // Backend returns prompt, not text
    difficulty: number;
    choices: string[];
    currentDifficulty: number;
    currentScore: number;
    currentStreak: number;
    maxStreak: number;
}

export interface AnswerResponse {
    correct: boolean;
    score: number;
    streak: number;
    newScore: number;
    newStreak: number;
    maxStreak: number;
    scoreDelta: number;  // Points earned from this answer
    correctAnswerId: string; // Or index if choices are just strings
}

export interface LeaderboardEntry {
    username: string;
    score: number;
    streak: number;
}

export interface LeaderboardData {
    topScores: LeaderboardEntry[];
    topStreaks: LeaderboardEntry[];
}
