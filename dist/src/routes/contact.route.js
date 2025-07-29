"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_controller_1 = require("../controllers/contact.controller");
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const router = express_1.default.Router();
router.post('/contact_form', contact_controller_1.createContactRequest);
router.use(authenticate_1.authenticate);
router.get('/contact_form', authorizaAdmin_1.authorizeAdmin, contact_controller_1.getContactRequests);
router.get('/contacts/:id', authorizaAdmin_1.authorizeAdmin, contact_controller_1.getContactRequestById);
router.patch('/contact_form/:id', authorizaAdmin_1.authorizeAdmin, contact_controller_1.markContactAsHandled);
router.delete('/contacts/:id', contact_controller_1.deleteContactRequest);
exports.default = router;
