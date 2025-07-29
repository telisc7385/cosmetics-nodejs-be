"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticate_1 = require("../middlewares/authenticate");
const authorizaAdmin_1 = require("../middlewares/authorizaAdmin");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const router = express_1.default.Router();
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
router.post('/user/dashboard', dashboard_controller_1.getDashboard);
router.post('/user/dashboard-sections/', dashboard_controller_1.getUserDashboardSections);
router.post('/user/dashboard-setting/', dashboard_controller_1.upsertDashboardSetting);
exports.default = router;
