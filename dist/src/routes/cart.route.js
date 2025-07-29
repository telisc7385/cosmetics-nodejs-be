"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const authenticate_1 = require("../middlewares/authenticate");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
router.get('/', cart_controller_1.getCart); // Get current user's cart
router.post('/add', cart_controller_1.addToCart); // Add item to cart
router.put('/update/:itemId', cart_controller_1.updateCartItem); // Update quantity
router.delete('/remove/:itemId', cart_controller_1.removeCartItem); // Remove a specific item
router.delete('/clear', cart_controller_1.clearCart); // Clear entire cart
exports.default = router;
