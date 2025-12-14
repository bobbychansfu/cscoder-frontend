import {NextRequest, NextResponse} from "next/server";


export async function GET (req: NextRequest) {

    const cookie = req.headers.get("cookie") ?? "";
    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

    const computing_id = req.nextUrl.searchParams.get("computing_id");
    const pid = req.nextUrl.searchParams.get("pid");

    const backendRes = await fetch(`${BACKEND_URL}/s/hints?computing_id=${computing_id}&pid=${pid}`, {
        method: "GET",
        headers: {
            Cookie: cookie,
        }
    })

    if (!backendRes.ok) {

        return NextResponse.json(await backendRes.json().catch(() => null), {status: backendRes.status})

    }

    const hints = await backendRes.json();

    return NextResponse.json(hints, {status: 200});

}


export async function POST (req: NextRequest) {

    const cookie = req.headers.get("cookie") ?? "";

    const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

    const body = await req.json();

    console.log(body);
    const backendRes = await fetch(`${BACKEND_URL}/s/request_hint`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookie,
        },
        body: JSON.stringify(body),
    });

    console.log("Sent request");
    // const data = await backendRes.json();

    if (!backendRes.ok) {
        const error = await backendRes.json().catch(() => null);
        console.error("[POST /api/problems/hints] Error:", error);
        return NextResponse.json({ error: "Failed to request hint" }, { status: 500 });
    }

    return NextResponse.json({ status: 200 });

}