'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

// Code splitting: Dynamically import Button component
const Button = dynamic(() => import('../components/Button'), {
    loading: () => <div style={{ width: '200px', height: '48px', background: '#7c3aed', borderRadius: '12px' }} />,
    ssr: false,
});

export default function HomePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [userName, setUserName] = useState('');

    const startQuiz = () => {
        if (!userName.trim()) {
            alert('Please enter your name to start!');
            return;
        }
        setLoading(true);
        const userId = uuidv4();
        localStorage.setItem('brainbolt-user-id', userId);
        localStorage.setItem('brainbolt-user-name', userName.trim());
        router.push('/quiz');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8"
            style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            }}
        >
            {/* Hero Section */}
            <div className="text-center mb-12 animate-fadeIn">
                <h1 className="text-6xl font-extrabold text-white mb-4" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                    🧠 BrainBolt
                </h1>
                <p className="text-xl text-purple-100 mb-2">
                    Adaptive Quiz Platform
                </p>
                <p className="text-sm text-purple-200 max-w-md mx-auto">
                    Test your knowledge with intelligent difficulty adjustment and compete on the leaderboard!
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full animate-scale"
                style={{
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255,255,255,0.3)',
                }}
            >
                <div className="mb-6">
                    <label htmlFor="userName" className="block text-gray-800 text-sm font-semibold mb-3">
                        Enter Your Name
                    </label>
                    <input
                        id="userName"
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
                        placeholder="Your name here..."
                        className="w-full px-5 py-4 text-lg font-medium rounded-xl border-2 border-purple-300 focus:border-purple-600 focus:ring-4 focus:ring-purple-200 transition-all outline-none"
                        style={{
                            background: '#ffffff',
                            color: '#1f2937',
                            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.15)',
                        }}
                        aria-label="Enter your name to start the quiz"
                    />
                </div>

                <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={startQuiz}
                    disabled={loading || !userName.trim()}
                    loading={loading}
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '18px',
                        fontWeight: '700',
                        padding: '16px',
                        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                    }}
                >
                    {loading ? 'Starting...' : '🚀 Start Quiz'}
                </Button>

                <div className="mt-6 flex justify-center">
                    <a
                        href="/leaderboard"
                        className="text-purple-700 hover:text-purple-900 font-semibold text-sm flex items-center gap-2 transition-colors"
                    >
                        🏆 View Leaderboard
                        <span className="text-xs">→</span>
                    </a>
                </div>
            </div>

            {/* Features */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl animate-slideIn">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center border border-white/30">
                    <div className="text-4xl mb-2">🎯</div>
                    <h3 className="text-white font-bold mb-1">Adaptive</h3>
                    <p className="text-purple-100 text-sm">Questions adjust to your skill level</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center border border-white/30">
                    <div className="text-4xl mb-2">🔥</div>
                    <h3 className="text-white font-bold mb-1">Streaks</h3>
                    <p className="text-purple-100 text-sm">Build momentum with correct answers</p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 text-center border border-white/30">
                    <div className="text-4xl mb-2">🏅</div>
                    <h3 className="text-white font-bold mb-1">Compete</h3>
                    <p className="text-purple-100 text-sm">Climb the global leaderboard</p>
                </div>
            </div>
        </div>
    );
}
