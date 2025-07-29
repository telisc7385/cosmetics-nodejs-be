"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const multerCloudinary_1 = require("../upload/multerCloudinary");
const router = (0, express_1.Router)();
router.post('/register', multerCloudinary_1.uploadMemory.single('image'), auth_controller_1.register);
router.post('/login', auth_controller_1.login);
exports.default = router;
