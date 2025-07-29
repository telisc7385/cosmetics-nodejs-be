"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTax = exports.updateTax = exports.createTax = exports.getAllTaxes = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const extractName_1 = require("../utils/extractName");
const getAllTaxes = async (req, res) => {
    const search = req.query.search || '';
    const taxes = await prisma_1.default.tax.findMany({
        where: {
            name: {
                contains: search,
                mode: 'insensitive',
            },
        },
        orderBy: {
            updated_at: 'desc',
        },
    });
    res.json({
        taxes: taxes.map((tax) => ({
            id: tax.id,
            name: tax.name,
            percentage: tax.percentage.toFixed(1),
            is_active: tax.is_active,
            created_by: tax.created_by,
            created_at: tax.created_at,
            updated_by: tax.updated_by,
            updated_at: tax.updated_at,
        })),
    });
};
exports.getAllTaxes = getAllTaxes;
const createTax = async (req, res) => {
    const { name, percentage, is_active } = req.body;
    const created_by = await (0, extractName_1.getUserNameFromToken)(req);
    const normalizedName = name.trim().toUpperCase();
    // Check if tax with the same name exists (case-insensitive match)
    const existing = await prisma_1.default.tax.findFirst({
        where: {
            name: {
                equals: normalizedName,
                mode: 'insensitive',
            },
        },
    });
    if (existing) {
        res.status(400).json({
            success: false,
            message: `Tax with this name already exists.`,
        });
        return;
    }
    const newTax = await prisma_1.default.tax.create({
        data: {
            name: normalizedName,
            percentage: parseFloat(percentage),
            is_active,
            created_by,
            updated_by: created_by,
        },
    });
    res.status(201).json({
        success: true,
        tax: {
            id: newTax.id,
            name: newTax.name,
            percentage: newTax.percentage.toFixed(1),
            is_active: newTax.is_active,
            created_by: newTax.created_by,
            created_at: newTax.created_at,
            updated_by: newTax.updated_by,
            updated_at: newTax.updated_at,
        },
    });
};
exports.createTax = createTax;
const updateTax = async (req, res) => {
    const { id } = req.params;
    const { name, percentage, is_active } = req.body;
    const updated_by = await (0, extractName_1.getUserNameFromToken)(req);
    const updated = await prisma_1.default.tax.update({
        where: { id: Number(id) },
        data: {
            name,
            percentage: parseFloat(percentage),
            is_active,
            updated_by,
        },
    });
    res.json({
        success: true,
        tax: {
            id: updated.id,
            name: updated.name,
            percentage: updated.percentage.toFixed(1),
            is_active: updated.is_active,
            created_by: updated.created_by,
            created_at: updated.created_at,
            updated_by: updated.updated_by,
            updated_at: updated.updated_at,
        },
    });
};
exports.updateTax = updateTax;
const deleteTax = async (req, res) => {
    const { id } = req.params;
    await prisma_1.default.tax.delete({
        where: { id: Number(id) },
    });
    res.json({ success: true, message: 'Deleted successfully' });
};
exports.deleteTax = deleteTax;
