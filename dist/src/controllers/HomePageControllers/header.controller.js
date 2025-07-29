"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHeaderData = exports.updateHeaderData = exports.getHeaders = exports.addHeaderData = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const addHeaderData = async (req, res) => {
    const { sequence_number, name, link, is_active, userId } = req.body;
    if (sequence_number === undefined ||
        !name ||
        !link ||
        is_active === undefined ||
        !userId) {
        res.status(400).json({ success: false, message: "Invalid JSON" });
        return;
    }
    if (isNaN(sequence_number) || sequence_number <= 0) {
        res.status(400).json({
            success: false,
            message: "Sequence number must be a positive number",
        });
        return;
    }
    try {
        const checkSequence = await prisma_1.default.header.findUnique({
            where: {
                sequence_number,
            },
        });
        if (checkSequence) {
            res
                .status(400)
                .json({
                success: false,
                message: "This sequence number already exists",
            });
        }
        const user = await prisma_1.default.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                profile: true,
            },
        });
        if (!user || !user.profile) {
            res.status(401).json({
                success: false,
                message: "Invalid or incomplete User profile",
            });
            return;
        }
        const header = await prisma_1.default.header.create({
            data: {
                sequence_number,
                name,
                link,
                is_active,
                created_by: user.profile.firstName,
            },
        });
        res.status(201).json({ success: true, result: header });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.addHeaderData = addHeaderData;
const getHeaders = async (req, res) => {
    const { ordering, is_active } = req.query;
    // Convert "true"/"false" strings to boolean
    const isActiveParsed = typeof is_active === "string"
        ? is_active.toLowerCase() === "true"
            ? true
            : is_active.toLowerCase() === "false"
                ? false
                : undefined
        : undefined;
    try {
        const baseQuery = {
            orderBy: {
                sequence_number: ordering === "-sequence_number" ? "desc" : "asc",
            },
        };
        // Only apply filter if is_active is explicitly true/false
        if (typeof isActiveParsed === "boolean") {
            baseQuery.where = {
                is_active: isActiveParsed,
            };
        }
        const navlinks = await prisma_1.default.header.findMany(baseQuery);
        res.status(200).json({ success: true, result: navlinks });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getHeaders = getHeaders;
const updateHeaderData = async (req, res) => {
    const { sequence_number, name, link, is_active } = req.body;
    const { header_id } = req.params;
    if (sequence_number === undefined ||
        !name ||
        !link ||
        is_active === undefined) {
        res.status(400).json({ success: false, message: "Invalid JSON" });
        return;
    }
    if (isNaN(sequence_number) || sequence_number <= 0) {
        res.status(400).json({
            success: false,
            message: "Sequence number must be a positive number",
        });
        return;
    }
    try {
        const checkSequence = await prisma_1.default.header.findUnique({
            where: {
                sequence_number,
            },
        });
        if (checkSequence && Number(header_id) !== checkSequence.id) {
            res
                .status(400)
                .json({
                success: false,
                message: "This sequence number already exists",
            });
            return;
        }
        const header = await prisma_1.default.header.update({
            where: {
                id: Number(header_id),
            },
            data: {
                sequence_number,
                name,
                link,
                is_active,
            },
        });
        res.status(200).json({ success: true, result: header });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateHeaderData = updateHeaderData;
const deleteHeaderData = async (req, res) => {
    const { header_id } = req.params;
    if (!header_id || isNaN(Number(header_id))) {
        res.status(400).json({ success: false, message: "Invalid header ID" });
        return;
    }
    try {
        await prisma_1.default.header.delete({
            where: {
                id: Number(header_id),
            },
        });
        res
            .status(200)
            .json({ success: true, message: "Header deleted successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
        return;
    }
};
exports.deleteHeaderData = deleteHeaderData;
