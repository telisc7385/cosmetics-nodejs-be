"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const prisma_1 = __importDefault(require("../db/prisma"));
const uploadToCloudinary_1 = require("../utils/uploadToCloudinary");
const register = async (req, res) => {
    const { email, password, profile, address } = req.body;
    // Parse profile from FormData string if needed
    let profileData = profile;
    if (typeof profile === 'string') {
        try {
            profileData = JSON.parse(profile);
        }
        catch {
            res.status(400).json({ message: 'Invalid profile format' });
            return;
        }
    }
    // Parse address from FormData string if needed
    let addressData = address;
    if (typeof address === 'string') {
        try {
            addressData = JSON.parse(address);
        }
        catch {
            res.status(400).json({ message: 'Invalid address format' });
            return;
        }
    }
    try {
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        let imageUrl = null;
        let publicId = null;
        // Upload image to Cloudinary if file exists
        if (req.file?.buffer) {
            const uploadResult = await (0, uploadToCloudinary_1.uploadToCloudinary)(req.file.buffer, 'users');
            imageUrl = uploadResult.secure_url;
            // publicId = uploadResult.public_id;
        }
        // Prepare address creation data
        const formattedAddresses = addressData
            ? Array.isArray(addressData)
                ? addressData
                : [addressData]
            : [];
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'USER',
                profile: {
                    create: {
                        ...profileData,
                        imageUrl,
                        // publicId,
                    },
                },
                addresses: {
                    create: formattedAddresses.map((addr) => ({
                        fullName: addr.fullName,
                        phone: addr.phone,
                        pincode: addr.pincode,
                        state: addr.state,
                        city: addr.city,
                        addressLine: addr.addressLine,
                        landmark: addr.landmark ?? '',
                        type: addr.type ?? 'SHIPPING',
                        isDefault: addr.isDefault ?? true,
                    })),
                },
            },
            include: {
                profile: true,
                addresses: true,
            },
        });
        res.status(201).json({
            message: 'User created successfully',
            userId: user.id,
            user,
        });
    }
    catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password, admin } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: { profile: true },
        });
        if (!user || !user.password) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        if (admin === 'ADMIN') {
            if (user.role !== 'ADMIN') {
                res.status(403).json({ message: "user is not admin" });
                return;
            }
        }
        const isValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isValid) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        if (user.isDeleted) {
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: { isDeleted: false },
            });
        }
        const token = (0, jwt_1.generateToken)({ userId: user.id, role: user.role });
        res.status(200).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.profile?.firstName ?? null,
                lastName: user.profile?.lastName ?? null,
                imageUrl: user.profile?.imageUrl ?? null,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.login = login;
