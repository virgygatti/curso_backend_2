const productService = require('../services/productService');

/**
 * GET /api/products/
 * Listado profesionalizado: paginación (limit, page), filtro (query: categoría o disponibilidad), orden (sort: asc|desc por price).
 * Respuesta: { status, payload, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink }
 */
async function getAll(req, res, next) {
  try {
    const baseUrl = req.baseUrl || '/api/products';
    const result = await productService.getPaginated({
      limit: req.query.limit,
      page: req.query.page,
      query: req.query.query,
      sort: req.query.sort,
      baseUrl
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/products/:pid
 * Obtiene un producto por ID
 */
async function getById(req, res, next) {
  try {
    const { pid } = req.params;
    const product = await productService.getById(pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado', pid });
    }
    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/products/
 * Crea un nuevo producto. id auto-generado, no se envía en body.
 * Tras crear, emite la lista actualizada por Socket.io para que todos los clientes (p. ej. realTimeProducts) se actualicen.
 */
async function create(req, res, next) {
  try {
    const validation = productService.validateProductBody(req.body);
    if (!validation.valid) {
      if (validation.missing) {
        return res.status(400).json({ error: 'Campos obligatorios faltantes', missing: validation.missing });
      }
      return res.status(400).json({ error: validation.error });
    }
    const product = await productService.create(req.body);
    const io = req.app.get('io');
    if (io) {
      const products = await productService.getAll();
      io.emit('products', products);
    }
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/products/:pid
 * Actualiza un producto. El id NUNCA se actualiza.
 */
async function update(req, res, next) {
  try {
    const { pid } = req.params;
    const product = await productService.getById(pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado', pid });
    }
    // No permitir actualizar id
    const body = { ...req.body };
    delete body.id;
    const updated = await productService.update(pid, body);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/products/:pid
 * Elimina un producto. Tras eliminar, emite la lista actualizada por Socket.io.
 */
async function remove(req, res, next) {
  try {
    const { pid } = req.params;
    const deleted = await productService.remove(pid);
    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado', pid });
    }
    const io = req.app.get('io');
    if (io) {
      const products = await productService.getAll();
      io.emit('products', products);
    }
    res.status(200).json({ message: 'Producto eliminado', product: deleted });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
