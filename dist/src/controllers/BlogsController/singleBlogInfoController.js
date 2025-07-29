"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSingleBlogInfo = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const getSingleBlogInfo = async (req, res) => {
    const blogSlug = req.params.slug;
    try {
        const blog = await prisma_1.default.frontend_blog.findFirst({
            where: {
                slug: blogSlug,
            },
            include: {
                tagjoints: {
                    include: {
                        frontend_blogtag: true,
                    },
                },
                seofocuskeywordjoints: {
                    include: {
                        seo_focus_keyword: true,
                    },
                },
            },
        });
        res.status(200).json({
            success: false,
            message: "Blog Data fetch sucessfully",
            data: blog,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
        return;
    }
};
exports.getSingleBlogInfo = getSingleBlogInfo;
