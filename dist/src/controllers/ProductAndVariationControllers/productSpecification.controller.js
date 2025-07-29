"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductSpecification = exports.updateProductSpecification = exports.getProductSpecifications = exports.createProductSpecification = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const createProductSpecification = async (req, res) => {
    const { productId, name, value, isActive } = req.body;
    if (!productId || !name || !value) {
        res.status(400).json({ message: 'productId, name, and value are required' });
        return;
    }
    try {
        const created = await prisma_1.default.productSpecification.create({
            data: {
                productId: Number(productId),
                name,
                value,
                isActive: isActive ?? true,
                isDeleted: false
            },
        });
        res.status(201).json({ success: true, productSpecification: created });
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating product specification' });
    }
};
exports.createProductSpecification = createProductSpecification;
const getProductSpecifications = async (req, res) => {
    const productId = Number(req.params.productId);
    try {
        const specs = await prisma_1.default.productSpecification.findMany({
            where: { productId, isDeleted: false },
        });
        res.json({ success: true, specifications: specs });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching specifications' });
    }
};
exports.getProductSpecifications = getProductSpecifications;
const updateProductSpecification = async (req, res) => {
    const id = Number(req.params.id);
    const { name, value, isActive } = req.body;
    try {
        const updated = await prisma_1.default.productSpecification.update({
            where: { id },
            data: {
                name,
                value,
                isActive,
            },
        });
        res.json({ success: true, productSpecification: updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating product specification' });
    }
};
exports.updateProductSpecification = updateProductSpecification;
const deleteProductSpecification = async (req, res) => {
    const id = Number(req.params.id);
    try {
        await prisma_1.default.productSpecification.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
        });
        res.json({ success: true, message: 'Product specification soft deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting product specification' });
    }
};
exports.deleteProductSpecification = deleteProductSpecification;
