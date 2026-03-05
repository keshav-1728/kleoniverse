const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, getPaymentStatus } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth'); // Assuming there's auth middleware

// @route   POST /api/payment/create-order
// @desc    Create a Razorpay order for payment
// @access  Private
router.post('/create-order', protect, createPaymentOrder);

// @route   POST /api/payment/verify
// @desc    Verify payment signature
// @access  Private
router.post('/verify', protect, verifyPayment);

// @route   GET /api/payment/status/:paymentId
// @desc    Get payment status from Razorpay
// @access  Private
router.get('/status/:paymentId', protect, getPaymentStatus);

module.exports = router;
