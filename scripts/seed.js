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
  },
  {
    name: 'Pollo Fresco',
    description: 'Pechuga de pollo fresca, sin hueso',
    price: 8.50,
    category: 'carnes',
    stock: 40,
    unit: 'kg',
    featured: false,
    image: 'https://images.unsplash.com/photo-1582737413760-8a5b4d7df923?w=300'
  },
  {
    name: 'Agua Mineral',
    description: 'Agua purificada, botella de 1.5L',
    price: 0.80,
    category: 'bebidas',
    stock: 200,
    unit: 'unidad',
    featured: false,
    image: 'https://images.unsplash.com/photo-1549498349-1f96b5c23798?w=300'
  },
  {
    name: 'Papas Fritas',
    description: 'Papas fritas originales, paquete 200g',
    price: 2.50,
    category: 'snacks',
    stock: 60,
    unit: 'paquete',
    featured: false,
    image: 'https://images.unsplash.com/photo-1516793434430-73452392c51c?w=300'
  },
  {
    name: 'Detergente Líquido',
    description: 'Detergente para ropa, 2L',
    price: 5.50,
    category: 'limpieza',
    stock: 25,
    unit: 'unidad',
    featured: false,
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=300'
  },
  {
    name: 'Huevos',
    description: 'Docena de huevos frescos',
    price: 2.80,
    category: 'otros',
    stock: 40,
    unit: 'docena',
    featured: true,
    image: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=300'
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
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Limpiar colecciones existentes
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Base de datos limpiada');

    // Insertar productos de ejemplo
    const products = await Product.insertMany(sampleProducts);
    console.log(`${products.length} productos insertados`);

    // Insertar usuario administrador
    const admin = await User.create(sampleAdmin);
    console.log('Usuario administrador creado:', admin.email);

    console.log('Base de datos poblada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

seedDatabase();
