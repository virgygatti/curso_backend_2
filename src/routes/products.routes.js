const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const { requireAuth, requireAdmin } = require('../middlewares/authorization');

// GET /api/products/ - Listar todos (soporta ?limit=N)
router.get('/', productsController.getAll);

// GET /api/products/:pid - Obtener producto por ID
router.get('/:pid', productsController.getById);

// Solo administrador: crear, actualizar y eliminar productos
router.post('/', requireAuth, requireAdmin, productsController.create);
router.put('/:pid', requireAuth, requireAdmin, productsController.update);
router.delete('/:pid', requireAuth, requireAdmin, productsController.remove);

module.exports = router;
