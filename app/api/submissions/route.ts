import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sids = searchParams.get('sids');

  if (!sids) {
    return NextResponse.json({ error: 'sids query parameter is required' }, { status: 400 });
  }

  // Forward the request to the backend
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('connect.sid'); // Default express-session cookie name

    const backendResponse = await fetch(`${BACKEND_URL}/m/submissions?sids=${sids}`, {
      headers: {
        'Cookie': sessionCookie ? `${sessionCookie.name}=${sessionCookie.value}` : '',
      },
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({ error: 'Backend returned non-JSON response' }));
      return NextResponse.json(errorData, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    console.log(`Received submission ${JSON.stringify(data)}`);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching from backend:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}