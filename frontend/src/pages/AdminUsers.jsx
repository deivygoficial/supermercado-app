import React, { useState, useEffect } from 'react'
import { Users, Edit2, Trash2, Shield, User, Mail, Phone, MapPin, Calendar, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const AdminUsers = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      reference: ''
    },
    role: 'cliente'
  })

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/'
      return
    }
    fetchUsers()
  }, [user])

  const fetchUsers = async () => {
    try {
      const currentToken = localStorage.getItem('token')
      const response = await axios.get('/api/users', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const currentToken = localStorage.getItem('token')
      
      if (editingUser) {
        await axios.put(`/api/users/${editingUser._id}`, formData, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        })
        console.log('✅ Usuario actualizado')
      } else {
        await axios.post('/api/auth/register', formData, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        })
        console.log('✅ Usuario creado')
      }

      resetForm()
      fetchUsers()
    } catch (error) {
      console.error('❌ Error al guardar usuario:', error)
      alert('Error al guardar el usuario')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return

    try {
      const currentToken = localStorage.getItem('token')
      await axios.delete(`/api/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      console.log('✅ Usuario eliminado')
      fetchUsers()
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error)
      alert('Error al eliminar el usuario')
    }
  }

  const toggleUserRole = async (userId, newRole) => {
    try {
      const currentToken = localStorage.getItem('token')
      await axios.put(`/api/users/${userId}`, { role: newRole }, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      fetchUsers()
    } catch (error) {
      console.error('❌ Error al cambiar rol:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        reference: ''
      },
      role: 'cliente'
    })
    setEditingUser(null)
    setShowForm(false)
  }

  const editUser = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        reference: ''
      },
      role: user.role
    })
    setEditingUser(user)
    setShowForm(true)
  }

  if (loading && users.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando usuarios...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administra los usuarios del sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Users className="h-5 w-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administradores</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Clientes</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'cliente').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos Hoy</p>
              <p className="text-2xl font-bold text-orange-600">
                {users.filter(u => {
                  const today = new Date().toDateString()
                  const userDate = new Date(u.lastLogin || u.createdAt).toDateString()
                  return today === userDate
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <EyeOff className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rol *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="input"
                      required
                    >
                      <option value="cliente">Cliente</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>

                {/* Address Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Dirección</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Calle y Número
                      </label>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: {...formData.address, street: e.target.value}
                        })}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: {...formData.address, city: e.target.value}
                        })}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <input
                        type="text"
                        value={formData.address.state}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: {...formData.address, state: e.target.value}
                        })}
                        className="input"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código Postal
                      </label>
                      <input
                        type="text"
                        value={formData.address.zipCode}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: {...formData.address, zipCode: e.target.value}
                        })}
                        className="input"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Referencia
                      </label>
                      <textarea
                        value={formData.address.reference}
                        onChange={(e) => setFormData({
                          ...formData, 
                          address: {...formData.address, reference: e.target.value}
                        })}
                        className="input"
                        rows={2}
                        placeholder="Edificio, apartamento, puntos de referencia..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {editingUser ? 'Actualizar' : 'Crear'} Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Usuario</th>
                <th className="text-left py-3 px-4">Contacto</th>
                <th className="text-left py-3 px-4">Rol</th>
                <th className="text-left py-3 px-4">Dirección</th>
                <th className="text-left py-3 px-4">Registro</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium">{userItem.name}</p>
                        <p className="text-sm text-gray-600">{userItem.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {userItem.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-gray-500" />
                          {userItem.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3 w-3 text-gray-500" />
                        {userItem.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      userItem.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {userItem.role === 'admin' ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {userItem.address ? (
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span>{userItem.address.street}, {userItem.address.city}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Sin dirección</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p>{new Date(userItem.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-600">
                        {new Date(userItem.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => editUser(userItem)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleUserRole(userItem._id, userItem.role === 'admin' ? 'cliente' : 'admin')}
                        className={`p-2 rounded ${
                          userItem.role === 'admin' 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={userItem.role === 'admin' ? 'Hacer cliente' : 'Hacer admin'}
                      >
                        {userItem.role === 'admin' ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </button>
                      {userItem._id !== user._id && (
                        <button
                          onClick={() => handleDelete(userItem._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay usuarios
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando tu primer usuario
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Agregar Usuario
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminUsers
