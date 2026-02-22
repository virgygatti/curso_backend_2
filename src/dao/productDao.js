const Product = require('../models/Product');

async function findAll(limit = undefined) {
  let query = Product.find().lean();
  if (limit != null) {
    const n = parseInt(limit, 10);
    if (!Number.isNaN(n) && n >= 0) query = query.limit(n);
  }
  const list = await query;
  return list.map((p) => ({ ...p, id: p._id.toString() }));
}

async function findById(id) {
  const product = await Product.findById(id);
  return product || null;
}

async function findByIdLean(id) {
  const product = await Product.findById(id).lean();
  return product ? { ...product, id: product._id.toString() } : null;
}

async function create(data) {
  const product = await Product.create(data);
  return product.toJSON();
}

async function updateById(id, data) {
  const product = await Product.findByIdAndUpdate(id, data, { new: true }).lean();
  return product ? { ...product, id: product._id.toString() } : null;
}

async function deleteById(id) {
  const product = await Product.findByIdAndDelete(id).lean();
  return product ? { ...product, id: product._id.toString() } : null;
}

async function countDocuments(filter = {}) {
  return Product.countDocuments(filter);
}

async function findPaginated(filter, skip, limit, sort) {
  const list = await Product.find(filter).lean().skip(skip).limit(limit).sort(sort || {});
  return list.map((p) => ({ ...p, id: p._id.toString() }));
}

/** Decrementa stock en cantidad. Devuelve el documento actualizado o null si no existe. */
async function decrementStock(id, quantity) {
  const product = await Product.findByIdAndUpdate(
    id,
    { $inc: { stock: -quantity } },
    { new: true }
  ).lean();
  return product ? { ...product, id: product._id.toString() } : null;
}

module.exports = {
  findAll,
  findById,
  findByIdLean,
  create,
  updateById,
  deleteById,
  countDocuments,
  findPaginated,
  decrementStock
};
