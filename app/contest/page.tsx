"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle } from 'lucide-react';
import Link from "next/link";
import { useRouter } from 'next/router';

// The shape of a single problem from the DB
interface Problem {
    pid: number;           // matches DB 'pid'
    name: string;          // matches DB 'name'
    difficulty: string;    // matches DB 'difficulty'
    // If your DB or endpoint includes 'ap' or 'score', choose the correct one:
    score?: number;        // from problemstatus (user-specific) OR from 'ap' in problems (problem base points)
    status?: string;       // from problemstatus (e.g. 'correct', 'in progress', etc.)
    // If your endpoint includes the last submission language or if you don't need it, remove this field:
    language?: string;
}

// The shape of what we ultimately map onto the page
interface ProblemCardItem {
    pid: number;
    name: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'NULL';
    score: number;
    solved: boolean;
    language: string;
}

// The shape of the data from your scoreboard
interface LeaderboardEntry {
    computing_id: string;
    total_score: number;
}

interface ContestInfo {
    cid: number;
    name: string;
    starts_at: string;
    ends_at: string;
    // etc. as provided by your API
}

// The shape we ultimately store in state
interface ContestData {
    title: string;
    startTime: string;
    duration: string;
    problems: ProblemCardItem[];
    leaderboard: { name: string; score: number }[];
}

