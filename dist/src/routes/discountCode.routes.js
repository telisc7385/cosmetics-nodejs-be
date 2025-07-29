"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const discountCode_controller_1 = require("../controllers/discountCode.controller");
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const router = (0, express_1.Router)();
// User-only route to view their codes
router.use(authenticate_1.authenticate);
router.get('/mine', discountCode_controller_1.getUserDiscountCodes);
// User redeeming code
router.post('/redeem', discountCode_controller_1.redeemDiscountCode);
// Admin route to view all codes
router.use(authorizaAdmin_1.authorizeAdmin);
router.get('/', discountCode_controller_1.getAllDiscountCodes);
exports.default = router;
