const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const walletController = require('../controllers/wallet.controller');
const paymentController = require('../controllers/payment.controller');

const router = express.Router();

const setPinSchema = Joi.object({
  body: Joi.object({
    pin: Joi.string().min(4).max(6).pattern(/^\d+$/).required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

const verifyPinSchema = Joi.object({
  body: Joi.object({
    pin: Joi.string().min(4).max(6).pattern(/^\d+$/).required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

const balanceSchema = Joi.object({
  body: Joi.object({
    pin: Joi.string().min(4).max(6).pattern(/^\d+$/).required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

const topupSchema = Joi.object({
  body: Joi.object({
    amount: Joi.number().positive().min(1).max(100000).required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

router.post('/set-pin', requireAuth, validate(setPinSchema), walletController.setPin);
router.post('/verify-pin', requireAuth, validate(verifyPinSchema), walletController.verifyPin);
router.post('/balance', requireAuth, validate(balanceSchema), walletController.getBalance);
router.post('/topup', requireAuth, validate(topupSchema), walletController.topup);

// Webhook for payment gateway
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
