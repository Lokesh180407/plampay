const palmService = require('../services/palm.service');

async function enroll(req, res, next) {
  try {
    const userId = req.user.id;
    const { palm_embedding: palmEmbedding, palm_bitmap: palmBitmap } = req.body;

    let embedding = palmEmbedding;

    // If bitmap is provided, extract embedding (stub - should be done on Android)
    if (palmBitmap && !palmEmbedding) {
      const { extractEmbeddingFromBitmap } = require('../utils/palm');
      embedding = await extractEmbeddingFromBitmap(palmBitmap);
    }

    if (!embedding) {
      const err = new Error('Either palm_embedding or palm_bitmap is required');
      err.statusCode = 400;
      throw err;
    }

    const palmData = await palmService.enrollPalm(userId, embedding);
    res.status(201).json({
      success: true,
      message: 'Palm enrolled successfully',
      data: {
        palmRegistered: true,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  enroll,
};
