"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayWebhookHandler = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = __importDefault(require("../db/prisma"));
const razorpayWebhookHandler = async (req, res) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = req.body.toString();
    const expectedSignature = crypto_1.default
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
    const isValid = signature === expectedSignature;
    console.log("signature", signature);
    console.log("expectedSignature", expectedSignature);
    console.log("body", body);
    let event;
    try {
        event = JSON.parse(body);
        console.log("event", event);
    }
    catch (err) {
        console.error('🔴 Failed to parse webhook body:', err);
        res.status(400).json({ message: 'Invalid body' });
        return;
    }
    const razorpayOrderId = event?.payload?.payment?.entity?.order_id || null;
    const razorpayPaymentId = event?.payload?.payment?.entity?.id || null; // ✅ Transaction ID
    console.log("razorpayOrderId", razorpayOrderId);
    console.log("razorpayPaymentId", razorpayPaymentId);
    // ✅ Log to database
    try {
        await prisma_1.default.razorpayWebhookLog.create({
            data: {
                event: event.event || 'unknown',
                orderId: razorpayOrderId,
                payload: event,
                receivedAt: new Date(),
                signature,
                isValid,
            },
        });
    }
    catch (logError) {
        console.error('🔴 Failed to log webhook:', logError);
    }
    // ❌ Invalid signature
    if (!isValid) {
        console.warn('❌ Invalid Razorpay webhook signature');
        res.status(400).json({ message: 'Invalid signature' });
        return;
    }
    console.log("event.event", event.event, razorpayOrderId);
    // ✅ Handle valid webhook
    if (event.event === 'payment.captured' && razorpayOrderId) {
        try {
            const order = await prisma_1.default.order.update({
                where: { razorpayOrderId },
                data: {
                    isVisible: true,
                    status: 'CONFIRMED',
                },
            });
            console.log("order", order);
            if (!order) {
                res.status(400).json({ error: "order payment not get" });
            }
            const paymentRes = await prisma_1.default.payment.updateMany({
                where: {
                    id: Number(order.paymentId)
                },
                data: {
                    transactionId: razorpayPaymentId,
                    status: 'SUCCESS'
                }
            });
            console.log(`✅ Order updated after payment capture: ${razorpayOrderId} ${paymentRes}`);
        }
        catch (err) {
            console.error('🔴 Failed to update order:', err);
        }
    }
    res.status(200).json({ status: 'Webhook received' });
};
exports.razorpayWebhookHandler = razorpayWebhookHandler;
