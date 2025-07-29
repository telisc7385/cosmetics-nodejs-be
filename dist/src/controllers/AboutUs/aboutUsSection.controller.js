"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAboutUsSection = exports.deleteAboutUsSection = exports.updateAboutUsSection = exports.getAllAboutUsSections = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const uploadToCloudinary_1 = require("../../utils/uploadToCloudinary");
const extractName_1 = require("../../utils/extractName");
// GET all
const getAllAboutUsSections = async (req, res) => {
    try {
        const { is_active } = req.query;
        const activeFilter = typeof is_active !== 'undefined'
            ? { is_active: String(is_active).toLowerCase() === 'true' }
            : {};
        const sections = await prisma_1.default.aboutUsSection.findMany({
            where: {
                ...activeFilter,
            },
            orderBy: { sequence_number: 'asc' },
            include: {
                components: {
                    where: {
                        ...activeFilter,
                    },
                    orderBy: { sequence_number: 'asc' },
                },
            },
        });
        const results = sections.map((section) => ({
            id: section.id,
            sequence_number: section.sequence_number,
            section_name: section.section_name,
            heading: section.heading,
            sub_heading: section.sub_heading,
            description: section.description,
            image: section.image,
            is_active: section.is_active,
            created_by: section.created_by,
            updated_by: section.updated_by,
            created_at: section.created_at,
            updated_at: section.updated_at,
            components: section.components.map((component) => ({
                id: component.id,
                sequence_number: component.sequence_number,
                title: component.title,
                description: component.description,
                heading: component.heading,
                sub_heading: component.sub_heading,
                image: component.image,
                is_active: component.is_active,
                created_by: component.created_by,
                updated_by: component.updated_by,
                created_at: component.created_at,
                updated_at: component.updated_at,
            })),
        }));
        res.json({ results });
    }
    catch (error) {
        console.error('Error fetching About Us sections:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getAllAboutUsSections = getAllAboutUsSections;
// PATCH (Edit)
const updateAboutUsSection = async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma_1.default.aboutUsSection.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ success: false, message: 'Section not found' });
        return;
    }
    const { sequence_number, section_name, heading, sub_heading, description, is_active, } = req.body;
    let image = existing.image;
    try {
        const seq = Number(sequence_number);
        if (!isNaN(seq) && seq <= 0) {
            res.status(400).json({
                success: false,
                message: `sequence_number must be a positive number`,
            });
            return;
        }
        // Check for duplicate sequence_number if changed
        if (typeof sequence_number !== 'undefined' &&
            Number(sequence_number) !== existing.sequence_number) {
            const duplicate = await prisma_1.default.aboutUsSection.findFirst({
                where: {
                    sequence_number: Number(sequence_number),
                    NOT: { id },
                },
            });
            if (duplicate) {
                res.status(400).json({
                    success: false,
                    message: `This sequence number already exists`,
                });
                return;
            }
        }
        // Upload new image if provided
        if (req.file?.buffer) {
            const upload = await (0, uploadToCloudinary_1.uploadToCloudinary)(req.file.buffer, 'aboutus_section');
            image = upload.secure_url;
        }
        const updated_by = await (0, extractName_1.getUserNameFromToken)(req);
        const updated = await prisma_1.default.aboutUsSection.update({
            where: { id },
            data: {
                sequence_number: typeof sequence_number !== 'undefined'
                    ? Number(sequence_number)
                    : existing.sequence_number,
                section_name: typeof section_name !== 'undefined'
                    ? section_name
                    : existing.section_name,
                heading: typeof heading !== 'undefined'
                    ? heading
                    : existing.heading,
                sub_heading: typeof sub_heading !== 'undefined'
                    ? sub_heading
                    : existing.sub_heading,
                description: typeof description !== 'undefined'
                    ? description
                    : existing.description,
                image,
                is_active: typeof is_active !== 'undefined'
                    ? is_active === 'true' || is_active === true
                    : existing.is_active,
                updated_by,
            },
        });
        res.json({
            success: true,
            message: 'Section updated',
            result: {
                ...updated,
                created_at: updated.created_at,
                updated_at: updated.updated_at,
            },
        });
    }
    catch (err) {
        console.error('Update error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.updateAboutUsSection = updateAboutUsSection;
// DELETE
const deleteAboutUsSection = async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma_1.default.aboutUsSection.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ success: false, message: 'Section not found' });
        return;
    }
    await prisma_1.default.aboutUsSection.delete({ where: { id } });
    res.json({ success: true, message: 'Section deleted successfully' });
};
exports.deleteAboutUsSection = deleteAboutUsSection;
const createAboutUsSection = async (req, res) => {
    try {
        const { sequence_number, section_name, heading, sub_heading, description, is_active, } = req.body;
        const created_by = await (0, extractName_1.getUserNameFromToken)(req);
        const seq = Number(sequence_number);
        if (seq != null && seq <= 0) {
            res.status(400).json({
                success: false,
                message: `sequence_number is not positive`,
            });
            return;
        }
        // 🔍 Check for duplicate sequence_number
        const existing = await prisma_1.default.aboutUsSection.findFirst({
            where: { sequence_number: Number(sequence_number) },
        });
        if (existing) {
            res.status(400).json({
                success: false,
                message: `This sequence number already exists`,
            });
            return;
        }
        let image = null;
        if (req.file?.buffer) {
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(req.file.buffer, 'aboutus_section');
            image = result.secure_url;
        }
        const newSection = await prisma_1.default.aboutUsSection.create({
            data: {
                sequence_number: Number(sequence_number),
                section_name,
                heading,
                sub_heading,
                description,
                image,
                is_active: is_active === 'true' || is_active === true,
                created_by,
                updated_by: created_by,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Section created successfully',
            result: {
                ...newSection,
                created_at: newSection.created_at,
                updated_at: newSection.updated_at,
            },
        });
    }
    catch (err) {
        console.error('Create AboutUsSection error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.createAboutUsSection = createAboutUsSection;
