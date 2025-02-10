import {NextRequest, NextResponse} from 'next/server';

export async function GET(req: NextRequest, {params}: { params: { cid: string } }) {
    try {
        const {cid} = params;
	const registerRes = await fetch(`http://localhost:5000/s/contest/register/${cid}`, {
				       headers: {
				       Cookie: req.headers.get('cookie') || '},
				       credentials: 'include'
	});

        const backendRes = await fetch(`http://localhost:5000/s/contest/${cid}`, {
            headers: {
                Cookie: req.headers.get('cookie') || '',
            },
	    credentials: 'include'
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json();
            return NextResponse.json(
                {error: errorData.error || 'Contest not found'},
                {status: backendRes.status}
            );
        }

        const data = await backendRes.json();
	console.log(data);
        return NextResponse.json(data);
    } catch (err) {
        console.error('[Contest API] Error:', err);
        return NextResponse.json(
            {error: 'Failed to fetch contest details'},
            {status: 500}
        );
    }
}
