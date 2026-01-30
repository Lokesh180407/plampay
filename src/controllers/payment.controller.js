const crypto = require('crypto');
const paymentService = require('../services/payment.service');
const walletService = require('../services/wallet.service');
const { verifyTerminal } = require('../middleware/terminalAuth');

async function scanPay(req, res, next) {
  try {
    const { terminal_id: terminalId, palm_embedding: palmEmbedding, palm_bitmap: palmBitmap, amount } = req.body;

    if (!terminalId || !amount) {
      const err = new Error('terminal_id and amount are required');
      err.statusCode = 400;
      throw err;
    }

    // Verify terminal (already done by middleware, but double-check)
    if (!req.terminal) {
      const err = new Error('Terminal authentication required');
      err.statusCode = 401;
      throw err;
    }

    const result = await paymentService.processPalmPayment({
      terminalId,
      palmEmbedding,
      palmBitmap,
      amount: Number(amount),
    });

    res.json({
      success: true,
      message: 'Payment successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function handleWebhook(req, res, next) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      return res.status(400).json({ success: false, message: 'Missing signature or webhook secret' });
    }

    const body = JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const orderId = payload.payment?.entity?.order_id || payload.order?.entity?.id;
      const transactionId = payload.payment?.entity?.notes?.transactionId || payload.order?.entity?.notes?.transactionId;

      if (transactionId) {
        await walletService.completeTopup(transactionId, orderId, 'RAZORPAY');
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  scanPay,
  handleWebhook,
};
