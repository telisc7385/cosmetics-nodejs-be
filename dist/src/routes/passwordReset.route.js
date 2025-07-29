"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passwordReset_controller_1 = require("../controllers/passwordReset.controller");
const rateLimiter_1 = require("../middlewares/rateLimiter");
const router = (0, express_1.Router)();
router.post('/request-reset', rateLimiter_1.RateLimiter, passwordReset_controller_1.requestPasswordReset); // Send OTP
router.post('/verify-otp', passwordReset_controller_1.verifyOTP); // Verify OTP
router.post('/reset-password', passwordReset_controller_1.resetPassword); // Reset password
exports.default = router;
