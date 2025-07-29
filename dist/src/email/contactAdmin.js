"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendContactAlertToAdmin = void 0;
const mail_1 = require("./mail");
const sendContactAlertToAdmin = async (adminEmail, userName, userEmail, subjectText, message) => {
    const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fffbea;padding:24px;border-radius:8px;border:1px solid #ddd;">
      <h2 style="color:#d32f2f;text-align:center;">📨 New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${userEmail}</p>
      <p><strong>Subject:</strong> ${subjectText}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background:#fff3cd;padding:12px;border-left:4px solid #ffecb5;">${message}</blockquote>
    </div>
  `;
    await mail_1.transporter.sendMail({
        from: '"E-COM Contact Form" <no-reply@ecom.com>',
        to: adminEmail,
        subject: `📨 New Contact Request from ${userName}`,
        html,
    });
};
exports.sendContactAlertToAdmin = sendContactAlertToAdmin;
