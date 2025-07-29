"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companySettings_controller_1 = require("../../controllers/ComponySettingsControllers/companySettings.controller");
const authenticate_1 = require("../../middlewares/authenticate");
const authorizaAdmin_1 = require("../../middlewares/authorizaAdmin");
const router = (0, express_1.Router)();
// Public access
router.get('/', companySettings_controller_1.getAllCompanySettings);
router.get('/:id', companySettings_controller_1.getCompanySettingsById);
// Admin only
const multerCloudinary_1 = require("../../upload/multerCloudinary");
router.post('/', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, multerCloudinary_1.uploadMemory.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'facebook_icon', maxCount: 1 },
    { name: 'instagram_icon', maxCount: 1 },
    { name: 'twitter_icon', maxCount: 1 },
    { name: 'linkedin_icon', maxCount: 1 },
]), companySettings_controller_1.upsertCompanySettings);
router.patch('/:id', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, multerCloudinary_1.uploadMemory.single('logo'), companySettings_controller_1.updateCompanySettings);
router.delete('/:id', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, companySettings_controller_1.deleteCompanySettings);
exports.default = router;
