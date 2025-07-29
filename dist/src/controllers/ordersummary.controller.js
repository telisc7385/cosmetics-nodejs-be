"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderSummaryByPincode = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const getOrderSummaryByPincode = async (req, res) => {
    const { pincode } = req.body;
    let error = null;
    let taxType = "";
    let taxPercentage = 0;
    let taxDetails = [];
    let shippingRate = 0;
    let isTaxInclusive = false;
    try {
        if (!pincode) {
            error = "Pincode is required";
        }
        else {
            const pincodeEntry = await prisma_1.default.pincode.findUnique({
                where: { zipcode: Number(pincode) },
            });
            if (!pincodeEntry) {
                error = "Invalid pincode";
            }
            else {
                const deliveryState = pincodeEntry.state.trim().toLowerCase();
                const companySettings = await prisma_1.default.companySettings.findFirst();
                if (!companySettings) {
                    error = "Company settings not found";
                }
                else {
                    const companyState = companySettings.company_state?.trim().toLowerCase();
                    isTaxInclusive = companySettings.is_tax_inclusive;
                    const isInterState = deliveryState !== companyState;
                    // --- Shipping Rate ---
                    const allShippingRates = await prisma_1.default.shippingRate.findMany({
                        where: { is_active: true },
                    });
                    const matchingEntry = allShippingRates.find((entry) => entry.state.trim().toLowerCase() === deliveryState);
                    if (matchingEntry) {
                        shippingRate =
                            deliveryState === matchingEntry.state.trim().toLowerCase()
                                ? matchingEntry.intra_state_rate
                                : matchingEntry.inter_state_rate;
                    }
                    else if (allShippingRates.length > 0) {
                        shippingRate = allShippingRates[0].inter_state_rate;
                    }
                    else {
                        error = "No shipping rate configured in the system";
                    }
                    // --- Tax Calculation ---
                    const taxRates = await prisma_1.default.tax.findMany({
                        where: { is_active: true },
                    });
                    if (taxRates.length > 0) {
                        if (isInterState) {
                            const igst = taxRates.find((t) => t.name.toUpperCase() === "IGST");
                            if (igst) {
                                taxType = "IGST";
                                taxPercentage = igst.percentage;
                                taxDetails = [{ name: igst.name, percentage: igst.percentage }];
                            }
                        }
                        else {
                            const cgst = taxRates.find((t) => t.name.toUpperCase() === "CGST");
                            const sgst = taxRates.find((t) => t.name.toUpperCase() === "SGST");
                            if (cgst && sgst) {
                                taxType = "CGST+SGST";
                                taxPercentage = cgst.percentage + sgst.percentage;
                                taxDetails = [
                                    { name: cgst.name, percentage: cgst.percentage },
                                    { name: sgst.name, percentage: sgst.percentage },
                                ];
                            }
                        }
                    }
                }
            }
        }
        // Final unified response
        res.status(200).json({
            success: !error,
            message: error ?? "Order summary fetched successfully",
            taxType,
            taxPercentage,
            taxDetails,
            shippingRate,
            isTaxInclusive,
        });
    }
    catch (error) {
        console.error("Order summary error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error,
        });
    }
};
exports.getOrderSummaryByPincode = getOrderSummaryByPincode;
