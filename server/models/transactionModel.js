const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['deposit', 'withdraw', 'transfer'], required: true },
  amount: { type: Number, required: true, min: 0.01 },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  description: { type: String, default: '' },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // for transfers
  stripePaymentIntentId: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
