"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redeemCouponCode = exports.getUserCouponCodes = exports.updateCouponCode = exports.getAllCouponCodes = exports.deleteCouponCode = exports.createCouponCode = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
// Admin: Create coupon code
const createCouponCode = async (req, res) => {
    const { name, discount, expiresAt, code, maxRedeemCount, show_on_homepage, is_active } = req.body;
    // Validate required fields
    if (!name || !discount || !expiresAt || !code || !maxRedeemCount) {
        res.status(400).json({
            message: 'Missing required fields: name, discount, expiresAt, code, maxRedeemCount',
        });
        return;
    }
    try {
        const newCode = await prisma_1.default.couponCode.create({
            data: {
                name,
                code,
                discount,
                expiresAt: new Date(expiresAt),
                maxRedeemCount,
                show_on_homepage: show_on_homepage === 'false' ? false : !!(show_on_homepage ?? true),
                is_active: is_active === 'false' ? false : !!(is_active ?? true),
            },
        });
        res.status(201).json({
            success: true,
            message: 'Coupon code created successfully',
            data: newCode,
        });
    }
    catch (error) {
        console.error('Create coupon code error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.createCouponCode = createCouponCode;
// Admin: Delete coupon code by ID
const deleteCouponCode = async (req, res) => {
    const { id } = req.params;
    const couponId = Number(id);
    if (!id || Number.isNaN(couponId)) {
        res.status(400).json({ message: 'Invalid or missing coupon ID' });
        return;
    }
    try {
        // Check if coupon exists before deleting
        const existingCoupon = await prisma_1.default.couponCode.findUnique({
            where: { id: couponId },
        });
        if (!existingCoupon) {
            res.status(404).json({ message: 'Coupon code not found' });
            return;
        }
        await prisma_1.default.couponRedemption.deleteMany({
            where: { couponId: couponId },
        });
        await prisma_1.default.couponCode.delete({
            where: { id: couponId },
        });
        res.status(200).json({ success: true, message: 'Coupon code deleted successfully' });
    }
    catch (error) {
        console.error('Delete coupon code error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.deleteCouponCode = deleteCouponCode;
// Admin: Get all coupon codes (global)
const getAllCouponCodes = async (req, res) => {
    try {
        const { is_active, ordering } = req.query;
        // Dynamic filters
        const whereClause = {
            code: {
                not: {
                    startsWith: 'ABND-', // 👈 Exclude abandoned cart codes
                },
            },
            expiresAt: {
                gte: new Date(), // ✅ Filter out expired coupons
            }
        };
        if (is_active === "true")
            whereClause.is_active = true;
        else if (is_active === "false")
            whereClause.is_active = false;
        // Default orderBy
        let orderByClause = { createdAt: "desc" };
        if (ordering) {
            if (typeof ordering === "string") {
                if (ordering.startsWith("-")) {
                    orderByClause = {
                        [ordering.slice(1)]: "desc",
                    };
                }
                else {
                    orderByClause = {
                        [ordering]: "asc",
                    };
                }
            }
        }
        const codes = await prisma_1.default.couponCode.findMany({
            where: whereClause,
            include: {
                _count: {
                    select: {
                        redemptions: true,
                    },
                },
            },
            orderBy: orderByClause,
        });
        const formatted = codes.map(code => ({
            ...code,
            redeemCount: code._count.redemptions,
        }));
        res.status(200).json({ success: true, data: formatted });
    }
    catch (error) {
        console.error('Get all coupon codes error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getAllCouponCodes = getAllCouponCodes;
// // Get coupon code by ID
// export const getCouponCodeById = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   try {
//     const code = await prisma.couponCode.findUnique({
//       where: { id: Number(id) },
//       include: { user: true, cart: true },
//     });
//     if (!code) {
//         res.status(404).json({ message: 'Coupon code not found' });
//         return
//     }
//     res.status(200).json({ success: true, data: code });
//   } catch (error) {
//     console.error('Get coupon code error:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };
// export const updateCouponCode = async (req: Request, res: Response) => {
//   const { id } = req.params;
//   const {
//     name,
//     code,
//     discount,
//     expiresAt,
//     maxRedeemCount,
//     show_on_homepage,
//     is_active,
//   } = req.body;
//   if (!id) {
//      res.status(400).json('Coupon ID is required');
//      return
//   }
//   try {
//     const couponId = parseInt(id);
//     const existing = await prisma.couponCode.findUnique({
//       where: { id: couponId },
//     });
//     if (!existing) {
//        res.status(404).json('Coupon not found');
//        return
//     }
//     const updatedCoupon = await prisma.couponCode.update({
//       where: { id: couponId },
//       data: {
//         ...(name !== undefined && { name }),
//         ...(code !== undefined && { code }),
//         ...(discount !== undefined && { discount }),
//         ...(expiresAt !== undefined && { expiresAt: new Date(expiresAt) }),
//         ...(maxRedeemCount !== undefined && { maxRedeemCount }),
//        ...(show_on_homepage !== undefined && { show_on_homepage: show_on_homepage == 'true' }),
//        ...(is_active !== undefined && { is_active: is_active == 'true' }),
//       },
//     });
//      res.status(200).json({"message":"coupon updated successfully",updatedCoupon});
//      return
//   } catch (error: any) {
//     console.error('Update coupon error:', error);
//     if (error.code === 'P2002') {
//        res.status(409).json('Coupon code must be unique');
//        return
//     }
//      res.status(500).json('Internal server error');
//   }
// };
const updateCouponCode = async (req, res) => {
    const { id } = req.params;
    const { name, code, discount, expiresAt, maxRedeemCount, show_on_homepage, is_active, } = req.body;
    if (!id) {
        res.status(400).json('Coupon ID is required');
        return;
    }
    try {
        const couponId = parseInt(id);
        const existing = await prisma_1.default.couponCode.findUnique({
            where: { id: couponId },
        });
        if (!existing) {
            res.status(404).json('Coupon not found');
            return;
        }
        const maxRedeemCountNum = maxRedeemCount !== undefined ? Number(maxRedeemCount) : undefined;
        const isActiveBool = is_active !== undefined ? (is_active === 'true' || is_active === true) : undefined;
        const showOnHomepageBool = show_on_homepage !== undefined ? (show_on_homepage === 'true' || show_on_homepage === true) : undefined;
        const updatedCoupon = await prisma_1.default.couponCode.update({
            where: { id: couponId },
            data: {
                ...(name !== undefined && { name }),
                ...(code !== undefined && { code }),
                ...(discount !== undefined && { discount: Number(discount) }),
                ...(expiresAt !== undefined && { expiresAt: new Date(expiresAt) }),
                ...(maxRedeemCountNum !== undefined && { maxRedeemCount: maxRedeemCountNum }),
                ...(showOnHomepageBool !== undefined && { show_on_homepage: showOnHomepageBool }),
                ...(isActiveBool !== undefined && { is_active: isActiveBool }),
            },
        });
        res.status(200).json({ message: 'Coupon updated successfully', updatedCoupon });
    }
    catch (error) {
        console.error('Update coupon error:', error);
        if (error.code === 'P2002') {
            res.status(409).json('Coupon code must be unique');
            return;
        }
        res.status(500).json('Internal server error');
    }
};
exports.updateCouponCode = updateCouponCode;
// User: Get all active coupon codes (globally available)
const getUserCouponCodes = async (req, res) => {
    try {
        const { cartId } = req.body;
        if (!cartId) {
            res.status(400).json({ success: false, message: "Cart ID is required." });
            return;
        }
        const coupons = await prisma_1.default.couponCode.findMany({
            where: {
                is_active: true,
                expiresAt: {
                    gt: new Date(),
                },
                redemptions: {
                    none: {
                        cartId: Number(cartId),
                        orderId: {
                            not: null,
                        },
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        res.status(200).json({ success: true, coupons });
    }
    catch (error) {
        console.error('Get user coupon codes error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getUserCouponCodes = getUserCouponCodes;
// POST /user/coupons/redeem - Apply a coupon code to user's car
const redeemCouponCode = async (req, res) => {
    const userId = req.user?.userId;
    const { code, cartId } = req.body;
    if (!code || !cartId) {
        res.status(400).json({ message: 'Missing code or cartId' });
        return;
    }
    try {
        // 1. Validate Cart
        const cart = await prisma_1.default.cart.findUnique({ where: { id: cartId } });
        if (!cart) {
            res.status(400).json({ message: 'Invalid cartId: Cart does not exist' });
            return;
        }
        // 2. Find the coupon
        const coupon = await prisma_1.default.couponCode.findUnique({
            where: { code },
        });
        if (!coupon) {
            res.status(400).json({ message: 'Coupon code does not exist' });
            return;
        }
        // 3. Check expiry and redemption limit
        const now = new Date();
        if (coupon.expiresAt < now) {
            res.status(400).json({ message: 'Coupon code has expired' });
            return;
        }
        if (coupon.redeemCount >= coupon.maxRedeemCount) {
            res.status(400).json({ message: 'Coupon redemption limit reached' });
            return;
        }
        // 4. Check if this cart already redeemed this coupon
        const alreadyRedeemed = await prisma_1.default.couponRedemption.findUnique({
            where: {
                couponId_cartId: {
                    couponId: coupon.id,
                    cartId: cartId,
                },
            },
        });
        if (alreadyRedeemed) {
            if (alreadyRedeemed.orderId !== null) {
                // Coupon already used in an actual order
                res.status(400).json({ message: 'This coupon is already used in a completed order' });
                return;
            }
            else {
                // Soft redemption exists (no order placed) — reuse it instead of re-inserting
                res.status(200).json({
                    success: true,
                    message: 'Coupon code applied successfully.',
                    data: {
                        couponCode: coupon.code,
                        discount: coupon.discount,
                    },
                });
                return;
            }
        }
        // 5. Create the redemption entry (safe to do now)
        await prisma_1.default.couponRedemption.create({
            data: {
                couponId: coupon.id,
                cartId: cartId,
            },
        });
        res.status(200).json({
            success: true,
            message: 'Coupon code applied successfully.',
            data: {
                couponCode: coupon.code,
                discount: coupon.discount,
            },
        });
    }
    catch (error) {
        console.error('Redeem coupon error:', error);
        res.status(500).json({ message: 'Internal server error' });
        return;
    }
};
exports.redeemCouponCode = redeemCouponCode;
