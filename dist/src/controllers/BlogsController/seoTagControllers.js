"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSeoTags = exports.deleteSeoTag = exports.updateSeoTag = exports.createSeoTag = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const extractName_1 = require("../../utils/extractName");
const createSeoTag = async (req, res) => {
    const { name, is_active } = req.body;
    try {
        const username = await (0, extractName_1.getUserNameFromToken)(req);
        const tag = await prisma_1.default.frontend_blogtag.create({
            data: {
                name,
                is_active,
                created_by: username,
                updated_by: username,
            },
        });
        res.status(201).json({
            success: true,
            message: "Tag created",
            tag
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
exports.createSeoTag = createSeoTag;
const updateSeoTag = async (req, res) => {
    const { name, is_active } = req.body;
    const { id } = req.params;
    try {
        const username = await (0, extractName_1.getUserNameFromToken)(req);
        const tag = await prisma_1.default.frontend_blogtag.update({
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
            message: "Tag Updated",
            tag,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
exports.updateSeoTag = updateSeoTag;
const deleteSeoTag = async (req, res) => {
    const { id } = req.params;
    try {
        const tag = await prisma_1.default.frontend_blogtag.delete({
            where: {
                id: Number(id),
            },
        });
        res.status(200).json({
            success: true,
            message: "Tag Deleted",
            tag,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};
exports.deleteSeoTag = deleteSeoTag;
const getAllSeoTags = async (req, res) => {
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
        const [tags, total] = await Promise.all([
            prisma_1.default.frontend_blogtag.findMany({
                where: whereClause,
                orderBy: {
                    [orderByField]: orderByDirection,
                },
                skip,
                take: limitNumber,
            }),
            prisma_1.default.frontend_blogtag.count({
                where: whereClause,
            }),
        ]);
        res.status(200).json({
            success: true,
            message: "Tags fetched",
            data: {
                success: true,
                total,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(total / limitNumber),
                tags,
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
exports.getAllSeoTags = getAllSeoTags;
