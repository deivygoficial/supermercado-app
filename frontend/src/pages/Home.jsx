import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Clock, Truck, X, Edit2 } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [productsByCategory, setProductsByCategory] = useState({})
  const [loading, setLoading] = useState(true)
  const [editingCategories, setEditingCategories] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar productos destacados
        const featuredResponse = await fetch('/api/products?featured=true&limit=8')
        const featuredData = await featuredResponse.json()
        setFeaturedProducts(featuredData.products || [])

        // Cargar categorías disponibles
        const categoriesResponse = await fetch('/api/products/categories/list')
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)

        // Cargar productos por categoría
        const categoryProducts = {}
        for (const category of categoriesData) {
          const productsResponse = await fetch(`/api/products?category=${category}&limit=4`)
          const productsData = await productsResponse.json()
          categoryProducts[category] = productsData.products || []
        }
        setProductsByCategory(categoryProducts)
      } catch (error) {
        console.error('Error al cargar datos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddToCart = (product) => {
    addToCart(product)
  }

  const deleteCategory = async (category) => {
    if (!confirm(`¿Estás seguro de eliminar la categoría "${getCategoryInfo(category).name}"? Esto eliminará todos los productos en esta categoría.`)) {
      return
    }

    try {
      const currentToken = localStorage.getItem('token')
      
      // Eliminar todos los productos de la categoría
      const products = productsByCategory[category] || []
      for (const product of products) {
        await fetch(`/api/products/${product._id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${currentToken}` }
        })
      }

      // Recargar datos
      const fetchData = async () => {
        const featuredResponse = await fetch('/api/products?featured=true&limit=8')
        const featuredData = await featuredResponse.json()
        setFeaturedProducts(featuredData.products || [])

        const categoriesResponse = await fetch('/api/products/categories/list')
        const categoriesData = await categoriesResponse.json()
        setCategories(categoriesData)

        const categoryProducts = {}
        for (const cat of categoriesData) {
          const productsResponse = await fetch(`/api/products?category=${cat}&limit=4`)
          const productsData = await productsResponse.json()
          categoryProducts[cat] = productsData.products || []
        }
        setProductsByCategory(categoryProducts)
      }

      await fetchData()
      alert(`Categoría "${getCategoryInfo(category).name}" eliminada exitosamente`)
    } catch (error) {
      console.error('Error al eliminar categoría:', error)
      alert('Error al eliminar la categoría')
    }
  }

  const getCategoryInfo = (category) => {
    const categoryMap = {
      'frutas': { name: 'Frutas', icon: '🍎', color: 'bg-red-100 text-red-600' },
      'verduras': { name: 'Verduras', icon: '🥬', color: 'bg-green-100 text-green-600' },
      'lacteos': { name: 'Lácteos', icon: '🥛', color: 'bg-blue-100 text-blue-600' },
      'carnes': { name: 'Carnes', icon: '🥩', color: 'bg-pink-100 text-pink-600' },
      'panaderia': { name: 'Panadería', icon: '🍞', color: 'bg-yellow-100 text-yellow-600' },
      'bebidas': { name: 'Bebidas', icon: '🥤', color: 'bg-purple-100 text-purple-600' },
      'snacks': { name: 'Snacks', icon: '🍿', color: 'bg-orange-100 text-orange-600' },
      'limpieza': { name: 'Limpieza', icon: '🧹', color: 'bg-gray-100 text-gray-600' },
      'alcohol': { name: 'Bebidas Alcohólicas', icon: '🍷', color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' },
      'otros': { name: 'Otros', icon: '📦', color: 'bg-indigo-100 text-indigo-600' }
    }
    return categoryMap[category] || categoryMap.otros
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-2xl p-8 md:p-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Tu supermercado online, delivery rápido
          </h1>
          <p className="text-xl mb-6 text-primary-100">
            Compra frescos y productos de calidad desde la comodidad de tu hogar
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="btn bg-white text-primary-600 hover:bg-gray-100">
              Ver Productos
            </Link>
            <Link to="/register" className="btn border-2 border-white text-white hover:bg-white hover:text-primary-600">
              Registrarse
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Delivery Rápido</h3>
          <p className="text-gray-600">Recibe tu pedido en menos de 45 minutos</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Horario Extendido</h3>
          <p className="text-gray-600">Abierto de 8am a 10pm todos los días</p>
        </div>
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Productos Frescos</h3>
          <p className="text-gray-600">Calidad garantizada en todos nuestros productos</p>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Categorías Populares</h2>
          {user?.role === 'admin' && (
            <button
              onClick={() => setEditingCategories(!editingCategories)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              {editingCategories ? 'Terminar' : 'Editar'}
            </button>
          )}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const categoryInfo = getCategoryInfo(category)
                const products = productsByCategory[category] || []
                return (
                  <div key={category} className="relative group">
                    <Link
                      to={`/products?category=${category}`}
                      className="card hover:shadow-md transition-shadow cursor-pointer text-center block"
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${categoryInfo.color}`}>
                        <span className="text-2xl">{categoryInfo.icon}</span>
                      </div>
                      <p className="font-medium text-gray-900">{categoryInfo.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{products.length} productos</p>
                    </Link>
                    
                    {editingCategories && user?.role === 'admin' && (
                      <button
                        onClick={() => deleteCategory(category)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar categoría"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Products by Category */}
            {categories.map((category) => {
              const categoryInfo = getCategoryInfo(category)
              const products = productsByCategory[category] || []
              
              if (products.length === 0) return null
              
              return (
                <div key={category} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <span className="text-2xl">{categoryInfo.icon}</span>
                      {categoryInfo.name}
                    </h3>
                    <Link 
                      to={`/products?category=${category}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      Ver todos →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {products.slice(0, 4).map((product) => (
                      <div key={product._id} className="card hover:shadow-lg transition-shadow">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                        <h4 className="font-medium text-gray-900 mb-2 text-sm">{product.name}</h4>
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-lg font-bold text-primary-600">
                            ${product.price.toFixed(2)} COP
                          </span>
                          <span className="text-xs text-gray-500">/{product.unit}</span>
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full btn btn-primary btn-sm flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Special Alcohol Section */}
      {!loading && productsByCategory.alcohol && productsByCategory.alcohol.length > 0 && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 p-8 md:p-12 text-white">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="flex justify-center items-center gap-3 mb-4">
                <span className="text-4xl">🍷</span>
                <h2 className="text-3xl md:text-4xl font-bold">Bebidas Alcohólicas Premium</h2>
                <span className="text-4xl">🍾</span>
              </div>
              <p className="text-lg text-purple-100 max-w-2xl mx-auto">
                Descubre nuestra selección exclusiva de vinos, licores y cervezas de alta calidad
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {productsByCategory.alcohol.slice(0, 8).map((product) => (
                <div key={product._id} className="bg-white/10 backdrop-blur-md rounded-xl p-4 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-lg mb-4"
                  />
                  <h3 className="font-semibold text-white mb-2 text-sm">{product.name}</h3>
                  <p className="text-xs text-purple-100 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-bold text-yellow-300">
                      ${product.price.toFixed(2)} COP
                    </span>
                    <span className="text-xs text-purple-200">/{product.unit}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Agregar
                  </button>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link 
                to="/products?category=alcohol"
                className="inline-flex items-center gap-2 bg-white text-purple-900 font-bold py-3 px-8 rounded-full hover:bg-purple-100 transition-all duration-300 transform hover:scale-105"
              >
                <span>Explorar Toda la Colección</span>
                <span className="text-xl">→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Productos Destacados</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <div key={product._id} className="card hover:shadow-lg transition-shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-bold text-primary-600">
                    ${product.price.toFixed(2)} COP
                  </span>
                  <span className="text-sm text-gray-500">/{product.unit}</span>
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full btn btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Agregar
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 rounded-2xl p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para hacer tu compra?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Regístrate hoy y obtén envío gratis en tu primer pedido. Compra frescos, 
          lácteos, carnes y mucho más desde la comodidad de tu hogar.
        </p>
        <Link to="/register" className="btn btn-primary">
          Crear Cuenta Gratuita
        </Link>
      </section>
    </div>
  )
}

export default Home
