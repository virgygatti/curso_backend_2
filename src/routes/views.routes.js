const express = require('express');
const router = express.Router();
const productService = require('../services/productService');
const cartService = require('../services/cartService');

/**
 * GET /
 * Muestra la vista index.handlebars con la lista de productos (sin WebSocket).
 */
router.get('/', async (req, res, next) => {
  try {
    const products = await productService.getAll();
    res.render('index', {
      title: 'Inicio',
      products: products || []
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /products
 * Listado de productos con paginación, filtro y orden. Vista: products/index.handlebars
 */
router.get('/products', async (req, res, next) => {
  try {
    const limit = req.query.limit || 10;
    const page = req.query.page || 1;
    const query = req.query.query || '';
    const sort = req.query.sort || '';
    const result = await productService.getPaginated({
      limit,
      page,
      query,
      sort,
      baseUrl: '/products'
    });
    res.render('products/index', {
      title: 'Productos',
      ...result,
      limit: Number(limit),
      query,
      sort,
      sortAsc: sort === 'asc',
      sortDesc: sort === 'desc'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /products/:pid
 * Detalle de un producto. Vista: products/detail.handlebars. Botón agregar al carrito.
 */
router.get('/products/:pid', async (req, res, next) => {
  try {
    const product = await productService.getById(req.params.pid);
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.render('products/detail', {
      title: product.title,
      product
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /carts/:cid
 * Vista de un carrito con sus productos (populate). Solo productos de ese carrito.
 */
router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await cartService.getById(req.params.cid);
    if (!cart) {
      return res.status(404).send('Carrito no encontrado');
    }
    res.render('carts/detail', {
      title: 'Carrito',
      cart
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /realtimeproducts
 * Vista que recibe la lista de productos vía WebSocket (cliente conecta y servidor envía "products").
 */
router.get('/realtimeproducts', async (req, res, next) => {
  try {
    res.render('realTimeProducts', {
      title: 'Productos en tiempo real'
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
