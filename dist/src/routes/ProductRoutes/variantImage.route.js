"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const variantImage_controller_1 = require("../../controllers/ProductAndVariationControllers/variantImage.controller");
const multerCloudinary_1 = require("../../upload/multerCloudinary");
const authenticate_1 = require("../../middlewares/authenticate");
const authorizaAdmin_1 = require("../../middlewares/authorizaAdmin");
const router = (0, express_1.Router)({ mergeParams: true });
// Public routes
router.get('/all', variantImage_controller_1.getAllVariantImagesForProduct); // this comes before `/:id`
router.get('/', variantImage_controller_1.getAllVariantImages);
router.get('/:variantId', variantImage_controller_1.getVariantImageById);
// Admin-only routes
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
router.post('/', multerCloudinary_1.uploadMemory.array('images', 1), variantImage_controller_1.createVariantImage);
router.patch('/:id', multerCloudinary_1.uploadMemory.array('images', 1), variantImage_controller_1.updateVariantImage);
router.delete('/:id', variantImage_controller_1.deleteVariantImage);
exports.default = router;
