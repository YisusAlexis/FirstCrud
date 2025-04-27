'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, ConfigProvider, Flex } from 'antd';

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/login', {
      
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await res.json()

    if (res.ok) {
      // Guardar sesión en localStorage
      localStorage.setItem('user', JSON.stringify(data.user))

      setMessage(`Bienvenido ${data.user.name}`)
      // Redirigir según rol
      if (data.user.role === 'ADMIN') {
        router.push('/admin')
      } else if (data.user.role === 'OWNER') {
        router.push('/owner')
      } else {
        router.push('/users')
      }
    } else {
      setMessage(data.error || 'Error desconocido')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Iniciar sesión</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Iniciar sesión
        </button>
        <Flex vertical gap="small">
          <h2>¿Aun no estas registrado?</h2>
          <Button href="/register" color="primary" variant="outlined">
           Registrarse
          </Button>
        </Flex>
      </form>
      {message && <p className="mt-4 text-center text-green-600">{message}</p>}
    </div>
  )
}
