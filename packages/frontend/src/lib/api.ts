import { Question, AnswerResponse, LeaderboardData } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export async function getQuestion(userId: string): Promise<Question> {
    const username = typeof window !== 'undefined' ? localStorage.getItem('brainbolt-user-name') : null;
    const headers: Record<string, string> = {
        'x-user-id': userId
    };
    if (username) {
        headers['x-user-name'] = username;
    }

    const res = await fetch(`${API_URL}/v1/quiz/next`, {
        cache: 'no-store',
        headers
    });
    if (!res.ok) throw new Error('Failed to fetch question');
    return res.json();
}

export async function submitAnswer(
    questionId: string,
    answer: string,  // The actual answer value, not the index
    userId: string,
    idempotencyKey: string
): Promise<AnswerResponse> {
    const res = await fetch(`${API_URL}/v1/quiz/answer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
        },
        body: JSON.stringify({
            questionId,
            answer: answer,  // Send the actual answer value
            answerIdempotencyKey: idempotencyKey,
        }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        console.error('Submit answer failed:', res.status, res.statusText, errorText);
        throw new Error(`Failed to submit answer: ${res.status} ${errorText}`);
    }
    return res.json();
}

export async function getLeaderboard(): Promise<LeaderboardData> {
    const res = await fetch(`${API_URL}/v1/leaderboard`, {
        next: { revalidate: 0 }, // Disable cache for realtime-ish
    });
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    return res.json();
}
