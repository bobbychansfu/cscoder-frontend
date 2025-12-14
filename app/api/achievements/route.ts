import { NextRequest, NextResponse } from 'next/server';

export async function GET(req:NextRequest) {
    try {
        const cookie = req.headers.get("cookie") ?? "";
        
        const backendRes = await fetch(`http://localhost:5000/s/achievements`,{
            headers: { Cookie: cookie },    
        });

        console.log("got backend response")

        if (!backendRes.ok) {
            const errorData = await backendRes.json().catch(() => ({}));
            return NextResponse.json(
                { error: errorData?.error || 'Failed to fetch achievements' },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        console.log(data);
        return NextResponse.json({
            computingId: data.computingId,
            achievements: data.achievements,
            topicXp: data.topicXp,
            totalXp: data.totalXp,
        });
    } catch (err: any) {
        console.error('Error in /api/achievements route:', err);
        return NextResponse.json(
            { error: 'Failed to fetch achievements', message: err.message },
            { status: 500 }
        );
    }
}