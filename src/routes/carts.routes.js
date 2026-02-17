const express = require('express');
const router = express.Router();
const cartsController = require('../controllers/carts.controller');

// POST /api/carts/ - Crear nuevo carrito
router.post('/', cartsController.create);

// GET /api/carts/:cid - Listar productos del carrito (con populate)
router.get('/:cid', cartsController.getById);

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', cartsController.addProduct);

// DELETE /api/carts/:cid/products/:pid - Eliminar un producto del carrito
router.delete('/:cid/products/:pid', cartsController.removeProduct);

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad del producto. Body: { quantity: number }
router.put('/:cid/products/:pid', cartsController.updateProductQuantity);

// PUT /api/carts/:cid - Actualizar carrito completo. Body: { products: [{ product: id, quantity: n }, ...] }
router.put('/:cid', cartsController.updateCart);

// DELETE /api/carts/:cid - Vaciar carrito (eliminar todos los productos)
router.delete('/:cid', cartsController.clearCart);

module.exports = router;
