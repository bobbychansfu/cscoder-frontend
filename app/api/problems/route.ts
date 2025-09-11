import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
    try {
        const cookie = req.headers.get("cookie") ?? "";

        const backendRes = await fetch("http://localhost:5000/problems", {
            headers: {
                Cookie: cookie,
            },
        });

        if (!backendRes.ok) {
            const errData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errData?.error || "Failed to fetch problems" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[GET /api/problems] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { problemName, problemDescription, tests, code, language } = body;

        const cookie = req.headers.get("cookie") ?? "";
        const backendRes = await fetch("http://localhost:5000/problems", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            body: JSON.stringify({
                name: problemName,
                description: problemDescription,
                tests,
                code,
                language,
            }),
        });

        if (!backendRes.ok) {
            const errData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errData?.error || "Failed to create problem" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[POST /api/problems] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
