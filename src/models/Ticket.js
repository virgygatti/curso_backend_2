const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const ticketSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, default: () => randomUUID() },
    purchase_datetime: { type: Date, default: Date.now },
    amount: { type: Number, required: true, min: 0 },
    purchaser: { type: String, required: true }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model('Ticket', ticketSchema);
