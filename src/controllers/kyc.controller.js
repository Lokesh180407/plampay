const kycService = require('../services/kyc.service');

async function upload(req, res, next) {
  try {
    const userId = req.user.id;
    const { aadhaar_image_url: aadhaarImageUrl, pan_image_url: panImageUrl } = req.body;
    const kyc = await kycService.uploadKyc(userId, { aadhaarImageUrl, panImageUrl });
    res.status(201).json({
      success: true,
      data: kyc,
    });
  } catch (err) {
    next(err);
  }
}

async function verify(req, res, next) {
  try {
    const { user_id: userId, decision } = req.body;
    const kyc = await kycService.verifyKyc({ userId, decision });
    res.json({
      success: true,
      data: kyc,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  upload,
  verify,
};

