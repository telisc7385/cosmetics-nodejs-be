"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const websocket_1 = require("../socket/websocket");
const sendNotification = async (userId, message, type = 'ORDER' // default type
) => {
    const notification = await prisma_1.default.notification.create({
        data: {
            userId,
            message,
            type,
        },
    });
    (0, websocket_1.notifyUpdate)(userId, {
        type: 'NOTIFICATION',
        data: {
            message,
            type, // ORDER | ALERT | SYSTEM
            id: notification.id,
            isRead: notification.isRead,
            createdAt: notification.createdAt,
        },
    });
};
exports.sendNotification = sendNotification;
