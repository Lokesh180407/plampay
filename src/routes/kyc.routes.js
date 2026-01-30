const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const kycController = require('../controllers/kyc.controller');

const router = express.Router();

const uploadSchema = Joi.object({
  body: Joi.object({
    aadhaar_image_url: Joi.string().min(1).required(),
    pan_image_url: Joi.string().min(1).required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

router.post('/upload', requireAuth, validate(uploadSchema), kycController.upload);

module.exports = router;

