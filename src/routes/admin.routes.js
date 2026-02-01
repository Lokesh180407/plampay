const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const kycController = require('../controllers/kyc.controller');
const terminalController = require('../controllers/terminal.controller');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

const verifyKycSchema = Joi.object({
  body: Joi.object({
    user_id: Joi.string().uuid().required(),
    decision: Joi.string().valid('approve', 'reject').required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

const createTerminalSchema = Joi.object({
  body: Joi.object({
    terminal_id: Joi.string().min(3).max(64).required(),
    api_key: Joi.string().min(8).required(),
    merchant: Joi.string().min(1).required(),
    location: Joi.string().allow('', null),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

router.post(
  '/verify-kyc',
  requireAuth,
  requireAdmin,
  validate(verifyKycSchema),
  kycController.verify
);

router.post(
  '/terminals',
  requireAuth,
  requireAdmin,
  validate(createTerminalSchema),
  terminalController.create
);

router.get(
  '/users',
  requireAuth,
  requireAdmin,
  adminController.getAllUsers
);

module.exports = router;

