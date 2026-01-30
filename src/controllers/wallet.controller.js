const walletService = require('../services/wallet.service');
const { getRazorpay } = require('../config/razorpay');

async function setPin(req, res, next) {
  try {
    const userId = req.user.id;
    const { pin } = req.body;
    await walletService.setPin(userId, pin);
    res.json({
      success: true,
      message: 'PIN set successfully',
    });
  } catch (err) {
    next(err);
  }
}

async function verifyPin(req, res, next) {
  try {
    const userId = req.user.id;
    const { pin } = req.body;
    await walletService.verifyPin(userId, pin);
    res.json({
      success: true,
      message: 'PIN verified',
    });
  } catch (err) {
    next(err);
  }
}

async function getBalance(req, res, next) {
  try {
    const userId = req.user.id;
    const { pin } = req.body;

    // Require PIN for balance check
    await walletService.verifyPin(userId, pin);

    const balance = await walletService.getBalance(userId);
    res.json({
      success: true,
      data: balance,
    });
  } catch (err) {
    next(err);
  }
}

async function topup(req, res, next) {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    const transaction = await walletService.createTopupOrder(userId, amount);

    // Create Razorpay order
    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: transaction.id,
      notes: {
        transactionId: transaction.id,
        userId,
      },
    });

    res.json({
      success: true,
      data: {
        transactionId: transaction.id,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount / 100,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  setPin,
  verifyPin,
  getBalance,
  topup,
};
