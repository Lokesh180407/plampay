const express = require('express');

const authRoutes = require('./auth.routes');
const kycRoutes = require('./kyc.routes');
const palmRoutes = require('./palm.routes');
const walletRoutes = require('./wallet.routes');
const paymentRoutes = require('./payment.routes');
const adminRoutes = require('./admin.routes');
const healthRoutes = require('./health.routes');

const router = express.Router();

// Health check (no auth required)
router.use('/', healthRoutes);

router.use('/auth', authRoutes);
router.use('/kyc', kycRoutes);
router.use('/palm', palmRoutes);
router.use('/wallet', walletRoutes);
router.use('/payment', paymentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

