const crypto = require('crypto');

/**
 * Palm-related helpers.
 *
 * This backend supports TWO modes:
 * 1. Client-side extraction (recommended): Android app uses
 *    https://github.com/kby-ai/Palmprint-Recognition-Android
 *    to generate a palm feature vector and sends `palm_embedding`.
 * 2. Server-side extraction (added for your requirement): Android app sends a
 *    base64-encoded palm bitmap (`palm_bitmap`), and the backend converts it
 *    into a deterministic numeric embedding that can be stored and matched.
 *
 * The server-side embedding here is a deterministic hash-based projection,
 * not a real ML model. In production, you can replace the implementation of
 * `extractEmbeddingFromBitmap` with a call to a proper palm-recognition model
 * service while keeping the rest of the pipeline unchanged.
 */

function validateEmbeddingArray(embedding) {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Palm embedding must be a non-empty array');
  }
  if (!embedding.every((v) => typeof v === 'number' || typeof v === 'string')) {
    throw new Error('Palm embedding must contain numeric values');
  }
}

/**
 * Pseudo palm embedding generator from bitmap.
 *
 * - Accepts base64-encoded image (optionally with data URI prefix).
 * - Decodes to bytes.
 * - Uses a cryptographic hash to project bytes into a fixed-length
 *   numeric vector suitable for cosine similarity.
 *
 * NOTE: This is NOT a true biometric model, but it behaves like an
 * embedding function (same input -> same vector) and keeps the rest
 * of the system (enrollment, matching, payments) exactly as designed.
 */
async function extractEmbeddingFromBitmap(bitmapBase64) {
  if (!bitmapBase64 || typeof bitmapBase64 !== 'string') {
    throw new Error('palm_bitmap must be a base64-encoded string');
  }

  // Strip potential data URI prefix: data:image/png;base64,....
  const base64Part = bitmapBase64.includes(',')
    ? bitmapBase64.split(',').pop()
    : bitmapBase64;

  let buffer;
  try {
    buffer = Buffer.from(base64Part, 'base64');
  } catch (e) {
    throw new Error('Invalid base64 palm bitmap');
  }

  if (!buffer || !buffer.length) {
    throw new Error('Empty palm bitmap data');
  }

  // Hash the image bytes to get a stable fingerprint
  const hash = crypto.createHash('sha512').update(buffer).digest(); // 64 bytes

  // Project hash bytes into a numeric vector (e.g. 128 dimensions)
  const EMBEDDING_LENGTH = 128;
  const embedding = [];
  for (let i = 0; i < EMBEDDING_LENGTH; i++) {
    const byte = hash[i % hash.length]; // 0..255
    // Map to roughly [-1, 1] range as float
    const value = (byte - 128) / 128;
    embedding.push(Number(value.toFixed(6)));
  }

  return embedding;
}

module.exports = {
  validateEmbeddingArray,
  extractEmbeddingFromBitmap,
};

