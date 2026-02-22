const ticketDao = require('../dao/ticketDao');

async function create(data) {
  return ticketDao.create(data);
}

module.exports = { create };
