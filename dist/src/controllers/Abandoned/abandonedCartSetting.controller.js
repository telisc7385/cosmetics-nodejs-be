"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAbandonedCartSetting = exports.updateAbandonedCartSetting = exports.createAbandonedCartSetting = exports.getAllAbandonedCartSettings = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const extractName_1 = require("../../utils/extractName");
const getAllAbandonedCartSettings = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;
        const ordering = req.query.ordering || 'id';
        const isActive = req.query.is_active;
        const where = {};
        if (isActive !== undefined) {
            where.is_active = isActive === 'true';
        }
        const total = await prisma_1.default.abandonedCartSetting.count({ where });
        const results = await prisma_1.default.abandonedCartSetting.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: {
                [ordering.replace('-', '')]: ordering.startsWith('-') ? 'desc' : 'asc',
            },
        });
        res.status(200).json({
            total_pages: Math.ceil(total / pageSize),
            current_page: page,
            page_size: pageSize,
            results: results.map((item) => ({
                ...item,
                created_at: item.created_at,
                updated_at: item.updated_at,
            })),
        });
    }
    catch (error) {
        console.error('Failed to fetch abandoned cart settings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllAbandonedCartSettings = getAllAbandonedCartSettings;
const createAbandonedCartSetting = async (req, res) => {
    try {
        const { hours_after_email_is_sent, discount_to_be_given_in_percent, hours_after_email_cart_is_emptied, is_active } = req.body;
        const user = await (0, extractName_1.getUserNameFromToken)(req);
        const data = {
            hours_after_email_is_sent: parseInt(hours_after_email_is_sent, 10),
            discount_to_be_given_in_percent: parseInt(discount_to_be_given_in_percent, 10),
            hours_after_email_cart_is_emptied: parseInt(hours_after_email_cart_is_emptied, 10),
            is_active: Boolean(is_active),
            created_by: user || 'System',
            updated_by: user || 'System',
        };
        const setting = await prisma_1.default.abandonedCartSetting.create({ data });
        res.status(201).json({ success: true, result: setting });
    }
    catch (error) {
        console.error('Failed to create abandoned cart setting:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.createAbandonedCartSetting = createAbandonedCartSetting;
const updateAbandonedCartSetting = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { hours_after_email_is_sent, discount_to_be_given_in_percent, hours_after_email_cart_is_emptied, is_active, } = req.body;
        const user = await (0, extractName_1.getUserNameFromToken)(req);
        const data = {
            updated_by: user || 'System',
        };
        if (hours_after_email_is_sent !== undefined) {
            data.hours_after_email_is_sent = parseInt(hours_after_email_is_sent, 10);
        }
        if (discount_to_be_given_in_percent !== undefined) {
            data.discount_to_be_given_in_percent = parseInt(discount_to_be_given_in_percent, 10);
        }
        if (hours_after_email_cart_is_emptied !== undefined) {
            data.hours_after_email_cart_is_emptied = parseInt(hours_after_email_cart_is_emptied, 10);
        }
        if (is_active !== undefined) {
            data.is_active = is_active === true || is_active === 'true';
        }
        const updated = await prisma_1.default.abandonedCartSetting.update({
            where: { id },
            data,
        });
        res.status(200).json({ success: true, result: updated });
    }
    catch (error) {
        console.error('Failed to update abandoned cart setting:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.updateAbandonedCartSetting = updateAbandonedCartSetting;
const deleteAbandonedCartSetting = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma_1.default.abandonedCartSetting.delete({ where: { id } });
        res.status(204).send({ success: true, message: 'Cart setting deleted' });
    }
    catch (error) {
        console.error('Failed to delete abandoned cart setting:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.deleteAbandonedCartSetting = deleteAbandonedCartSetting;
