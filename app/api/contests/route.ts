import {NextRequest, NextResponse} from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const backendRes = await fetch('http://localhost:5000/i/info', {
            headers: {
                Cookie: req.headers.get('cookie') || '',
            },
            credentials: 'include',
        });
        console.log(backendRes);

        if (!backendRes.ok) {
            const errorData = await backendRes.json();
            return NextResponse.json(
                {error: errorData.error || 'Backend error'},
                {status: backendRes.status}
            );
        }

        const data = await backendRes.json();
        console.log(data);

        return NextResponse.json({
            contests: data.contests,
            contestsOpen: data.contestsOpen
        });

    } catch (err) {
        console.error('[Contests] Error:', err);
        return NextResponse.json(
            {error: 'Failed to fetch contests'},
            {status: 500}
        );
    }
}
