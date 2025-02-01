import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params}: { params: { userid: string } }) {
    try {
        const {userid} = params;
        const cookie = req.headers.get("cookie") ?? "";

        const backendRes = await fetch(`http://localhost:5000/user/${userid}`, {
            headers: { Cookie: cookie },
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => null);
            return NextResponse.json(
                { error: errorData?.error || "Failed to fetch user data" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        return NextResponse.json(data, { status: 200 });
    } catch (err) {
        console.error("Error in /api/user route:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
