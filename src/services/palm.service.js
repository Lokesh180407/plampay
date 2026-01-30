const prisma = require('../config/prisma');
const { encryptEmbedding } = require('../utils/crypto');
const { validateEmbeddingArray } = require('../utils/palm');

async function enrollPalm(userId, embedding) {
  validateEmbeddingArray(embedding);

  const encryptedEmbedding = encryptEmbedding(embedding);

  const palmData = await prisma.palmData.upsert({
    where: { userId },
    update: {
      encryptedEmbedding,
    },
    create: {
      userId,
      encryptedEmbedding,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { palmRegistered: true },
  });

  return palmData;
}

const MATCH_THRESHOLD =
  typeof process.env.PALM_MATCH_THRESHOLD === 'string'
    ? Number(process.env.PALM_MATCH_THRESHOLD)
    : 0.95;

async function findUserByPalmEmbedding(embedding, threshold = MATCH_THRESHOLD || 0.95) {
  const allPalmData = await prisma.palmData.findMany({
    include: {
      user: {
        include: {
          wallet: true,
        },
      },
    },
  });

  const { cosineSimilarity } = require('../utils/crypto');
  let bestMatch = null;
  let bestScore = 0;

  for (const palmRecord of allPalmData) {
    try {
      const { decryptEmbedding } = require('../utils/crypto');
      const storedEmbedding = decryptEmbedding(palmRecord.encryptedEmbedding);
      const similarity = cosineSimilarity(embedding, storedEmbedding);
      if (similarity > bestScore) {
        bestScore = similarity;
        bestMatch = palmRecord;
      }
    } catch (err) {
      // Skip invalid embeddings
      continue;
    }
  }

  if (bestScore < threshold) {
    return null;
  }

  return {
    user: bestMatch.user,
    similarity: bestScore,
  };
}

module.exports = {
  enrollPalm,
  findUserByPalmEmbedding,
};
