"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHomepageStatistic = exports.updateHomepageStatistic = exports.createHomepageStatistic = exports.getHomepageStatistics = exports.extractUserName = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const jwt_1 = require("../../utils/jwt");
const extractUserName = async (req) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: { profile: true },
        });
        if (user?.profile?.firstName) {
            return `${user.profile.firstName} ${user.profile.lastName || ''}`.trim();
        }
        return user?.email || 'Superb Store';
    }
    catch (err) {
        return 'ECOM Store';
    }
};
exports.extractUserName = extractUserName;
const getHomepageStatistics = async (req, res) => {
    const { page = '1', page_size = '10', is_active } = req.query;
    const pageNumber = parseInt(page);
    const pageSize = parseInt(page_size);
    const skip = (pageNumber - 1) * pageSize;
    const where = {};
    if (is_active !== undefined) {
        where.is_active = is_active === 'true';
    }
    const results = await prisma_1.default.homepageStatistic.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { updated_at: 'desc' },
    });
    res.json({
        results: results.map((item) => ({
            id: item.id,
            title: item.title,
            number: item.number,
            is_active: item.is_active,
            created_by: item.created_by,
            created_at: item.created_at,
            updated_by: item.updated_by,
            updated_at: item.updated_at,
        })),
    });
};
exports.getHomepageStatistics = getHomepageStatistics;
const createHomepageStatistic = async (req, res) => {
    const { title, number, is_active } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, message: 'Token missing' });
        return;
    }
    const user = await (0, exports.extractUserName)(req);
    const createdBy = 'ECOM Store'; // optionally fetch from profile using payload.userId
    const newStat = await prisma_1.default.homepageStatistic.create({
        data: {
            title,
            number: Number(number),
            is_active,
            created_by: user,
            updated_by: user,
        },
    });
    res.status(201).json({ success: true, id: newStat.id });
};
exports.createHomepageStatistic = createHomepageStatistic;
const updateHomepageStatistic = async (req, res) => {
    const { id } = req.params;
    const { title, number, is_active } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const user = await (0, exports.extractUserName)(req);
    const stat = await prisma_1.default.homepageStatistic.findUnique({ where: { id: Number(id) } });
    if (!stat) {
        res.status(404).json({ success: false, message: 'Statistic not found' });
        return;
    }
    const updated = await prisma_1.default.homepageStatistic.update({
        where: { id: Number(id) },
        data: {
            title,
            number: Number(number),
            is_active,
            updated_by: user,
        },
    });
    res.json({
        success: true,
        result: {
            id: updated.id,
            title: updated.title,
            number: updated.number,
            is_active: updated.is_active,
            created_by: updated.created_by,
            created_at: updated.created_at,
            updated_by: updated.updated_by,
            updated_at: updated.updated_at
        },
    });
};
exports.updateHomepageStatistic = updateHomepageStatistic;
const deleteHomepageStatistic = async (req, res) => {
    const { id } = req.params;
    await prisma_1.default.homepageStatistic.delete({
        where: { id: Number(id) },
    });
    res.json({ success: true, message: 'Deleted successfully' });
};
exports.deleteHomepageStatistic = deleteHomepageStatistic;
