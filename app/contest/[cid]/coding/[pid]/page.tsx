"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import CodeEditor from "@/components/CodeEditor";

interface ProblemDetails {
    pid: number;
    cid: number;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard" | string;
}

export default function CodingPage() {
    const { cid, pid } = useParams();

    const [problem, setProblem] = useState<ProblemDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("Python");
    const [submissionResult, setSubmissionResult] = useState<any>(null);

    // ============= 1) Fetch Problem Details on Mount =============
    useEffect(() => {
        if (!cid || !pid) return;

        setLoading(true);
        fetch(`/api/contest/${cid}/problem/${pid}`, {
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json().catch(() => null);
                    throw new Error(errData?.error || `Failed to fetch problem ${pid}`);
                }
                return await res.json() as Promise<ProblemDetails>;
            })
            .then((data) => {
                setProblem(data);
                setError(null);
            })
            .catch((err) => {
                console.error("Error fetching problem details:", err);
                setProblem(null);
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [cid, pid]);

    // ============= 2) Handle Code Submission =============
    const handleSubmitCode = async () => {
        if (!cid || !pid) return;

        try {
            setSubmissionResult(null);
            const res = await fetch(`/api/contest/${cid}/problem/${pid}`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, language }),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || "Failed to submit code");
            }

            const data = await res.json();
            setSubmissionResult(data);
            console.log("Submission result:", data);
        } catch (err: any) {
            console.error("Error submitting code:", err);
            setSubmissionResult({ error: err.message });
        }
    };

    // ============= 3) Render States =============
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading problem...</div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;
    }

    if (!problem) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                No problem data found
            </div>
        );
    }

    // ============= 4) Render the Page =============
    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <main className="max-w-4xl mx-auto">
                <Card className="p-6 shadow-neumorphic mb-8">
                    <h1 className="text-2xl font-bold text-red-700 mb-2">
                        {problem.title}
                    </h1>
                    <p className="text-sm text-gray-500 mb-4">
                        Difficulty: {problem.difficulty}
                    </p>
                    <p className="text-gray-800 whitespace-pre-line">
                        {problem.description}
                    </p>
                </Card>

                {/* Code Editor */}
                <Card className="p-6 shadow-neumorphic mb-8">
                    <div className="mb-4">
                        <Select onValueChange={setLanguage} defaultValue={language}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="C++">C++</SelectItem>
                                <SelectItem value="Python">Python</SelectItem>
                                <SelectItem value="Java">Java</SelectItem>
                                <SelectItem value="JavaScript">JavaScript</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <CodeEditor
                        language={language}
                        value={code}
                        onChange={setCode}
                    />
                </Card>

                {/* Submission Button */}
                <Button
                    className="bg-red-700 hover:bg-red-800 text-white w-full"
                    onClick={handleSubmitCode}
                >
                    Submit
                </Button>

                {/* Submission Result */}
                {submissionResult && (
                    <Card className="p-6 shadow-neumorphic mt-4">
                        {submissionResult.error ? (
                            <p className="text-red-600">Error: {submissionResult.error}</p>
                        ) : (
                            <pre className="text-sm text-gray-800">
                {JSON.stringify(submissionResult, null, 2)}
              </pre>
                        )}
                    </Card>
                )}
            </main>
        </div>
    );
}
