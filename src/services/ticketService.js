const ticketRepository = require('../repositories/ticketRepository');

async function create(data) {
  return ticketRepository.create(data);
}

module.exports = { create };
