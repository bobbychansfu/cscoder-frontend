import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { cid: string; pid: string } }
) {
    try {
        const { cid, pid } = params;
        const cookie = req.headers.get("cookie") ?? "";
        const backendRes = await fetch(`http://localhost:5000/contest/${cid}/problem/${pid}`, {
            headers: { Cookie: cookie },
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => null);
            return NextResponse.json(
                { error: errorData?.error || "Failed to fetch problem details" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[GET /api/contest/[cid]/problem/[pid]] Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: { cid: string; pid: string } }
) {
    try {
        const { cid, pid } = params;
        const body = await req.json();

        const cookie = req.headers.get("cookie") ?? "";
        const backendRes = await fetch(`http://localhost:5000/contest/${cid}/problem/${pid}/submit`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            body: JSON.stringify(body),
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => null);
            return NextResponse.json(
                { error: errorData?.error || "Failed to submit code" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("[POST /api/contest/[cid]/problem/[pid]] Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
