"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const multerCloudinary_1 = require("../upload/multerCloudinary");
const SubCategories_controller_1 = require("../controllers/CategoryControllers/SubCategories.controller");
const router = (0, express_1.Router)();
// // Public routes
router.get('/', SubCategories_controller_1.getSubcategoryByCategoryId);
// router.patch('/:id', updateSubCategory);
// // Admin-only routes
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
// // Accept both image and banner uploads
const fileUploadMiddleware = multerCloudinary_1.uploadMemory.fields([
    { name: 'image', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
]);
router.patch('/:id', fileUploadMiddleware, SubCategories_controller_1.updateSubCategory);
router.post('/', fileUploadMiddleware, SubCategories_controller_1.createSubcategory);
router.delete("/:id", SubCategories_controller_1.deleteSubcategory);
// router.patch('/:id', fileUploadMiddleware, updateSubcategory);
// router.delete('/:id', deleteSubcategory);
// router.patch('/deactivate/:id', softDeleteSubcategory);
// router.patch('/restore/:id', restoreSubcategory);
// router.get('/by-category/:categoryId', getSubcategoriesByCategoryId);
exports.default = router;
