const palmService = require('./palm.service');
const walletService = require('./wallet.service');
const { validateEmbeddingArray } = require('../utils/palm');

async function processPalmPayment({ terminalId, palmEmbedding, palmBitmap, amount }) {
  // Extract embedding if bitmap provided
  let embedding = palmEmbedding;
  if (palmBitmap && !palmEmbedding) {
    const { extractEmbeddingFromBitmap } = require('../utils/palm');
    embedding = await extractEmbeddingFromBitmap(palmBitmap);
  }

  if (!embedding) {
    const err = new Error('Either palm_embedding or palm_bitmap is required');
    err.statusCode = 400;
    throw err;
  }

  validateEmbeddingArray(embedding);

  // Match palm (threshold default >= 0.95, configurable via PALM_MATCH_THRESHOLD)
  const match = await palmService.findUserByPalmEmbedding(embedding);
  if (!match) {
    const err = new Error('Palm not recognized');
    err.statusCode = 401;
    throw err;
  }

  const user = match.user;

  // Check KYC
  if (user.kycStatus !== 'APPROVED') {
    const err = new Error('KYC not approved');
    err.statusCode = 403;
    throw err;
  }

  // Get wallet
  const wallet = await walletService.getWalletByUserId(user.id);

  // Deduct balance
  const result = await walletService.deductBalance(
    wallet.id,
    amount,
    terminalId,
    `Palm payment at terminal ${terminalId}`
  );

  return {
    success: true,
    userId: user.id,
    transactionId: result.transaction.id,
    newBalance: Number(result.wallet.balance),
    similarity: match.similarity,
  };
}

module.exports = {
  processPalmPayment,
};
