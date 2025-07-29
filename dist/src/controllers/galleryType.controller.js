"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGalleryType = exports.updateGalleryType = exports.getAllGalleryTypes = exports.createGalleryType = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
// 🔹 Create GalleryType
const createGalleryType = async (req, res) => {
    const { name, isActive } = req.body;
    if (!name) {
        res.status(400).json({ success: false, message: 'Name is required' });
        return;
    }
    try {
        const type = await prisma_1.default.galleryType.create({
            data: {
                name,
                isActive: isActive !== 'false',
            },
        });
        res.status(201).json({ success: true, message: 'GalleryType created', result: type });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error creating GalleryType' });
    }
};
exports.createGalleryType = createGalleryType;
// 🔹 Get All GalleryTypes
const getAllGalleryTypes = async (_req, res) => {
    try {
        const types = await prisma_1.default.galleryType.findMany({
            orderBy: { name: 'asc' },
        });
        res.status(200).json({ success: true, result: types });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching GalleryTypes' });
    }
};
exports.getAllGalleryTypes = getAllGalleryTypes;
// 🔹 Update GalleryType by id
const updateGalleryType = async (req, res) => {
    const id = Number(req.params.id);
    const { isActive, name } = req.body;
    try {
        const existing = await prisma_1.default.galleryType.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'GalleryType not found' });
            return;
        }
        const updated = await prisma_1.default.galleryType.update({
            where: { id },
            data: {
                name: name ?? existing.name,
                isActive: isActive !== undefined ? isActive !== 'false' : existing.isActive,
            },
        });
        res.status(200).json({ success: true, message: 'GalleryType updated', result: updated });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error updating GalleryType' });
    }
};
exports.updateGalleryType = updateGalleryType;
// 🔹 Delete GalleryType by name
const deleteGalleryType = async (req, res) => {
    const id = Number(req.params.id);
    try {
        await prisma_1.default.galleryType.delete({ where: { id } });
        res.status(200).json({ success: true, message: 'GalleryType deleted' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting GalleryType' });
    }
};
exports.deleteGalleryType = deleteGalleryType;
