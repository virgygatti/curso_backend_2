const userDao = require('../dao/userDao');
const cartDao = require('../dao/cartDao');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function findByEmail(email) {
  return userDao.findOneByEmail(email);
}

async function findById(id) {
  const user = await userDao.findById(id);
  if (!user) return null;
  return {
    ...user,
    id: user._id.toString(),
    cart: user.cart ? user.cart.toString() : null
  };
}

async function findByIdForAuth(id) {
  const user = await userDao.findByIdWithPassword(id);
  if (!user) return null;
  const { password, ...rest } = user;
  return {
    ...rest,
    id: user._id.toString(),
    cart: user.cart ? user.cart.toString() : null
  };
}

async function register(body) {
  const existing = await userDao.findOneByEmail(body.email);
  if (existing) return { user: null, error: 'El email ya está registrado' };
  const cart = await cartDao.create();
  const cartId = cart._id || cart.id;
  const hashedPassword = bcrypt.hashSync(body.password, SALT_ROUNDS);
  const user = await userDao.create({
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    age: body.age,
    password: hashedPassword,
    cart: cartId,
    role: body.role || 'user'
  });
  return { user, error: null };
}

async function getAll() {
  return userDao.findAll();
}

async function getById(id) {
  return userDao.findById(id).then((u) => (u ? { ...u, id: u._id.toString() } : null));
}

async function update(id, body) {
  const updates = { ...body };
  if (updates.password) {
    updates.password = bcrypt.hashSync(updates.password, SALT_ROUNDS);
  }
  delete updates.email;
  return userDao.updateById(id, updates);
}

async function remove(id) {
  return userDao.deleteById(id);
}

module.exports = {
  findByEmail,
  findById: findByIdForAuth,
  findByIdPublic: findById,
  register,
  getAll,
  getById,
  update,
  remove
};