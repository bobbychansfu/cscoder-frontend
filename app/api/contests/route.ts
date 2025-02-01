import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const backendRes = await fetch('http://localhost:5000/info', {
            headers: {
                Cookie: req.headers.get('cookie') || '',
            },
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json();
            return NextResponse.json(
                { error: errorData.error || 'Backend error' },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();

        return NextResponse.json({
            contests: data.contests
        });

    } catch (err) {
        console.error('[Contests] Error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch contests' },
            { status: 500 }
        );
    }
}