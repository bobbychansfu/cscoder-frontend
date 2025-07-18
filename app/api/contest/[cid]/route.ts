import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { cid: string } }) {
    try {
        const { cid } = params;
       
        const registerRes = await fetch(`http://localhost:5000/s/contest/register/${cid}`, {
            method: 'POST', 
            headers: {
                Cookie: req.headers.get('cookie') || '',
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
        
        const enterContestRes = await fetch(`http://localhost:5000/s/entercontest/${cid}`, {
            headers: {
                Cookie: req.headers.get('cookie') || ''
            },
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
                { error: errorData.error || 'Contest not found' },
                { status: backendRes.status }
            );
        }

        const data = await backendRes.json();
        
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

        const problemSubmissions = {};
        
        if (data.contestProblemsStatus && Array.isArray(data.contestProblemsStatus)) {
            for (const problem of data.contestProblemsStatus) {
                try {
                    const submissionsRes = await fetch(`http://localhost:5000/s/submissions/${cid}/${problem.pid}`, {
                        headers: {
                            Cookie: req.headers.get('cookie') || '',
                        },
                        credentials: 'include'
                    });
                    
                    if (submissionsRes.ok) {
                        const submissionsData = await submissionsRes.json();
                        // TODO: FIX THIS ASAP!!!! ❗
                        // @ts-ignore
                        problemSubmissions[problem.pid] = submissionsData.submissions || [];
                    }
                } catch (submissionErr) {
                    console.error(`Error fetching submissions for problem ${problem.pid}:`, submissionErr);
                    // TODO: FIX THIS ASAP!!!! ❗
                    // @ts-ignore
                    problemSubmissions[problem.pid] = [];
                }
            }
        }

        return NextResponse.json({
            ...data,
            contestInfo,
            problemSubmissions
        });
    } catch (err: any) {
        console.error('[Contest API] Error:', err);
        return NextResponse.json(
            { error: 'Failed to fetch contest details', message: err.message },
            { status: 500 }
        );
    }
} 
