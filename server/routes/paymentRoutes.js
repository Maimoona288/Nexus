const express = require('express');
const router = express.Router();
const Transaction = require('../models/transactionModel');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');

// NOTE: For real Stripe, install stripe and set STRIPE_SECRET_KEY in .env
// const Stripe = require('stripe');
// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment simulation (Stripe sandbox mock)
 */

/**
 * @swagger
 * /api/payments/deposit:
 *   post:
 *     summary: Simulate a deposit
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount: { type: number }
 *               description: { type: string }
 *     responses:
 *       201: { description: Deposit created }
 */
router.post('/deposit', verifyToken, async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required.' });

    // MOCK: Simulate Stripe PaymentIntent
    const mockPaymentIntentId = `pi_mock_${Date.now()}`;

    const tx = await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      amount: parseFloat(amount),
      description: description || 'Deposit to Nexus wallet',
      status: 'Completed',
      stripePaymentIntentId: mockPaymentIntentId
    });

    res.status(201).json({ message: 'Deposit successful.', transaction: tx });
  } catch (err) {
    res.status(500).json({ message: 'Deposit error.', error: err.message });
  }
});

/**
 * @swagger
 * /api/payments/withdraw:
 *   post:
 *     summary: Simulate a withdrawal
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 */
router.post('/withdraw', verifyToken, async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required.' });

    // Check available balance
    const completedDeposits = await Transaction.aggregate([
      { $match: { user: req.user.id, type: 'deposit', status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const completedWithdrawals = await Transaction.aggregate([
      { $match: { user: req.user.id, type: { $in: ['withdraw', 'transfer'] }, status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const balance = (completedDeposits[0]?.total || 0) - (completedWithdrawals[0]?.total || 0);

    if (amount > balance) {
      const tx = await Transaction.create({
        user: req.user.id, type: 'withdraw', amount, description, status: 'Failed'
      });
      return res.status(400).json({ message: 'Insufficient balance.', transaction: tx });
    }

    const tx = await Transaction.create({
      user: req.user.id,
      type: 'withdraw',
      amount: parseFloat(amount),
      description: description || 'Withdrawal from Nexus wallet',
      status: 'Completed'
    });

    res.status(201).json({ message: 'Withdrawal successful.', transaction: tx });
  } catch (err) {
    res.status(500).json({ message: 'Withdrawal error.', error: err.message });
  }
});

/**
 * @swagger
 * /api/payments/transfer:
 *   post:
 *     summary: Transfer funds to another user
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 */
router.post('/transfer', verifyToken, async (req, res) => {
  try {
    const { toUserEmail, amount, description } = req.body;
    if (!toUserEmail || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Recipient email and amount required.' });
    }

    const toUser = await User.findOne({ email: toUserEmail });
    if (!toUser) return res.status(404).json({ message: 'Recipient not found.' });
    if (toUser._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot transfer to yourself.' });
    }

    const tx = await Transaction.create({
      user: req.user.id,
      type: 'transfer',
      amount: parseFloat(amount),
      description: description || `Transfer to ${toUser.name}`,
      toUser: toUser._id,
      status: 'Completed'
    });

    res.status(201).json({ message: 'Transfer successful.', transaction: tx });
  } catch (err) {
    res.status(500).json({ message: 'Transfer error.', error: err.message });
  }
});

/**
 * @swagger
 * /api/payments/history:
 *   get:
 *     summary: Get transaction history
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 */
router.get('/history', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .populate('toUser', 'name email')
      .sort({ createdAt: -1 });

    // Compute balance
    const completed = transactions.filter(t => t.status === 'Completed');
    const totalIn = completed.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
    const totalOut = completed.filter(t => ['withdraw', 'transfer'].includes(t.type)).reduce((s, t) => s + t.amount, 0);
    const balance = totalIn - totalOut;

    res.json({ transactions, balance: balance.toFixed(2) });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching history.', error: err.message });
  }
});

module.exports = router;
