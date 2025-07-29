"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const stream_1 = require("stream");
const cloudinary_1 = __importDefault(require("../upload/cloudinary"));
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({ folder }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result);
        });
        stream_1.Readable.from(buffer).pipe(stream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
