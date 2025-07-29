"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banner_controller_1 = require("../controllers/banner.controller");
const multerCloudinary_1 = require("../upload/multerCloudinary");
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const router = (0, express_1.Router)();
// Public route
router.get('/', banner_controller_1.getBanners);
// Admin-only routes
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
const bannerUpload = multerCloudinary_1.uploadMemory.fields([
    { name: 'image', maxCount: 1 },
    { name: 'mobile_banner', maxCount: 1 },
]);
router.post('/', bannerUpload, banner_controller_1.createBanner);
router.patch('/:id', bannerUpload, banner_controller_1.updateBanner);
router.delete('/:id', banner_controller_1.deleteBanner);
exports.default = router;
