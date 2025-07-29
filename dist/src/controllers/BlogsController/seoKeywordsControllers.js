"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSeoKeywords = exports.deleteSeoKeyword = exports.updateSeoKeyword = exports.createSeoKeyword = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const extractName_1 = require("../../utils/extractName");
const createSeoKeyword = async (req, res) => {
    const { name, is_active } = req.body;
    try {
        const username = await (0, extractName_1.getUserNameFromToken)(req);
        const keyword = await prisma_1.default.frontend_blogseofocuskeyword.create({
            data: {
                name,
                is_active,
                created_by: username,
                updated_by: username,
            },
        });
        res.status(201).json({
            success: true,
            message: "Keyword created",
            keyword,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
exports.createSeoKeyword = createSeoKeyword;
const updateSeoKeyword = async (req, res) => {
    const { name, is_active } = req.body;
    const { id } = req.params;
    try {
        const username = await (0, extractName_1.getUserNameFromToken)(req);
        const keyword = await prisma_1.default.frontend_blogseofocuskeyword.update({
            where: {
                id: Number(id),
            },
            data: {
                name,
                is_active,
                updated_by: username,
            },
        });
        res.status(200).json({
            success: true,
            message: "Keyword Updated",
            keyword,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
exports.updateSeoKeyword = updateSeoKeyword;
const deleteSeoKeyword = async (req, res) => {
    const { id } = req.params;
    try {
        const keyword = await prisma_1.default.frontend_blogseofocuskeyword.delete({
            where: {
                id: Number(id),
            },
        });
        res.status(200).json({
            success: true,
            message: "Keyword Deleted",
            keyword,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
exports.deleteSeoKeyword = deleteSeoKeyword;
const getAllSeoKeywords = async (req, res) => {
    try {
        const { is_active, page = "1", page_size = "10", ordering, search = "", } = req.query;
        const pageNumber = parseInt(page);
        const limitNumber = parseInt(page_size);
        const skip = (pageNumber - 1) * limitNumber;
        // Extract ordering field and direction
        let orderByField = "created_at";
        let orderByDirection = "desc";
        if (ordering) {
            if (ordering.startsWith("-")) {
                const field = ordering.substring(1);
                if (["name", "created_at"].includes(field)) {
                    orderByField = field;
                    orderByDirection = "desc";
                }
            }
            else {
                if (["name", "created_at"].includes(ordering)) {
                    orderByField = ordering;
                    orderByDirection = "asc";
                }
            }
        }
        const whereClause = {
            AND: [
                search
                    ? {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    }
                    : {},
                is_active !== undefined
                    ? {
                        is_active: is_active === "true",
                    }
                    : {},
            ],
        };
        const [keywords, total] = await Promise.all([
            prisma_1.default.frontend_blogseofocuskeyword.findMany({
                where: whereClause,
                orderBy: {
                    [orderByField]: orderByDirection,
                },
                skip,
                take: limitNumber,
            }),
            prisma_1.default.frontend_blogseofocuskeyword.count({
                where: whereClause,
            }),
        ]);
        res.status(200).json({
            success: true,
            message: "Keywords fetched",
            data: {
                success: true,
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
                keywords,
            },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
exports.getAllSeoKeywords = getAllSeoKeywords;
