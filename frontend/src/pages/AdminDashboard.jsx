import React, { useState, useEffect } from 'react'
import { Package, Users, ShoppingCart, TrendingUp, Bell, Clock, CheckCircle, Truck, XCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import NotificationSystem from '../components/NotificationSystem'
import axios from 'axios'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/'
      return
    }
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      const currentToken = localStorage.getItem('token')
      
      if (!currentToken) {
        console.error('❌ Admin: No hay token disponible')
        return
      }

      // Fetch stats con autenticación
      const [ordersRes, usersRes, productsRes] = await Promise.all([
        axios.get('/api/orders', {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        }),
        axios.get('/api/users', {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        }),
        axios.get('/api/products', {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        })
      ])

      const ordersData = ordersRes.data
      const usersData = usersRes.data
      const productsData = productsRes.data

      const pendingCount = ordersData.orders?.filter(o => o.status === 'pendiente').length || 0

      setStats({
        totalOrders: ordersData.total || 0,
        totalUsers: usersData.total || 0,
        totalProducts: productsData.products?.length || 0,
        pendingOrders: pendingCount
      })

      setRecentOrders(ordersData.orders?.slice(0, 5) || [])

      // Notificación en consola para administrador
      if (pendingCount > 0) {
        console.log(`🔔 Tienes ${pendingCount} pedido${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''} por atender!`)
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error)
      if (error.response?.status === 401) {
        console.error('❌ Admin: Token inválido o expirado')
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'confirmado':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'en camino':
        return <Truck className="h-4 w-4 text-orange-500" />
      case 'entregado':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelado':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Package className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmado':
        return 'bg-blue-100 text-blue-800'
      case 'en camino':
        return 'bg-orange-100 text-orange-800'
      case 'entregado':
        return 'bg-green-100 text-green-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando panel de administración...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Gestiona pedidos, productos y usuarios</p>
        </div>
        <NotificationSystem />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pedidos Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Pedidos Recientes</h2>
            <a href="/orders" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Ver todos →
            </a>
          </div>
          <div className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay pedidos recientes</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <p className="font-medium">#{order._id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{order.user?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${order.totalAmount.toFixed(2)} COP</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            <a href="/products" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <Package className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium">Gestionar Productos</p>
            </a>
            <a href="/orders" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <ShoppingCart className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium">Ver Pedidos</p>
            </a>
            <a href="/users" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <Users className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium">Gestionar Usuarios</p>
            </a>
            <a href="/profile" className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <p className="font-medium">Estadísticas</p>
            </a>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {stats.pendingOrders > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Clock className="h-6 w-6 text-yellow-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {stats.pendingOrders}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-yellow-800 text-lg">
                🚨 {stats.pendingOrders} pedido{stats.pendingOrders > 1 ? 's NUEVOS' : ' NUEVO'} por atender!
              </p>
              <p className="text-yellow-700">
                Los clientes están esperando confirmación de sus pedidos. 
                <a href="/orders" className="ml-2 text-yellow-800 underline font-medium">
                  Ver pedidos →
                </a>
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.pendingOrders === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">
                ✅ Todos los pedidos están al día
              </p>
              <p className="text-sm text-green-600">
                No hay pedidos pendientes en este momento
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
