const palmService = require('./palm.service');
const walletService = require('./wallet.service');
const prisma = require('../config/prisma');
const { validateEmbeddingArray } = require('../utils/palm');
const { decryptEmbedding, cosineSimilarity } = require('../utils/crypto');

const MATCH_THRESHOLD =
  typeof process.env.PALM_MATCH_THRESHOLD === 'string'
    ? Number(process.env.PALM_MATCH_THRESHOLD)
    : 0.95;

/**
 * Process mall scan-pay: find user by phone, verify palm match, deduct balance.
 */
async function processMallScanPay({ phone, palmEmbedding, palmBitmap, amount }) {
  const { extractEmbeddingFromBitmap } = require('../utils/palm');
  let embedding = palmEmbedding;
  if (palmBitmap && !palmEmbedding) {
    embedding = await extractEmbeddingFromBitmap(palmBitmap);
  }
  if (!embedding) {
    const err = new Error('Either palm_embedding or palm_bitmap is required');
    err.statusCode = 400;
    throw err;
  }
  validateEmbeddingArray(embedding);

  // Find user by phone
  const user = await prisma.user.findUnique({
    where: { phone },
    include: { wallet: true, palmData: true },
  });
  if (!user) {
    const err = new Error('User not found with this phone number');
    err.statusCode = 404;
    throw err;
  }

  if (!user.palmData) {
    const err = new Error('Palm KYC not completed for this user');
    err.statusCode = 403;
    throw err;
  }

  if (user.kycStatus !== 'APPROVED') {
    const err = new Error('KYC not completed');
    err.statusCode = 403;
    throw err;
  }

  const storedEmbedding = decryptEmbedding(user.palmData.encryptedEmbedding);
  const similarity = cosineSimilarity(embedding, storedEmbedding);
  if (similarity < MATCH_THRESHOLD) {
    const err = new Error('Palm not matched');
    err.statusCode = 401;
    throw err;
  }

  if (!user.wallet) {
    const err = new Error('Wallet not found');
    err.statusCode = 404;
    throw err;
  }

  const result = await walletService.deductBalance(
    user.wallet.id,
    amount,
    null,
    'Mall scan-pay'
  );

  return {
    userId: user.id,
    transactionId: result.transaction.id,
    amount,
    newBalance: Number(result.wallet.balance),
    similarity,
  };
}

module.exports = {
  processMallScanPay,
};
