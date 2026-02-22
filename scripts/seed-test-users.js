/**
 * Seed de usuarios de prueba para backend2.
 * Crea un admin y un user, cada uno con su carrito.
 * Ejecutar: node scripts/seed-test-users.js
 * Requiere: servidor NO corriendo (o otra BD), MongoDB disponible.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');
const Cart = require('../src/models/Cart');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/backend1';
const SALT_ROUNDS = 10;

const TEST_USERS = [
  { email: 'admin@test.com', password: '123456', first_name: 'Admin', last_name: 'Test', age: 30, role: 'admin' },
  { email: 'user@test.com',  password: '123456', first_name: 'User',  last_name: 'Test', age: 25, role: 'user'  }
];

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    for (const data of TEST_USERS) {
      const existing = await User.findOne({ email: data.email });
      if (existing) {
        existing.role = data.role;
        await existing.save();
        console.log(`Usuario ${data.email} ya existía; role actualizado a "${data.role}".`);
        continue;
      }
      const cart = await Cart.create({ products: [] });
      const hashedPassword = bcrypt.hashSync(data.password, SALT_ROUNDS);
      await User.create({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        age: data.age,
        password: hashedPassword,
        cart: cart._id,
        role: data.role
      });
      console.log(`Creado: ${data.email} (role: ${data.role})`);
    }

    console.log('\nCredenciales de prueba:');
    console.log('  Admin: admin@test.com / 123456');
    console.log('  User:  user@test.com  / 123456');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado.');
  }
}

run();
