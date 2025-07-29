"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentByOrder = exports.listPayments = exports.updatePayment = exports.getPaymentById = exports.createPayment = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../db/prisma"));
// Create a new payment
const createPayment = async (req, res) => {
    try {
        const { method, status, transactionId, paidAt, orderId } = req.body;
        if (!method || !orderId) {
            res.status(400).json({ error: "Method and orderId are required" });
            return;
        }
        const payment = await prisma_1.default.payment.create({
            data: {
                method,
                status: status || client_1.PaymentStatus.PENDING,
                transactionId,
                paidAt: paidAt ? new Date(paidAt) : null,
                order: { connect: { id: orderId } },
            },
        });
        // Link payment to order
        await prisma_1.default.order.update({
            where: { id: orderId },
            data: { paymentId: payment.id },
        });
        res.status(201).json(payment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create payment" });
    }
};
exports.createPayment = createPayment;
// Get payment by ID
const getPaymentById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const payment = await prisma_1.default.payment.findUnique({
            where: { id },
            include: { order: true },
        });
        if (!payment) {
            res.status(404).json({ error: "Payment not found" });
            return;
        }
        res.json(payment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch payment" });
    }
};
exports.getPaymentById = getPaymentById;
// Update a payment by ID
const updatePayment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { method, status, transactionId, paidAt } = req.body;
        const updatedPayment = await prisma_1.default.payment.update({
            where: { id },
            data: {
                method,
                status,
                transactionId,
                paidAt: paidAt ? new Date(paidAt) : null,
            },
        });
        res.json(updatedPayment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update payment" });
    }
};
exports.updatePayment = updatePayment;
// List all payments
const listPayments = async (_req, res) => {
    try {
        const payments = await prisma_1.default.payment.findMany({
            include: { order: true },
        });
        res.json(payments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch payments" });
    }
};
exports.listPayments = listPayments;
// Get payment details by order ID
const getPaymentByOrder = async (req, res) => {
    try {
        const orderId = Number(req.params.orderId);
        if (isNaN(orderId)) {
            res.status(400).json({ error: "Invalid orderId" });
            return;
        }
        const payment = await prisma_1.default.payment.findFirst({
            where: { order: { id: orderId } },
            include: { order: true },
        });
        if (!payment) {
            res.status(404).json({ error: "Payment not found for this order" });
            return;
        }
        res.json(payment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch payment by order ID" });
    }
};
exports.getPaymentByOrder = getPaymentByOrder;
