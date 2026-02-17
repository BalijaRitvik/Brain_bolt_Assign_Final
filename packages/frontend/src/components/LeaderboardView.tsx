"use client";

import { useEffect, useState, useCallback, memo } from 'react';
import { LeaderboardData } from '../lib/types';
import { LeaderboardTable } from '../components/LeaderboardTable';
import { socket } from '../lib/socket';

export const LeaderboardView = memo(({ initialData }: { initialData: LeaderboardData }) => {
    const [data, setData] = useState<LeaderboardData>(initialData);

    const onLeaderboardUpdate = useCallback((newData: LeaderboardData) => {
        console.log('Leaderboard updated:', newData);
        setData(newData);
    }, []);

    useEffect(() => {
        // Connect socket
        socket.connect();

        socket.on('leaderboardUpdate', onLeaderboardUpdate);

        return () => {
            socket.off('leaderboardUpdate', onLeaderboardUpdate);
            socket.disconnect();
        };
    }, [onLeaderboardUpdate]);

    return (
        <div
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8"
            role="region"
            aria-label="Leaderboard rankings"
        >
            <LeaderboardTable
                title="Top Scores"
                data={data.topScores}
                type="score"
            />
            <LeaderboardTable
                title="Top Streaks"
                data={data.topStreaks}
                type="streak"
            />
        </div>
    );
});

LeaderboardView.displayName = 'LeaderboardView';
