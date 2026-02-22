const cartRepository = require('../repositories/cartRepository');
const productRepository = require('../repositories/productRepository');
const ticketRepository = require('../repositories/ticketRepository');

async function getAll() {
  return cartRepository.getAll();
}

async function getById(cid) {
  return cartRepository.getById(cid);
}

async function create() {
  return cartRepository.create();
}

async function addProduct(cid, pid) {
  return cartRepository.addProduct(cid, pid, 1);
}

async function removeProduct(cid, pid) {
  return cartRepository.removeProduct(cid, pid);
}

async function updateCart(cid, productsArray) {
  return cartRepository.updateCart(cid, productsArray);
}

async function updateProductQuantity(cid, pid, quantity) {
  return cartRepository.updateProductQuantity(cid, pid, quantity);
}

async function clearCart(cid) {
  return cartRepository.clearCart(cid);
}

/**
 * Finaliza la compra: verifica stock, descuenta, genera ticket y deja en el carrito solo los no procesados.
 */
async function purchase(cid, purchaserEmail) {
  const cart = await cartRepository.getById(cid);
  if (!cart) return { error: 'Carrito no encontrado' };

  let totalAmount = 0;
  const unprocessedIds = [];
  const unprocessedItems = [];

  for (const item of cart.products || []) {
    const productId = item.product?.id || item.product?._id?.toString() || item.product;
    if (!productId) continue;
    const product = await productRepository.getById(productId);
    if (!product) continue;
    const qty = item.quantity || 1;
    if (product.stock >= qty) {
      await productRepository.decrementStock(productId, qty);
      totalAmount += product.price * qty;
    } else {
      unprocessedIds.push(productId);
      unprocessedItems.push({ product: productId, quantity: qty });
    }
  }

  let ticket = null;
  if (totalAmount > 0) {
    ticket = await ticketRepository.create({ amount: totalAmount, purchaser: purchaserEmail });
  }

  const updatedCart = await cartRepository.setProducts(cid, unprocessedItems);
  const cartFormatted = updatedCart || { ...cart, products: unprocessedItems };

  return { ticket, unprocessedIds, cart: cartFormatted };
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
  purchase
};
