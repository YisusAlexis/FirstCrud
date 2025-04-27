import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const auth = request.headers.get('cookie')?.includes('auth=')

  if (!auth) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  return NextResponse.json({ message: 'Autorizado' })
}
