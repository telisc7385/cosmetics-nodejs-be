"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTag = exports.updateTag = exports.createTag = exports.getAllTags = exports.extractUserName = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const jwt_1 = require("../../utils/jwt");
const extractUserName = async (req) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Token ', '');
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: { profile: true },
        });
        if (user?.profile?.firstName) {
            return `${user.profile.firstName} ${user.profile.lastName || ''}`.trim();
        }
        return user?.email || 'ECOM Store';
    }
    catch (err) {
        return 'ECOM Store';
    }
};
exports.extractUserName = extractUserName;
const getAllTags = async (req, res) => {
    const id = req.query.id;
    // If ID is passed via query, fetch by ID
    if (id) {
        const tag = await prisma_1.default.googleAnalytics.findUnique({
            where: { id: Number(id) },
        });
        if (!tag) {
            res.status(404).json({ success: false, message: 'Tag not found' });
            return;
        }
        res.json({
            success: true,
            result: {
                id: tag.id,
                google_email: tag.google_email,
                tag: tag.tag,
                measurement_id: tag.measurement_id,
                is_active: tag.is_active,
                created_by: tag.created_by,
                created_at: tag.created_at,
                updated_by: tag.updated_by,
                updated_at: tag.updated_at,
            },
        });
        return;
    }
    // If no ID, return latest (default)
    const tag = await prisma_1.default.googleAnalytics.findFirst({
        orderBy: { updated_at: 'desc' },
    });
    if (!tag) {
        res.json({ success: true, result: [] });
        return;
    }
    res.json({
        success: true,
        result: [
            {
                id: tag.id,
                google_email: tag.google_email,
                tag: tag.tag,
                measurement_id: tag.measurement_id,
                is_active: tag.is_active,
                created_by: tag.created_by,
                created_at: tag.created_at,
                updated_by: tag.updated_by,
                updated_at: tag.updated_at,
            },
        ],
    });
    return;
};
exports.getAllTags = getAllTags;
const createTag = async (req, res) => {
    const { google_email, tag, measurement_id, is_active } = req.body;
    const user = await (0, exports.extractUserName)(req);
    const newTag = await prisma_1.default.googleAnalytics.create({
        data: {
            google_email,
            tag,
            measurement_id,
            is_active,
            created_by: user,
            updated_by: user,
        },
    });
    res.status(201).json({ success: true, id: newTag.id });
};
exports.createTag = createTag;
const updateTag = async (req, res) => {
    const { id } = req.params;
    const { google_email, tag, measurement_id, is_active } = req.body;
    const user = await (0, exports.extractUserName)(req);
    const existing = await prisma_1.default.googleAnalytics.findUnique({
        where: { id: Number(id) },
    });
    if (!existing) {
        res.status(404).json({ success: false, message: 'Tag not found' });
        return;
    }
    const updated = await prisma_1.default.googleAnalytics.update({
        where: { id: Number(id) },
        data: {
            google_email,
            tag,
            measurement_id,
            is_active,
            updated_by: user,
        },
    });
    res.json({
        success: true,
        result: {
            id: updated.id,
            google_email: updated.google_email,
            tag: updated.tag,
            measurement_id: updated.measurement_id,
            is_active: updated.is_active,
            created_by: updated.created_by,
            created_at: updated.created_at,
            updated_by: updated.updated_by,
            updated_at: updated.updated_at,
        },
    });
};
exports.updateTag = updateTag;
const deleteTag = async (req, res) => {
    const { id } = req.params;
    await prisma_1.default.googleAnalytics.delete({
        where: { id: Number(id) },
    });
    res.json({ success: true, message: 'Deleted successfully' });
    return;
};
exports.deleteTag = deleteTag;
