"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductsFromSheet = exports.toggleProductStatus = exports.deleteProduct = exports.updateProduct = exports.updateProductSequence = exports.getProductsFilter = exports.getProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const slugify_1 = require("../../utils/slugify");
const productFilters_1 = require("../../utils/productFilters");
const fastcsv = __importStar(require("fast-csv"));
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
const createProduct = async (req, res) => {
    try {
        const { name, description, SKU, basePrice, sellingPrice, priceDifferencePercent, stock, isNewArrival, createdById, categoryId, subcategoryId, length, width, weight, height, seoTitle, seoKeyword, seoDescription, productDetails, is_active, variant_specifications, tags, } = req.body;
        // Basic validation (add more checks as needed)
        if (!name || !SKU || !basePrice || !sellingPrice) {
            res.status(400).json({ message: "Required fields missing" });
            return;
        }
        const slug = await (0, slugify_1.generateSlug)(name, SKU);
        // Determine next sequenceNumber
        const last = await prisma_1.default.product.findFirst({
            where: { categoryId: Number(categoryId) },
            orderBy: { sequenceNumber: "desc" },
            select: { sequenceNumber: true },
        });
        const nextSeq = (last?.sequenceNumber ?? 0) + 1;
        // Normalize specifications object into array of { name, value }
        const specs = [];
        if (variant_specifications && typeof variant_specifications === "object") {
            for (const [key, vals] of Object.entries(variant_specifications)) {
                if (Array.isArray(vals)) {
                    for (const v of vals)
                        specs.push({ name: key, value: String(v) });
                }
                else {
                    specs.push({ name: key, value: String(vals) });
                }
            }
        }
        const product = await prisma_1.default.product.create({
            data: {
                name,
                description,
                SKU,
                basePrice: parseFloat(basePrice),
                sellingPrice: parseFloat(sellingPrice),
                priceDifferencePercent: parseFloat(priceDifferencePercent),
                stock: parseInt(stock),
                isNewArrival: isNewArrival === "true" || isNewArrival === true,
                isActive: is_active === "true" || is_active === true,
                isDeleted: false,
                createdById: Number(createdById),
                updatedById: Number(createdById),
                categoryId: Number(categoryId),
                subcategoryId: subcategoryId ? Number(subcategoryId) : null,
                length,
                width,
                weight,
                height,
                slug,
                sequenceNumber: nextSeq,
                seoTitle,
                seoKeyword,
                seoDescription,
                productDetails,
                specifications: {
                    create: specs.map((s) => ({
                        name: s.name,
                        value: s.value,
                        isActive: true,
                        isDeleted: false,
                    })),
                },
                tags: tags && Array.isArray(tags)
                    ? {
                        connect: tags.map((tagId) => ({ id: tagId }))
                    }
                    : undefined,
            },
            include: { specifications: true, tags: true },
        });
        res.status(201).json({ success: true, product });
    }
    catch (err) {
        console.error("Create product error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createProduct = createProduct;
// export const getProducts = async (req: Request, res: Response) => {
//   try {
//     const { category, parent, ordering, is_active, id } = req.query;
//     const whereClause: any = { isDeleted: false };
//     const { search } = req.query;
//     if (category && !isNaN(Number(category))) {
//       whereClause.categoryId = Number(category);
//     }
//     if (id && !isNaN(Number(id))) {
//       whereClause.id = Number(id);
//     }
//     if (parent === "true") {
//       whereClause.subcategoryId = null;
//     }
//     if (is_active !== undefined) {
//       // Convert "true" / "false" string to boolean
//       whereClause.isActive = is_active === "true";
//     }
//     // Map snake_case query fields to DB camelCase fields
//     const orderFieldMap: Record<string, string> = {
//       selling_price: "sellingPrice",
//       base_price: "basePrice",
//       price_difference_percent: "priceDifferencePercent",
//       stock: "stock",
//       name: "name",
//       sequence_number: "sequenceNumber",
//     };
//     // Default ordering by sequenceNumber ascending
//     let orderBy: any = { sequenceNumber: "asc" };
//     if (ordering && typeof ordering === "string") {
//       const isDesc = ordering.startsWith("-");
//       const rawField = isDesc ? ordering.slice(1) : ordering;
//       const mappedField = orderFieldMap[rawField];
//       if (mappedField) {
//         orderBy = { [mappedField]: isDesc ? "desc" : "asc" };
//       } else {
//         res.status(400).json({
//           success: false,
//           message: `Invalid ordering field: ${rawField}`,
//         });
//         return;
//       }
//     }
//     const products = await prisma.product.findMany({
//       where: {
//         ...whereClause,
//         ...(search && typeof search === "string"
//           ? {
//             OR: [
//               {
//                 name: {
//                   contains: search,
//                   mode: "insensitive",
//                 },
//               },
//               {
//                 basePrice: {
//                   equals: isNaN(Number(search)) ? undefined : Number(search),
//                 },
//               },
//               {
//                 sellingPrice: {
//                   equals: isNaN(Number(search)) ? undefined : Number(search),
//                 },
//               },
//               {
//                 category: {
//                   is: {
//                     name: {
//                       contains: search,
//                       mode: "insensitive",
//                     },
//                   },
//                 },
//               }
//             ],
//           }
//           : {}),
//       },
//       include: {
//         category: true,
//         subcategory: true,
//         images: true,
//         variants: { include: { images: true } },
//         specifications: true,
//       },
//       orderBy,
//     });
//     const transformed = products.map((p) => {
//       const specsObj: Record<string, string[]> = {};
//       p.specifications.forEach((s) => {
//         if (!specsObj[s.name]) specsObj[s.name] = [];
//         if (!specsObj[s.name].includes(s.value)) specsObj[s.name].push(s.value);
//       });
//       return {
//         ...p,
//         specifications: specsObj,
//       };
//     });
//     res.status(200).json({
//       success: true,
//       count: transformed.length,
//       products: transformed,
//     });
//   } catch (error: any) {
//     console.error("Get products error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
const getProducts = async (req, res) => {
    try {
        const query = req.query;
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = query.search || '';
        const ordering = query.sort;
        const is_active = query.is_active;
        const parent = query.parent;
        const id = parseInt(query.id);
        const newArrival = query.newArrival;
        const categoryIds = Array.isArray(query.category)
            ? query.category.map(Number)
            : query.category
                ? [Number(query.category)]
                : [];
        const subcategoryIds = Array.isArray(query.subcategory)
            ? query.subcategory.map(Number)
            : query.subcategory
                ? [Number(query.subcategory)]
                : [];
        const minPrice = parseFloat(query.min);
        const maxPrice = parseFloat(query.max);
        const tagIds = query.tags
            ? Array.isArray(query.tags)
                ? query.tags.map(Number)
                : String(query.tags).split(',').map(Number)
            : [];
        const whereClause = {
            isDeleted: false,
        };
        const categorySlug = query.category_slug;
        if (categorySlug) {
            // Try finding in categories first
            const category = await prisma_1.default.category.findFirst({
                where: { slug: categorySlug },
            });
            if (category) {
                whereClause.categoryId = category.id;
            }
            else {
                // If not found in category, check in subcategory
                const subcategory = await prisma_1.default.subcategory.findFirst({
                    where: { slug: categorySlug },
                });
                if (subcategory) {
                    whereClause.subcategoryId = subcategory.id;
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: `No category or subcategory found with slug "${categorySlug}"`,
                    });
                    return;
                }
            }
        }
        if (categoryIds.length > 0) {
            whereClause.categoryId = { in: categoryIds };
        }
        if (subcategoryIds.length > 0) {
            whereClause.subcategoryId = { in: subcategoryIds };
        }
        if (!isNaN(id))
            whereClause.id = id;
        if (parent === 'true')
            whereClause.subcategoryId = null;
        if (is_active !== undefined)
            whereClause.isActive = is_active === 'true';
        if (newArrival === 'true')
            whereClause.isNewArrival = true;
        if (!isNaN(minPrice) && !isNaN(maxPrice)) {
            whereClause.sellingPrice = {
                gte: minPrice,
                lte: maxPrice,
            };
        }
        else if (!isNaN(minPrice)) {
            whereClause.sellingPrice = { gte: minPrice };
        }
        else if (!isNaN(maxPrice)) {
            whereClause.sellingPrice = { lte: maxPrice };
        }
        if (tagIds.length > 0) {
            whereClause.tags = {
                some: {
                    id: { in: tagIds },
                },
            };
        }
        const orderFieldMap = {
            selling_price: 'sellingPrice',
            base_price: 'basePrice',
            price_difference_percent: 'priceDifferencePercent',
            stock: 'stock',
            name: 'name',
            sequence_number: 'sequenceNumber',
        };
        let orderBy = { sequenceNumber: 'asc' };
        if (ordering && typeof ordering === 'string') {
            const isDesc = ordering.startsWith('-');
            const rawField = isDesc ? ordering.slice(1) : ordering;
            const mappedField = orderFieldMap[rawField];
            if (mappedField) {
                orderBy = { [mappedField]: isDesc ? 'desc' : 'asc' };
            }
            else {
                res.status(400).json({
                    success: false,
                    message: `Invalid ordering field: ${rawField}`,
                });
                return;
            }
        }
        const products = await prisma_1.default.product.findMany({
            where: {
                ...whereClause,
                ...(search
                    ? {
                        OR: [
                            {
                                name: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                basePrice: {
                                    equals: isNaN(Number(search)) ? undefined : Number(search),
                                },
                            },
                            {
                                sellingPrice: {
                                    equals: isNaN(Number(search)) ? undefined : Number(search),
                                },
                            },
                            {
                                category: {
                                    is: {
                                        name: {
                                            contains: search,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        ],
                    }
                    : {}),
            },
            include: {
                category: true,
                subcategory: true,
                images: true,
                variants: { include: { images: true } },
                specifications: true,
                tags: true
            },
            orderBy,
            skip,
            take: limit,
        });
        const transformed = products.map((p) => {
            const specsObj = {};
            p.specifications.forEach((s) => {
                if (!specsObj[s.name])
                    specsObj[s.name] = [];
                if (!specsObj[s.name].includes(s.value))
                    specsObj[s.name].push(s.value);
            });
            return {
                ...p,
                specifications: specsObj,
            };
        });
        const totalCount = await prisma_1.default.product.count({
            where: {
                ...whereClause,
                ...(search
                    ? {
                        OR: [
                            {
                                name: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                basePrice: {
                                    equals: isNaN(Number(search)) ? undefined : Number(search),
                                },
                            },
                            {
                                sellingPrice: {
                                    equals: isNaN(Number(search)) ? undefined : Number(search),
                                },
                            },
                            {
                                category: {
                                    is: {
                                        name: {
                                            contains: search,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        ],
                    }
                    : {}),
            },
        });
        const totalPages = Math.ceil(totalCount / limit);
        const priceRange = await prisma_1.default.product.aggregate({
            where: {
                ...whereClause,
                ...(search
                    ? {
                        OR: [
                            {
                                name: {
                                    contains: search,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                basePrice: {
                                    equals: isNaN(Number(search)) ? undefined : Number(search),
                                },
                            },
                            {
                                sellingPrice: {
                                    equals: isNaN(Number(search)) ? undefined : Number(search),
                                },
                            },
                            {
                                category: {
                                    is: {
                                        name: {
                                            contains: search,
                                            mode: 'insensitive',
                                        },
                                    },
                                },
                            },
                        ],
                    }
                    : {}),
            },
            _min: { sellingPrice: true },
            _max: { sellingPrice: true },
        });
        res.status(200).json({
            success: true,
            count: transformed.length,
            totalCount,
            totalPages,
            currentPage: page,
            minPrice: priceRange._min.sellingPrice ?? 0,
            maxPrice: priceRange._max.sellingPrice ?? 0,
            products: transformed,
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProducts = getProducts;
const getProductsFilter = async (req, res) => {
    try {
        const { where, orderBy, skip, limit, page } = (0, productFilters_1.buildProductQuery)(req.query);
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                where,
                include: {
                    category: true,
                    subcategory: true,
                    images: true,
                    variants: { include: { images: true } },
                    specifications: true,
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma_1.default.product.count({ where }),
        ]);
        const transformed = products.map((p) => {
            const specsObj = {};
            p.specifications.forEach((s) => {
                if (!specsObj[s.name])
                    specsObj[s.name] = [];
                if (!specsObj[s.name].includes(s.value))
                    specsObj[s.name].push(s.value);
            });
            return {
                ...p,
                specifications: specsObj,
            };
        });
        res.status(200).json({
            success: true,
            count: transformed.length,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            products: transformed,
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getProductsFilter = getProductsFilter;
const updateProductSequence = async (req, res) => {
    try {
        const updates = req.body.sequencePayload;
        // Validate input
        if (!Array.isArray(updates) || updates.length === 0) {
            res
                .status(400)
                .json({
                success: false,
                message: "Invalid payload. Expected an array of { id, sequence_number }.",
            });
            return;
        }
        for (const item of updates) {
            if (!item.id ||
                !item.sequence_number ||
                isNaN(item.id) ||
                isNaN(item.sequence_number)) {
                res.status(400).json({
                    success: false,
                    message: "Each item must have a valid numeric 'id' and 'sequence_number'.",
                });
                return;
            }
        }
        // Run updates in a transaction
        await prisma_1.default.$transaction(updates.map((item) => prisma_1.default.product.update({
            where: { id: Number(item.id) },
            data: { sequenceNumber: Number(item.sequence_number) },
        })));
        res
            .status(200)
            .json({
            success: true,
            message: "Product sequence numbers updated successfully.",
        });
    }
    catch (error) {
        console.error("Update product sequence error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProductSequence = updateProductSequence;
const updateProduct = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        res.status(400).json({ success: false, message: "Invalid product id" });
        return;
    }
    const { name, description, SKU, basePrice, sellingPrice, priceDifferencePercent, stock, isNewArrival, updatedById, categoryId, subcategoryId, length, width, weight, sequenceNumber, seoTitle, seoKeyword, seoDescription, productDetails, is_active, variant_specifications, tags } = req.body;
    try {
        const existing = await prisma_1.default.product.findUnique({ where: { id }, include: { specifications: true } });
        if (!existing) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        const slug = name ? await (0, slugify_1.generateSlug)(name, SKU) : existing.slug;
        const updatedProduct = await prisma_1.default.product.update({
            where: { id },
            data: {
                name: name ?? existing.name,
                description,
                SKU: SKU ?? existing.SKU,
                basePrice: basePrice ? parseFloat(basePrice) : existing.basePrice,
                sellingPrice: sellingPrice ? parseFloat(sellingPrice) : existing.sellingPrice,
                priceDifferencePercent: priceDifferencePercent ? parseFloat(priceDifferencePercent) : existing.priceDifferencePercent,
                stock: stock ? parseInt(stock) : existing.stock,
                isNewArrival: isNewArrival !== undefined ? isNewArrival === "true" : existing.isNewArrival,
                isActive: is_active !== undefined ? is_active : existing.isActive,
                updatedById: Number(updatedById),
                categoryId: categoryId ? Number(categoryId) : existing.categoryId,
                subcategoryId: subcategoryId ? Number(subcategoryId) : existing.subcategoryId,
                length,
                width,
                weight,
                slug,
                sequenceNumber: sequenceNumber ? Number(sequenceNumber) : existing.sequenceNumber,
                seoTitle,
                seoKeyword,
                seoDescription,
                productDetails,
            },
            include: { tags: true },
        });
        if (Array.isArray(tags)) {
            await prisma_1.default.product.update({
                where: { id },
                data: {
                    tags: {
                        set: tags.map((tagId) => ({ id: tagId })),
                    },
                },
            });
        }
        if (Array.isArray(variant_specifications)) {
            await prisma_1.default.productSpecification.deleteMany({ where: { productId: id } });
            await prisma_1.default.productSpecification.createMany({
                data: variant_specifications.map((spec) => ({
                    productId: id,
                    name: spec.name,
                    value: spec.value,
                    isActive: true,
                    isDeleted: false,
                })),
            });
        }
        const finalProduct = await prisma_1.default.product.findUnique({
            where: { id },
            include: {
                tags: true,
                specifications: true,
                // ✅ add more relations if needed, like category, subcategory, etc.
            },
        });
        res.status(200).json({ success: true, product: finalProduct });
    }
    catch (error) {
        console.error("Update product error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    const id = Number(req.params.id);
    try {
        const existing = await prisma_1.default.product.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: "Product not found" });
            return;
        }
        await prisma_1.default.product.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedById: Number(req.body.deletedById) || existing.deletedById,
            },
        });
        // Also soft delete specifications
        await prisma_1.default.productSpecification.updateMany({
            where: { productId: id },
            data: { isDeleted: true },
        });
        res.status(200).json({ success: true, message: "Product soft deleted" });
    }
    catch (error) {
        console.error("Delete product error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteProduct = deleteProduct;
const toggleProductStatus = async (req, res) => {
    const id = Number(req.params.id);
    let { isNewArrival, isActive } = req.body;
    if (isNaN(id)) {
        res.status(400).json({ success: false, message: 'Invalid product ID' });
        return;
    }
    if (isNewArrival === undefined && isActive === undefined) {
        res.status(400).json({
            success: false,
            message: 'At least one of isNewArrival or isActive must be provided',
        });
        return;
    }
    // Convert "true" / "false" strings to boolean
    if (typeof isNewArrival === 'string') {
        isNewArrival = isNewArrival.toLowerCase() === 'true';
    }
    if (typeof isActive === 'string') {
        isActive = isActive.toLowerCase() === 'true';
    }
    try {
        const product = await prisma_1.default.product.findUnique({ where: { id } });
        if (!product) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }
        const updated = await prisma_1.default.product.update({
            where: { id },
            data: {
                ...(isNewArrival !== undefined && { isNewArrival }),
                ...(isActive !== undefined && { isActive }),
            },
        });
        res.status(200).json({
            success: true,
            message: 'Product status updated successfully',
            data: updated,
        });
    }
    catch (error) {
        console.error('Toggle product status error:', error);
        res
            .status(500)
            .json({ success: false, message: 'Failed to update product status' });
    }
};
exports.toggleProductStatus = toggleProductStatus;
const uploadProductsFromSheet = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            res.status(400).json({ message: 'No file uploaded or file is empty' });
            return;
        }
        const file = req.file; // ✅ TypeScript now knows `file` is defined
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        let rows = [];
        if (ext === '.csv') {
            rows = await new Promise((resolve, reject) => {
                const results = [];
                const stream = fastcsv.parse({ headers: true, trim: true });
                stream.on('error', reject);
                stream.on('data', (row) => results.push(row));
                stream.on('end', () => resolve(results));
                stream.write(file.buffer);
                stream.end();
            });
        }
        else if (ext === '.xls' || ext === '.xlsx') {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            rows = XLSX.utils.sheet_to_json(sheet);
        }
        else {
            res.status(400).json({ message: 'Unsupported file format' });
            return;
        }
        let count = 0;
        for (const row of rows) {
            try {
                const name = row['Name']?.trim();
                const description = row['Description']?.trim();
                const categoryName = row['Parent category name']?.trim();
                const SEOtitle = row['SEO title']?.trim();
                const SEOdescription = row['SEO description']?.trim();
                const SEOkeywords = row['SEO keywords']?.trim();
                const seoData = row['SEO data']?.trim();
                const heading = row['Heading']?.trim();
                const title = row['Title']?.trim();
                const minOrderQty = parseInt(row['Minimum order quantity'], 10) || 1;
                if (!name || !categoryName) {
                    console.warn('Skipping invalid row:', row);
                    continue;
                }
                const category = await prisma_1.default.category.findFirst({ where: { name: categoryName } });
                if (!category) {
                    console.warn(`Category not found for row: ${name}`);
                    continue;
                }
                const slug = await (0, slugify_1.generateSlug)(name, String(Date.now()));
                await prisma_1.default.product.create({
                    data: {
                        name,
                        description,
                        SKU: `SKU-${Date.now()}-${count}`,
                        basePrice: 100,
                        sellingPrice: 90,
                        priceDifferencePercent: 10,
                        stock: 10,
                        isNewArrival: false,
                        isActive: true,
                        isDeleted: false,
                        createdById: 1,
                        updatedById: 1,
                        categoryId: category.id,
                        subcategoryId: null,
                        slug,
                        sequenceNumber: count + 1,
                        seoTitle: SEOtitle,
                        seoKeyword: SEOkeywords,
                        seoDescription: SEOdescription,
                        productDetails: seoData,
                        specifications: {
                            create: [
                                { name: 'Title', value: title, isActive: true, isDeleted: false },
                                { name: 'Heading', value: heading, isActive: true, isDeleted: false },
                            ],
                        },
                    },
                });
                count++;
            }
            catch (err) {
                console.error('Error processing product row:', err);
            }
        }
        res.json({ message: 'Products uploaded successfully', count });
    }
    catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.uploadProductsFromSheet = uploadProductsFromSheet;
