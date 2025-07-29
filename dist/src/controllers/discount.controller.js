"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiscountRule = exports.getDiscountRules = exports.createDiscountRule = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const createDiscountRule = async (req, res) => {
    const { percentage, minItems } = req.body;
    if (!percentage || !minItems) {
        res.status(400).json({ message: 'percentage and minItems are required' });
        return;
    }
    try {
        const rule = await prisma_1.default.discountRule.create({
            data: { percentage, minItems },
        });
        res.status(201).json(rule);
    }
    catch (error) {
        console.error('Error creating discount rule:', error);
        res.status(500).json({ message: 'Failed to create discount rule' });
    }
};
exports.createDiscountRule = createDiscountRule;
// GET - accessible by any user
const getDiscountRules = async (req, res) => {
    try {
        const rules = await prisma_1.default.discountRule.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(rules);
    }
    catch (error) {
        console.error('Error fetching discount rules:', error);
        res.status(500).json({ message: 'Failed to fetch discount rules' });
    }
};
exports.getDiscountRules = getDiscountRules;
const deleteDiscountRule = async (req, res) => {
    const { id } = req.params;
    // Validate id is a number
    const ruleId = Number(id);
    if (isNaN(ruleId)) {
        res.status(400).json({ message: 'Invalid discount rule ID' });
        return;
    }
    try {
        // Check if the rule exists first (optional)
        const existingRule = await prisma_1.default.discountRule.findUnique({
            where: { id: ruleId },
        });
        if (!existingRule) {
            res.status(404).json({ message: 'Discount rule not found' });
            return;
        }
        // Delete the discount rule
        await prisma_1.default.discountRule.delete({
            where: { id: ruleId },
        });
        res.status(200).json({ message: 'Discount rule deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting discount rule:', error);
        res.status(500).json({ message: 'Failed to delete discount rule' });
    }
};
exports.deleteDiscountRule = deleteDiscountRule;
