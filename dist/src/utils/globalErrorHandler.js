"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const errorMsg_1 = require("../middlewares/errorMsg");
const globalErrorHandler = (err, req, res, next) => {
    const statusCode = (err instanceof errorMsg_1.AppError && err.statusCode) || 500;
    const message = err.message || 'Internal Server Error';
    console.error('[ERROR]', err);
    res.status(statusCode).json({
        status: 'error',
        message,
    });
};
exports.globalErrorHandler = globalErrorHandler;
