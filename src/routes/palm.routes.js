const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const palmController = require('../controllers/palm.controller');

const router = express.Router();

const enrollSchema = Joi.object({
  body: Joi.object({
    palm_embedding: Joi.array().items(Joi.number()).optional(),
    palm_bitmap: Joi.string().optional(),
  }).xor('palm_embedding', 'palm_bitmap'),
  params: Joi.object({}),
  query: Joi.object({}),
});

router.post('/enroll', requireAuth, validate(enrollSchema), palmController.enroll);

module.exports = router;
