const userRepository = require('../repositories/userRepository');

async function register(body) {
  return userRepository.register(body);
}

async function findByEmail(email) {
  return userRepository.findByEmail(email);
}

/** Para estrategia JWT "current": devuelve usuario con id y cart como string, sin password. */
async function findById(id) {
  return userRepository.findById(id);
}

async function getAll() {
  return userRepository.getAll();
}

async function getById(id) {
  return userRepository.getById(id);
}

async function update(id, body) {
  return userRepository.update(id, body);
}

async function remove(id) {
  return userRepository.remove(id);
}

module.exports = {
  register,
  findByEmail,
  findById,
  getAll,
  getById,
  update,
  remove
};
