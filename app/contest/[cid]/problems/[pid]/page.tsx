"use client";

import React, {useEffect, useRef, useState} from "react";
import {useParams} from "next/navigation";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import CodeEditor from "@/components/CodeEditor";
import Script from "next/script";
import {io, Socket} from "socket.io-client"
import {useSubmissions} from "@/lib/SubmissionsContext";

interface ProblemDetails {
    pid: number;
    cid: number;
    title: string;
    description: string;
    difficulty: "Easy" | "Medium" | "Hard" | string;
    downloadContents?: string[];
    sampleRuns?: Array<{
        input: string;
        output: string;
        id: number;
    }>;
}

interface ProblemStatus {
    sid: number | null,
    computing_id: string | null,
    cid: number | null,
    pid: number | null,
    status: string | null,
    tries: number | null,
    time_penalty: number | null,
    score: number | null,
    error: string | null
}

interface AIHint {
    code: string | null,
    hint: string | null,
    validation: string | null,
    request_num: number | null,
}

declare global {
    interface Window {
        MathJax: any;
    }
}

export default function CodingPage() {
    const { cid, pid } = useParams();
    const { submissions, startPolling } = useSubmissions();

    const [problem, setProblem] = useState<ProblemDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("Python");
    const [submitting, setSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<ProblemStatus | null>(null);
    const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
    const [statusSocket, setStatusSocket] = useState<Socket | null>(null)
    const [hintSocket, setHintSocket] = useState<Socket | null>(null);
    const [aiHints, setAIHints] = useState<Array<AIHint>>([]);
    const [waitingForHint, setWaitingForHint] = useState<boolean>(false);

    const descriptionRef = useRef<HTMLDivElement>(null);

    const liveStatus = submissionResult?.sid ? submissions.get(submissionResult.sid)?.status : null;

    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

    function updateProblemStatus(status: ProblemStatus){
            console.log(JSON.stringify(status, null, 2));
            setSubmissionResult({...status});
    }

    function updateAIHints(ai_hint: AIHint) {

        const most_recent_hint: AIHint | undefined = aiHints.at(-1);

        if (most_recent_hint) {
            ai_hint["request_num"] = most_recent_hint["request_num"] + 1;
        } else {
            ai_hint["request_num"] = 1;
        }

        console.log(`Received Hint: ${JSON.stringify(ai_hint)}`);

        setAIHints([...aiHints, ai_hint]);
        setWaitingForHint(false);
    }

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
                const processedData = processProblemData(data);
                setProblem(processedData);
                setError(null);

                setTimeout(() => {
                    if (window.MathJax) {
                        window.MathJax.typesetPromise?.([descriptionRef.current]);
                    }
                }, 100);
            })
            .catch((err) => {
                console.error("Error fetching problem details:", err);
                setProblem(null);
                setError(err.message);
            })
            .finally(() => {
                setLoading(false);
            });

        const status_socket = io(`${BACKEND_URL}/status`);
        setStatusSocket(status_socket);

        const hint_socket = io(`${BACKEND_URL}/ai_hints`);
        setHintSocket(hint_socket);

    }, [cid, pid]);

    useEffect(() => {

        if (statusSocket) {
            // Connect to codeserver via websocket
            statusSocket.on('connect', () => {
                console.log('Connected to server!');
            });

            statusSocket.emit('test', 'Ready to listen for problem status')

            // Listen for updates from server on problem status
            statusSocket.on("status", updateProblemStatus);
        }

        if (hintSocket) {
            hintSocket.on('connect', () => {
                console.log('Connected to server!');
            });

            hintSocket.emit('test', 'Ready to listen for AI hints')

            // Listen for updates from server on problem status
            hintSocket.on("hint", updateAIHints);

        }

        return () => {

            if (statusSocket) {
                statusSocket.off("connect");
                statusSocket.off("status", updateProblemStatus);
                statusSocket.off("disconnect");
                statusSocket.disconnect();
            }

            if (hintSocket) {
                hintSocket.off("connect");
                hintSocket.off("hint", updateAIHints);
                hintSocket.off("disconnect");
                hintSocket.disconnect();
            }
        }
    }, [statusSocket, hintSocket]);
    
    const processProblemData = (data: ProblemDetails): ProblemDetails => {
        if (typeof window === 'undefined') {
            return data;
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data.description;
        
        const sampleRuns: Array<{input: string; output: string; id: number}> = [];
        
        const sampleRunHeadings = Array.from(tempDiv.querySelectorAll('h3'))
            .filter(heading => heading.textContent?.includes('Sample Run'));
        
        sampleRunHeadings.forEach((heading, index) => {
            const runMatch = heading.textContent?.match(/Sample Run (\d+)/);
            const runId = runMatch ? parseInt(runMatch[1]) : index + 1;
            
            let preElement = heading.nextElementSibling;
            while (preElement && preElement.tagName !== 'PRE') {
                preElement = preElement.nextElementSibling;
            }
            
            if (preElement) {
                const boldElements = preElement.querySelectorAll('b');
                let input = '';
                let output = '';
                
                if (boldElements.length > 0) {
                    boldElements.forEach(bold => {
                        input += bold.textContent + ' ';
                    });
                    input = input.trim();
                    
                    output = preElement.textContent || '';
                    boldElements.forEach(bold => {
                        output = output.replace(bold.textContent || '', '');
                    });
                    output = output.trim();
                } else {
                    const lines = (preElement.textContent || '').trim().split('\n');
                    if (lines.length >= 2) {
                        input = lines[0].trim();
                        output = lines.slice(1).join('\n').trim();
                    }
                }
                
                if (input && output) {
                    sampleRuns.push({
                        input,
                        output,
                        id: runId
                    });
                }
            }
        });
        
        sampleRuns.sort((a, b) => a.id - b.id);
        
        return {
            ...data,
            sampleRuns: sampleRuns.length > 0 ? sampleRuns : undefined
        };
    };

    const handleSubmitCode = async () => {
        if (!cid || !pid || !code) {
            if (submissionResult){
                setSubmissionResult({ ...submissionResult, error: "No code to submit" });
            } else {

            }
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
            if (data.sid) {
                startPolling(data.sid);
            }
        } catch (err: any) {
            console.error("Error submitting code:", err);

            if (submissionResult){
                console.log(JSON.stringify(submissionResult))
                setSubmissionResult({...submissionResult, error: err.message });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestHint = async () => {

        if (!cid || !pid || !problem) return;

        try {

            const request_data = {
                problem: problem.title,
                description: problem.description,
                language: language,
                code: code
            };

            const res = await fetch("/api/problems/hints", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(request_data),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.error || "Failed to request hint");
            } else {
                setWaitingForHint(true);
            }

        } catch (error) {
            console.error("Error requesting hint:", error);
        }

    }


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
            <Script 
                id="mathjax-script"
                strategy="afterInteractive"
                src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
                onLoad={() => {
                    window.MathJax = {
                        tex: {
                            inlineMath: [['$', '$'], ['\\(', '\\)']],
                            displayMath: [['$$', '$$'], ['\\[', '\\]']],
                        },
                        svg: {
                            fontCache: 'global'
                        },
                        options: {
                            enableMenu: false
                        }
                    };
                    if (window.MathJax.typesetPromise) {
                        window.MathJax.typesetPromise([descriptionRef.current]);
                    }
                }}
            />

            <main className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-bold text-red-700 mb-4">
                    {problem.title}
                </h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <Card className="p-6 shadow-neumorphic mb-6 h-full">
                            <div className="mb-4">
                                <p className="text-sm text-gray-500 mb-2">
                                    Difficulty: {problem.difficulty}
                                </p>
                                <div 
                                    ref={descriptionRef}
                                    className="text-gray-800 prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: problem.description }}
                                />
                                
                                {problem.sampleRuns && problem.sampleRuns.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium mb-3">Sample Runs</h3>
                                        <Tabs defaultValue={`run-${problem.sampleRuns[0].id}`}>
                                            <TabsList className="mb-2">
                                                {problem.sampleRuns.map(run => (
                                                    <TabsTrigger key={run.id} value={`run-${run.id}`}>
                                                        Sample Run {run.id}
                                                    </TabsTrigger>
                                                ))}
                                            </TabsList>
                                            
                                            {problem.sampleRuns.map(run => (
                                                <TabsContent key={run.id} value={`run-${run.id}`} className="mt-0">
                                                    <div className="bg-gray-50 p-4 rounded-md">
                                                        <div className="mb-3">
                                                            <div className="text-sm font-medium text-gray-500 mb-1">Input:</div>
                                                            <pre className="bg-white p-3 rounded border border-gray-200 text-sm overflow-x-auto">
                                                                {run.input}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-500 mb-1">Output:</div>
                                                            <pre className="bg-white p-3 rounded border border-gray-200 text-sm overflow-x-auto">
                                                                {run.output}
                                                            </pre>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                            ))}
                                        </Tabs>
                                    </div>
                                )}
                            </div>
                            
                            {problem.downloadContents && problem.downloadContents.length > 0 && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-md">
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
                                                Status: {liveStatus || submissionResult.status}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>

                    <div>
                        <Card className="p-6 shadow-neumorphic h-full">
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
                            
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-sm text-gray-500">
                                    {uploadedFileName 
                                        ? <span>File: <span className="font-medium">{uploadedFileName}</span></span>
                                        : "Upload code file or write directly in the editor"
                                    }
                                </div>
                                <label className="cursor-pointer">
                                    <span className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm inline-block">
                                        {uploadedFileName ? "Change File" : "Upload File"}
                                    </span>
                                    <input 
                                        type="file"
                                        className="hidden"
                                        accept=".py,.cpp,.java,.js,.html,.css,.txt"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const extension = file.name.split('.').pop()?.toLowerCase();
                                                if (extension) {
                                                    const langMap: {[key: string]: string} = {
                                                        'py': 'Python',
                                                        'cpp': 'C++',
                                                        'java': 'Java',
                                                        'js': 'JavaScript',
                                                    };
                                                    
                                                    if (langMap[extension]) {
                                                        setLanguage(langMap[extension]);
                                                    }
                                                }
                                                
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    if (event.target?.result) {
                                                        setCode(event.target.result.toString());
                                                        setUploadedFileName(file.name);
                                                    }
                                                };
                                                reader.readAsText(file);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            <div className="min-h-[calc(100vh-350px)]">
                                <CodeEditor
                                    language={language.toLowerCase()}
                                    value={code}
                                    onChange={setCode}
                                />

                                <div className="flex justify-end">

                                    <div className={`
                                         my-5 mx-6
                                         transition-all duration-300 
                                         ${waitingForHint ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                                    `}>
                                        <div role="status" className="flex justify-center items-center space-x-3">

                                            <div>
                                                <svg aria-hidden="true"
                                                     className="w-8 h-8 text-neutral-tertiary animate-spin text-red-600 fill-red-300"
                                                     viewBox="0 0 100 101" fill="none"
                                                     xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                        fill="currentColor"/>
                                                    <path
                                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                        fill="currentFill"/>
                                                </svg>
                                            </div>

                                            <div>
                                                <span className="font-bold text-red-700"> Generating Hint ... </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Button
                                            className="bg-green-700 hover:bg-green-800 text-white flex-1 my-5"
                                            onClick={handleRequestHint}
                                        >
                                            Request an AI Hint
                                        </Button>
                                    </div>

                                </div>
                            </div>

                            <div className="mt-4 flex space-x-4">
                                <Button
                                    className="bg-red-700 hover:bg-red-800 text-white flex-1"
                                    onClick={handleSubmitCode}
                                    disabled={submitting || !code}
                                >
                                    {submitting ? "Submitting..." : "Submit"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-gray-300 hover:bg-gray-100 text-gray-700"
                                    onClick={() => {
                                        setCode("");
                                        setUploadedFileName(null);
                                    }}
                                    disabled={submitting || !code}
                                >
                                    Clear
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};
