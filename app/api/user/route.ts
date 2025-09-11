import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const cookie = req.headers.get("cookie") ?? "";

        const backendRes = await fetch(`http://localhost:5000/s/profile`, {
            headers: { Cookie: cookie },
        });

        console.log("got backend response")

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => null);
            return NextResponse.json(
                { error: errorData?.error || "Failed to fetch user data" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        console.log(data);
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("Error in /api/user route:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
