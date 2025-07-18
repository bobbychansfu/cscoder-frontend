"use client";

import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, Circle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import Link from "next/link";
import { useParams } from "next/navigation";

interface Problem {
    pid: number;
    name: string;
    difficulty: string;
    score?: number;
    status?: string;
    language?: string;
}

interface ProblemCardItem {
    pid: number;
    name: string;
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'NULL';
    score: number;
    solved: boolean;
    status: string;
    language: string;
}

interface Submission {
    sid: number;
    time_submitted: string;
    language: string;
    status: string;
    score: number;
}

interface ContestInfo {
    cid: number;
    name: string;
    starts_at: string;
    ends_at: string;
}

interface ContestData {
    title: string;
    startTime: string;
    duration: string;
    problems: ProblemCardItem[];
    problemSubmissions: Record<number, Submission[]>;
}

export default function ContestPage() {
    const { cid } = useParams();
    const [contestData, setContestData] = useState<ContestData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContestData = async () => {
            try {
                if (!cid) return;

                console.log(cid);
                setLoading(true);

                const contestResponse = await fetch(`/api/contest/${cid}`, {
                    credentials: 'include',
                });
                if (!contestResponse.ok) {
                    throw new Error('Failed to fetch contest data');
                }
                const contestJson = await contestResponse.json();

                const contestInfo: ContestInfo = contestJson.contestInfo || {
                    cid: parseInt(cid as string),
                    name: 'Unknown Contest',
                    starts_at: new Date().toISOString(),
                    ends_at: new Date().toISOString()
                };

                const problems: ProblemCardItem[] = contestJson.contestProblemsStatus.map((problem: Problem) => ({
                    pid: problem.pid,
                    name: problem.name,
                    difficulty: mapDifficulty(problem.difficulty),
                    language: problem.language || '',
                    score: problem.score ?? 0,
                    status: problem.status || '',
                    solved: problem.status === 'correct',
                }));

                const mappedContestData: ContestData = {
                    title: contestInfo.name,
                    startTime: `Starts: ${new Date(contestInfo.starts_at).toLocaleString()}`,
                    duration: `Ends: ${new Date(contestInfo.ends_at).toLocaleString()}`,
                    problems,
                    problemSubmissions: contestJson.problemSubmissions || {}
                };

                setContestData(mappedContestData);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchContestData().then(r => console.log(r));
    }, [cid]);

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
    const totalScore = contestData.problems.reduce((sum, p) => p.score ? sum + p.score : sum, 0);

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

                <Card className="p-4 shadow-neumorphic">
                    <h2 className="text-xl font-bold text-red-700 mb-4">Problems</h2>
                    <div className="text-sm text-gray-600 mb-4">
                        Solved: {solvedProblems}/{totalProblems} | Score: {totalScore}
                    </div>
                    <div className="space-y-4">
                        {contestData.problems.map((problem) => (
                            <ProblemItem 
                                key={problem.pid} 
                                problem={problem} 
                                submissions={contestData.problemSubmissions[problem.pid] || []}
                            />
                        ))}
                    </div>
                </Card>
            </main>
        </div>
    );
}

function ProblemItem({ problem, submissions }: { 
    problem: ProblemCardItem, 
    submissions: Submission[] 
}) {
    const [isHovered, setIsHovered] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const params = useParams();

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

    const getStatusIcon = () => {
        if (problem.solved) {
            return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
        } else if (problem.status === 'judging' || submissions.some(s => s.status === 'judging')) {
            return <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />;
        } else if (submissions.length === 0 || problem.status === '') {
            return <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />;
        } else {
            return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
        }
    };

    return (
        <div className="rounded-lg overflow-hidden border border-gray-200">
            <div
                className={`flex items-center justify-between p-3 bg-white rounded-lg shadow-sm transition-colors duration-200 ${
                    isHovered ? difficultyColor : ''
                }`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex items-center flex-grow">
                    {getStatusIcon()}
                    <Link href={`/contest/${params.cid}/problems/${problem.pid}`} className="flex-grow">
                        <div className="ml-2 truncate">{problem.name}</div>
                    </Link>
                </div>
                
                <div className="flex items-center">
                    {problem.difficulty !== 'NULL' && (
                        <div className={`mx-2 ${textColor} flex-shrink-0`}>
                            {problem.difficulty}
                        </div>
                    )}
                    
                    {problem.language && problem.language !== 'N/A' && (
                        <div className="mx-2 flex-shrink-0">{problem.language}</div>
                    )}
                    
                    {problem.score > 0 && (
                        <div className="text-red-600 mx-2 flex-shrink-0">{problem.score}</div>
                    )}
                    
                    {submissions.length > 0 && (
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                setIsExpanded(!isExpanded);
                            }}
                            className="ml-2 p-1 rounded-full hover:bg-gray-100"
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && submissions.length > 0 && (
                <div className="bg-gray-50 p-3 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Submissions</h3>
                    <div className="space-y-2">
                        {submissions.map((submission) => (
                            <div 
                                key={submission.sid} 
                                className="bg-white p-2 rounded border border-gray-200 text-sm flex justify-between items-center"
                            >
                                <div className="flex items-center">
                                    {submission.status === 'correct' ? (
                                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                    ) : submission.status === 'judging' ? (
                                        <Clock className="w-4 h-4 text-blue-500 mr-2" />
                                    ) : (
                                        <XCircle className="w-4 h-4 text-red-500 mr-2" />
                                    )}
                                    <span className="text-gray-600">
                                        {new Date(submission.time_submitted).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                                        {submission.language}
                                    </span>
                                    {submission.score > 0 && (
                                        <span className="text-red-600 font-medium">
                                            {submission.score}
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        submission.status === 'correct' 
                                            ? 'bg-green-100 text-green-800' 
                                            : submission.status === 'judging'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {submission.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
