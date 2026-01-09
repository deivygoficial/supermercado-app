const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB optimizada para Vercel
const connectDB = async () => {
  try {
    // Deshabilitar buffering completamente
    mongoose.set('bufferCommands', false);
    mongoose.set('bufferMaxEntries', 0);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 1, // Reducir a 1 conexión para Vercel
      serverSelectionTimeoutMS: 10000, // 10 segundos
      socketTimeoutMS: 30000, // 30 segundos
      connectTimeoutMS: 10000, // 10 segundos
      heartbeatFrequencyMS: 10000, // 10 segundos
      retryWrites: true,
      w: 'majority',
      bufferMaxEntries: 0, // Sin buffering
      bufferCommands: false // Sin buffering de comandos
    });
    
    console.log('✅ Conectado a MongoDB Atlas');
    console.log('📊 Database:', conn.connection.name);
    return conn;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    // No salir del proceso, solo loguear el error
    return null;
  }
};

// Conectar a la base de datos y esperar conexión
const dbConnection = connectDB();

// Middleware para esperar conexión antes de procesar rutas
const waitForDB = async (req, res, next) => {
  try {
    // Esperar a que la conexión esté lista
    if (mongoose.connection.readyState !== 1) {
      await dbConnection;
    }
    next();
  } catch (error) {
    console.error('Error de conexión:', error);
    res.status(500).json({ message: 'Error de conexión a la base de datos' });
  }
};

// Aplicar middleware a todas las rutas API
app.use('/api', waitForDB);

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/users', require('./routes/users'));

// Ruta principal
app.get('/', (req, res) => {
  res.json({ message: 'API de Supermercado Delivery' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
