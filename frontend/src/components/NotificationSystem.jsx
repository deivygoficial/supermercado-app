import React, { useState, useEffect, useRef } from 'react'
import { Bell, X, ShoppingCart, User, MapPin, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const NotificationSystem = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const eventSourceRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  useEffect(() => {
    if (user?.role !== 'admin') return

    const connectNotifications = () => {
      try {
        const currentToken = localStorage.getItem('token')
        
        // Cerrar conexión existente si hay una
        if (eventSourceRef.current) {
          eventSourceRef.current.close()
        }

        // Crear nueva conexión SSE
        eventSourceRef.current = new EventSource(`/api/orders/notifications`, {
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        })

        eventSourceRef.current.onopen = () => {
          console.log('🔔 Conectado a notificaciones en tiempo real')
        }

        eventSourceRef.current.onmessage = (event) => {
          try {
            const notification = JSON.parse(event.data)
            
            if (notification.type === 'new_order') {
              // Agregar notificación nueva
              const newNotification = {
                id: Date.now(),
                type: 'new_order',
                title: '🛒 Nuevo Pedido Recibido',
                message: `${notification.order.customerName} ha realizado un pedido`,
                data: notification.order,
                timestamp: new Date(),
                read: false
              }

              setNotifications(prev => [newNotification, ...prev])
              setUnreadCount(prev => prev + 1)

              // Mostrar alerta visual
              showVisualAlert(newNotification)
            }
          } catch (error) {
            console.error('Error parsing notification:', error)
          }
        }

        eventSourceRef.current.onerror = (error) => {
          console.error('Error en conexión de notificaciones:', error)
          
          // Reintentar conexión después de 5 segundos
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Reintentando conectar a notificaciones...')
            connectNotifications()
          }, 5000)
        }
      } catch (error) {
        console.error('Error al conectar notificaciones:', error)
      }
    }

    connectNotifications()

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [user])

  const showVisualAlert = (notification) => {
    // Crear alerta visual flotante
    const alertDiv = document.createElement('div')
    alertDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 animate-pulse max-w-sm cursor-pointer hover:bg-green-600 transition-colors'
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
          <p class="font-semibold">Nuevo Pedido</p>
          <p class="text-sm opacity-90">${notification.message}</p>
          <p class="text-xs opacity-75 mt-1">Click para ver detalles →</p>
        </div>
      </div>
    `
    
    // Agregar evento de clic para navegar a gestión de pedidos
    alertDiv.addEventListener('click', () => {
      window.location.href = '/admin/orders'
    })
    
    document.body.appendChild(alertDiv)
    
    // Remover alerta después de 5 segundos
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv)
      }
    }, 5000)
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    // Navegar a gestión de pedidos al hacer clic en una notificación
    window.location.href = '/admin/orders'
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const clearAll = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`
    return `Hace ${Math.floor(diff / 86400000)} d`
  }

  if (user?.role !== 'admin') return null

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {notification.type === 'new_order' && (
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <ShoppingCart className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {notification.message}
                            </p>
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {notification.data.customerName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ShoppingCart className="h-3 w-3" />
                                  {notification.data.itemCount} productos
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {notification.data.deliveryAddress?.street}
                                </span>
                                <span className="font-semibold text-green-600">
                                  ${notification.data.totalAmount?.toFixed(2)} COP
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Clock className="h-3 w-3" />
                                {formatTime(notification.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <button
                onClick={clearAll}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Limpiar todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationSystem
