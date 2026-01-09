const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1']
  },
  unit: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    reference: { type: String }
  },
  paymentMethod: {
    type: String,
    enum: ['efectivo'],
    default: 'efectivo'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado'],
    default: 'pendiente'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: {
      type: String,
      default: ''
    }
  }],
  notes: {
    type: String,
    default: ''
  },
  estimatedDeliveryTime: {
    type: Date
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Método para calcular el total del pedido
orderSchema.methods.calculateTotal = function() {
  this.totalAmount = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Middleware para calcular total antes de guardar
orderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.calculateTotal();
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
