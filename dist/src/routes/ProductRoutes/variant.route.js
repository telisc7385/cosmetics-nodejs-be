"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const variant_controller_1 = require("../../controllers/ProductAndVariationControllers/variant.controller");
const authenticate_1 = require("../../middlewares/authenticate");
const authorizaAdmin_1 = require("../../middlewares/authorizaAdmin");
const variantImage_route_1 = __importDefault(require("../ProductRoutes/variantImage.route"));
const router = (0, express_1.Router)({ mergeParams: true });
// Public or authenticated routes
router.get('/', variant_controller_1.getAllVariants);
router.get('/:id', variant_controller_1.getVariantById);
router.get('/product/:productId', variant_controller_1.getVariantsByProduct);
router.use('/images/:variantId', variantImage_route_1.default);
// Admin-only routes
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
router.post('/:productId', variant_controller_1.createVariant);
router.patch('/:id', variant_controller_1.updateVariant);
router.delete('/:id', variant_controller_1.deleteVariant);
router.patch('/deactivate/:id', variant_controller_1.softDeleteVariant);
router.patch('/restore/:id', variant_controller_1.restoreVariant);
exports.default = router;
