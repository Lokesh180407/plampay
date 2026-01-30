const authService = require('../services/auth.service');

async function signup(req, res, next) {
  try {
    const { email, phone, password } = req.body;
    const result = await authService.signup({ email, phone, password });
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, phone, password } = req.body;
    const result = await authService.login({ email, phone, password });
    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
};

