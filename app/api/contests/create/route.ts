import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { contestName, contestDescription, problemIds } = body;

        const cookie = req.headers.get("cookie") ?? "";
        const backendRes = await fetch("http://localhost:5000/contests", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            body: JSON.stringify({
                name: contestName,
                description: contestDescription,
                problems: problemIds,
            }),
        });

        if (!backendRes.ok) {
            const errData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errData?.error || "Failed to create contest" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[POST /api/contests] Error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
