const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

/**
 * Obtiene todos los carritos
 */
async function getAll() {
  const carts = await Cart.find().lean();
  return carts.map((c) => ({ ...c, id: c._id.toString() }));
}

/**
 * Obtiene un carrito por ID con productos poblados (populate)
 */
async function getById(cid) {
  const cart = await Cart.findById(cid).populate('products.product').lean();
  if (!cart) return null;
  const id = cart._id.toString();
  const products = (cart.products || []).map((item) => ({
    product: item.product ? { ...item.product, id: item.product._id.toString() } : null,
    quantity: item.quantity
  }));
  return { ...cart, id, products };
}

/**
 * Crea un nuevo carrito
 */
async function create() {
  const cart = await Cart.create({ products: [] });
  return cart.toJSON();
}

/**
 * Agrega un producto al carrito. Si ya existe, incrementa quantity.
 */
async function addProduct(cid, pid) {
  const cart = await Cart.findById(cid);
  if (!cart) return { cart: null, error: 'Carrito no encontrado' };

  const product = await Product.findById(pid);
  if (!product) return { cart: null, error: 'Producto no encontrado' };

  const item = cart.products.find((p) => p.product.toString() === pid.toString());
  if (item) {
    item.quantity += 1;
  } else {
    cart.products.push({ product: new mongoose.Types.ObjectId(pid), quantity: 1 });
  }
  await cart.save();
  const updated = await Cart.findById(cid).populate('products.product').lean();
  const id = updated._id.toString();
  const products = (updated.products || []).map((item) => ({
    product: item.product ? { ...item.product, id: item.product._id.toString() } : null,
    quantity: item.quantity
  }));
  return { cart: { ...updated, id, products }, error: null };
}

/**
 * Formatea carrito con populate para respuesta
 */
async function _formatCart(cartDoc) {
  const updated = await Cart.findById(cartDoc._id).populate('products.product').lean();
  const id = updated._id.toString();
  const products = (updated.products || []).map((item) => ({
    product: item.product ? { ...item.product, id: item.product._id.toString() } : null,
    quantity: item.quantity
  }));
  return { ...updated, id, products };
}

/**
 * Elimina un producto del carrito
 */
async function removeProduct(cid, pid) {
  const cart = await Cart.findById(cid);
  if (!cart) return { cart: null, error: 'Carrito no encontrado' };
  const initialLen = cart.products.length;
  cart.products = cart.products.filter((p) => p.product.toString() !== pid.toString());
  if (cart.products.length === initialLen) return { cart: null, error: 'Producto no está en el carrito' };
  await cart.save();
  return { cart: await _formatCart(cart), error: null };
}

/**
 * Actualiza el carrito completo. products: [{ product: productId, quantity: number }, ...]
 */
async function updateCart(cid, productsArray) {
  const cart = await Cart.findById(cid);
  if (!cart) return { cart: null, error: 'Carrito no encontrado' };
  if (!Array.isArray(productsArray)) return { cart: null, error: 'products debe ser un array' };
  const items = [];
  for (const item of productsArray) {
    const productId = item.product || item.productId;
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    if (!productId) continue;
    const exists = await Product.findById(productId);
    if (exists) items.push({ product: new mongoose.Types.ObjectId(productId), quantity: qty });
  }
  cart.products = items;
  await cart.save();
  return { cart: await _formatCart(cart), error: null };
}

/**
 * Actualiza solo la cantidad de un producto en el carrito. quantity en req.body
 */
async function updateProductQuantity(cid, pid, quantity) {
  const cart = await Cart.findById(cid);
  if (!cart) return { cart: null, error: 'Carrito no encontrado' };
  const qty = Math.max(0, parseInt(quantity, 10));
  const item = cart.products.find((p) => p.product.toString() === pid.toString());
  if (!item) return { cart: null, error: 'Producto no está en el carrito' };
  if (qty === 0) {
    cart.products = cart.products.filter((p) => p.product.toString() !== pid.toString());
  } else {
    item.quantity = qty;
  }
  await cart.save();
  return { cart: await _formatCart(cart), error: null };
}

/**
 * Elimina todos los productos del carrito
 */
async function clearCart(cid) {
  const cart = await Cart.findById(cid);
  if (!cart) return { cart: null, error: 'Carrito no encontrado' };
  cart.products = [];
  await cart.save();
  return { cart: await _formatCart(cart), error: null };
}

module.exports = {
  getAll,
  getById,
  create,
  addProduct,
  removeProduct,
  updateCart,
  updateProductQuantity,
  clearCart
};