export default function ContestPage() {
    const API_URL = 'http://localhost:5000';
    const [contestData, setContestData] = useState<ContestData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { cid } = router.query;

    useEffect(() => {
        const fetchContestData = async () => {
            try {
                if (!cid) return;

                setLoading(true);

                // 1) Fetch the contest + problems + user-problem status
                const contestResponse = await fetch(`${API_URL}/contest/${cid}`, {
                    credentials: 'include',
                });
                if (!contestResponse.ok) {
                    throw new Error('Failed to fetch contest data');
                }
                // Suppose the response looks like:
                // {
                //   contest: {
                //     cid: 123,
                //     name: "My Contest",
                //     starts_at: "2025-01-06T00:00:00Z",
                //     ends_at: "2025-01-06T02:00:00Z",
                //     ...
                //   },
                //   contestProblemsStatus: [
                //     {
                //       pid: 1,
                //       name: "Problem A",
                //       difficulty: "Easy",
                //       score: 100,          // from problemstatus or problems.ap
                //       status: "correct",   // from problemstatus
                //       language: "cpp",     // possibly from last submission
                //     },
                //     ...
                //   ]
                // }
                const contestJson = await contestResponse.json();

                // 2) Fetch the leaderboard data
                const leaderboardResponse = await fetch(`${API_URL}/scoreboard/${cid}`, {
                    credentials: 'include',
                });
                if (!leaderboardResponse.ok) {
                    throw new Error('Failed to fetch leaderboard data');
                }
                // Suppose the scoreboard returns something like:
                // {
                //   contest: {
                //     cid: 123,
                //     name: "My Contest",
                //     starts_at: "...",
                //     ends_at: "...",
                //   },
                //   allStatus: [
                //     {
                //       user: { computing_id: "abc1de" },
                //       total_score: 300
                //     },
                //     {
                //       user: { computing_id: "abc2de" },
                //       total_score: 200
                //     },
                //     ...
                //   ]
                // }
                const leaderboardJson = await leaderboardResponse.json();

                // We’ll extract the shared contest info from either response
                const contest: ContestInfo = leaderboardJson.contest; // or from contestJson.contest

                // Convert the array of problems into your front-end shape
                const problems: ProblemCardItem[] = contestJson.contestProblemsStatus.map((problem: Problem) => ({
                    pid: problem.pid,
                    name: problem.name,
                    difficulty: mapDifficulty(problem.difficulty),
                    language: problem.language || 'N/A',
                    // If your endpoint includes user-specific score from 'problemstatus.score' or the base
                    // problem 'ap' from 'problems', pick the correct field:
                    score: problem.score ?? 0,
                    solved: problem.status === 'correct',
                }));

                // Convert leaderboard data
                const leaderboard = leaderboardJson.allStatus.map((entry: any) => ({
                    name: entry.user?.computing_id || 'Unknown',
                    score: entry.total_score,
                }));

                // Build the final contest data object
                const mappedContestData: ContestData = {
                    title: contest.name,
                    startTime: `Starts: ${new Date(contest.starts_at).toLocaleString()}`,
                    duration: `Ends: ${new Date(contest.ends_at).toLocaleString()}`,
                    problems,
                    leaderboard,
                };

                setContestData(mappedContestData);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContestData();
    }, [cid]);

    // Helper to map DB "difficulty" strings to your typed union
    const mapDifficulty = (difficulty: string): 'Easy' | 'Medium' | 'Hard' | 'NULL' => {
        switch (difficulty) {
            case 'Easy':
            case 'Medium':
            case 'Hard':
                return difficulty;
            default:
                return 'NULL';
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;
    }

    if (!contestData) {
        return <div className="min-h-screen flex items-center justify-center">No data available</div>;
    }

    const totalProblems = contestData.problems.length;
    const solvedProblems = contestData.problems.filter((p) => p.solved).length;
    const progress = (solvedProblems / totalProblems) * 100;
    const totalScore = contestData.problems.reduce((sum, p) => sum + p.score, 0);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <main className="max-w-7xl mx-auto">
                <Card className="p-4 mb-8 shadow-neumorphic">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-red-700">
                            {contestData.title}
                        </h1>
                        <div className="text-sm text-gray-600">
                            <span className="mr-4">{contestData.startTime}</span>
                            <span>{contestData.duration}</span>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-red-600 h-2.5 rounded-full"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </Card>

                <div className="flex gap-8">
                    {/* Problems Section */}
                    <div className="flex-grow space-y-4">
                        {/* First half of the problems */}
                        <Card className="p-4 shadow-neumorphic">
                            <h2 className="text-xl font-bold text-red-700 mb-4">Problems</h2>
                            <div className="text-sm text-gray-600 mb-4">
                                Tries: {solvedProblems}/{totalProblems} | Score: {totalScore}
                            </div>
                            <div className="space-y-2">
                                {contestData.problems
                                    .slice(0, Math.ceil(totalProblems / 2))
                                    .map((problem) => (
                                        <ProblemItem key={problem.pid} problem={problem} />
                                    ))}
                            </div>
                        </Card>

                        {/* Second half of the problems */}
                        <Card className="p-4 shadow-neumorphic">
                            <h2 className="text-xl font-bold text-red-700 mb-4">Problems</h2>
                            <div className="text-sm text-gray-600 mb-4">
                                Tries: {solvedProblems}/{totalProblems} | Score: {totalScore}
                            </div>
                            <div className="space-y-2">
                                {contestData.problems
                                    .slice(Math.ceil(totalProblems / 2))
                                    .map((problem) => (
                                        <ProblemItem key={problem.pid} problem={problem} />
                                    ))}
                            </div>
                        </Card>
                    </div>

                    {/* Leaderboard Section */}
                    <Card className="w-64 p-4 shadow-neumorphic h-fit">
                        <h2 className="text-xl font-bold text-red-700 mb-4">LEADERBOARD</h2>
                        <div className="space-y-2">
                            {contestData.leaderboard.map((entry, index) => (
                                <div key={index} className="text-sm">
                                    {entry.name} - {entry.score}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function ProblemItem({ problem }: { problem: ProblemCardItem }) {
    const [isHovered, setIsHovered] = useState(false);

    const difficultyColor = {
        Easy: 'hover:bg-green-100 border-green-300',
        Medium: 'hover:bg-yellow-100 border-yellow-300',
        Hard: 'hover:bg-red-100 border-red-300',
        NULL: 'hover:bg-gray-100 border-gray-300',
    }[problem.difficulty];

    const textColor = {
        Easy: 'text-green-600',
        Medium: 'text-yellow-600',
        Hard: 'text-red-600',
        NULL: 'text-gray-600',
    }[problem.difficulty];

    return (
        <Link href={`/coding/${problem.pid}`}>
            <div
                className={`flex items-center justify-between p-2 bg-white rounded-lg shadow-sm transition-colors duration-200 border ${difficultyColor} ${
                    isHovered ? 'border-opacity-100' : 'border-opacity-0'
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {problem.solved ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <div className="flex-grow ml-2 truncate">{problem.name}</div>
                <div className={`mx-2 ${textColor} flex-shrink-0`}>
                    {problem.difficulty}
                </div>
                <div className="mx-2 flex-shrink-0">{problem.language}</div>
                <div className="text-red-600 flex-shrink-0">{problem.score}</div>
            </div>
        </Link>
    );
}
