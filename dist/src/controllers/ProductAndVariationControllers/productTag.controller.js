"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductTag = exports.updateProductTag = exports.createProductTag = exports.getAllProductTags = exports.extractUserName = void 0;
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
const getAllProductTags = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.page_size) || 10;
    const skip = (page - 1) * pageSize;
    const isActiveQuery = req.query.is_active;
    const isActive = isActiveQuery === 'true' ? true :
        isActiveQuery === 'false' ? false :
            undefined;
    const whereClause = isActive !== undefined ? { is_active: isActive } : {};
    const [tags, totalCount] = await Promise.all([
        prisma_1.default.productTag.findMany({
            where: whereClause,
            skip,
            take: pageSize,
            orderBy: { updated_at: 'desc' },
        }),
        prisma_1.default.productTag.count(),
    ]);
    const totalPages = Math.ceil(totalCount / pageSize);
    res.json({
        total_pages: totalPages,
        current_page: page,
        page_size: pageSize,
        results: tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            is_active: tag.is_active,
            created_by: tag.created_by,
            created_at: tag.created_at,
            updated_by: tag.updated_by,
            updated_at: tag.updated_at,
        })),
    });
};
exports.getAllProductTags = getAllProductTags;
const createProductTag = async (req, res) => {
    const { name, is_active } = req.body;
    const userName = await (0, exports.extractUserName)(req);
    const newTag = await prisma_1.default.productTag.create({
        data: {
            name,
            is_active,
            created_by: userName,
            updated_by: userName,
        },
    });
    res.status(201).json({
        success: true,
        result: {
            id: newTag.id,
            name: newTag.name,
            is_active: newTag.is_active,
            created_by: newTag.created_by,
            created_at: newTag.created_at,
            updated_by: newTag.updated_by,
            updated_at: newTag.updated_at,
        },
    });
};
exports.createProductTag = createProductTag;
const updateProductTag = async (req, res) => {
    const { id } = req.params;
    const { name, is_active } = req.body;
    const updater = await (0, exports.extractUserName)(req);
    const updated = await prisma_1.default.productTag.update({
        where: { id: Number(id) },
        data: {
            name,
            is_active,
            updated_by: updater,
        },
    });
    res.json({
        success: true,
        result: {
            id: updated.id,
            name: updated.name,
            is_active: updated.is_active,
            created_by: updated.created_by,
            created_at: updated.created_at,
            updated_by: updated.updated_by,
            updated_at: updated.updated_at,
        },
    });
};
exports.updateProductTag = updateProductTag;
const deleteProductTag = async (req, res) => {
    const { id } = req.params;
    await prisma_1.default.productTag.delete({
        where: { id: Number(id) },
    });
    res.json({ success: true, message: 'Deleted successfully' });
};
exports.deleteProductTag = deleteProductTag;
