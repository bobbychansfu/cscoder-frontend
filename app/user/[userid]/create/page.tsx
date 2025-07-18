"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Search, PlusCircle, Trash } from "lucide-react";
import CodeEditor from "@/components/CodeEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Problem {
    id: string;
    name: string;
    difficulty: "Easy" | "Medium" | "Hard" | string;
}

interface Test {
    input: string;
    expectedOutput: string;
}

const programmingLanguages = ["C++", "Python", "Java", "JavaScript"];

export default function ContestProblemCreation() {
    const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);
    const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
    const [contestName, setContestName] = useState("");
    const [contestDescription, setContestDescription] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const [problemName, setProblemName] = useState("");
    const [problemDescription, setProblemDescription] = useState("");
    const [tests, setTests] = useState<Test[]>([{ input: "", expectedOutput: "" }]);
    const [code, setCode] = useState("");
    const [activeTestTab, setActiveTestTab] = useState("0");
    const [selectedLanguage, setSelectedLanguage] = useState<string>("C++");

    useEffect(() => {
        fetch("/api/problems", {
            credentials: "include",
        })
            .then(async (res) => {
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.error || "Failed to fetch problems");
                }
                return res.json();
            })
            .then((data) => {
                if (!data.problems) {
                    console.warn("Unexpected data format from /api/problems:", data);
                    return;
                }
                setAvailableProblems(data.problems);
            })
            .catch((err) => {
                console.error("Error fetching problems:", err);
            });
    }, []);

    const filteredProblems = availableProblems.filter((problem) => {
        return (
            problem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            problem.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const handleProblemSelection = (problemId: string) => {
        if (selectedProblems.includes(problemId)) {
            setSelectedProblems(selectedProblems.filter((id) => id !== problemId));
        } else {
            setSelectedProblems([...selectedProblems, problemId]);
        }
    };

    const handleRefresh = () => {
        fetch("/api/problems", { credentials: "include" })
            .then(async (res) => {
                if (!res.ok) throw new Error("Failed to refresh problems");
                return res.json();
            })
            .then((data) => {
                setAvailableProblems(data.problems || []);
            })
            .catch((err) => console.error("Refresh error:", err));
    };

    const handleCreateContest = async () => {
        try {
            console.log("Creating contest:", {
                contestName,
                contestDescription,
                problemIds: selectedProblems,
            });

            const res = await fetch("/api/contests", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contestName,
                    contestDescription,
                    problemIds: selectedProblems,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error("Create Contest Error:", errData);
                alert("Failed to create contest: " + (errData.error || "Unknown error"));
                return;
            }

            const data = await res.json();
            console.log("Contest created:", data);
            alert("Contest created successfully!");
        } catch (err) {
            console.error("Error creating contest:", err);
            alert("Error creating contest. See console for details.");
        }
    };

    const handleCreateProblem = async () => {
        try {
            console.log("Creating problem:", {
                problemName,
                problemDescription,
                tests,
                code,
                selectedLanguage,
            });

            const res = await fetch("/api/problems", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    problemName,
                    problemDescription,
                    tests,
                    code,
                    language: selectedLanguage,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error("Create Problem Error:", errData);
                alert("Failed to create problem: " + (errData.error || "Unknown error"));
                return;
            }

            const data = await res.json();
            console.log("Problem created:", data);
            alert("Problem created successfully!");
        } catch (err) {
            console.error("Error creating problem:", err);
            alert("Error creating problem. See console for details.");
        }
    };

    const handleAddTest = () => {
        const newTestIndex = tests.length.toString();
        setTests([...tests, { input: "", expectedOutput: "" }]);
        setActiveTestTab(newTestIndex);
    };

    const handleRemoveTest = (index: number) => {
        const newTests = tests.filter((_, i) => i !== index);
        setTests(newTests);

        const currentTab = parseInt(activeTestTab, 10);
        if (currentTab >= index) {
            const newTab = Math.max(0, currentTab - 1).toString();
            setActiveTestTab(newTab);
        }
    };

    const handleTestChange = (
        index: number,
        field: "input" | "expectedOutput",
        value: string
    ) => {
        const newTests = [...tests];
        newTests[index][field] = value;
        setTests(newTests);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <main className="max-w-6xl mx-auto">
                <Tabs defaultValue="contest" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="contest">Create Contest</TabsTrigger>
                        <TabsTrigger value="problem">Create Problem</TabsTrigger>
                    </TabsList>
                    <TabsContent value="contest">
                        <Card className="p-6 shadow-neumorphic">
                            <h2 className="text-2xl font-bold text-red-700 mb-4">
                                Create a New Contest
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label
                                        htmlFor="contestName"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Contest Name
                                    </label>
                                    <Input
                                        id="contestName"
                                        value={contestName}
                                        onChange={(e) => setContestName(e.target.value)}
                                        className="mt-1"
                                        placeholder="Enter contest name"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="contestDescription"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Contest Description
                                    </label>
                                    <Textarea
                                        id="contestDescription"
                                        value={contestDescription}
                                        onChange={(e) => setContestDescription(e.target.value)}
                                        className="mt-1"
                                        placeholder="Enter contest description"
                                        rows={4}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Problems
                                    </label>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="relative flex-grow">
                                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <Input
                                                type="text"
                                                placeholder="Search problems..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-8"
                                            />
                                        </div>
                                        <Button onClick={handleRefresh} variant="outline" size="icon">
                                            <RefreshCcw className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {filteredProblems.map((problem) => (
                                            <div
                                                key={problem.id}
                                                className="flex items-center space-x-2 p-2 bg-white rounded-md shadow-sm"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`problem-${problem.id}`}
                                                    checked={selectedProblems.includes(problem.id)}
                                                    onChange={() => handleProblemSelection(problem.id)}
                                                    className="rounded text-red-600 focus:ring-red-500"
                                                />
                                                <label
                                                    htmlFor={`problem-${problem.id}`}
                                                    className="flex-grow text-sm text-gray-700"
                                                >
                                                    {problem.name}
                                                </label>
                                                <Badge
                                                    variant={
                                                        problem.difficulty === "Easy"
                                                            ? "secondary"
                                                            : problem.difficulty === "Medium"
                                                                ? "default"
                                                                : problem.difficulty === "Hard"
                                                                    ? "destructive"
                                                                    : "outline"
                                                    }
                                                >
                                                    {problem.difficulty}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleCreateContest}
                                    className="w-full bg-red-700 hover:bg-red-800 text-white"
                                >
                                    Create Contest
                                </Button>
                            </div>
                        </Card>
                    </TabsContent>

                    <TabsContent value="problem">
                        <Card className="p-6 shadow-neumorphic">
                            <h2 className="text-2xl font-bold text-red-700 mb-4">
                                Create a New Problem
                            </h2>
                            <div className="flex gap-6">
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label
                                            htmlFor="problemName"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Problem Name
                                        </label>
                                        <Input
                                            id="problemName"
                                            value={problemName}
                                            onChange={(e) => setProblemName(e.target.value)}
                                            className="mt-1"
                                            placeholder="Enter problem name"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="problemDescription"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            Problem Description
                                        </label>
                                        <Textarea
                                            id="problemDescription"
                                            value={problemDescription}
                                            onChange={(e) => setProblemDescription(e.target.value)}
                                            className="mt-1"
                                            placeholder="Enter problem description"
                                            rows={4}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Test Cases
                                        </label>
                                        <Tabs value={activeTestTab} onValueChange={setActiveTestTab}>
                                            <div className="flex items-center justify-between mb-2">
                                                <TabsList>
                                                    {tests.map((_, index) => (
                                                        <TabsTrigger key={index} value={index.toString()}>
                                                            Test {index + 1}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>
                                                <Button variant="outline" size="sm" onClick={handleAddTest}>
                                                    <PlusCircle className="h-4 w-4 mr-2" /> Add Test
                                                </Button>
                                            </div>
                                            {tests.map((test, index) => (
                                                <TabsContent key={index} value={index.toString()}>
                                                    <div className="space-y-2 p-4 bg-white rounded-md shadow-sm">
                                                        <div>
                                                            <label
                                                                htmlFor={`input-${index}`}
                                                                className="block text-xs font-medium text-gray-500"
                                                            >
                                                                Input
                                                            </label>
                                                            <Textarea
                                                                id={`input-${index}`}
                                                                value={test.input}
                                                                onChange={(e) =>
                                                                    handleTestChange(index, "input", e.target.value)
                                                                }
                                                                className="mt-1"
                                                                placeholder="Enter test input"
                                                                rows={2}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label
                                                                htmlFor={`output-${index}`}
                                                                className="block text-xs font-medium text-gray-500"
                                                            >
                                                                Expected Output
                                                            </label>
                                                            <Textarea
                                                                id={`output-${index}`}
                                                                value={test.expectedOutput}
                                                                onChange={(e) =>
                                                                    handleTestChange(index, "expectedOutput", e.target.value)
                                                                }
                                                                className="mt-1"
                                                                placeholder="Enter expected output"
                                                                rows={2}
                                                            />
                                                        </div>
                                                        {tests.length > 1 && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleRemoveTest(index)}
                                                                className="mt-2"
                                                            >
                                                                <Trash className="h-4 w-4 mr-2" /> Remove Test
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <Card className="p-6 shadow-neumorphic">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="relative z-10">
                                                <Select
                                                    onValueChange={(value) => setSelectedLanguage(value)}
                                                    defaultValue={selectedLanguage}
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
                                        </div>

                                        <Card className="flex-1 p-6 shadow-neumorphic">
                                            <div className="relative h-full">
                                                <CodeEditor value={code} onChange={setCode} language={selectedLanguage} />
                                            </div>
                                        </Card>
                                    </Card>
                                </div>
                            </div>

                            <Button
                                onClick={handleCreateProblem}
                                className="w-full bg-red-700 hover:bg-red-800 text-white mt-6"
                            >
                                Create Problem
                            </Button>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
