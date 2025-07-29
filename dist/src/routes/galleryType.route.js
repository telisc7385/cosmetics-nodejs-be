"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const galleryType_controller_1 = require("../controllers/galleryType.controller");
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const router = express_1.default.Router();
router.get('/', galleryType_controller_1.getAllGalleryTypes);
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
router.post('/', galleryType_controller_1.createGalleryType);
router.patch('/:id', galleryType_controller_1.updateGalleryType);
router.delete('/:id', galleryType_controller_1.deleteGalleryType);
exports.default = router;
