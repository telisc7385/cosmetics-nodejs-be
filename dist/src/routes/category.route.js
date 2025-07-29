"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = require("../controllers/CategoryControllers/category.controller");
const subcategory_route_1 = __importDefault(require("./subcategory.route"));
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const multerCloudinary_1 = require("../upload/multerCloudinary");
const router = (0, express_1.Router)();
// Public routes
router.get('/', category_controller_1.getAllCategories);
router.get('/frontend', category_controller_1.getFrontendCategories);
router.get('/id', category_controller_1.getCategoryById);
router.get('/getCategory/:slug', category_controller_1.getCategoryByCategorySlug);
router.use('/subcategory', subcategory_route_1.default);
// Nested subcategory routes
// Admin-only routes
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
// Handle image and banner uploads
const categoryUpload = multerCloudinary_1.uploadMemory.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
]);
router.post('/', categoryUpload, category_controller_1.createCategory);
router.patch('/:id', categoryUpload, category_controller_1.updateCategory);
router.delete('/:id', category_controller_1.deleteCategory);
router.patch('/deactivate/:id', category_controller_1.softDeleteCategory);
router.patch('/restore/:id', category_controller_1.restoreCategory);
exports.default = router;
