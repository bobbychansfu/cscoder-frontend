"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
    Trophy, Code, Star, PlusCircle, List, CheckCircle, FolderPlus, Medal, Target
} from "lucide-react";
import {useParams} from "next/navigation";

/** Define interfaces that match the data your backend (or the Next.js API route) returns **/

interface UserData {
    username: string;
    rank: string;
    competitionsParticipated: number;
    problemsSolved: number;
    pointsAcquired: number;
    recentActivities: {
        type: string;  // e.g. 'participated', 'solved', 'created', etc.
        name: string;  // e.g. "Algorithm Challenge 2025" or "Dynamic Programming Mastery"
    }[];
}

export default function UserAccount() {
    const {userid} = useParams();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Also get the registered and scores from them contests
    useEffect(() => {
        setLoading(true);
        fetch(`/api/user/${userid}`, {
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Failed to fetch user data");
                }
                return await res.json() as Promise<UserData>;
            })
            .then((data) => {
                setUserData(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Fetch user data error:", err);
                setError(err.message);
                setUserData(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
                Error: {error}
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
                No user data found
            </div>
        );
    }

    const { username, rank, competitionsParticipated, problemsSolved, pointsAcquired, recentActivities } = userData;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <main className="max-w-4xl mx-auto">
                <Card className="p-8 shadow-neumorphic mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold text-red-700">{username}</h1>
                        <span className="bg-yellow-400 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {rank}
            </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            icon={<Trophy className="w-6 h-6 text-red-700" />}
                            title="Competitions"
                            value={competitionsParticipated}
                        />
                        <StatCard
                            icon={<Code className="w-6 h-6 text-red-700" />}
                            title="Problems Solved"
                            value={problemsSolved}
                        />
                        <StatCard
                            icon={<Star className="w-6 h-6 text-red-700" />}
                            title="Points"
                            value={pointsAcquired}
                        />
                    </div>
                </Card>

                <div className="flex flex-col md:flex-row gap-4">
                    <Link href={"/create"}>
                        <Button className="flex-1 bg-white text-red-700 shadow-neumorphic transition-shadow">
                            <PlusCircle className="mr-2 h-4 w-4" /> Create New Contest/Problem
                        </Button>
                    </Link>

                    <Button className="flex-1 bg-white text-red-700 shadow-neumorphic transition-shadow">
                        <List className="mr-2 h-4 w-4" /> View My Competitions
                    </Button>
                </div>

                <Card className="mt-8 p-6 shadow-neumorphic">
                    <h2 className="text-2xl font-bold text-red-700 mb-4">Recent Activity</h2>
                    <ul className="space-y-2">
                        {recentActivities.map((activity, index) => (
                            <li
                                key={index}
                                className="bg-white p-3 rounded-md shadow-sm flex items-center space-x-3"
                            >
                                {/* For icons, you might map `activity.type` => an icon. For now, here's a quick example */}
                                {mapActivityIcon(activity.type)}
                                <span>{activity.name}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </main>
        </div>
    );
}

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number;
}

function StatCard({ icon, title, value }: StatCardProps) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
            {icon}
            <div>
                <h2 className="text-sm font-medium text-gray-500">{title}</h2>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
}

// Example of dynamic icon assignment based on activity type
function mapActivityIcon(type: string): React.ReactNode {
    switch (type) {
        case "participated":
            return <Trophy className="w-5 h-5 text-yellow-500" />;
        case "solved":
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case "created":
            return <FolderPlus className="w-5 h-5 text-blue-500" />;
        case "rank-up":
            return <Medal className="w-5 h-5 text-yellow-600" />;
        case "milestone":
            return <Target className="w-5 h-5 text-red-500" />;
        default:
            // fallback icon
            return <Star className="w-5 h-5 text-gray-500" />;
    }
}
