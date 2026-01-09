import React, { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle, Truck, Eye, RefreshCw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const Orders = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const statusInfo = {
    pendiente: { label: 'Pendiente', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
    confirmado: { label: 'Confirmado', icon: CheckCircle, color: 'bg-blue-100 text-blue-800' },
    preparando: { label: 'Preparando', icon: Package, color: 'bg-purple-100 text-purple-800' },
    en_camino: { label: 'En Camino', icon: Truck, color: 'bg-orange-100 text-orange-800' },
    entregado: { label: 'Entregado', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
    cancelado: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-800' }
  }

  useEffect(() => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    fetchOrders()
  }, [user, statusFilter])

  const fetchOrders = async () => {
    try {
      const currentToken = localStorage.getItem('token')
      const params = statusFilter ? `?status=${statusFilter}` : ''
      const response = await axios.get(`/api/orders/my-orders${params}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error('❌ Error al cargar pedidos:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status) => {
    return statusInfo[status] || statusInfo.pendiente
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

  const getStatusProgress = (status) => {
    const progress = {
      pendiente: 0,
      confirmado: 20,
      preparando: 40,
      en_camino: 60,
      entregado: 100,
      cancelado: 0
    }
    return progress[status] || 0
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando tus pedidos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Mis Pedidos</h1>
          <p className="text-gray-600 mt-2">Revisa el estado y historial de tus pedidos</p>
        </div>
        <button
          onClick={fetchOrders}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </button>
      </div>

      {/* Status Filter */}
      <div className="card">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filtrar por estado:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-48"
          >
            <option value="">Todos los pedidos</option>
            {Object.entries(statusInfo).map(([value, info]) => (
              <option key={value} value={value}>
                {info.label}
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

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No tienes pedidos {statusFilter && `con estado "${getStatusInfo(statusFilter).label}"`}
          </h3>
          <p className="text-gray-600 mb-6">
            {statusFilter ? 'Intenta con otro filtro' : 'Realiza tu primer pedido para verlo aquí'}
          </p>
          {!statusFilter && (
            <a href="/products" className="btn btn-primary">
              Ver Productos
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStatusInfo = getStatusInfo(order.status)
            const StatusIcon = currentStatusInfo.icon
            
            return (
              <div key={order._id} className="card">
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Pedido #{order._id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600">
                      Realizado el {formatDate(order.createdAt)}
                    </p>
                    {order.estimatedDeliveryTime && (
                      <p className="text-sm text-gray-600">
                        Entrega estimada: {formatDate(order.estimatedDeliveryTime)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${currentStatusInfo.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      {currentStatusInfo.label}
                    </span>
                    <p className="text-lg font-bold mt-2">
                      ${order.totalAmount.toFixed(2)} COP
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {order.status !== 'cancelado' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-2">
                      <span>Pendiente</span>
                      <span>Confirmado</span>
                      <span>Preparando</span>
                      <span>En Camino</span>
                      <span>Entregado</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getStatusProgress(order.status)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Productos:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span>{item.quantity}x {item.name || item.product?.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)} COP</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status History */}
                {order.statusHistory && order.statusHistory.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Historial del Pedido:</h4>
                    <div className="space-y-2">
                      {order.statusHistory.map((history, index) => {
                        const historyStatusInfo = getStatusInfo(history.status)
                        const HistoryIcon = historyStatusInfo.icon
                        
                        return (
                          <div key={index} className="flex items-center gap-3 text-sm">
                            <div className={`w-6 h-6 ${historyStatusInfo.color} rounded-full flex items-center justify-center`}>
                              <HistoryIcon className="h-3 w-3" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">{historyStatusInfo.label}</span>
                              <span className="text-gray-600 ml-2">
                                {formatDate(history.timestamp)}
                              </span>
                              {history.note && (
                                <p className="text-blue-600 text-xs mt-1">Nota: {history.note}</p>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Ver Detalles
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
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

              {/* Delivery Address */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Dirección de Entrega</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>{selectedOrder.deliveryAddress.street}</p>
                  <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</p>
                  <p>{selectedOrder.deliveryAddress.zipCode}</p>
                  {selectedOrder.deliveryAddress.reference && (
                    <p className="text-gray-600 mt-2">Ref: {selectedOrder.deliveryAddress.reference}</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Resumen del Pedido</h3>
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

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold">Total del Pedido:</span>
                  <span className="text-xl font-bold text-primary-600">
                    ${selectedOrder.totalAmount.toFixed(2)} COP
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div>
                    <p className="font-semibold mb-2">Notas del Pedido:</p>
                    <p className="text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
