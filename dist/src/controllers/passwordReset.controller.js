"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.verifyOTP = exports.requestPasswordReset = void 0;
const otp_1 = require("../utils/otp");
const mail_1 = require("../email/mail");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../db/prisma"));
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
    }
    const otp = (0, otp_1.generateOTP)();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await prisma_1.default.user.update({
        where: { email },
        data: { resetOTP: otp, resetOTPExpiry: expiry },
    });
    await (0, mail_1.sendOTPEmail)(email, otp);
    res.status(200).json({ message: 'OTP sent successfully!' });
};
exports.requestPasswordReset = requestPasswordReset;
const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || user.resetOTP !== otp || !user.resetOTPExpiry || user.resetOTPExpiry < new Date()) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
    }
    res.status(200).json({ message: 'OTP verified' });
};
exports.verifyOTP = verifyOTP;
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user || user.resetOTP !== otp || !user.resetOTPExpiry || user.resetOTPExpiry < new Date()) {
        res.status(400).json({ message: 'Invalid or expired OTP' });
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
    await prisma_1.default.user.update({
        where: { email },
        data: {
            password: hashedPassword,
            resetOTP: null,
            resetOTPExpiry: null,
        },
    });
    res.status(200).json({ message: 'Password reset successfully' });
};
exports.resetPassword = resetPassword;
