import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import prisma from '@/lib/prisma'
// POST /api/register
export async function POST(request: Request) {
  const reqBody = await request.json()
  const { name, email, password, role } = reqBody

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
  }

const normalizedEmail = email.trim().toLowerCase()  

  // Validar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail  } })
  if (existingUser) {
    return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 })
  }

  // Encriptar la contraseña
  const hashedPassword = await hash(password, 10)

  // Crear usuario
  const user = await prisma.user.create({
  data: {
    name,
    email : normalizedEmail,
    password: hashedPassword,
    role
  }
})

  return NextResponse.json({ message: 'Usuario registrado correctamente', user })
}
