const Product = require('../models/Product');

const REQUIRED_FIELDS = ['title', 'description', 'code', 'price', 'stock', 'category'];

/**
 * Valida que el cuerpo del producto tenga todos los campos obligatorios
 */
function validateProductBody(body) {
  const missing = REQUIRED_FIELDS.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  if (typeof body.price !== 'number' || body.price < 0) {
    return { valid: false, error: 'price debe ser un número mayor o igual a 0' };
  }
  if (typeof body.stock !== 'number' || body.stock < 0) {
    return { valid: false, error: 'stock debe ser un número mayor o igual a 0' };
  }
  return { valid: true };
}

/**
 * Obtiene todos los productos, opcionalmente limitados (para Socket/views que no usan paginación)
 */
async function getAll(limit = undefined) {
  let query = Product.find().lean();
  if (limit !== undefined && limit !== null) {
    const n = parseInt(limit, 10);
    if (!Number.isNaN(n) && n >= 0) query = query.limit(n);
  }
  const list = await query;
  return list.map((p) => ({ ...p, id: p._id.toString() }));
}

/**
 * Listado profesionalizado: paginación, filtro (query) y orden (sort por price).
 * @param {Object} opts - limit (default 10), page (default 1), query (filtro categoría/disponibilidad), sort ('asc'|'desc'), baseUrl ('/api/products')
 * @returns {Object} { status, payload, totalPages, prevPage, nextPage, page, hasPrevPage, hasNextPage, prevLink, nextLink }
 */
async function getPaginated(opts = {}) {
  const limit = Math.max(1, parseInt(opts.limit, 10) || 10);
  const page = Math.max(1, parseInt(opts.page, 10) || 1);
  const sortParam = (opts.sort || '').toLowerCase();
  const queryParam = typeof opts.query === 'string' ? opts.query.trim() : '';
  const baseUrl = opts.baseUrl || '/api/products';

  const filter = {};
  if (queryParam) {
    if (['available', 'true', 'disponible'].includes(queryParam)) {
      filter.status = true;
    } else if (['unavailable', 'false', 'nodisponible'].includes(queryParam)) {
      filter.status = false;
    } else {
      filter.category = new RegExp(queryParam, 'i');
    }
  }

  const total = await Product.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const skip = (page - 1) * limit;
  let query = Product.find(filter).lean().skip(skip).limit(limit);
  if (sortParam === 'asc' || sortParam === 'desc') {
    query = query.sort({ price: sortParam === 'asc' ? 1 : -1 });
  }
  const list = await query;
  const payload = list.map((p) => ({ ...p, id: p._id.toString() }));

  const hasPrevPage = page > 1;
  const hasNextPage = page < totalPages;
  const prevPage = hasPrevPage ? page - 1 : null;
  const nextPage = hasNextPage ? page + 1 : null;

  const params = new URLSearchParams();
  if (limit !== 10) params.set('limit', String(limit));
  if (queryParam) params.set('query', queryParam);
  if (sortParam) params.set('sort', sortParam);
  const paramStr = params.toString() ? '&' + params.toString() : '';

  const prevLink = hasPrevPage ? `${baseUrl}?page=${prevPage}${paramStr}` : null;
  const nextLink = hasNextPage ? `${baseUrl}?page=${nextPage}${paramStr}` : null;

  return {
    status: 'success',
    payload,
    totalPages,
    prevPage,
    nextPage,
    page,
    hasPrevPage,
    hasNextPage,
    prevLink,
    nextLink
  };
}

/**
 * Obtiene un producto por ID
 */
async function getById(pid) {
  const product = await Product.findById(pid).lean();
  if (!product) return null;
  return { ...product, id: product._id.toString() };
}

/**
 * Crea un nuevo producto. El id no se envía en el body, lo genera MongoDB.
 */
async function create(body) {
  const product = await Product.create({
    title: body.title,
    description: body.description,
    code: body.code,
    price: body.price,
    status: body.status !== undefined ? body.status : true,
    stock: body.stock,
    category: body.category,
    thumbnails: Array.isArray(body.thumbnails) ? body.thumbnails : []
  });
  return product.toJSON();
}

/**
 * Actualiza un producto por ID. El id NUNCA se actualiza.
 */
async function update(pid, body) {
  const allowed = ['title', 'description', 'code', 'price', 'status', 'stock', 'category', 'thumbnails'];
  const updateData = {};
  for (const key of allowed) {
    if (body[key] !== undefined) {
      if (key === 'price' || key === 'stock') updateData[key] = Number(body[key]);
      else if (key === 'status') updateData[key] = Boolean(body[key]);
      else if (key === 'thumbnails') updateData[key] = Array.isArray(body[key]) ? body[key] : [];
      else updateData[key] = body[key];
    }
  }
  const product = await Product.findByIdAndUpdate(pid, updateData, { new: true }).lean();
  if (!product) return null;
  return { ...product, id: product._id.toString() };
}

/**
 * Elimina un producto por ID
 */
async function remove(pid) {
  const product = await Product.findByIdAndDelete(pid).lean();
  if (!product) return null;
  return { ...product, id: product._id.toString() };
}

module.exports = {
  getAll,
  getPaginated,
  getById,
  create,
  update,
  remove,
  validateProductBody
};
