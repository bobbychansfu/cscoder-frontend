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
    downloadContents?: string[];
}

export default function CodingPage() {
    const { cid, pid } = useParams();

    const [problem, setProblem] = useState<ProblemDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("Python");
    const [submitting, setSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<any>(null);

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
                return res.json();
            })
            .then((data) => {
                console.log("Problem data:", data);
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

    const handleSubmitCode = async () => {
        if (!cid || !pid || !code) {
            setSubmissionResult({ error: "No code to submit" });
            return;
        }

        try {
            setSubmitting(true);
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
        } finally {
            setSubmitting(false);
        }
    };

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
                    <div className="text-gray-800 whitespace-pre-line prose max-w-none">
                        {problem.description}
                    </div>
                    
                    {problem.downloadContents && problem.downloadContents.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md">
                            <h3 className="text-lg font-medium mb-2">Downloads</h3>
                            <ul>
                                {problem.downloadContents.map((file, index) => (
                                    <li key={index} className="text-blue-600 hover:underline">
                                        <a href={`/problems/${problem.pid}/downloads/${file}`} download>{file}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
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
                        language={language.toLowerCase()}
                        value={code}
                        onChange={setCode}
                    />

                    <Button
                        className="bg-red-700 hover:bg-red-800 text-white w-full mt-4"
                        onClick={handleSubmitCode}
                        disabled={submitting || !code}
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </Button>
                </Card>

                {/* Submission Result */}
                {submissionResult && (
                    <Card className="p-6 shadow-neumorphic">
                        <h3 className="text-xl font-bold text-red-700 mb-4">Submission Result</h3>
                        {submissionResult.error ? (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600">Error: {submissionResult.error}</p>
                            </div>
                        ) : (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-green-700 font-medium">
                                    {submissionResult.message || "Submission successful!"}
                                </p>
                                <p className="text-gray-600 mt-2">
                                    Submission ID: {submissionResult.sid || "N/A"}
                                </p>
                                {submissionResult.status && (
                                    <p className="text-gray-600">
                                        Status: {submissionResult.status}
                                    </p>
                                )}
                            </div>
                        )}
                    </Card>
                )}
            </main>
        </div>
    );
};

