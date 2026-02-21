const bcrypt = require('bcrypt');
const User = require('../models/User');
const Cart = require('../models/Cart');

const SALT_ROUNDS = 10;

/**
 * Registra un usuario. Crea un carrito vacío y lo asigna. Password se hashea con bcrypt (hashSync).
 */
async function register(body) {
  const existing = await User.findOne({ email: body.email });
  if (existing) return { user: null, error: 'El email ya está registrado' };
  const cart = await Cart.create({ products: [] });
  const hashedPassword = bcrypt.hashSync(body.password, SALT_ROUNDS);
  const user = await User.create({
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    age: body.age,
    password: hashedPassword,
    cart: cart._id,
    role: body.role || 'user'
  });
  return { user: user.toJSON(), error: null };
}

/**
 * Busca usuario por email (para login). No excluye password.
 */
async function findByEmail(email) {
  return User.findOne({ email }).lean();
}

/**
 * Busca usuario por ID (para estrategia JWT current). Excluye password.
 */
async function findById(id) {
  const user = await User.findById(id).lean();
  if (!user) return null;
  const { password, ...rest } = user;
  return {
    ...rest,
    id: user._id.toString(),
    cart: user.cart ? user.cart.toString() : null
  };
}

/**
 * Lista usuarios (sin password). Uso admin.
 */
async function getAll() {
  const list = await User.find().select('-password').lean();
  return list.map((u) => ({ ...u, id: u._id.toString() }));
}

/**
 * Obtiene un usuario por ID (sin password).
 */
async function getById(id) {
  const user = await User.findById(id).select('-password').lean();
  if (!user) return null;
  return { ...user, id: user._id.toString() };
}

/**
 * Actualiza usuario. Si se envía password, se hashea.
 */
async function update(id, body) {
  const updates = { ...body };
  if (updates.password) {
    updates.password = bcrypt.hashSync(updates.password, SALT_ROUNDS);
  }
  delete updates.email; // no permitir cambiar email por simplicidad
  const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password').lean();
  if (!user) return null;
  return { ...user, id: user._id.toString() };
}

/**
 * Elimina usuario por ID.
 */
async function remove(id) {
  const user = await User.findByIdAndDelete(id).lean();
  if (!user) return null;
  return { ...user, id: user._id.toString(), password: undefined };
}

module.exports = {
  register,
  findByEmail,
  findById,
  getAll,
  getById,
  update,
  remove
};
