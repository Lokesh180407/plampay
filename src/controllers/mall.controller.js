const mallService = require('../services/mall.service');

async function scanPay(req, res, next) {
  try {
    const { phone, palm_embedding: palmEmbedding, palm_bitmap: palmBitmap, amount } = req.body;

    if (!phone || !amount) {
      const err = new Error('phone and amount are required');
      err.statusCode = 400;
      throw err;
    }

    const result = await mallService.processMallScanPay({
      phone: String(phone).trim(),
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

module.exports = {
  scanPay,
};
