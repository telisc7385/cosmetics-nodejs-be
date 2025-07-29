"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const whyChooseUs_controller_1 = require("../controllers/whyChooseUs.controller");
const multerCloudinary_1 = require("../upload/multerCloudinary"); // adjust path if needed
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin"); // fixed typo here
const router = express_1.default.Router();
router.get('/', whyChooseUs_controller_1.getAllWhyChooseUsItems);
router.get('/:id', whyChooseUs_controller_1.getWhyChooseUsItemById);
// Protect routes below with authentication & admin authorization
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
router.post('/', multerCloudinary_1.uploadMemory.single('image'), whyChooseUs_controller_1.createWhyChooseUsItem);
router.patch('/:id', multerCloudinary_1.uploadMemory.single('image'), whyChooseUs_controller_1.updateWhyChooseUsItem);
router.delete('/:id', whyChooseUs_controller_1.deleteWhyChooseUsItem);
exports.default = router;
