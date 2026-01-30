const crypto = require('crypto');

const AES_ALGO = 'aes-256-gcm';

function getPalmKey() {
  const key = process.env.PALM_EMBEDDING_KEY;
  if (!key) {
    throw new Error('PALM_EMBEDDING_KEY not configured');
  }
  // Expect 32-byte key provided as hex or base64
  if (key.length === 64) {
    return Buffer.from(key, 'hex');
  }
  return Buffer.from(key, 'base64');
}

function encryptEmbedding(embeddingArray) {
  const key = getPalmKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(AES_ALGO, key, iv);

  const plaintext = JSON.stringify(embeddingArray);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  return JSON.stringify({
    iv: iv.toString('base64'),
    authTag,
    data: encrypted,
  });
}

function decryptEmbedding(encryptedEmbedding) {
  const key = getPalmKey();
  const payload = JSON.parse(encryptedEmbedding);
  const iv = Buffer.from(payload.iv, 'base64');
  const authTag = Buffer.from(payload.authTag, 'base64');
  const decipher = crypto.createDecipheriv(AES_ALGO, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(payload.data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length !== vecB.length) {
    throw new Error('Embedding vectors must be same length arrays');
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = Number(vecA[i]);
    const b = Number(vecB[i]);
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = {
  encryptEmbedding,
  decryptEmbedding,
  cosineSimilarity,
};

