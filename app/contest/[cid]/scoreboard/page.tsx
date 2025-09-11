"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface ScoreboardEntry {
    user: {
        computing_id: string;
        name: string;
    };
    problemstatus: {
        pid: number;
        score: number;
    }[];
    total_score: number;
    total_penalty: number;
}

interface Problem {
    pid: number;
    name: string;
}

export default function ScoreboardPage() {
    const { cid } = useParams();
    const [scoreboardData, setScoreboardData] = useState<ScoreboardEntry[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchScoreboardData = async () => {
            try {
                if (!cid) return;
                setLoading(true);

                const response = await fetch(`/api/scoreboard/${cid}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch scoreboard data');
                }

                const data = await response.json();
                setScoreboardData(data.allStatus);
                setProblems(data.probs);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchScoreboardData();
    }, [cid]);

    const getRankRowClass = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-yellow-200'; // Gold
            case 2:
                return 'bg-gray-200'; // Silver
            case 3:
                return 'bg-yellow-400'; // Bronze
            default:
                return 'bg-white';
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <main className="max-w-7xl mx-auto">
                <Card className="p-4 mb-8 shadow-neumorphic">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-red-700">Scoreboard</h1>
                        <Link href={`/contest/${cid}`} className="text-red-600 hover:underline">
                            Back to Contest
                        </Link>
                    </div>
                </Card>

                <Card className="p-4 shadow-neumorphic overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Rank</th>
                                    <th scope="col" className="px-6 py-3">User</th>
                                    <th scope="col" className="px-6 py-3 text-green-600">Total Score</th>
                                    <th scope="col" className="px-6 py-3 text-red-600">Penalty</th>
                                    {problems.map(p => (
                                        <th key={p.pid} scope="col" className="px-6 py-3">{p.name}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {scoreboardData.map((entry, index) => (
                                    <tr key={entry.user.computing_id} className={`${getRankRowClass(index + 1)} border-b`}>
                                        <td className="px-6 py-4 font-medium text-gray-900">#{index + 1}</td>
                                        <td className="px-6 py-4">{entry.user.name}</td>
                                        <td className="px-6 py-4 font-bold text-green-600">{entry.total_score}</td>
                                        <td className="px-6 py-4 text-red-600">{entry.total_penalty}</td>
                                        {problems.map(p => {
                                            const problemStatus = entry.problemstatus.find(ps => ps.pid === p.pid);
                                            return (
                                                <td key={p.pid} className="px-6 py-4">
                                                    {problemStatus ? problemStatus.score : '-'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>
        </div>
    );
}
