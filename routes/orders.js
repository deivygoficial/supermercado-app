const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');

// Almacenamiento de conexiones SSE para notificaciones en tiempo real
const adminConnections = new Set();

// Endpoint para notificaciones en tiempo real (solo admin)
router.get('/notifications', adminAuth, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Agregar conexión a la lista
  adminConnections.add(res);

  // Enviar mensaje de conexión exitosa
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Conectado a notificaciones' })}\n\n`);

  // Manejar desconexión
  req.on('close', () => {
    adminConnections.delete(res);
  });
});

// Función para enviar notificaciones a todos los admins conectados
const notifyAdmins = (notification) => {
  const message = `data: ${JSON.stringify(notification)}\n\n`;
  adminConnections.forEach(connection => {
    try {
      connection.write(message);
    } catch (error) {
      // Eliminar conexión rota
      adminConnections.delete(connection);
    }
  });
};

// Crear un nuevo pedido
router.post('/', auth, async (req, res) => {
  try {
    const { items, deliveryAddress, notes } = req.body;
    
    // Validar que hay items en el pedido
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'El pedido debe tener al menos un producto' });
    }
    
    // Validar dirección de entrega
    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.zipCode) {
      return res.status(400).json({ message: 'La dirección de entrega es incompleta' });
    }
    
    // Calcular total manualmente
    const totalAmount = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    // Crear pedido con método de pago fijo a efectivo
    const order = new Order({
      user: req.user._id,
      items,
      deliveryAddress,
      paymentMethod: 'efectivo', // Siempre efectivo
      notes,
      totalAmount, // Agregar total calculado
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 minutos
    });
    
    console.log('📝 Pedido a guardar:', {
      user: req.user._id,
      itemsCount: items.length,
      totalAmount,
      deliveryAddress: deliveryAddress.street
    });
    
    await order.save();
    
    // Populate para devolver información completa
    await order.populate('user', 'name email phone');
    
    console.log(`🛒 Nuevo pedido recibido: #${order._id} de ${order.user.name}`);
    console.log(`📦 Total: $${order.totalAmount} - Estado: ${order.status}`);
    
    // Enviar notificación a administradores en tiempo real
    notifyAdmins({
      type: 'new_order',
      order: {
        id: order._id,
        customerName: order.user.name,
        customerEmail: order.user.email,
        totalAmount: order.totalAmount,
        itemCount: order.items.length,
        status: order.status,
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress
      },
      timestamp: new Date()
    });
    
    res.status(201).json(order);
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    console.error('❌ Detalles del error:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(400).json({ 
      message: 'Error al crear pedido', 
      error: error.message,
      details: error.errors ? Object.keys(error.errors) : 'No validation errors'
    });
  }
});

// Obtener todos los pedidos (solo admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
  }
});

// Obtener pedidos del usuario autenticado
router.get('/my-orders', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let query = { user: req.user._id };
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('items.product', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
  }
});

// Obtener un pedido específico del usuario
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name image');
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Verificar que el pedido pertenece al usuario o es admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para ver este pedido' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedido', error: error.message });
  }
});

// Actualizar estado del pedido (solo admin)
router.put('/:id/status', adminAuth, async (req, res) => {
  try {
    console.log('🔄 Iniciando actualización de estado del pedido:', req.params.id)
    console.log('📝 Datos recibidos:', { status: req.body.status, note: req.body.note })
    
    const { status } = req.body
    
    // Estados válidos
    const validStatuses = ['pendiente', 'confirmado', 'preparando', 'en_camino', 'entregado', 'cancelado']
    
    if (!validStatuses.includes(status)) {
      console.log('❌ Estado no válido:', status)
      return res.status(400).json({ 
        message: 'Estado no válido',
        validStatuses 
      })
    }

    console.log('🔍 Buscando pedido...')
    const order = await Order.findById(req.params.id)

    if (!order) {
      console.log('❌ Pedido no encontrado:', req.params.id)
      return res.status(404).json({ message: 'Pedido no encontrado' })
    }

    console.log('✅ Pedido encontrado:', order._id)
    console.log('📊 Estado actual:', order.status)

    // Guardar estado anterior para historial
    const previousStatus = order.status
    order.status = status
    
    // Agregar al historial de estados
    if (!order.statusHistory) {
      order.statusHistory = []
    }
    
    order.statusHistory.push({
      status: status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      note: req.body.note || ''
    })

    // Si el pedido es entregado, registrar fecha de entrega
    if (status === 'entregado') {
      order.deliveredAt = new Date()
    }

    console.log('💾 Guardando cambios...')
    await order.save()

    // Obtener el pedido actualizado con populate
    console.log('🔍 Obteniendo pedido actualizado...')
    const updatedOrder = await Order.findById(req.params.id)
      .populate('user', 'name email phone')

    console.log('✅ Pedido guardado exitosamente')

    // Enviar notificación al cliente (simulado)
    console.log(`🔔 Notificación enviada a ${updatedOrder.user?.name || 'Cliente'} (${updatedOrder.user?.email || 'N/A'}):`)
    console.log(`📦 Pedido #${order._id.slice(-6)} actualizado: ${previousStatus} → ${status}`)
    
    if (req.body.note) {
      console.log(`📝 Nota: ${req.body.note}`)
    }

    res.json({
      message: 'Estado del pedido actualizado correctamente',
      order: updatedOrder,
      previousStatus,
      newStatus: status
    })
  } catch (error) {
    console.error('❌ Error detallado al actualizar estado del pedido:', error)
    console.error('Stack trace:', error.stack)
    
    res.status(500).json({ 
      message: 'Error al actualizar estado del pedido',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
});

// Obtener todos los pedidos (solo admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener pedidos', error: error.message });
  }
});

// Cancelar pedido (usuario o admin)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    
    // Verificar que el pedido pertenece al usuario o es admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para cancelar este pedido' });
    }
    
    // Solo se pueden cancelar pedidos en estado pendiente o confirmado
    if (!['pendiente', 'confirmado'].includes(order.status)) {
      return res.status(400).json({ message: 'No se puede cancelar un pedido en estado ' + order.status });
    }
    
    order.status = 'cancelado';
    await order.save();
    
    res.json({ message: 'Pedido cancelado correctamente', order });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar pedido', error: error.message });
  }
});

module.exports = router;
