"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllNotifications = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
// 1. Get all notifications
const getNotifications = async (req, res) => {
    const notifications = await prisma_1.default.notification.findMany({
        where: { userId: req.user.userId },
        orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
};
exports.getNotifications = getNotifications;
// 2. Mark one as read
const markAsRead = async (req, res) => {
    const { id } = req.params;
    const updated = await prisma_1.default.notification.update({
        where: { id: Number(id) },
        data: { isRead: true },
    });
    res.json(updated);
};
exports.markAsRead = markAsRead;
// 3. Mark all as read
const markAllAsRead = async (req, res) => {
    await prisma_1.default.notification.updateMany({
        where: { userId: req.user.userId, isRead: false },
        data: { isRead: true },
    });
    res.json({ message: 'All notifications marked as read.' });
};
exports.markAllAsRead = markAllAsRead;
// 4. Delete one notification
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    await prisma_1.default.notification.delete({
        where: { id: Number(id) },
    });
    res.json({ message: 'Notification deleted.' });
};
exports.deleteNotification = deleteNotification;
// 5. Delete all notifications for user
const clearAllNotifications = async (req, res) => {
    await prisma_1.default.notification.deleteMany({
        where: { userId: req.user.userId },
    });
    res.json({ message: 'All notifications cleared.' });
};
exports.clearAllNotifications = clearAllNotifications;
