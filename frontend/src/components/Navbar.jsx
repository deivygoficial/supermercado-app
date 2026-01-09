import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Menu, X, Store } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">SuperMercado</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors">
              Inicio
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary-600 transition-colors">
              Productos
            </Link>
            {isAuthenticated && (
              <>
                {user?.role !== 'admin' && (
                  <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition-colors">
                    Mis Pedidos
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <>
                    <Link to="/admin" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                      Panel Admin
                    </Link>
                    <Link to="/admin/products" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                      Productos
                    </Link>
                    <Link to="/admin/orders" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                      Pedidos
                    </Link>
                    <Link to="/admin/users" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                      Usuarios
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors">
                  <User className="h-5 w-5" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-primary text-sm">
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/products"
                className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                onClick={() => setIsMenuOpen(false)}
              >
                Productos
              </Link>
              {isAuthenticated && (
                <>
                  {user?.role !== 'admin' && (
                    <Link
                      to="/orders"
                      className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mis Pedidos
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        to="/admin"
                        className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Panel Admin
                      </Link>
                      <Link
                        to="/admin/products"
                        className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Productos
                      </Link>
                      <Link
                        to="/admin/orders"
                        className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Pedidos
                      </Link>
                      <Link
                        to="/admin/users"
                        className="text-gray-700 hover:text-primary-600 transition-colors px-2 py-1 font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Usuarios
                      </Link>
                    </>
                  )}
                </>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span className="text-sm">{user?.name}</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Link
                      to="/login"
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-primary text-sm"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
