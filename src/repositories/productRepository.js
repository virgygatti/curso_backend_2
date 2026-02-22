const productDao = require('../dao/productDao');

async function getAll(limit) {
  return productDao.findAll(limit);
}

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

  const total = await productDao.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const skip = (page - 1) * limit;
  const sort = sortParam === 'asc' || sortParam === 'desc' ? { price: sortParam === 'asc' ? 1 : -1 } : {};
  const payload = await productDao.findPaginated(filter, skip, limit, sort);

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

async function getById(pid) {
  return productDao.findByIdLean(pid);
}

async function create(body) {
  return productDao.create({
    title: body.title,
    description: body.description,
    code: body.code,
    price: body.price,
    status: body.status !== undefined ? body.status : true,
    stock: body.stock,
    category: body.category,
    thumbnails: Array.isArray(body.thumbnails) ? body.thumbnails : []
  });
}

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
  return productDao.updateById(pid, updateData);
}

async function remove(pid) {
  return productDao.deleteById(pid);
}

async function decrementStock(pid, quantity) {
  return productDao.decrementStock(pid, quantity);
}

module.exports = {
  getAll,
  getPaginated,
  getById,
  create,
  update,
  remove,
  decrementStock
};
