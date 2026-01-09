import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

const Cart = () => {
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId) => {
    removeFromCart(productId)
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <ShoppingCart className="h-16 w-16 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-6">
          ¡Agrega algunos productos para comenzar tu compra!
        </p>
        <Link to="/products" className="btn btn-primary">
          Ver Productos
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tu Carrito</h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Vaciar Carrito
          </button>
        </div>

        {items.map((item) => (
          <div key={item._id} className="card">
            <div className="flex gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      ${item.price.toFixed(2)} COP / {item.unit}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item._id)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                      className="p-1 rounded border border-gray-300 hover:bg-gray-100"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      ${(item.price * item.quantity).toFixed(2)} COP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="card sticky top-24">
          <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)} COP</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className="text-green-600">Gratis</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary-600">${total.toFixed(2)} COP</span>
              </div>
            </div>
          </div>

          {isAuthenticated ? (
            <Link
              to="/checkout"
              className="w-full btn btn-primary flex items-center justify-center gap-2"
            >
              Proceder al Pago
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 text-center">
                Inicia sesión para continuar con tu compra
              </p>
              <Link
                to="/login"
                state={{ from: '/cart' }}
                className="w-full btn btn-primary"
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/register"
                state={{ from: '/cart' }}
                className="w-full btn btn-secondary"
              >
                Crear Cuenta
              </Link>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Beneficios</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Envío gratis en pedidos sobre $50 COP</li>
              <li>✓ Pago seguro</li>
              <li>✓ Devolución fácil</li>
              <li>✓ Productos frescos garantizados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
