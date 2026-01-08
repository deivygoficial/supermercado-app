const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'La descripción es obligatoria']
  },
  price: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  category: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    enum: ['frutas', 'verduras', 'lacteos', 'carnes', 'panaderia', 'bebidas', 'snacks', 'limpieza', 'alcohol', 'otros']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x300?text=Producto'
  },
  unit: {
    type: String,
    required: [true, 'La unidad es obligatoria'],
    enum: ['kg', 'g', 'l', 'ml', 'unidad', 'docena', 'paquete', 'botella', 'lata']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Índices para mejor rendimiento
productSchema.index({ category: 1 });
productSchema.index({ name: 'text' });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
