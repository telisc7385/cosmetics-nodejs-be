"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const coupon_controller_1 = require("../controllers/coupon.controller");
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const router = express_1.default.Router();
router.post('/user-coupon', authenticate_1.authenticate, coupon_controller_1.getUserCouponCodes);
router.post('/redeem', authenticate_1.authenticate, coupon_controller_1.redeemCouponCode);
// router.get('/discounts/:id', authenticate, getCouponCodeById);
router.get('/discounts', authenticate_1.authenticate, coupon_controller_1.getAllCouponCodes);
router.post('/', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, coupon_controller_1.createCouponCode);
router.patch('/update/:id', coupon_controller_1.updateCouponCode);
router.delete('/discounts/:id', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, coupon_controller_1.deleteCouponCode);
exports.default = router;
