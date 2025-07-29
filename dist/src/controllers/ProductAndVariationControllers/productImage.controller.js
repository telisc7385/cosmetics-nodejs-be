"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductImage = exports.getProductImages = exports.deleteProductImage = exports.createProductImage = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const uploadToCloudinary_1 = require("../../utils/uploadToCloudinary");
const createProductImage = async (req, res) => {
    const { productId, sequence } = req.body;
    if (!productId || !req.files) {
        res.status(400).json({ message: "productId and images are required" });
        return;
    }
    if (sequence) {
        const existing = await prisma_1.default.productImage.findFirst({
            where: {
                productId: Number(productId),
                sequence: Number(sequence),
            },
        });
        if (existing) {
            res.status(400).json({
                message: `Sequence number ${sequence} already exists for this product.`,
            });
            return;
        }
    }
    try {
        const createdImages = [];
        for (const file of req.files) {
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(file.buffer, "products/images");
            const created = await prisma_1.default.productImage.create({
                data: {
                    productId: Number(productId),
                    image: result.secure_url,
                    sequence: sequence ? Number(sequence) : 0,
                },
            });
            createdImages.push(created);
        }
        res.status(201).json({ success: true, productImages: createdImages });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating product images" });
    }
};
exports.createProductImage = createProductImage;
const deleteProductImage = async (req, res) => {
    const id = Number(req.params.id);
    try {
        await prisma_1.default.productImage.delete({ where: { id } });
        res.json({ success: true, message: "Product image deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting product image" });
    }
};
exports.deleteProductImage = deleteProductImage;
const getProductImages = async (req, res) => {
    const productId = Number(req.params.productId);
    const images = await prisma_1.default.productImage.findMany({ where: { productId } });
    res.json({ success: true, images });
};
exports.getProductImages = getProductImages;
const updateProductImage = async (req, res) => {
    const id = Number(req.params.id);
    const { sequence } = req.body;
    let imageUrl;
    if (req.file) {
        const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(req.file.buffer, "products/images");
        imageUrl = result.secure_url;
    }
    const updated = await prisma_1.default.productImage.update({
        where: { id },
        data: {
            image: imageUrl,
            sequence: sequence ? Number(sequence) : undefined,
        },
    });
    res.json({ success: true, productImage: updated });
};
exports.updateProductImage = updateProductImage;
