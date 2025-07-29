"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const galleryItem_controller_1 = require("../controllers/galleryItem.controller");
const multerCloudinary_1 = require("../upload/multerCloudinary");
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const router = express_1.default.Router();
router.get('/', galleryItem_controller_1.getAllGalleryItems);
router.post('/', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, multerCloudinary_1.uploadMemory.single('image'), galleryItem_controller_1.createGalleryItem);
router.patch('/:id', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, multerCloudinary_1.uploadMemory.single('image'), galleryItem_controller_1.updateGalleryItem);
router.delete('/:id', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, galleryItem_controller_1.deleteGalleryItem);
exports.default = router;
