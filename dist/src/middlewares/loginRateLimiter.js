"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRateLimiter = void 0;
// src/middlewares/loginRateLimiter.ts
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 10;
exports.loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: WINDOW_MINUTES * 60 * 1000, // 10 minutes
    max: MAX_ATTEMPTS, // 5 attempts
    keyGenerator: (req) => req.body.email || req.ip, // limit by email first
    handler: (req, res) => {
        res.status(429).json({
            message: `Too many login attempts. Please try again in ${WINDOW_MINUTES} minutes.`,
        });
    },
    standardHeaders: true, // send RateLimit headers
    legacyHeaders: false,
});
