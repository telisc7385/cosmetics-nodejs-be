"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDiscountCodes = exports.redeemDiscountCode = exports.getUserDiscountCodes = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const getUserDiscountCodes = async (req, res) => {
    const userId = req.user?.userId;
    try {
        const codes = await prisma_1.default.discountCode.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(codes);
    }
    catch (error) {
        console.error('Error fetching discount codes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserDiscountCodes = getUserDiscountCodes;
const redeemDiscountCode = async (req, res) => {
    const { code } = req.body;
    const userId = req.user?.userId;
    if (!code) {
        res.status(400).json({ message: 'Discount code is required' });
        return;
    }
    try {
        const discount = await prisma_1.default.discountCode.findFirst({
            where: {
                code,
                userId,
                used: false,
                expiresAt: { gt: new Date() },
            },
        });
        if (!discount) {
            res.status(404).json({ message: 'Invalid or expired discount code' });
            return;
        }
        // Optionally mark as used
        await prisma_1.default.discountCode.update({
            where: { id: discount.id },
            data: { used: true },
        });
        res.json({ message: 'Discount code redeemed', discount });
    }
    catch (error) {
        console.error('Error redeeming code:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.redeemDiscountCode = redeemDiscountCode;
const getAllDiscountCodes = async (_req, res) => {
    try {
        const codes = await prisma_1.default.discountCode.findMany({
            include: {
                user: { select: { email: true } },
                cart: { select: { id: true, updatedAt: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(codes);
    }
    catch (error) {
        console.error('Error fetching all codes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllDiscountCodes = getAllDiscountCodes;
