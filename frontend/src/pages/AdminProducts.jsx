import React, { useState, useEffect } from 'react'
import { Package, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Tag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const AdminProducts = () => {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [categories, setCategories] = useState([
    { value: 'frutas', label: 'Frutas' },
    { value: 'verduras', label: 'Verduras' },
    { value: 'lacteos', label: 'Lácteos' },
    { value: 'carnes', label: 'Carnes' },
    { value: 'panaderia', label: 'Panadería' },
    { value: 'bebidas', label: 'Bebidas' },
    { value: 'alcohol', label: 'Bebidas Alcohólicas' },
    { value: 'despensa', label: 'Despensa' },
    { value: 'congelados', label: 'Congelados' },
    { value: 'limpieza', label: 'Limpieza' },
    { value: 'otros', label: 'Otros' }
  ])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'frutas',
    image: '',
    unit: 'unidad',
    isActive: true,
    featured: false
  })

  const units = [
    { value: 'unidad', label: 'Unidad' },
    { value: 'kg', label: 'Kilogramo' },
    { value: 'g', label: 'Gramo' },
    { value: 'l', label: 'Litro' },
    { value: 'ml', label: 'Mililitro' },
    { value: 'botella', label: 'Botella' },
    { value: 'lata', label: 'Lata' },
    { value: 'docena', label: 'Docena' },
    { value: 'paquete', label: 'Paquete' }
  ]

  useEffect(() => {
    if (user?.role !== 'admin') {
      window.location.href = '/'
      return
    }
    fetchProducts()
  }, [user])

  const fetchProducts = async () => {
    try {
      const currentToken = localStorage.getItem('token')
      const response = await axios.get('/api/products', {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      setProducts(response.data.products || [])
    } catch (error) {
      console.error('❌ Error al cargar productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const currentToken = localStorage.getItem('token')
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      }

      if (editingProduct) {
        await axios.put(`/api/products/${editingProduct._id}`, productData, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        })
        console.log('✅ Producto actualizado')
      } else {
        await axios.post('/api/products', productData, {
          headers: { 'Authorization': `Bearer ${currentToken}` }
        })
        console.log('✅ Producto creado')
      }

      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('❌ Error al guardar producto:', error)
      alert('Error al guardar el producto')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return

    try {
      const currentToken = localStorage.getItem('token')
      await axios.delete(`/api/products/${productId}`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      console.log('✅ Producto eliminado')
      fetchProducts()
    } catch (error) {
      console.error('❌ Error al eliminar producto:', error)
      alert('Error al eliminar el producto')
    }
  }

  const toggleProductStatus = async (productId, isActive) => {
    try {
      const currentToken = localStorage.getItem('token')
      await axios.put(`/api/products/${productId}`, { isActive }, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      })
      fetchProducts()
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'frutas',
      image: '',
      unit: 'unidad',
      isActive: true,
      featured: false
    })
    setEditingProduct(null)
    setShowForm(false)
  }

  const addCategory = () => {
    if (newCategory.trim() && !categories.find(c => c.value === newCategory.toLowerCase())) {
      const categoryValue = newCategory.toLowerCase().replace(/\s+/g, '_')
      setCategories([...categories, { 
        value: categoryValue, 
        label: newCategory 
      }])
      setNewCategory('')
      setShowCategoryForm(false)
      console.log('✅ Nueva categoría agregada:', newCategory)
    }
  }

  const removeCategory = (categoryValue) => {
    // No permitir eliminar categorías si hay productos usándolas
    const productsInCategory = products.filter(p => p.category === categoryValue)
    if (productsInCategory.length > 0) {
      alert(`No puedes eliminar esta categoría porque hay ${productsInCategory.length} productos usándola`)
      return
    }
    
    setCategories(categories.filter(c => c.value !== categoryValue))
    console.log('✅ Categoría eliminada:', categoryValue)
  }

  const editProduct = (product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      unit: product.unit,
      isActive: product.isActive,
      featured: product.featured
    })
    setEditingProduct(product)
    setShowForm(true)
  }

  if (loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando productos...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Administración de Productos</h1>
          <p className="text-gray-600 mt-2">Gestiona tu inventario de productos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Productos</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-2xl font-bold text-green-600">
                {products.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactivos</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => !p.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <EyeOff className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Destacados</p>
              <p className="text-2xl font-bold text-purple-600">
                {products.filter(p => p.featured).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Tag className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Producto *
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
                      Precio (COP) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="input"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="input"
                      required
                    >
                      {units.map(unit => (
                        <option key={unit.value} value={unit.value}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL de Imagen
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="input"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="input"
                    rows={3}
                    placeholder="Describe el producto..."
                  />
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Producto Activo</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Destacado</span>
                  </label>
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
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {editingProduct ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Categories Management */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Gestión de Categorías</h2>
          <button
            onClick={() => setShowCategoryForm(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Categoría
          </button>
        </div>

        {/* Category Form */}
        {showCategoryForm && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Nombre de la nueva categoría"
                className="flex-1 input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addCategory()
                  }
                }}
              />
              <button
                onClick={addCategory}
                className="btn btn-primary"
              >
                Agregar
              </button>
              <button
                onClick={() => {
                  setShowCategoryForm(false)
                  setNewCategory('')
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Categories List */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <div
              key={category.value}
              className="px-3 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex items-center gap-2"
            >
              {category.label}
              {!['frutas', 'verduras', 'lacteos', 'carnes', 'panaderia', 'bebidas', 'despensa', 'congelados', 'limpieza', 'otros'].includes(category.value) && (
                <button
                  onClick={() => removeCategory(category.value)}
                  className="ml-2 text-red-600 hover:text-red-800"
                  title="Eliminar categoría"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-left py-3 px-4">Categoría</th>
                <th className="text-left py-3 px-4">Precio</th>
                <th className="text-left py-3 px-4">Estado</th>
                <th className="text-left py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.unit}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                      {categories.find(c => c.value === product.category)?.label || product.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    ${product.price.toFixed(2)} COP
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                      {product.featured && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                          Destacado
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => editProduct(product)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleProductStatus(product._id, !product.isActive)}
                        className={`p-2 rounded ${
                          product.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={product.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay productos
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando tu primer producto
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Agregar Producto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProducts
