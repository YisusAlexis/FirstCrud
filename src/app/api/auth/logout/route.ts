import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logout exitoso' })

  response.headers.set('Set-Cookie', 'auth=; Max-Age=0; Path=/')

  return response
}
