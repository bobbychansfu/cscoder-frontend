import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { cid: string } }) {
    try {
        const { cid } = params;
        
        // Step 1: First, try to register the user for the contest
        const registerRes = await fetch(`http://localhost:5000/s/contest/register/${cid}`, {
            method: 'POST', 
            headers: {
                Cookie: req.headers.get('cookie') || '',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        // Step 2: Enter the contest (required to create problem statuses)
        const enterContestRes = await fetch(`http://localhost:5000/s/entercontest/${cid}`, {
            headers: {
                Cookie: req.headers.get('cookie') || ''
            },
            credentials: 'include'
        });
        
        // Step 3: Get contest details
        const backendRes = await fetch(`http://localhost:5000/s/contest/${cid}`, {
            headers: {
                Cookie: req.headers.get('cookie') || '',
            },
            credentials: 'include'
        });

        if (!backendRes.ok) {
            const errorData = await backendRes.json();
            return NextResponse.json(
                { error: errorData.error || 'Contest not found' },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        
        // Also fetch basic contest info to get name, start and end times
        const contestInfoRes = await fetch(`http://localhost:5000/s/closed/${cid}`, {
            headers: {
                Cookie: req.headers.get('cookie') || '',
            },
            credentials: 'include'
        });
        
        let contestInfo = null;
        if (contestInfoRes.ok) {
            const contestData = await contestInfoRes.json();
            contestInfo = contestData.contest;
        }
        
        // Add contest info to the response
        return NextResponse.json({
            ...data,
            contestInfo
        });
    } catch (err: any) {
        console.error('[Contest API] Error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch contest details', message: err.message },
            { status: 500 }
        );
    }
};

