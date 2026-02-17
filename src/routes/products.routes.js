const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');

// GET /api/products/ - Listar todos (soporta ?limit=N)
router.get('/', productsController.getAll);

// GET /api/products/:pid - Obtener producto por ID
router.get('/:pid', productsController.getById);

// POST /api/products/ - Crear producto
router.post('/', productsController.create);

// PUT /api/products/:pid - Actualizar producto (id no se actualiza)
router.put('/:pid', productsController.update);

// DELETE /api/products/:pid - Eliminar producto
router.delete('/:pid', productsController.remove);

module.exports = router;
