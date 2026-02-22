const cartDao = require('../dao/cartDao');
const productDao = require('../dao/productDao');

async function getAll() {
  return cartDao.findAll();
}

async function getById(cid) {
  return cartDao.findByIdPopulate(cid);
}

async function create() {
  return cartDao.create();
}

async function addProduct(cid, pid, quantity = 1) {
  const cart = await cartDao.addProduct(cid, pid, quantity);
  if (!cart) return { cart: null, error: 'Carrito o producto no encontrado' };
  return { cart, error: null };
}

async function removeProduct(cid, pid) {
  const cart = await cartDao.removeProduct(cid, pid);
  if (!cart) return { cart: null, error: 'Carrito no encontrado o producto no está en el carrito' };
  return { cart, error: null };
}

async function updateCart(cid, productsArray) {
  if (!Array.isArray(productsArray)) return { cart: null, error: 'products debe ser un array' };
  const items = [];
  for (const item of productsArray) {
    const productId = item.product || item.productId;
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    if (!productId) continue;
    const exists = await productDao.findById(productId);
    if (exists) items.push({ product: productId, quantity: qty });
  }
  const cart = await cartDao.setProducts(cid, items);
  if (!cart) return { cart: null, error: 'Carrito no encontrado' };
  return { cart, error: null };
}

async function updateProductQuantity(cid, pid, quantity) {
  const cart = await cartDao.updateProductQuantity(cid, pid, quantity);
  if (!cart) return { cart: null, error: 'Carrito no encontrado o producto no está en el carrito' };
  return { cart, error: null };
}

async function clearCart(cid) {
  const cart = await cartDao.clearProducts(cid);
  if (!cart) return { cart: null, error: 'Carrito no encontrado' };
  return { cart, error: null };
}

/** Establece los productos del carrito (array de { product, quantity }). Usado tras purchase. */
async function setProducts(cid, items) {
  const cart = await cartDao.setProducts(cid, items);
  if (!cart) return null;
  return cart;
}

module.exports = {
  getAll,
  getById,
  create,
  addProduct,
  removeProduct,
  updateCart,
  updateProductQuantity,
  clearCart,
  setProducts
};