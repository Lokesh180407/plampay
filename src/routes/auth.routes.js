const express = require('express');
const Joi = require('joi');
const validate = require('../middleware/validate');
const authController = require('../controllers/auth.controller');

const router = express.Router();

const signupSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().min(6).max(20).required(),
    password: Joi.string().min(6).max(128).required(),
    confirm_password: Joi.string().valid(Joi.ref('password')).required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().min(6).max(20),
    password: Joi.string().min(6).max(128).required(),
  })
    .xor('email', 'phone')
    .messages({
      'object.missing': 'Either email or phone is required',
      'object.xor': 'Provide either email or phone, not both',
    }),
  params: Joi.object({}),
  query: Joi.object({}),
});

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;

