"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserNameFromToken = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const jwt_1 = require("./jwt");
const getUserNameFromToken = async (req) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace(/Bearer |Token /, '').trim();
        if (!token)
            throw new Error('No token found');
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: { profile: true },
        });
        if (!user)
            return 'ECOM Store';
        return user.profile?.firstName
            ? `${user.profile.firstName} ${user.profile.lastName ?? ''}`.trim()
            : user.email ?? 'ECOM Store';
    }
    catch {
        return 'ECOM Store';
    }
};
exports.getUserNameFromToken = getUserNameFromToken;
