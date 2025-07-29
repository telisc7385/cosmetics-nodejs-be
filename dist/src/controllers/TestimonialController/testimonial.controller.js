"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTestimonial = exports.updateTestimonial = exports.getTestimonialById = exports.getAllTestimonials = exports.createTestimonial = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const uploadToCloudinary_1 = require("../../utils/uploadToCloudinary");
// 🔹 Create Testimonial
const createTestimonial = async (req, res) => {
    const { name, description, role, is_active } = req.body;
    if (!name || !description || !role) {
        res.status(400).json({
            success: false,
            message: 'Name, description, and role are required.',
        });
        return;
    }
    try {
        let image = '';
        if (req.file?.buffer) {
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(req.file.buffer, 'testimonials');
            image = result.secure_url;
        }
        const testimonial = await prisma_1.default.testimonial.create({
            data: {
                name,
                description,
                role,
                image,
                is_active: is_active === 'false' ? false : true,
            },
        });
        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            testimonial,
        });
    }
    catch (error) {
        console.error('Create error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.createTestimonial = createTestimonial;
// 🔹 Get All Testimonials
const getAllTestimonials = async (req, res) => {
    try {
        const { ordering, is_active } = req.query;
        // Default ordering
        let orderBy = { createdAt: 'desc' };
        if (typeof ordering === 'string') {
            const isDescending = ordering.startsWith('-');
            const field = isDescending ? ordering.slice(1) : ordering;
            // Ensure only valid fields are allowed
            const allowedFields = ['name', 'createdAt']; // update based on your model
            if (allowedFields.includes(field)) {
                orderBy = {
                    [field]: isDescending ? 'desc' : 'asc',
                };
            }
        }
        // Parse is_active as boolean if provided
        const isActiveParsed = typeof is_active === 'string'
            ? is_active.toLowerCase() === 'true'
                ? true
                : is_active.toLowerCase() === 'false'
                    ? false
                    : undefined
            : undefined;
        // Build query
        const queryOptions = {
            orderBy,
        };
        if (typeof isActiveParsed === 'boolean') {
            queryOptions.where = {
                is_active: isActiveParsed,
            };
        }
        const testimonials = await prisma_1.default.testimonial.findMany(queryOptions);
        res.status(200).json({
            success: true,
            testimonials,
        });
    }
    catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getAllTestimonials = getAllTestimonials;
// 🔹 Get Testimonial By ID
const getTestimonialById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const testimonial = await prisma_1.default.testimonial.findUnique({ where: { id } });
        if (!testimonial) {
            res.status(404).json({
                success: false,
                message: 'Testimonial not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            testimonial,
        });
    }
    catch (error) {
        console.error('Get by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.getTestimonialById = getTestimonialById;
// 🔹 Update Testimonial
const updateTestimonial = async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description, role, is_active } = req.body;
    try {
        const existing = await prisma_1.default.testimonial.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({
                success: false,
                message: 'Testimonial not found',
            });
            return;
        }
        let image = existing.image;
        if (req.file?.buffer) {
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(req.file.buffer, 'testimonials');
            image = result.secure_url;
        }
        const updated = await prisma_1.default.testimonial.update({
            where: { id },
            data: {
                name,
                description,
                role,
                image,
                is_active: is_active === 'false' ? false : true,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Testimonial updated successfully',
            updated,
        });
    }
    catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.updateTestimonial = updateTestimonial;
// 🔹 Delete Testimonial
const deleteTestimonial = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await prisma_1.default.testimonial.delete({ where: { id } });
        res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
};
exports.deleteTestimonial = deleteTestimonial;
