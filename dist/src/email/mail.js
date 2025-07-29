"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPEmail = exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendOTPEmail = async (to, otp) => {
    await exports.transporter.sendMail({
        from: `"E-COM Support" <${process.env.EMAIL_USER}>`,
        to,
        subject: '🔐 Your OTP for Password Reset',
        html: `
      <div style="font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #333; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Reset Your Password</h2>
          <p style="font-size: 15px; color: #555;">Hello,</p>
          <p style="font-size: 15px; color: #555;">We received a request to reset your password. Please use the OTP below to proceed:</p>
          <div style="margin: 20px 0; text-align: center;">
            <span style="display: inline-block; font-size: 24px; letter-spacing: 4px; font-weight: bold; color: #2c3e50;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #888;">This OTP will expire in 10 minutes. If you didn’t request a password reset, you can safely ignore this email.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #aaa;">— E-COM Team</p>
        </div>
      </div>
    `,
    });
};
exports.sendOTPEmail = sendOTPEmail;
