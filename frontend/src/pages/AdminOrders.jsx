import React, { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, Truck, XCircle, AlertCircle, Eye, MessageSquare, Filter, RefreshCw, Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import NotificationSystem from '../components/NotificationSystem'
import axios from 'axios'

const AdminOrders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [note, setNote] = useState('')
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [lastCheckedTime, setLastCheckedTime] = useState(new Date())

  const statusOptions = [
    { value: 'pendiente', label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'confirmado', label: 'Confirmado', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
    { value: 'preparando', label: 'Preparando', icon: Package, color: 'bg-purple-100 text-purple-800' },
    { value: 'en_camino', label: 'En Camino', icon: Truck, color: 'bg-orange-100 text-orange-800' },
    { value: 'entregado', label: 'Entregado', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    { value: 'cancelado', label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/'
      return
    }
    fetchOrders()
    
    // Conectar a notificaciones en tiempo real
    connectToNotifications()
  }, [user, statusFilter])

  useEffect(() => {
    // Contar pedidos nuevos (creados después de la última vez que se revisó)
    const newOrders = orders.filter(order => 
      new Date(order.createdAt) > lastCheckedTime && order.status === 'pendiente'
    )
    setNewOrdersCount(newOrders.length)
  }, [orders, lastCheckedTime])

  const connectToNotifications = () => {
    try {
      const currentToken = localStorage.getItem('token')
      
      const eventSource = new EventSource('/api/orders/notifications', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      })

      eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)
          
          if (notification.type === 'new_order') {
            // Actualizar la lista de pedidos
            fetchOrders()
            
            // Incrementar contador de nuevos pedidos
            setNewOrdersCount(prev => prev + 1)
            
            // Mostrar alerta visual
            showOrderAlert(notification.order)
          }
        } catch (error) {
          console.error('Error parsing notification:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('Error en conexión de notificaciones:', error)
        // Reintentar conexión después de 5 segundos
        setTimeout(connectToNotifications, 5000)
      }
    } catch (error) {
      console.error('Error al conectar notificaciones:', error)
    }
  }

  const showOrderAlert = (order) => {
    // Crear alerta visual flotante
    const alertDiv = document.createElement('div')
    alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-bounce max-w-sm'
    alertDiv.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <p class="font-semibold">¡Nuevo Pedido!</p>
          <p class="text-sm opacity-90">${order.customerName} - ${order.totalAmount?.toFixed(2)} COP</p>
        </div>
      </div>
    `
    
    document.body.appendChild(alertDiv)
    
    // Remover alerta después de 5 segundos
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv)
      }
    }, 5000)
  }

  const markOrdersAsChecked = () => {
    setLastCheckedTime(new Date())
    setNewOrdersCount(0)
  }

  const fetchOrders = async () => {
    try {
      const currentToken = localStorage.getItem('token')
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const response = await axios.get(`/api/orders${params}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('❌ Error al cargar pedidos:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus, note = '') => {
    setUpdatingStatus(orderId)
    try {
      const currentToken = localStorage.getItem('token')
      const response = await axios.put(`/api/orders/${orderId}/status`, 
        { status: newStatus, note }, 
        { headers: { 'Authorization': `Bearer ${currentToken}` } }
      )
      console.log(`✅ Pedido #${orderId.slice(-6)} actualizado a: ${newStatus}`)
      console.log('Respuesta del servidor:', response.data)
      
      // Actualizar la lista de pedidos
      fetchOrders()
      setSelectedOrder(null)
      setShowNoteModal(false)
      setNote('')
      
      // Mostrar mensaje de éxito
      alert(`✅ Estado actualizado correctamente a "${newStatus}"`)
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error)
      console.error('Detalles del error:', error.response?.data)
      
      // Mostrar mensaje de error más específico
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Error al actualizar el estado del pedido'
      alert(`❌ Error: ${errorMessage}`)
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusInfo = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleStatusChange = (order, newStatus) => {
    if (newStatus === 'cancelado' || newStatus === 'en_camino' || newStatus === 'entregado') {
      setSelectedOrder(order)
      setShowNoteModal(true)
    } else {
      updateOrderStatus(order._id, newStatus)
    }
  }

  const confirmStatusChange = () => {
    if (selectedOrder) {
      const newStatus = document.querySelector('input[name="status"]:checked')?.value
      if (newStatus) {
        updateOrderStatus(selectedOrder._id, newStatus, note)
      }
    }
  }

  const StatsCards = () => {
    const stats = statusOptions.map(status => ({
      ...status,
      count: orders.filter(o => o.status === status.value).length
    }))

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.value} className="card text-center">
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <Icon className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">{stat.count}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          )
        })}
      </div>
    )
  }

  if (loading && orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando pedidos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
            {newOrdersCount > 0 && (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {newOrdersCount} nueva{newOrdersCount > 1 ? 's' : ''} solicitud{newOrdersCount > 1 ? 'es' : ''}
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-2">Administra el estado de todos los pedidos</p>
        </div>
        <div className="flex items-center gap-3">
          {newOrdersCount > 0 && (
            <button
              onClick={markOrdersAsChecked}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Marcar como revisadas
            </button>
          )}
          <button
            onClick={fetchOrders}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-48"
          >
            <option value="">Todos los pedidos</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {statusFilter && (
            <button
              onClick={() => setStatusFilter('')}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Limpiar filtro
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Pedido</th>
                <th className="text-left py-3 px-4">Cliente</th>
                <th className="text-left py-3 px-4">Productos</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">#{order._id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">{order.items.length} productos</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{order.user?.name}</p>
                      <p className="text-sm text-gray-600">{order.user?.email}</p>
                      {order.user?.phone && (
                        <p className="text-sm text-gray-600">{order.user?.phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs">
                      {order.items.slice(0, 2).map((item, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          {item.quantity}x {item.name || item.product?.name}
                        </p>
                      ))}
                      {order.items.length > 2 && (
                        <p className="text-sm text-gray-500">
                          +{order.items.length - 2} más...
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold">${order.totalAmount.toFixed(2)} COP</p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p>{formatDate(order.createdAt)}</p>
                      {order.estimatedDeliveryTime && (
                        <p className="text-gray-600">
                          Entrega: {formatDate(order.estimatedDeliveryTime)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusInfo(order.status).color}`}>
                      {getStatusInfo(order.status).label}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order, e.target.value)}
                        disabled={updatingStatus === order._id}
                        className="text-sm border rounded px-2 py-1 disabled:opacity-50"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay pedidos {statusFilter && `con estado "${getStatusInfo(statusFilter).label}"`}
              </h3>
              <p className="text-gray-600">
                {statusFilter ? 'Intenta con otro filtro' : 'Los pedidos aparecerán aquí cuando los clientes realicen compras'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && !showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detalles del Pedido #{selectedOrder._id.slice(-6)}</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-3">Información del Cliente</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nombre:</strong> {selectedOrder.user?.name}</p>
                    <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                    <p><strong>Teléfono:</strong> {selectedOrder.user?.phone || 'No proporcionado'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Dirección de Entrega</h3>
                  <div className="space-y-1 text-sm">
                    <p>{selectedOrder.deliveryAddress.street}</p>
                    <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</p>
                    <p>{selectedOrder.deliveryAddress.zipCode}</p>
                    {selectedOrder.deliveryAddress.reference && (
                      <p className="text-gray-600">Ref: {selectedOrder.deliveryAddress.reference}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Productos del Pedido</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.name || item.product?.name}</p>
                        <p className="text-sm text-gray-600">{item.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{item.quantity} x ${item.price.toFixed(2)} COP</p>
                        <p className="font-semibold">${(item.quantity * item.price).toFixed(2)} COP</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Historial de Estados</h3>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                        <div className={`w-8 h-8 ${getStatusInfo(history.status).color} rounded-full flex items-center justify-center`}>
                          {React.createElement(getStatusInfo(history.status).icon, { className: 'h-4 w-4' })}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{getStatusInfo(history.status).label}</p>
                          <p className="text-sm text-gray-600">{formatDate(history.timestamp)}</p>
                          {history.note && (
                            <p className="text-sm text-blue-600">Nota: {history.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total del Pedido:</span>
                  <span className="text-xl font-bold text-primary-600">
                    ${selectedOrder.totalAmount.toFixed(2)} COP
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="mb-4">
                    <p className="font-semibold mb-2">Notas del Cliente:</p>
                    <p className="text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNoteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-bold mb-4">Agregar Nota al Cambio de Estado</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo estado:
                  </label>
                  <div className="space-y-2">
                    {statusOptions.map(option => (
                      <label key={option.value} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="status"
                          value={option.value}
                          defaultChecked={option.value === selectedOrder.status}
                        />
                        <span className={`px-2 py-1 rounded-full text-xs ${option.color}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nota (opcional):
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Ej: Cliente solicitó entrega en puerta principal..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowNoteModal(false)
                    setSelectedOrder(null)
                    setNote('')
                  }}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmStatusChange}
                  disabled={updatingStatus === selectedOrder._id}
                  className="btn btn-primary"
                >
                  {updatingStatus === selectedOrder._id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    'Confirmar Cambio'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminOrders
