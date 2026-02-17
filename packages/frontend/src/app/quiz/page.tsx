"use client";

import { useEffect, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { getQuestion, submitAnswer } from '../../lib/api';
import { Question } from '../../lib/types';
import { QuizCard } from '../../components/QuizCard';
import { useRouter } from 'next/navigation';

export default function QuizPage() {
    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [userId, setUserId] = useState<string>('');
    const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    const loadQuestion = useCallback(async (id?: string) => {
        setLoading(true);
        try {
            const q = await getQuestion(id || userId);
            setQuestion(q);
            // Only initialize score/streak on the very first question load
            if (score === 0 && streak === 0) {
                setScore(q.currentScore);
                setStreak(q.currentStreak);
                setMaxStreak(q.maxStreak);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [userId, score, streak]);

    useEffect(() => {
        const storedUserId = localStorage.getItem('brainbolt-user-id');
        if (!storedUserId) {
            router.push('/');
            return;
        }
        setUserId(storedUserId);
        loadQuestion(storedUserId);
    }, []);

    const handleAnswer = useCallback(async (index: number) => {
        if (!question || !userId) return;

        const idempotencyKey = uuidv4();
        setLoading(true);

        try {
            // Get the actual answer value from the choices array
            const answerValue = question.choices[index];
            const result = await submitAnswer(question.questionId, answerValue, userId, idempotencyKey);

            // Update score and streak from the API response
            console.log('Updating score to:', result.newScore, 'streak to:', result.newStreak, 'maxStreak to:', result.maxStreak);
            setScore(result.newScore);
            setStreak(result.newStreak);
            setMaxStreak(result.maxStreak);

            // Show feedback
            if (result.correct) {
                setFeedback({ message: `✅ Correct! +${result.scoreDelta} points`, type: 'success' });
            } else {
                setFeedback({ message: '❌ Wrong answer!', type: 'error' });
            }
            // Auto-hide feedback after 2 seconds
            setTimeout(() => setFeedback(null), 2000);

            // Show non-blocking feedback (toast/overlay) instead of alert if possible, 
            // but for now, let's just NOT block the UI thread with alert() before fetching.
            // We can add a "Correct/Incorrect" state to QuizCard if we want, but let's focus on logic first.

            // Load next question with retry logic to avoid duplicates
            let nextQ: Question | null = null;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                // Add small delay to allow backend DB propagation
                await new Promise(resolve => setTimeout(resolve, 300 + (attempts * 200)));

                try {
                    nextQ = await getQuestion(userId);
                    // If we got a different question, break
                    if (nextQ && nextQ.questionId !== question.questionId) {
                        break;
                    }
                    console.log(`Received duplicate question ${nextQ?.questionId}, retrying... (${attempts + 1}/${maxAttempts})`);
                } catch (e) {
                    console.error('Error fetching next question:', e);
                }
                attempts++;
            }

            if (nextQ && nextQ.questionId !== question.questionId) {
                setQuestion(nextQ);
            } else {
                console.error('Failed to get a new question after retries');
                // Fallback: force fetch again or show error? 
                // It's better to show *something* than stuck. The user can try refreshing.
                if (nextQ) setQuestion(nextQ);
            }

        } catch (err) {
            console.error('Failed to submit answer', err);
            // alert('Error submitting answer. Please try again.'); 
        } finally {
            setLoading(false);
        }
    }, [question, userId]);

    if (!userId) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            }}
        >
            {/* Stats Header */}
            <header className="w-full max-w-3xl mb-8 animate-fadeIn">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-white/30">
                    <div className="grid grid-cols-3 gap-6">
                        {/* Score */}
                        <div className="text-center">
                            <div className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-1">Score</div>
                            <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {score}
                            </div>
                        </div>

                        {/* Leaderboard Button */}
                        <div className="flex items-center justify-center">
                            <Link
                                href="/leaderboard"
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                🏆 Leaderboard
                            </Link>
                        </div>

                        {/* Streak */}
                        <div className="text-center">
                            <div className="text-xs text-orange-600 font-semibold uppercase tracking-wide mb-1">Streak</div>
                            <div className="text-2xl font-bold text-orange-500">
                                🔥 {streak}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                                Best: ⭐ {maxStreak}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Answer Feedback Toast */}
            {feedback && (
                <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl font-bold text-xl text-white z-50 animate-bounce ${feedback.type === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
                    } backdrop-blur-md border-2 border-white/20`}>
                    {feedback.message}
                </div>
            )}

            {/* Question Card */}
            {question ? (
                <div className="w-full max-w-3xl animate-fadeIn">
                    <QuizCard
                        question={question}
                        onAnswer={handleAnswer}
                        loading={loading}
                    />
                </div>
            ) : (
                <div className="bg-white/90 backdrop-blur-md rounded-2xl p-12 shadow-2xl">
                    <div className="text-purple-600 text-xl font-semibold animate-pulse text-center">
                        Loading Question...
                    </div>
                </div>
            )}

            {/* User Info Footer */}
            <div className="mt-8 text-white/70 text-sm bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                User: {localStorage.getItem('brainbolt-user-name') || userId?.substring(0, 8)}
            </div>
        </div>
    );
}
