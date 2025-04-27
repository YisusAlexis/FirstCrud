import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs' // <- Importar bcrypt para encriptar la nueva password

type Params = {
  params: { id: string }
}

// Función para actualizar el usuario (ya la tienes)
export async function PUT(req: Request, { params }: Params) {
  const { id } = params

  try {
    const data = await req.json()

    const { name, email, password, role } = data

    const updateData: any = {
      name,
      email,
      role
    }

    // Si hay una nueva contraseña, la encriptamos antes de guardar
    if (password && password.trim() !== '') {
      const hashedPassword = await hash(password, 10) // 10 salt rounds es lo normal
      updateData.password = hashedPassword
    }

    // Actualizamos el usuario
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}

// Función para eliminar el usuario
export async function DELETE(req: Request, { params }: Params) {
  const { id } = params

  try {
    // Eliminamos el usuario de la base de datos
    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) }
    })

    // Retornamos la respuesta con el usuario eliminado
    return NextResponse.json(deletedUser)
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 })
  }
}
