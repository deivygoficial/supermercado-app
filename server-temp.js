// Temporarily use JSON file for testing
const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, 'data', 'products.json');

// Create data directory and file if they don't exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}

if (!fs.existsSync(productsFile)) {
  fs.writeFileSync(productsFile, JSON.stringify([]));
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Try MongoDB connection, fallback to JSON file
let useMongoDB = false;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/supermercado', {
  serverSelectionTimeoutMS: 3000,
  bufferMaxEntries: 0,
  bufferCommands: false
})
.then(() => {
  console.log('Conectado a MongoDB');
  useMongoDB = true;
})
.catch(err => {
  console.log('MongoDB no disponible, usando JSON file:', err.message);
  useMongoDB = false;
});

// Import routes
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');

// Use routes
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Supermercado Delivery',
    database: useMongoDB ? 'MongoDB' : 'JSON File',
    status: 'OK'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Base de datos: ${useMongoDB ? 'MongoDB' : 'JSON File'}`);
});
