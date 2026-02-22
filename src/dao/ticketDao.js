const Ticket = require('../models/Ticket');

async function create(data) {
  const ticket = await Ticket.create({
    amount: data.amount,
    purchaser: data.purchaser
  });
  return ticket.toJSON();
}

module.exports = { create };
