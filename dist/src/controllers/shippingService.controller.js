"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShippingService = exports.createShippingService = exports.getAllShippingServices = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const readableDate_1 = require("../utils/readableDate");
const extractName_1 = require("../utils/extractName");
const getAllShippingServices = async (req, res) => {
    const services = await prisma_1.default.shippingService.findMany({
        orderBy: { updated_at: 'desc' },
    });
    const response = {
        aramex: null,
        shiprocket: null,
        usps: null,
    };
    services.forEach((s) => {
        const formatted = {
            id: s.id,
            name: s.name,
            url: s.url,
            is_active: s.is_active,
            created_by: s.created_by,
            created_at: (0, readableDate_1.formatReadableDate)(s.created_at),
            updated_by: s.updated_by,
            updated_at: (0, readableDate_1.formatReadableDate)(s.updated_at),
            start_date: s.start_date,
            end_date: s.end_date,
        };
        if (s.name === 'Aramex') {
            response.aramex = {
                ...formatted,
                aramex_username: s.aramex_username,
                aramex_password: s.aramex_password,
                aramex_account_number: s.aramex_account_number,
                aramex_account_pin: s.aramex_account_pin,
            };
        }
        else if (s.name === 'Shiprocket') {
            response.shiprocket = {
                ...formatted,
                shiprocket_username: s.shiprocket_username,
                shiprocket_password: s.shiprocket_password,
                shiprocket_token: s.shiprocket_token,
            };
        }
        else if (s.name === 'USPS') {
            response.usps = {
                ...formatted,
                usps_client_id: s.usps_client_id,
                usps_client_secret: s.usps_client_secret,
            };
        }
    });
    res.json({
        shipping_services: response,
    });
};
exports.getAllShippingServices = getAllShippingServices;
const createShippingService = async (req, res) => {
    const created_by = await (0, extractName_1.getUserNameFromToken)(req);
    const { name, url, is_active, start_date, end_date, aramex_username, aramex_password, aramex_account_number, aramex_account_pin, shiprocket_username, shiprocket_password, shiprocket_token, usps_client_id, usps_client_secret, } = req.body;
    const newService = await prisma_1.default.shippingService.create({
        data: {
            name,
            url,
            is_active: is_active ?? true,
            created_by,
            updated_by: created_by,
            start_date: start_date ? new Date(start_date) : null,
            end_date: end_date ? new Date(end_date) : null,
            aramex_username,
            aramex_password,
            aramex_account_number,
            aramex_account_pin,
            shiprocket_username,
            shiprocket_password,
            shiprocket_token,
            usps_client_id,
            usps_client_secret,
        },
    });
    res.status(201).json({ success: true, id: newService.id });
};
exports.createShippingService = createShippingService;
const updateShippingService = async (req, res) => {
    const { id } = req.params;
    const updated_by = await (0, extractName_1.getUserNameFromToken)(req);
    const { name, url, is_active, start_date, end_date, aramex_username, aramex_password, aramex_account_number, aramex_account_pin, shiprocket_username, shiprocket_password, shiprocket_token, usps_client_id, usps_client_secret, } = req.body;
    const updateData = {
        updated_by,
    };
    // Dynamically add only defined fields
    if (name !== undefined)
        updateData.name = name;
    if (url !== undefined)
        updateData.url = url;
    if (is_active !== undefined)
        updateData.is_active = is_active;
    if (start_date !== undefined)
        updateData.start_date = start_date;
    if (end_date !== undefined)
        updateData.end_date = end_date;
    if (name === 'Aramex') {
        if (aramex_username !== undefined)
            updateData.aramex_username = aramex_username;
        if (aramex_password !== undefined)
            updateData.aramex_password = aramex_password;
        if (aramex_account_number !== undefined)
            updateData.aramex_account_number = aramex_account_number;
        if (aramex_account_pin !== undefined)
            updateData.aramex_account_pin = aramex_account_pin;
    }
    else if (name === 'Shiprocket') {
        if (shiprocket_username !== undefined)
            updateData.shiprocket_username = shiprocket_username;
        if (shiprocket_password !== undefined)
            updateData.shiprocket_password = shiprocket_password;
        if (shiprocket_token !== undefined)
            updateData.shiprocket_token = shiprocket_token;
    }
    else if (name === 'USPS') {
        if (usps_client_id !== undefined)
            updateData.usps_client_id = usps_client_id;
        if (usps_client_secret !== undefined)
            updateData.usps_client_secret = usps_client_secret;
    }
    const updated = await prisma_1.default.shippingService.update({
        where: { id: Number(id) },
        data: updateData,
    });
    res.json({
        success: true,
        result: {
            ...updated,
            created_at: (0, readableDate_1.formatReadableDate)(updated.created_at),
            updated_at: (0, readableDate_1.formatReadableDate)(updated.updated_at),
        },
    });
};
exports.updateShippingService = updateShippingService;
