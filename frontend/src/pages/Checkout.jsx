import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, DollarSign, Building, ArrowRight } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const Checkout = () => {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()
  const { user, token } = useAuth() // Obtener token directamente
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState({
    deliveryAddress: user?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      reference: ''
    },
    paymentMethod: 'efectivo', // Solo efectivo
    notes: ''
  })

  // Verificar autenticación al cargar
  useEffect(() => {
    if (!user || !token) {
      navigate('/login', { state: { from: '/checkout' } })
    }
  }, [user, token, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setOrderData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setOrderData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Verificar que tenemos token
    const currentToken = localStorage.getItem('token')
    if (!currentToken) {
      alert('❌ Debes iniciar sesión para realizar un pedido')
      navigate('/login')
      return
    }

    try {
      const orderItems = items.map(item => ({
        product: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit
      }))

      const orderPayload = {
        items: orderItems,
        deliveryAddress: orderData.deliveryAddress,
        paymentMethod: 'efectivo',
        notes: orderData.notes
      }

      console.log('🛒 Enviando pedido:', orderPayload)
      console.log('🔑 Token:', currentToken ? 'Presente' : 'Ausente')

      const response = await axios.post('/api/orders', orderPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        }
      })

      console.log('✅ Pedido creado:', response.data)

      if (response.status === 201) {
        const order = response.data
        clearCart()
        
        // Mostrar mensaje de éxito
        alert(`🛒 ¡Pedido realizado con éxito!\n\n📋 Número de pedido: #${order._id.slice(-6)}\n💰 Total: $${order.totalAmount.toFixed(2)} COP\n💳 Pago: Efectivo al recibir\n🚚 Entrega estimada: 45 minutos\n\n📧 Recibirás una confirmación por correo.\n\nEl administrador ha sido notificado y está procesando tu pedido.`)
        
        navigate('/orders', { 
          state: { 
            message: '¡Pedido realizado correctamente!',
            orderId: order._id 
          } 
        })
      }
    } catch (error) {
      console.error('❌ Error completo:', error)
      
      if (error.response?.status === 401) {
        alert('❌ Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
        navigate('/login')
      } else {
        alert(`❌ Error al realizar el pedido:\n${error.response?.data?.message || error.message || 'Error desconocido'}`)
      }
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    navigate('/cart')
    return null
  }

  // Debug info
  console.log('🔍 Estado de autenticación:', { 
    user: user?.name, 
    token: token ? 'Presente' : 'Ausente',
    itemsCount: items.length 
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Finalizar Compra</h1>
        <p className="text-gray-600 mt-2">Revisa tu pedido y completa los datos de entrega</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Address */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Dirección de Entrega</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calle y Número *
                  </label>
                  <input
                    type="text"
                    name="deliveryAddress.street"
                    value={orderData.deliveryAddress.street}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.city"
                      value={orderData.deliveryAddress.city}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.state"
                      value={orderData.deliveryAddress.state}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="deliveryAddress.zipCode"
                      value={orderData.deliveryAddress.zipCode}
                      onChange={handleChange}
                      className="input"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia (Opcional)
                  </label>
                  <textarea
                    name="deliveryAddress.reference"
                    value={orderData.deliveryAddress.reference}
                    onChange={handleChange}
                    className="input"
                    rows={2}
                    placeholder="Edificio, apartamento, puntos de referencia..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method - Solo Efectivo */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Método de Pago</h2>
              <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="efectivo"
                    checked={orderData.paymentMethod === 'efectivo'}
                    onChange={handleChange}
                    className="mr-3"
                    disabled
                  />
                  <DollarSign className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Pago en Efectivo</p>
                    <p className="text-sm text-green-600">Paga al recibir tu pedido</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-green-700 bg-green-100 p-2 rounded">
                  💡 El repartidor cobrará el monto total al momento de la entrega
                </p>
              </div>
            </div>

            {/* Order Notes */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Notas del Pedido</h2>
              <textarea
                name="notes"
                value={orderData.notes}
                onChange={handleChange}
                className="input"
                rows={3}
                placeholder="Instrucciones especiales para tu pedido..."
              />
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
            
            {/* Order Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{item.quantity}x</span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">
                    ${(item.price * item.quantity).toFixed(2)} COP
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)} COP</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pago</span>
                <span className="text-green-600 font-medium">Efectivo (al recibir)</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)} COP</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn btn-primary flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  Realizar Pedido
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            {/* Benefits */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Beneficios</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>✓ Envío gratis en pedidos sobre $50</li>
                <li>✓ Entrega estimada: 45 minutos</li>
                <li>✓ Pago seguro</li>
                <li>✓ Productos frescos garantizados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
