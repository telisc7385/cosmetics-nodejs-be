"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestSellingProducts = exports.getProductBySlug = exports.getNewArrivalProducts = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const redisClient_1 = __importDefault(require("../../db/redisClient"));
const getNewArrivalProducts = async (req, res) => {
    try {
        const newArrivals = await prisma_1.default.product.findMany({
            where: {
                isNewArrival: true,
                isActive: true,
                isDeleted: false,
            },
            orderBy: {
                sequenceNumber: "asc",
            },
            include: {
                images: true,
                variants: true,
                category: true,
                subcategory: true,
            },
        });
        res.status(200).json({
            success: true,
            count: newArrivals.length,
            products: newArrivals,
        });
    }
    catch (error) {
        console.error("Error fetching new arrivals:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch new arrival products",
        });
    }
};
exports.getNewArrivalProducts = getNewArrivalProducts;
const getProductBySlug = async (req, res) => {
    const { slug } = req.params;
    const cacheKey = `product:${slug}`;
    // Check cache
    const cachedProduct = await redisClient_1.default.get(cacheKey);
    const keys = await redisClient_1.default.keys("*");
    console.log("Redis keys:", keys);
    if (cachedProduct) {
        res.json({
            success: true,
            data: JSON.parse(cachedProduct),
        });
        return;
    }
    try {
        const product = await prisma_1.default.product.findFirst({
            where: {
                slug,
                isActive: true,
                isDeleted: false,
            },
            include: {
                images: {
                    orderBy: { sequence: "asc" }, // optional: sort by image sequence
                },
                variants: {
                    where: { isDeleted: false, is_active: true },
                    include: {
                        images: {
                            where: { is_active: true },
                            orderBy: { sequence_number: "asc" }, // optional: sort variant images
                        },
                    },
                },
                specifications: true,
                category: true,
                subcategory: true,
            },
        });
        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }
        await redisClient_1.default.set(cacheKey, JSON.stringify(product), "EX", 3600);
        res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error("Error fetching product by slug:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching the product",
        });
        return;
    }
};
exports.getProductBySlug = getProductBySlug;
const getBestSellingProducts = async (req, res) => {
    try {
        // Step 1: Aggregate sales count grouped by productId
        const bestSellers = await prisma_1.default.orderItem.groupBy({
            by: ["productId"],
            where: {
                productId: {
                    not: null,
                },
                order: {
                    status: {
                        not: "CANCELLED",
                    },
                },
            },
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: "desc",
                },
            },
            take: 10, // get top 10
        });
        // Step 2: Extract only non-null productIds
        const productIds = bestSellers
            .map((item) => item.productId)
            .filter((id) => id !== null && id !== undefined);
        // Step 3: Fetch product details
        const products = await prisma_1.default.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
                isActive: true,
                isDeleted: false,
            },
            include: {
                images: true,
                category: true,
                subcategory: true,
            },
        });
        res.status(200).json({
            success: true,
            count: products.length,
            result: products,
        });
    }
    catch (error) {
        console.error("Best selling products error:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};
exports.getBestSellingProducts = getBestSellingProducts;
