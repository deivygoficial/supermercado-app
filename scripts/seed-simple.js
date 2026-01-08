const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
require('dotenv').config();

// Datos de ejemplo
const sampleProducts = [
  {
    name: 'Manzanas Rojas',
    description: 'Manzanas frescas y crujientes, perfectas para cualquier momento del día',
    price: 2.50,
    category: 'frutas',
    stock: 100,
    unit: 'kg',
    featured: true,
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300'
  },
  {
    name: 'Plátanos',
    description: 'Plátanos maduros y dulces, ricos en potasio',
    price: 1.80,
    category: 'frutas',
    stock: 150,
    unit: 'kg',
    featured: true,
    image: 'https://images.unsplash.com/photo-1543286386-713bdd548da4?w=300'
  },
  {
    name: 'Leche Entera',
    description: 'Leche fresca pasteurizada, 1 litro',
    price: 1.20,
    category: 'lacteos',
    stock: 50,
    unit: 'l',
    featured: true,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300'
  },
  {
    name: 'Pan Integral',
    description: 'Pan fresco hecho con harina integral, ideal para sandwichs',
    price: 2.00,
    category: 'panaderia',
    stock: 30,
    unit: 'unidad',
    featured: false,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300'
  },
  {
    name: 'Tomates',
    description: 'Tomates frescos y jugosos, perfectos para ensaladas',
    price: 3.00,
    category: 'verduras',
    stock: 80,
    unit: 'kg',
    featured: true,
    image: 'https://images.unsplash.com/photo-1546470427-e92b2c9c09d6?w=300'
  }
];

const sampleAdmin = {
  name: 'Administrador',
  email: 'admin@supermercado.com',
  password: 'admin123',
  phone: '+1234567890',
  role: 'admin',
  address: {
    street: 'Calle Principal 123',
    city: 'Ciudad',
    state: 'Estado',
    zipCode: '12345'
  }
};

async function seedDatabase() {
  try {
    console.log('Intentando conectar a MongoDB...');
    
    // Intentar conexión con diferentes configuraciones
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/supermercado';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // 5 segundos timeout
      connectTimeoutMS: 5000,
    });
    
    console.log('✅ Conectado a MongoDB exitosamente');

    // Limpiar colecciones existentes
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Base de datos limpiada');

    // Insertar productos de ejemplo
    const products = await Product.insertMany(sampleProducts);
    console.log(`📦 ${products.length} productos insertados`);

    // Insertar usuario administrador
    const admin = await User.create(sampleAdmin);
    console.log(`👤 Usuario administrador creado: ${admin.email}`);

    console.log('🎉 Base de datos poblada exitosamente');
    console.log('\n📋 Credenciales de acceso:');
    console.log('Email: admin@supermercado.com');
    console.log('Contraseña: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solución:');
      console.log('1. Asegúrate que MongoDB esté instalado');
      console.log('2. Inicia MongoDB con: mongod');
      console.log('3. O usa MongoDB Atlas (base de datos en la nube)');
    }
    
    process.exit(1);
  }
}

seedDatabase();
