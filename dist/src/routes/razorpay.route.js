"use strict";
// src/routes/razorpayWebhookRoutes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const razorpay_controller_1 = require("../controllers/razorpay.controller");
// import { razorpayWebhookHandler } from '../controllers/razorpayWebhookController';
const router = express_1.default.Router();
// Razorpay requires raw body for signature verification
router.post('/', express_1.default.raw({ type: 'application/json' }), razorpay_controller_1.razorpayWebhookHandler);
exports.default = router;
