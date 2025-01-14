"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CodeEditor from "@/components/CodeEditor";
import { useRouter } from 'next/router';

interface ProblemData {
    pid: number;                          // matches DB "pid"
    name: string;                         // matches DB "name"
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'NULL';
    description: string;                  // matches DB "description"
    // optional fields if you want them:
    // ap?: number;                       // matches DB "ap"
    // time_constraint?: number;          // matches DB "time_constraint"
    // mem_constraint?: number;           // matches DB "mem_constraint"
    // author?: string;                   // matches DB "author"
    // etc.
}

const programmingLanguages = ['C++', 'Python', 'Java', 'JavaScript'];

// TODO: Add code submission logic & ChatGPT integration
export default function CodingPage() {
    const [code, setCode] = useState<string>('');
    const [consoleOutput, setConsoleOutput] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('C++');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [problemData, setProblemData] = useState<ProblemData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { cid, pid } = router.query;

    // Fetch problem data from your backend
    useEffect(() => {
        const fetchProblemData = async () => {
            try {
                if (!cid || !pid) return; // Wait until both exist
                setLoading(true);

                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

                // Example endpoint: GET /problem/:cid/:pid
                const response = await fetch(`${API_URL}/problem/${cid}/${pid}`, {
                    credentials: 'include',
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch problem data');
                }

                // Suppose the response is shaped like:
                // {
                //   problem: {
                //     pid: 100,
                //     name: "Sample Problem",
                //     description: "Solve X, Y, Z...",
                //     difficulty: "Medium",
                //     ...
                //   }
                // }
                const data = await response.json();
                const rawProblem = data.problem;

                // Map your DB fields to the interface
                const fetchedProblem: ProblemData = {
                    pid: rawProblem.pid,
                    name: rawProblem.name,
                    description: rawProblem.description,
                    difficulty: mapDifficulty(rawProblem.difficulty),
                };

                setProblemData(fetchedProblem);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProblemData();
    }, [cid, pid]);

    // Load user code from local storage
    useEffect(() => {
        if (!pid) return;
        const savedCode = localStorage.getItem(`userCode_${pid}`);
        const savedLanguage = localStorage.getItem(`userLanguage_${pid}`);

        if (savedLanguage) {
            handleLanguageChange(savedLanguage);
        }
        if (savedCode) {
            setCode(savedCode);
        }
        setIsInitialLoad(false);
    }, [pid]);

    // Auto-save user code to local storage
    useEffect(() => {
        if (!pid || isInitialLoad) return;
        localStorage.setItem(`userCode_${pid}`, code);
        localStorage.setItem(`userLanguage_${pid}`, selectedLanguage);
    }, [code, selectedLanguage, pid, isInitialLoad]);

    const handleLanguageChange = (value: string) => {
        setSelectedLanguage(value);
    };

    const handleRunCode = () => {
        // Right now, just show a stub in the console output
        setConsoleOutput(`Running ${selectedLanguage} code...\n\n// Output will appear here`);
    };

    // Convert any unexpected difficulty to 'NULL'
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

    if (!problemData) {
        return <div className="min-h-screen flex items-center justify-center">No problem data found.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <main className="max-w-7xl mx-auto">
                {/* Contest Header */}
                <Card className="p-4 mb-8 shadow-neumorphic">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Menu className="mr-2 h-5 w-5 text-red-700" />
                            <h1 className="text-xl font-bold text-red-700">Contest {cid}</h1>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="icon">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Main Content */}
                <div className="flex gap-8">
                    {/* Problem Statement */}
                    <Card className="flex-1 p-6 shadow-neumorphic">
                        <h2 className="text-2xl font-bold text-red-700 mb-2">
                            {problemData.name} (PID: {problemData.pid})
                        </h2>
                        <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
              {problemData.difficulty}
            </span>
                        <p className="mt-4 whitespace-pre-wrap">{problemData.description}</p>
                    </Card>

                    {/* Code Editor & Console */}
                    <div className="flex-1 space-y-4">
                        <Card className="p-6 shadow-neumorphic">
                            <div className="flex justify-between items-center mb-4">
                                <div className="relative z-10">
                                    {/* Language Select */}
                                    <Select
                                        onValueChange={handleLanguageChange}
                                        value={selectedLanguage}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Language" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {programmingLanguages.map((lang) => (
                                                <SelectItem key={lang} value={lang}>
                                                    {lang}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Run code button */}
                                <Button onClick={handleRunCode}>Run Code</Button>
                            </div>

                            {/* Code Editor */}
                            <Card className="flex-1 p-6 shadow-neumorphic">
                                <div className="relative h-full">
                                    <CodeEditor
                                        value={code}
                                        onChange={setCode}
                                        language={selectedLanguage}
                                    />
                                </div>
                            </Card>
                        </Card>

                        {/* Console Output */}
                        <Card className="p-6 shadow-neumorphic">
                            <h3 className="text-lg font-semibold mb-2">Console Output</h3>
                            <pre className="p-4 rounded-md overflow-x-auto border border-black">
                {consoleOutput || '// Run your code to see output'}
              </pre>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
