"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSlug = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const generateSlug = async (name, SKU) => {
    const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "") // Remove non-alphanumeric characters
        .replace(/\s+/g, "-"); // Replace spaces with dashes
    let slug = baseSlug;
    while (true) {
        const exists = await prisma_1.default.product.findFirst({
            where: { slug },
        });
        if (!exists)
            break;
        slug = `${baseSlug}-${SKU}`;
    }
    return slug;
};
exports.generateSlug = generateSlug;
