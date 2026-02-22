const User = require('../models/User');

async function findOneByEmail(email) {
  return User.findOne({ email }).lean();
}

async function findById(id) {
  return User.findById(id).lean();
}

async function findByIdWithPassword(id) {
  return User.findById(id).lean();
}

async function create(data) {
  const user = await User.create(data);
  return user.toJSON();
}

async function updateById(id, data) {
  const user = await User.findByIdAndUpdate(id, data, { new: true }).select('-password').lean();
  return user ? { ...user, id: user._id.toString() } : null;
}

async function deleteById(id) {
  const user = await User.findByIdAndDelete(id).lean();
  return user ? { ...user, id: user._id.toString() } : null;
}

async function findAll() {
  const list = await User.find().select('-password').lean();
  return list.map((u) => ({ ...u, id: u._id.toString() }));
}

module.exports = {
  findOneByEmail,
  findById,
  findByIdWithPassword,
  create,
  updateById,
  deleteById,
  findAll
};
