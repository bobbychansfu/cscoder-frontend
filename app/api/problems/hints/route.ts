import {NextRequest, NextResponse} from "next/server";

export async function POST (req: NextRequest) {

    try {

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
        return NextResponse.json({ status: 200 });

    } catch (error) {
        console.error("[POST /api/problems/hints] Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }

}