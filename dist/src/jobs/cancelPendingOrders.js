"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelStalePendingOrdersAndNotify = cancelStalePendingOrdersAndNotify;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../db/prisma"));
const cron_1 = require("cron");
const canceledOrderMail_1 = require("../email/canceledOrderMail");
const notification_1 = require("../utils/notification");
async function cancelStalePendingOrdersAndNotify() {
    try {
        const cutoffDate = new Date(Date.now() - 48 * 60 * 60 * 1000);
        // Find all pending orders older than 48h with user email included
        const staleOrders = await prisma_1.default.order.findMany({
            where: {
                status: client_1.OrderStatus.PENDING,
                createdAt: { lt: cutoffDate },
            },
            include: {
                user: true,
            },
        });
        if (staleOrders.length === 0) {
            console.log('No stale pending orders to cancel.');
            return;
        }
        // Cancel all stale orders at once
        const updateResult = await prisma_1.default.order.updateMany({
            where: {
                status: client_1.OrderStatus.PENDING,
                createdAt: { lt: cutoffDate },
            },
            data: { status: client_1.OrderStatus.CANCELLED },
        });
        console.log(`Cancelled ${updateResult.count} stale pending orders.`);
        // Send cancellation email to each affected user
        for (const order of staleOrders) {
            const email = order.user.email;
            if (email) {
                try {
                    await (0, canceledOrderMail_1.sendOrderCancelledEmail)(email, order.id);
                    (0, notification_1.sendNotification)(order.userId, `⚠️ Order #${order.id} has been cancelled due to inactivity.`, 'ALERT');
                    console.log(`Sent cancellation email to ${email} for order #${order.id}`);
                }
                catch (err) {
                    console.error(`Failed to send cancellation email to ${email}`, err);
                }
            }
        }
    }
    catch (error) {
        console.error('Error cancelling stale pending orders:', error);
    }
}
const job = new cron_1.CronJob('0 0 * * *', cancelStalePendingOrdersAndNotify);
job.start();
//console.log('Stale pending orders cancellation + email cron job started.');
