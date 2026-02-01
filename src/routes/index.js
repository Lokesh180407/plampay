const express = require('express');

const authRoutes = require('./auth.routes');
const kycRoutes = require('./kyc.routes');
const palmRoutes = require('./palm.routes');
const walletRoutes = require('./wallet.routes');
const paymentRoutes = require('./payment.routes');
const mallRoutes = require('./mall.routes');
const adminRoutes = require('./admin.routes');
const healthRoutes = require('./health.routes');
const uploadRoutes = require('./upload.routes');

const router = express.Router();

// Health check (no auth required)
router.use('/', healthRoutes);

router.use('/auth', authRoutes);
router.use('/kyc', kycRoutes);
router.use('/palm', palmRoutes);
router.use('/wallet', walletRoutes);
router.use('/payment', paymentRoutes);
router.use('/mall', mallRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;

