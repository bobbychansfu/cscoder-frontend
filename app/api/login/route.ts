import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticket = searchParams.get('ticket');
    if (!ticket) {
        NextResponse.json({ error: 'No ticket provided' }, { status: 400 });
    }

    try {
        console.log(ticket);
        const backendRes = await fetch('http://localhost:5000/?ticket=${ticket}', {
            headers: { Cookie: req.headers.get('cookie') || '' },
        });

        const resBody = await backendRes.json();

        const setCookie = resBody.headers.get('set-cookie');

        const nextRes = NextResponse.json(resBody);

        if (setCookie) {
            nextRes.headers.set('set-cookie', setCookie);
        }

        return nextRes;
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to call backend' }, { status: 500 });
    }
}