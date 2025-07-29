"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCart = exports.removeCartItem = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
// GET /cart
const getCart = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const cart = await prisma_1.default.cart.findUnique({
        where: { userId },
        include: {
            items: {
                include: {
                    product: { include: { images: true } },
                    variant: {
                        include: {
                            images: true,
                            product: {
                                select: {
                                    name: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });
    if (!cart) {
        res.json({ cart: null, discount: 0 });
        return;
    }
    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const discountRule = await prisma_1.default.discountRule.findFirst({ orderBy: { createdAt: 'desc' } });
    const discount = discountRule && itemCount >= discountRule.minItems ? discountRule.percentage : 0;
    res.json({ cart, discount });
};
exports.getCart = getCart;
// POST /cart/add
const addToCart = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { productId, variantId, quantity } = req.body;
    if (!productId && !variantId) {
        res.status(400).json({ message: 'ProductId or VariantId required' });
        return;
    }
    const cart = await prisma_1.default.cart.upsert({
        where: { userId },
        create: { userId },
        update: {},
    });
    if (variantId) {
        const variant = await prisma_1.default.productVariant.findUnique({
            where: { id: variantId },
        });
        if (!variant || variant.isDeleted) {
            res.status(404).json({ message: 'Variant not found' });
            return;
        }
        const existing = await prisma_1.default.cartItem.findFirst({
            where: { cartId: cart.id, variantId },
        });
        const updatedOrNew = existing
            ? await prisma_1.default.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + (quantity ?? 1) },
            })
            : await prisma_1.default.cartItem.create({
                data: {
                    cartId: cart.id,
                    variantId,
                    quantity: quantity ?? 1,
                },
            });
        res.json(updatedOrNew);
        return;
    }
    const product = await prisma_1.default.product.findUnique({
        where: { id: productId },
        include: { variants: true },
    });
    if (!product || product.isDeleted) {
        res.status(404).json({ message: 'Product not found' });
        return;
    }
    if (product.variants && product.variants.length > 0) {
        res.status(400).json({
            message: 'This product has variants. Please select a variant instead.',
        });
        return;
    }
    const existing = await prisma_1.default.cartItem.findFirst({
        where: { cartId: cart.id, productId },
    });
    const updatedOrNew = existing
        ? await prisma_1.default.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + (quantity ?? 1) },
        })
        : await prisma_1.default.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity: quantity ?? 1,
            },
        });
    res.json(updatedOrNew);
};
exports.addToCart = addToCart;
// PUT /cart/update/:itemId
const updateCartItem = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
        res.status(400).json({ message: 'Quantity must be at least 1' });
        return;
    }
    const item = await prisma_1.default.cartItem.findUnique({ where: { id: +itemId }, include: { cart: true } });
    if (!item || item.cart.userId !== userId) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }
    const updated = await prisma_1.default.cartItem.update({ where: { id: item.id }, data: { quantity } });
    res.json(updated);
};
exports.updateCartItem = updateCartItem;
// DELETE /cart/remove/:itemId
const removeCartItem = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const { itemId } = req.params;
    const item = await prisma_1.default.cartItem.findUnique({ where: { id: +itemId }, include: { cart: true } });
    if (!item || item.cart.userId !== userId) {
        res.status(404).json({ message: 'Item not found' });
        return;
    }
    await prisma_1.default.cartItem.delete({ where: { id: item.id } });
    res.json({ message: 'Item removed' });
};
exports.removeCartItem = removeCartItem;
// DELETE /cart/clear
const clearCart = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const cart = await prisma_1.default.cart.findUnique({ where: { userId } });
    if (!cart) {
        res.json({ message: 'Cart already empty' });
        return;
    }
    await prisma_1.default.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Cart cleared' });
};
exports.clearCart = clearCart;
