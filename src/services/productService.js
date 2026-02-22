const productRepository = require('../repositories/productRepository');

const REQUIRED_FIELDS = ['title', 'description', 'code', 'price', 'stock', 'category'];

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

async function getAll(limit = undefined) {
  return productRepository.getAll(limit);
}

async function getPaginated(opts = {}) {
  return productRepository.getPaginated(opts);
}

async function getById(pid) {
  return productRepository.getById(pid);
}

async function create(body) {
  return productRepository.create(body);
}

async function update(pid, body) {
  return productRepository.update(pid, body);
}

async function remove(pid) {
  return productRepository.remove(pid);
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
