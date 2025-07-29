"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const authenticate_1 = require("../middlewares/authenticate");
const multerCloudinary_1 = require("../upload/multerCloudinary");
const discount_controller_1 = require("../controllers/discount.controller");
const router = (0, express_1.Router)();
router.use(authenticate_1.authenticate);
// User-specific routes
router.delete('/delete', user_controller_1.deleteOwnAccount);
router.patch('/deactivate', user_controller_1.softDeleteOwnAccount);
router.patch('/restore', user_controller_1.restoreOwnAccount);
router.patch('/update', multerCloudinary_1.uploadMemory.single('image'), user_controller_1.updateOwnProfile);
router.patch('/change-password', user_controller_1.changePassword);
router.get('/details', user_controller_1.getMe);
router.get('/discounts', discount_controller_1.getDiscountRules);
exports.default = router;
