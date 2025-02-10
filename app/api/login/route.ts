import {NextRequest, NextResponse} from 'next/server';

export async function GET(req: NextRequest) {
    const {searchParams} = new URL(req.url);
    const ticket = searchParams.get('ticket');
    if (!ticket) {
        NextResponse.json({error: 'No ticket provided'}, {status: 400});
    }

    try {
        const backendRes = await fetch(`http://localhost:5000/?ticket=${ticket}`, {
            headers: {Cookie: req.headers.get('cookie') || ''},
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json();
            console.log('Error response: ', errorData);
            return NextResponse.json({error: 'Backend Error', details: errorData}, {status: backendRes.status});
        }

        const resBody = await backendRes.json();
        console.log(resBody);

        const setCookie = backendRes.headers.get('set-cookie');

        const nextRes = NextResponse.json(resBody);

        if (setCookie) {
            nextRes.headers.set('set-cookie', setCookie);
        }

        return nextRes;
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: 'Failed to call backend'}, {status: 500});
    }
}
