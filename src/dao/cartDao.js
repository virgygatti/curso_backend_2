const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function _formatCartPopulate(doc) {
  const cart = await Cart.findById(doc._id).populate('products.product').lean();
  if (!cart) return null;
  const id = cart._id.toString();
  const products = (cart.products || []).map((item) => ({
    product: item.product ? { ...item.product, id: item.product._id.toString() } : null,
    quantity: item.quantity
  }));
  return { ...cart, id, products };
}

async function findById(cid) {
  return Cart.findById(cid);
}

async function findByIdLean(cid) {
  const cart = await Cart.findById(cid).lean();
  return cart ? { ...cart, id: cart._id.toString() } : null;
}

async function findByIdPopulate(cid) {
  const cart = await Cart.findById(cid).populate('products.product').lean();
  if (!cart) return null;
  const id = cart._id.toString();
  const products = (cart.products || []).map((item) => ({
    product: item.product ? { ...item.product, id: item.product._id.toString() } : null,
    quantity: item.quantity
  }));
  return { ...cart, id, products };
}

async function create() {
  const cart = await Cart.create({ products: [] });
  return cart.toJSON();
}

async function addProduct(cid, pid, quantity = 1) {
  const cart = await Cart.findById(cid);
  if (!cart) return null;
  const product = await Product.findById(pid);
  if (!product) return null;
  const item = cart.products.find((p) => p.product.toString() === pid.toString());
  if (item) {
    item.quantity += quantity;
  } else {
    cart.products.push({ product: new mongoose.Types.ObjectId(pid), quantity });
  }
  await cart.save();
  return _formatCartPopulate(cart);
}

async function removeProduct(cid, pid) {
  const cart = await Cart.findById(cid);
  if (!cart) return null;
  const initialLen = cart.products.length;
  cart.products = cart.products.filter((p) => p.product.toString() !== pid.toString());
  if (cart.products.length === initialLen) return null;
  await cart.save();
  return _formatCartPopulate(cart);
}

async function setProducts(cid, productsArray) {
  const cart = await Cart.findById(cid);
  if (!cart) return null;
  const items = productsArray.map((item) => ({
    product: new mongoose.Types.ObjectId(item.product),
    quantity: Math.max(1, item.quantity || 1)
  }));
  cart.products = items;
  await cart.save();
  return _formatCartPopulate(cart);
}

async function updateProductQuantity(cid, pid, quantity) {
  const cart = await Cart.findById(cid);
  if (!cart) return null;
  const qty = Math.max(0, parseInt(quantity, 10));
  const item = cart.products.find((p) => p.product.toString() === pid.toString());
  if (!item) return null;
  if (qty === 0) {
    cart.products = cart.products.filter((p) => p.product.toString() !== pid.toString());
  } else {
    item.quantity = qty;
  }
  await cart.save();
  return _formatCartPopulate(cart);
}

async function clearProducts(cid) {
  const cart = await Cart.findById(cid);
  if (!cart) return null;
  cart.products = [];
  await cart.save();
  return _formatCartPopulate(cart);
}

async function findAll() {
  const list = await Cart.find().lean();
  return list.map((c) => ({ ...c, id: c._id.toString() }));
}

module.exports = {
  findById,
  findByIdLean,
  findByIdPopulate,
  create,
  addProduct,
  removeProduct,
  setProducts,
  updateProductQuantity,
  clearProducts,
  findAll
};
