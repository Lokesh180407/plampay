const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const mallController = require('../controllers/mall.controller');

const router = express.Router();

const scanPaySchema = Joi.object({
  body: Joi.object({
    phone: Joi.string().min(6).max(20).required(),
    palm_embedding: Joi.array().items(Joi.number()).optional(),
    palm_bitmap: Joi.string().optional(),
    amount: Joi.number().positive().min(0.01).required(),
  })
    .xor('palm_embedding', 'palm_bitmap')
    .messages({
      'object.missing': 'Either palm_embedding or palm_bitmap is required',
      'object.xor': 'Provide either palm_embedding or palm_bitmap, not both',
    }),
  params: Joi.object({}),
  query: Joi.object({}),
});

router.post('/scan-pay', validate(scanPaySchema), mallController.scanPay);

module.exports = router;
