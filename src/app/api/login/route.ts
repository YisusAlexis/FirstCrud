import { compare } from 'bcryptjs'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const normalizedEmail = email.trim().toLowerCase()

  try {
    // Validación básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son obligatorios' },
        { status: 400 }
      )
    }

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    if (!user) {
      console.warn(`Intento de login fallido: email no registrado -> ${normalizedEmail}`)
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar contraseña
    const valid = await compare(password, user.password)
    if (!valid) {
      console.warn(`Intento de login fallido: contraseña incorrecta para ${normalizedEmail}`)
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Si el login es exitoso:
    const response = NextResponse.json({
      message: 'Login exitoso',
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

    // Aquí seteamos la cookie
    response.cookies.set('auth', user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 día
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
