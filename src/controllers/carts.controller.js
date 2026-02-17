const cartService = require('../services/cartService');

/**
 * POST /api/carts/
 * Crea un nuevo carrito. Estructura: { id, products: [] }
 */
async function create(req, res, next) {
  try {
    const cart = await cartService.create();
    res.status(201).json(cart);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/carts/:cid
 * Lista los productos que pertenecen al carrito con el cid proporcionado
 */
async function getById(req, res, next) {
  try {
    const { cid } = req.params;
    const cart = await cartService.getById(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado', cid });
    }
    res.status(200).json(cart);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/carts/:cid/product/:pid
 * Agrega el producto al array "products" del carrito.
 * Formato: { product: "pid", quantity: 1 }. Si ya existe, incrementa quantity.
 */
async function addProduct(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const result = await cartService.addProduct(cid, pid);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json(result.cart);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/carts/:cid/products/:pid - Elimina un producto del carrito
 */
async function removeProduct(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const result = await cartService.removeProduct(cid, pid);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json(result.cart);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/carts/:cid - Actualiza el carrito completo. Body: { products: [{ product: id, quantity: n }, ...] }
 */
async function updateCart(req, res, next) {
  try {
    const { cid } = req.params;
    const result = await cartService.updateCart(cid, req.body.products || req.body);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json(result.cart);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/carts/:cid/products/:pid - Actualiza la cantidad. Body: { quantity: number }
 */
async function updateProductQuantity(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const quantity = req.body.quantity;
    const result = await cartService.updateProductQuantity(cid, pid, quantity);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json(result.cart);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/carts/:cid - Elimina todos los productos del carrito
 */
async function clearCart(req, res, next) {
  try {
    const { cid } = req.params;
    const result = await cartService.clearCart(cid);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json(result.cart);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getById,
  addProduct,
  removeProduct,
  updateCart,
  updateProductQuantity,
  clearCart
};
