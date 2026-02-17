import { getLeaderboard } from '../../lib/api';
import { LeaderboardView } from '../../components/LeaderboardView';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
    let initialData;
    try {
        initialData = await getLeaderboard();
    } catch (err) {
        console.error('Failed to fetch initial leaderboard', err);
        initialData = { topScores: [], topStreaks: [] };
    }

    return (
        <div className="min-h-screen p-8 flex flex-col items-center"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            }}
        >
            <div className="text-center mb-10 animate-fadeIn">
                <h1 className="text-5xl font-extrabold text-white mb-3" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    🏆 Live Leaderboard
                </h1>
                <p className="text-purple-100 text-lg">
                    Top performers and high streaks
                </p>
            </div>

            <LeaderboardView initialData={initialData} />

            <div className="mt-12">
                <a
                    href="/quiz"
                    className="px-8 py-4 bg-white/95 hover:bg-white text-purple-700 font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 inline-block"
                >
                    ← Back to Quiz
                </a>
            </div>
        </div>
    );
}
