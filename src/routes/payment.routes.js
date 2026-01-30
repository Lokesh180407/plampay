const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { verifyTerminal } = require('../middleware/terminalAuth');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

const scanPaySchema = Joi.object({
  body: Joi.object({
    terminal_id: Joi.string().required(),
    api_key: Joi.string().required(),
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

router.post('/scan-pay', verifyTerminal, validate(scanPaySchema), paymentController.scanPay);

module.exports = router;
