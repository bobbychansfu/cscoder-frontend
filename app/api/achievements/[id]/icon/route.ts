import { NextRequest } from 'next/server'

const BACKEND_BASE_URL =
  process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000' 

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const cookie = req.headers.get('cookie') ?? ''

  const backendRes = await fetch(
    `${BACKEND_BASE_URL}/s/achievements/${id}/icon`,
    {
      headers: { Cookie: cookie },  
      redirect: 'manual',           
    }
  )

  if (backendRes.status === 302 || backendRes.status === 401) {
    return new Response(null, { status: 401 })
  }

  if (!backendRes.ok) {
    return new Response(null, { status: backendRes.status })
  }

  const buf = await backendRes.arrayBuffer()
  return new Response(buf, {
    status: 200,
    headers: {
      'Content-Type': backendRes.headers.get('content-type') || 'image/png',
    },
  })
}