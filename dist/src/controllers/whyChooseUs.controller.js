"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteWhyChooseUsItem = exports.getWhyChooseUsItemById = exports.getAllWhyChooseUsItems = exports.updateWhyChooseUsItem = exports.createWhyChooseUsItem = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const cloudinary_1 = __importDefault(require("../upload/cloudinary"));
// 🔸 Create WhyChooseUsItem
const createWhyChooseUsItem = async (req, res) => {
    const { sequenceNumber, heading, description, isActive } = req.body;
    if (!sequenceNumber || !heading || !description) {
        res.status(400).json({ message: 'sequenceNumber, heading, and description are required.' });
        return;
    }
    try {
        const seqTest = Number(sequenceNumber);
        if (isNaN(seqTest) || seqTest <= 0) {
            res.status(400).json({ message: 'Sequence number must be a positive number.' });
            return;
        }
        const sequenceStr = String(sequenceNumber);
        const existing = await prisma_1.default.whyChooseUsItem.findFirst({
            where: { sequence_number: sequenceStr },
        });
        if (existing) {
            res.status(400).json({ message: 'Sequence number already used.' });
            return;
        }
        let image;
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.default.uploader.upload_stream({ folder: 'whyChooseUsImages' }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                }).end(req.file?.buffer);
            });
            image = result.secure_url;
        }
        const newItem = await prisma_1.default.whyChooseUsItem.create({
            data: {
                sequence_number: sequenceStr,
                heading,
                description,
                image,
                isActive: isActive === 'false' ? false : true,
            },
        });
        res.status(201).json({ success: true, newItem });
    }
    catch (error) {
        console.error('Create WhyChooseUsItem error:', error);
        res.status(500).json({ message: 'Error creating item' });
    }
};
exports.createWhyChooseUsItem = createWhyChooseUsItem;
// 🔸 Update WhyChooseUsItem
const updateWhyChooseUsItem = async (req, res) => {
    const id = parseInt(req.params.id);
    const { sequenceNumber, heading, description, isActive } = req.body;
    try {
        const existing = await prisma_1.default.whyChooseUsItem.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        const seqTest = Number(sequenceNumber);
        if (isNaN(seqTest) || seqTest <= 0) {
            res.status(400).json({ message: 'Sequence number must be a positive number.' });
            return;
        }
        const sequenceStr = String(sequenceNumber);
        const duplicate = await prisma_1.default.whyChooseUsItem.findFirst({
            where: {
                sequence_number: sequenceStr,
                NOT: { id: id },
            },
        });
        if (duplicate) {
            res.status(400).json({ message: 'Sequence number already used by another item.' });
            return;
        }
        let image = existing.image;
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.default.uploader.upload_stream({ folder: 'whyChooseUsImages' }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                }).end(req.file?.buffer);
            });
            image = result.secure_url;
        }
        const updated = await prisma_1.default.whyChooseUsItem.update({
            where: { id },
            data: {
                sequence_number: sequenceStr,
                heading,
                description,
                image,
                isActive: isActive === 'false' ? false : true,
            },
        });
        res.json({ success: true, updated });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        console.error('Update WhyChooseUsItem error:', error);
        res.status(500).json({ message: 'Error updating item' });
    }
};
exports.updateWhyChooseUsItem = updateWhyChooseUsItem;
// 🔸 Get all
const getAllWhyChooseUsItems = async (req, res) => {
    try {
        const { ordering, is_active } = req.query;
        // Default ordering
        let orderBy = { sequence_number: 'asc' };
        if (ordering && typeof ordering === 'string') {
            const isDesc = ordering.startsWith('-');
            const field = isDesc ? ordering.slice(1) : ordering;
            const allowedFields = ['sequence_number', 'heading', 'isActive'];
            if (allowedFields.includes(field)) {
                orderBy = { [field]: isDesc ? 'desc' : 'asc' };
            }
            else {
                res.status(400).json({ success: false, message: `Invalid ordering field: ${field}` });
                return;
            }
        }
        // Optional filter for isActive
        const where = {};
        if (is_active !== undefined) {
            if (is_active === 'true') {
                where.isActive = true;
            }
            else if (is_active === 'false') {
                where.isActive = false;
            }
            else {
                res.status(400).json({ success: false, message: 'Invalid is_active value. Use true or false.' });
                return;
            }
        }
        const items = await prisma_1.default.whyChooseUsItem.findMany({ where, orderBy });
        const formattedItems = items.map(item => ({
            ...item,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        }));
        res.json({ success: true, items: formattedItems });
    }
    catch (error) {
        console.error('Get all WhyChooseUs items error:', error);
        res.status(500).json({ message: 'Error fetching items' });
    }
};
exports.getAllWhyChooseUsItems = getAllWhyChooseUsItems;
// 🔸 Get one
const getWhyChooseUsItemById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const item = await prisma_1.default.whyChooseUsItem.findUnique({ where: { id } });
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        res.json({
            success: true,
            item: {
                ...item,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            },
        });
    }
    catch (error) {
        console.error('Get WhyChooseUs item by id error:', error);
        res.status(500).json({ message: 'Error fetching item' });
    }
};
exports.getWhyChooseUsItemById = getWhyChooseUsItemById;
// 🔸 Delete
const deleteWhyChooseUsItem = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const item = await prisma_1.default.whyChooseUsItem.findUnique({ where: { id } });
        if (!item) {
            res.status(404).json({ message: 'Item not found' });
            return;
        }
        await prisma_1.default.whyChooseUsItem.delete({ where: { id } });
        res.json({ message: 'Item deleted successfully' });
    }
    catch (error) {
        console.error('Delete WhyChooseUs item error:', error);
        res.status(500).json({ message: 'Error deleting item' });
    }
};
exports.deleteWhyChooseUsItem = deleteWhyChooseUsItem;
