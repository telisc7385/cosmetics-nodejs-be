"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllVariantImagesForProduct = exports.getVariantImageById = exports.getAllVariantImages = exports.deleteVariantImage = exports.updateVariantImage = exports.createVariantImage = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const uploadToCloudinary_1 = require("../../utils/uploadToCloudinary");
const cloudinary_1 = __importDefault(require("../../upload/cloudinary"));
// CREATE
const createVariantImage = async (req, res) => {
    const { variantId, sequence_number } = req.body;
    if (!variantId || !req.files) {
        res.status(400).json({ success: false, message: 'variantId and images are required' });
        return;
    }
    try {
        const seq = sequence_number ? Number(sequence_number) : 0;
        const existing = await prisma_1.default.variantImage.findFirst({
            where: { variantId: Number(variantId), sequence_number: seq },
        });
        if (existing) {
            res.status(400).json({
                success: false,
                message: `Sequence number ${seq} already exists for this variant.`,
            });
            return;
        }
        const createdImages = [];
        for (const file of req.files) {
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(file.buffer, 'products/images');
            const created = await prisma_1.default.variantImage.create({
                data: {
                    variantId: Number(variantId),
                    url: result.secure_url,
                    publicId: result.public_id,
                    sequence_number: seq,
                    is_active: true,
                },
            });
            createdImages.push(created);
        }
        res.status(201).json({ success: true, variantImages: createdImages });
    }
    catch (error) {
        console.error('Error uploading variant image(s):', error);
        res.status(500).json({ success: false, message: 'Failed to upload image(s)' });
    }
};
exports.createVariantImage = createVariantImage;
// UPDATE variant image
const updateVariantImage = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existing = await prisma_1.default.variantImage.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'Image not found' });
            return;
        }
        let updateData = {};
        if (req.files && req.files.length > 0) {
            // delete old image
            if (existing.publicId) {
                try {
                    await cloudinary_1.default.uploader.destroy(existing.publicId);
                }
                catch (err) {
                    console.warn('Failed to delete old publicId:', err);
                }
            }
            // upload new one
            const file = req.files[0];
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(file.buffer, 'products/images');
            updateData.url = result.secure_url;
            updateData.publicId = result.public_id;
        }
        if (req.body.sequence_number !== undefined) {
            updateData.sequence_number = Number(req.body.sequence_number);
        }
        if (req.body.is_active !== undefined) {
            updateData.is_active = req.body.is_active === 'false' || req.body.is_active === false ? false : true;
        }
        if (req.body.variantId !== undefined) {
            updateData.variantId = Number(req.body.variantId);
        }
        const updated = await prisma_1.default.variantImage.update({
            where: { id },
            data: updateData,
        });
        res.status(200).json({ success: true, variantImage: updated });
    }
    catch (error) {
        console.error('Error updating variant image:', error);
        res.status(500).json({ success: false, message: 'Failed to update variant image' });
    }
};
exports.updateVariantImage = updateVariantImage;
// DELETE
const deleteVariantImage = async (req, res) => {
    const id = +req.params.id;
    try {
        const image = await prisma_1.default.variantImage.findUnique({ where: { id } });
        if (!image) {
            res.status(404).json({ success: false, message: 'Image not found' });
            return;
        }
        if (image.publicId) {
            await cloudinary_1.default.uploader.destroy(image.publicId).catch((err) => {
                console.warn('Cloudinary deletion failed:', err.message);
            });
        }
        await prisma_1.default.variantImage.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'Variant image deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting variant image:', err);
        res.status(500).json({ success: false, message: 'Failed to delete variant image' });
    }
};
exports.deleteVariantImage = deleteVariantImage;
// GET ALL FOR VARIANT
const getAllVariantImages = async (req, res) => {
    const variantId = Number(req.params.variantId);
    try {
        const images = await prisma_1.default.variantImage.findMany({
            where: variantId ? { variantId } : undefined,
            orderBy: { sequence_number: 'asc' },
            include: { variant: true },
        });
        res.status(200).json({
            success: true,
            message: 'Variant images fetched',
            images,
        });
    }
    catch (error) {
        console.error('Error fetching variant images:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch variant images' });
    }
};
exports.getAllVariantImages = getAllVariantImages;
// GET BY ID
const getVariantImageById = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid variant image id' });
        return;
    }
    try {
        const image = await prisma_1.default.variantImage.findUnique({
            where: { id },
            include: { variant: true },
        });
        if (!image) {
            res.status(404).json({ success: false, message: 'Variant image not found' });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Variant image found',
            variantImage: image,
        });
    }
    catch (error) {
        console.error('Error fetching variant image:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch variant image' });
    }
};
exports.getVariantImageById = getVariantImageById;
// GET ALL FOR PRODUCT + VARIANT
const getAllVariantImagesForProduct = async (req, res) => {
    const productId = Number(req.params.productId);
    const variantId = Number(req.params.variantId);
    if (isNaN(productId) || isNaN(variantId)) {
        res.status(400).json({ success: false, message: 'Invalid productId or variantId' });
        return;
    }
    try {
        const variant = await prisma_1.default.productVariant.findFirst({
            where: {
                id: variantId,
                productId,
                isDeleted: false,
                product: { isDeleted: false },
            },
            include: {
                product: true,
            },
        });
        if (!variant) {
            res.status(404).json({
                success: false,
                message: 'Variant not found for the specified product',
            });
            return;
        }
        const images = await prisma_1.default.variantImage.findMany({
            where: { variantId },
            orderBy: { sequence_number: 'asc' },
        });
        res.status(200).json({
            success: true,
            message: 'Variant images for product fetched',
            productId,
            variantId,
            variantName: variant.name,
            imageCount: images.length,
            images,
        });
    }
    catch (error) {
        console.error('Error fetching variant images for product:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getAllVariantImagesForProduct = getAllVariantImagesForProduct;
