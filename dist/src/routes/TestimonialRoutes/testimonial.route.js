"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const testimonial_controller_1 = require("../../controllers/TestimonialController/testimonial.controller");
const multerCloudinary_1 = require("../../upload/multerCloudinary");
const authenticate_1 = require("../../middlewares/authenticate");
const authorizaAdmin_1 = require("../../middlewares/authorizaAdmin");
const router = express_1.default.Router();
router.get('/', testimonial_controller_1.getAllTestimonials);
router.get('/:id', testimonial_controller_1.getTestimonialById);
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
router.post('/', multerCloudinary_1.uploadMemory.single('image'), testimonial_controller_1.createTestimonial);
router.patch('/:id', multerCloudinary_1.uploadMemory.single('image'), testimonial_controller_1.updateTestimonial);
router.delete('/:id', testimonial_controller_1.deleteTestimonial);
exports.default = router;
