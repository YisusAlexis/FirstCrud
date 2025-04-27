'use client'

import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, Select, message, Layout, Menu } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const { Header, Sider, Content } = Layout

type User = {
  id: number
  name: string
  email: string
  password: string
  role: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndFetchUsers = async () => {
      try {
        const res = await fetch('/api/auth/check', { method: 'GET' })
        if (res.status !== 200) {
          router.push('/login')
          return
        }

        const usersRes = await fetch('/api/users')
        const usersData = await usersRes.json()
        setUsers(usersData)
      } catch (err) {
        console.error('Error al obtener usuarios:', err)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchUsers()
  }, [router])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const openEditModal = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    })
    setIsModalOpen(true)
  }

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields()

      const response = await fetch(`/api/users/${editingUser?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      })

      if (response.ok) {
        message.success('Usuario actualizado correctamente')
        const updatedUsers = users.map(user =>
          user.id === editingUser?.id ? { ...user, ...values, createdAt: user.createdAt } : user
        )
        setUsers(updatedUsers)
        setIsModalOpen(false)
      } else {
        message.error('Error al actualizar usuario')
      }
    } catch (err) {
      console.error('Error al actualizar:', err)
      message.error('Error al actualizar usuario')
    }
  }

  const handleDelete = async (userId: number) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        message.success('Usuario eliminado correctamente')
        const updatedUsers = users.filter(user => user.id !== userId)
        setUsers(updatedUsers)
      } else {
        message.error('Error al eliminar usuario')
      }
    } catch (err) {
      console.error('Error al eliminar usuario:', err)
      message.error('Error al eliminar usuario')
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Password', dataIndex: 'password', key: 'password' },
    { title: 'Rol', dataIndex: 'role', key: 'role' },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_: any, user: User) => (
        <div className="flex gap-2">
          <Button type="link" onClick={() => openEditModal(user)}>
            Editar
          </Button>
          <Button type="link" danger onClick={() => handleDelete(user.id)}>
            Eliminar
          </Button>
        </div>
      )
    }
  ]

  if (loading) return <div className="h-screen flex items-center justify-center text-blue-400">Cargando...</div>

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Barra Lateral */}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} style={{ background: '#e6f0fa' }}>
        <div className="text-center py-6 text-lg font-bold text-blue-600">Admin</div>
        <Menu theme="light" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<UserOutlined />}>
            Usuarios
          </Menu.Item>
          <Menu.Item key="2" icon={<LogoutOutlined />} onClick={handleLogout}>
            Cerrar Sesión
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Contenido principal */}
      <Layout>
        {/* Navbar Superior */}
        <Header style={{ background: '#d0e5f7', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <h1 className="text-xl text-blue-800 font-bold">Panel de Administración</h1>
        </Header>

        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', borderRadius: '8px' }}>
          <h2 className="text-2xl font-semibold text-blue-700 mb-6">Usuarios Registrados</h2>

          <Table
            dataSource={users}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
            bordered
          />
        </Content>
      </Layout>

      {/* Modal para editar usuario */}
      <Modal
        title="Editar UsuarioXXXXX"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleUpdate}
        okText="Actualizar"
        cancelText="Cancelar"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Nombre" rules={[{ required: true, message: 'Ingrese el nombre' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Ingrese el email' }]}>
            <Input type="email" />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input.Password placeholder="Dejar vacío si no deseas cambiar" />
          </Form.Item>
          <Form.Item name="role" label="Rol" rules={[{ required: true, message: 'Seleccione el rol' }]}>
            <Select>
              <Select.Option value="admin">ADMIN</Select.Option>
              <Select.Option value="user">USER</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}
