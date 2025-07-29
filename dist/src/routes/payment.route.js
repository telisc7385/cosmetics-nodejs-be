"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const payment_controller_1 = require("../controllers/payment.controller");
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const router = express_1.default.Router();
// Create a payment record for an order
router.post('/', authenticate_1.authenticate, payment_controller_1.createPayment);
// Update payment status (e.g., from webhook or frontend callback)
router.patch('/:id/status', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, payment_controller_1.updatePayment);
// get payment by id
router.get('/view/:id', authenticate_1.authenticate, payment_controller_1.getPaymentById);
// Get payment details by order ID
router.get('/order/:orderId', authenticate_1.authenticate, payment_controller_1.getPaymentByOrder);
router.get('/history', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, payment_controller_1.listPayments);
exports.default = router;
