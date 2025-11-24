import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { cid: string; pid: string } }
) {
    try {
        const { cid, pid } = params;
        const cookie = req.headers.get("cookie") ?? "";
        
        const backendRes = await fetch(`http://localhost:5000/s/problem/${cid}/${pid}`, {
            headers: { 
                Cookie: cookie 
            },
            credentials: 'include'
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => null);
            return NextResponse.json(
                { error: errorData?.error || "Failed to fetch problem details" },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        
        const transformedData = {
            pid: parseInt(pid),
            cid: parseInt(cid),
            title: data.problem?.name || "Unknown Problem",
            description: data.htmlContents || "No description available",
            difficulty: data.problem?.difficulty || "Unknown",
            downloadContents: data.downloadContents || [],
        };
	console.log(transformedData.downloadContents)
	console.log(transformedData.description)
        
        return NextResponse.json(transformedData, { status: 200 });
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
        
        const { code, language, connection_id } = body;

        console.log(code, language, connection_id);
        
        const backendRes = await fetch(`http://localhost:5000/s/submit/${cid}/${pid}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookie,
            },
            credentials: 'include',
            body: JSON.stringify({ 
                textcode: code,
                language: language,
                connection_id: connection_id
            }),
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
    } catch (err: any) {
        console.error("[POST /api/contest/[cid]/problem/[pid]] Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error", message: err.message },
            { status: 500 }
        );
    }
}
