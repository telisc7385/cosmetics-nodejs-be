"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSubscribers = exports.subscribeNewsletter = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const sendNewsletterWelcomeEmail_1 = require("../../email/sendNewsletterWelcomeEmail");
// Subscribe a new email
const subscribeNewsletter = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' });
        return;
    }
    try {
        const existing = await prisma_1.default.newsLetter.findUnique({ where: { email } });
        if (existing) {
            res.status(200).json({ success: true, message: 'Already subscribed' });
            return;
        }
        const newSubscription = await prisma_1.default.newsLetter.create({ data: { email } });
        // ✅ Send welcome email
        await (0, sendNewsletterWelcomeEmail_1.sendNewsletterWelcomeEmail)(email);
        res.status(201).json({ success: true, message: 'Subscribed successfully', data: newSubscription });
    }
    catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
    }
};
exports.subscribeNewsletter = subscribeNewsletter;
// Get all newsletter emails (admin only, optional)
const getAllSubscribers = async (req, res) => {
    const search = req.query.search || '';
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * pageSize;
    try {
        const where = search
            ? {
                email: {
                    contains: search,
                    mode: 'insensitive',
                },
            }
            : {};
        const [subscribers, total] = await Promise.all([
            prisma_1.default.newsLetter.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            prisma_1.default.newsLetter.count({ where }),
        ]);
        const formattedResults = subscribers.map((s) => ({
            id: s.id,
            email: s.email,
            subscribed_at: new Date(s.createdAt).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            }).replace(',', ''),
        }));
        res.json({
            success: true,
            total_pages: Math.ceil(total / pageSize),
            current_page: page,
            page_size: pageSize,
            results: formattedResults,
        });
    }
    catch (error) {
        console.error('Fetch newsletter subscribers failed:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch subscribers', error: error.message });
    }
};
exports.getAllSubscribers = getAllSubscribers;
