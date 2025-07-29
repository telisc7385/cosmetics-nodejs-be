"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMemory = void 0;
const multer_1 = __importDefault(require("multer"));
exports.uploadMemory = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
    fileFilter: (req, file, cb) => {
        const ext = file.originalname.toLowerCase();
        if (!ext.match(/\.(jpg|jpeg|png|webp|mp4|mov|avi|mkv)$/)) {
            cb(new Error('Only images are allowed'));
            return;
        }
        cb(null, true);
    },
});
