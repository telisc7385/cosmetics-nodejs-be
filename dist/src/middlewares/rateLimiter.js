"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Example: Limit OTP or login requests to 5 per 10 minutes
exports.RateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        message: 'Too many OTP requests. Please try again after 10 minutes.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
