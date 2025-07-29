"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderCancelledEmail = sendOrderCancelledEmail;
const mail_1 = require("./mail");
async function sendOrderCancelledEmail(email, orderId) {
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eee;border-radius:8px;">
      <h2>Order #${orderId} Cancelled</h2>
      <p>Your order has been automatically cancelled because it was not completed within 48 hours.</p>
      <p>If you still want to purchase the items, please place a new order.</p>
      <p>Thank you for shopping with us.</p>
    </div>
  `;
    await mail_1.transporter.sendMail({
        from: '"E-COM" <no-reply@ecom.com>',
        to: email,
        subject: `Your Order #${orderId} Has Been Cancelled`,
        html,
    });
}
