"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const newletter_controller_1 = require("../../controllers/HomePageControllers/newletter.controller");
const authenticate_1 = require("../../middlewares/authenticate");
const authorizaAdmin_1 = require("../../middlewares/authorizaAdmin");
const router = express_1.default.Router();
router.post('/subscribe', newletter_controller_1.subscribeNewsletter);
router.get('/', authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin, newletter_controller_1.getAllSubscribers);
exports.default = router;
