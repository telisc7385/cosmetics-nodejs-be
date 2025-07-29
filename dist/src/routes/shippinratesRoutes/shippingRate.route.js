"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shippingRate_controller_1 = require("../../controllers/shippingRate/shippingRate.controller");
const router = (0, express_1.Router)();
router.get('/', shippingRate_controller_1.getAllShippingRates);
// router.use(authenticate,authorizeAdmin)
router.post('/', shippingRate_controller_1.createShippingRate);
router.patch('/:id/', shippingRate_controller_1.updateShippingRate);
router.delete('/:id/', shippingRate_controller_1.deleteShippingRate);
exports.default = router;
