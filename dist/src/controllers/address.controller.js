"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAddressesForAdmin = exports.setDefaultAddress = exports.deleteAddress = exports.updateAddress = exports.getUserAddresses = exports.createAddress = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const createAddress = async (req, res) => {
    const userId = req.user?.userId;
    console.log(req.body);
    try {
        const address = await prisma_1.default.address.create({
            data: {
                ...req.body,
                userId,
            },
        });
        res.status(201).json({ message: "Address Added Successfully", address });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to create address', error });
    }
};
exports.createAddress = createAddress;
const getUserAddresses = async (req, res) => {
    const userId = req.user?.userId;
    try {
        const addresses = await prisma_1.default.address.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' },
        });
        res.json({ address: addresses });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch addresses', error });
    }
};
exports.getUserAddresses = getUserAddresses;
const updateAddress = async (req, res) => {
    const { id } = req.params;
    try {
        const updated = await prisma_1.default.address.update({
            where: { id: Number(id) },
            data: req.body,
        });
        res.json({ message: "Address Updated Successfully", updated });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update address', error });
    }
};
exports.updateAddress = updateAddress;
const deleteAddress = async (req, res) => {
    const { id } = req.params;
    try {
        const address = await prisma_1.default.address.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: 'Address deleted', address });
    }
    catch (error) {
        if (error.code === 'P2003') {
            res.status(400).json({
                message: 'Cannot delete this address because it is linked to an existing order.',
            });
            return;
        }
        res.status(500).json({ message: 'Failed to delete address', error: error.message });
    }
};
exports.deleteAddress = deleteAddress;
const setDefaultAddress = async (req, res) => {
    const userId = req.user?.userId;
    const { id } = req.params;
    try {
        // Reset other addresses
        await prisma_1.default.address.updateMany({
            where: { userId },
            data: { isDefault: false },
        });
        // Set selected one to default
        const updated = await prisma_1.default.address.update({
            where: { id: Number(id) },
            data: { isDefault: true },
        });
        res.json(updated);
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to set default address', error });
    }
};
exports.setDefaultAddress = setDefaultAddress;
const getUserAddressesForAdmin = async (req, res) => {
    const paramUserId = parseInt(req.params.userId); // e.g. /addresses/6
    const loggedInUserId = req.user?.userId;
    const isAdmin = req.user?.role === 'ADMIN';
    // Only admins can fetch addresses for other users
    if (!isAdmin && paramUserId !== loggedInUserId) {
        res.status(403).json({ message: 'Forbidden: You can only access your own addresses' });
        return;
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id: paramUserId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const addresses = await prisma_1.default.address.findMany({
            where: { userId: paramUserId },
            orderBy: { isDefault: 'desc' },
        });
        res.json({ address: addresses });
    }
    catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Failed to fetch addresses', error: error.message });
    }
};
exports.getUserAddressesForAdmin = getUserAddressesForAdmin;
