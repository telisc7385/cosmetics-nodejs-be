"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Routes (aboutUsSection.routes.ts)
const express_1 = require("express");
const aboutUsSection_controller_1 = require("../../controllers/AboutUs/aboutUsSection.controller");
const multerCloudinary_1 = require("../../upload/multerCloudinary");
const authenticate_1 = require("../../middlewares/authenticate");
const authorizaAdmin_1 = require("../../middlewares/authorizaAdmin");
const router = (0, express_1.Router)();
router.get('/', aboutUsSection_controller_1.getAllAboutUsSections);
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
router.post('/', multerCloudinary_1.uploadMemory.single('image'), aboutUsSection_controller_1.createAboutUsSection);
router.patch('/:id', authenticate_1.authenticate, multerCloudinary_1.uploadMemory.single('image'), aboutUsSection_controller_1.updateAboutUsSection);
router.delete('/:id', aboutUsSection_controller_1.deleteAboutUsSection);
exports.default = router;
