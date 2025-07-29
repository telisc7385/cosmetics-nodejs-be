"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOrderHistory = exports.getOrdersForAdmin = exports.generateInvoicePDF = exports.getSingleOrder = exports.getOrderById = exports.getAllUserOrdersForAdmin = exports.updateOrderStatus = exports.createOrder = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const client_1 = require("@prisma/client");
const dayjs_1 = __importDefault(require("dayjs"));
const sendOrderConfirmationEmail_1 = require("../email/sendOrderConfirmationEmail");
const notification_1 = require("../utils/notification");
const orderStatusMail_1 = require("../email/orderStatusMail");
const razorpay_1 = __importDefault(require("razorpay"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const puppeteer_1 = __importDefault(require("puppeteer"));
// Create new order for authenticated user
const createOrder = async (req, res) => {
    const userId = req.user?.userId;
    const { items, addressId, totalAmount, taxAmount, taxType, appliedTaxRate, isTaxInclusive, shippingRate, paymentMethod, discountAmount = 0, subtotal, discountCode = '', billingAddress, shippingAddress, cartId, abandentDiscountAmount } = req.body;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    if (!subtotal || !totalAmount) {
        res.status(400).json({ message: 'subtotal ,totalAmount required' });
        return;
    }
    try {
        const createItems = items.map((item, idx) => {
            const hasProduct = typeof item.productId === 'number';
            const hasVariant = typeof item.variantId === 'number';
            if (!hasProduct && !hasVariant) {
                throw new Error(`Item ${idx + 1}: Must have either productId or variantId.`);
            }
            if (hasProduct && hasVariant) {
                throw new Error(`Item ${idx + 1}: Cannot have both productId and variantId.`);
            }
            return {
                productId: hasProduct ? item.productId : null,
                variantId: hasVariant ? item.variantId : null,
                quantity: item.quantity,
                price: item.price,
            };
        });
        // // Calculate final amount after discount (never below zero)
        // const finalAmount = Math.max(totalAmount - discountAmount, 0);
        const paymentStatus = paymentMethod.toUpperCase() === 'RAZORPAY'
            ? client_1.PaymentStatus.SUCCESS
            : client_1.PaymentStatus.PENDING;
        const payment = await prisma_1.default.payment.create({
            data: {
                method: paymentMethod,
                status: paymentStatus,
            },
        });
        const address = await prisma_1.default.address.findUnique({
            where: { id: addressId },
        });
        if (!address) {
            res.status(400).json({ message: 'Invalid address ID' });
            return;
        }
        let razorpayOrderId = null;
        let razorpayKeyId = null;
        if (paymentMethod.toUpperCase() === 'RAZORPAY') {
            const razorpayService = await prisma_1.default.paymentService.findFirst({
                where: {
                    name: 'Razorpay',
                    is_active: true,
                },
            });
            const keyId = razorpayService?.razorpay_key_id || process.env.RAZORPAY_KEY;
            const keySecret = razorpayService?.razorpay_key_secret || process.env.RAZORPAY_SECRET;
            if (!keyId || !keySecret) {
                res.status(500).json({ message: 'Razorpay credentials not configured in DB or ENV.' });
                return;
            }
            const razorpay = new razorpay_1.default({
                key_id: keyId,
                key_secret: keySecret,
            });
            const razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: "INR",
                receipt: `receipt_order_${Date.now()}`,
                notes: {
                    userId: userId.toString(),
                    addressId: addressId.toString(),
                    cartId: cartId?.toString() || '',
                },
            });
            razorpayOrderId = razorpayOrder.id;
            razorpayKeyId = keyId;
        }
        const order = await prisma_1.default.order.create({
            data: {
                userId,
                addressId,
                subtotal,
                totalAmount,
                discountAmount,
                discountCode,
                billingAddress,
                shippingAddress,
                taxAmount,
                taxType,
                appliedTaxRate,
                isTaxInclusive,
                shippingRate,
                status: client_1.OrderStatus.PENDING,
                paymentId: payment.id,
                abandentDiscountAmount,
                razorpayOrderId: razorpayOrderId,
                items: {
                    create: createItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: {
                            include: {
                                product: true,
                            }
                        }
                    },
                },
                payment: true,
                user: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        if (discountCode && cartId) {
            const coupon = await prisma_1.default.couponCode.findUnique({
                where: { code: discountCode },
            });
            if (coupon) {
                const redemption = await prisma_1.default.couponRedemption.findUnique({
                    where: {
                        couponId_cartId: {
                            couponId: coupon.id,
                            cartId: cartId,
                        },
                    },
                });
                if (redemption && !redemption.orderId) {
                    await prisma_1.default.couponRedemption.update({
                        where: { id: redemption.id },
                        data: {
                            orderId: order.id,
                        },
                    });
                    const updatedCount = coupon.redeemCount + 1;
                    const stillVisible = updatedCount < coupon.maxRedeemCount;
                    await prisma_1.default.couponCode.update({
                        where: { id: coupon.id },
                        data: {
                            redeemCount: updatedCount,
                            show_on_homepage: stillVisible,
                        },
                    });
                }
            }
        }
        if (cartId && userId) {
            try {
                await prisma_1.default.abandonedCartItem.deleteMany({
                    where: {
                        cartId: cartId,
                        userId: userId,
                    },
                });
                console.log(`✅ Cleared abandoned cart items for cartId=${cartId}, userId=${userId}`);
            }
            catch (err) {
                console.error('Failed to clear abandoned cart items:', err);
            }
        }
        // Send order confirmation email
        // const shippingService = await prisma.shippingService.findFirst({
        //   where: { name: 'Shiprocket', is_active: true },
        // });
        // if (!shippingService?.shiprocket_token) {
        //   console.warn('Shiprocket token not available. Skipping shipment creation.');
        //    res.status(201).json({ ...order, finalAmount });
        //    return;
        // }
        // const shipmentData = await createShiprocketShipment(order, address, shippingService.shiprocket_token);
        // if (shipmentData) {
        //   await prisma.shipment.create({
        //     data: {
        //       orderId: order.id,
        //       courierName: shipmentData.courier_company || 'Shiprocket',
        //       awbCode: shipmentData.awb_code,
        //       trackingUrl: shipmentData.tracking_url,
        //       shipmentId: shipmentData.shipment_id?.toString() || '',
        //       status: shipmentData.current_status || 'Pending',
        //       labelUrl: shipmentData.label_url,
        //     },
        //   });
        //   console.log(`✅ Shipment created for Order #${order.id}`);
        // }
        // const razorpayOrder = await razorpay.orders.create({
        //   amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
        //   currency: "INR",
        //   receipt: `receipt_order_${Date.now()}`,
        // });
        res.status(201).json({ totalAmount,
            id: order.id,
            fullname: address.fullName,
            ...(razorpayOrderId && {
                razorpayid: razorpayOrderId,
                razorpayKeyId: razorpayKeyId,
            }),
        });
        await (0, sendOrderConfirmationEmail_1.sendOrderConfirmationEmail)(order.user.email, order.user.profile?.firstName || 'Customer', `COM-${order.id}`, order.items.map((i) => {
            const productName = i.variant?.product?.name || i.product?.name || 'Unnamed Product';
            const variantLabel = i.variant?.name ? ` (${i.variant.name})` : '';
            return {
                name: productName + variantLabel,
                quantity: i.quantity,
                price: i.price,
            };
        }), totalAmount, order.payment?.method || 'N/A');
        await (0, notification_1.sendNotification)(userId, `🎉 Your order #${order.id} has been created and status ${order.status}. Final amount: ₹${totalAmount}`, 'ORDER');
        await (0, orderStatusMail_1.sendOrderStatusUpdateEmail)(order.user.email, order.user.profile?.firstName || 'Customer', order.id, order.status);
    }
    catch (error) {
        console.error('Create order failed:', error);
        res.status(500).json({ message: 'Failed to create order', error });
    }
};
exports.createOrder = createOrder;
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;
        const order = await prisma_1.default.order.update({
            where: { id: Number(orderId) },
            data: { status },
            include: {
                user: {
                    include: {
                        profile: true,
                    },
                },
            },
        });
        await (0, notification_1.sendNotification)(order.userId, `Your order #${order.id} status has been updated to ${order.status}. at ${(0, dayjs_1.default)().format('DD/MM/YYYY, hh:mmA')}`, 'ORDER');
        await (0, orderStatusMail_1.sendOrderStatusUpdateEmail)(order.user.email, order.user.profile?.firstName || 'Customer', order.id, order.status);
        res.json(order);
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// Get orders for admin
const getAllUserOrdersForAdmin = async (req, res) => {
    const { search, page = 1, page_size = 10, ordering = 'desc', order_status, start_date, end_date, } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isAdmin) {
        res.status(403).json({ message: "Access denied. Only admins can view all orders." });
        return;
    }
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const sortOrder = ordering === 'asc' ? 'asc' : 'desc';
    try {
        const whereConditions = {};
        if (req.query.id) {
            const id = parseInt(req.query.id);
            if (!isNaN(id)) {
                whereConditions.id = id;
            }
        }
        else if (search) {
            const searchStr = search.toString();
            const orConditions = [];
            if (!isNaN(Number(searchStr))) {
                orConditions.push({ id: Number(searchStr) });
            }
            const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
            if (validStatuses.includes(searchStr.toUpperCase())) {
                orConditions.push({ status: searchStr.toUpperCase() });
            }
            orConditions.push({
                OR: [
                    {
                        user: {
                            OR: [
                                { email: { contains: searchStr, mode: 'insensitive' } },
                                {
                                    profile: {
                                        OR: [
                                            { firstName: { contains: searchStr, mode: 'insensitive' } },
                                            { lastName: { contains: searchStr, mode: 'insensitive' } },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        address: {
                            OR: [
                                { fullName: { contains: searchStr, mode: 'insensitive' } },
                                { phone: { contains: searchStr, mode: 'insensitive' } },
                            ],
                        },
                    },
                ],
            });
            if (orConditions.length > 0) {
                whereConditions.OR = orConditions;
            }
        }
        if (order_status) {
            whereConditions.status = order_status;
        }
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            // Increment endDate by 1 day for exclusive upper bound
            endDate.setDate(endDate.getDate() + 1);
            whereConditions.createdAt = {
                gte: startDate,
                lt: endDate,
            };
        }
        const totalCount = await prisma_1.default.order.count({ where: whereConditions });
        const orders = await prisma_1.default.order.findMany({
            where: whereConditions,
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true,
                                category: true,
                            },
                        },
                        variant: {
                            include: {
                                images: true,
                                product: {
                                    include: {
                                        images: true,
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
                payment: true,
                address: true,
                user: true, // include user details (optional, for admin view)
            },
            orderBy: { createdAt: sortOrder },
            skip: (pageNum - 1) * pageSizeNum,
            take: pageSizeNum,
        });
        res.json({
            success: true,
            result: orders,
            pagination: {
                total: totalCount,
                current_page: pageNum,
                page_size: pageSizeNum,
                total_pages: Math.ceil(totalCount / pageSizeNum),
            },
        });
    }
    catch (error) {
        console.error('Admin fetch orders failed:', error);
        res.status(500).json({ message: 'Failed to fetch admin orders', error });
    }
};
exports.getAllUserOrdersForAdmin = getAllUserOrdersForAdmin;
// Get a specific order by ID for the logged-in user
const getOrderById = async (req, res) => {
    const userId = req.user?.userId;
    const { id } = req.params;
    if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const order = await prisma_1.default.order.findFirst({
            where: {
                id: Number(id),
                userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
                payment: true,
                address: true,
            },
        });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        res.json(order);
    }
    catch (error) {
        console.error('Fetch order by ID failed:', error);
        res.status(500).json({ message: 'Failed to fetch order', error });
    }
};
exports.getOrderById = getOrderById;
// Helper to format address safely
function formatAddress(address) {
    if (!address)
        return 'N/A';
    return [
        address.addressLine,
        address.landmark,
        address.city,
        address.state,
        address.country || 'India',
        address.pincode,
    ]
        .filter(Boolean)
        .join(', ');
}
// GET single order info as JSON invoice response
const getSingleOrder = async (req, res) => {
    try {
        const orderIdStr = req.params.id;
        const orderId = Number(orderIdStr);
        if (!orderIdStr || isNaN(orderId)) {
            res.status(400).json({ message: 'Invalid or missing order ID' });
            return;
        }
        const order = await prisma_1.default.order.findFirst({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: { include: { category: true, images: true, } },
                        variant: { include: { images: true, product: true } },
                    },
                },
                user: { include: { profile: true } },
                address: true,
                payment: true,
            },
        });
        if (!order) {
            res.status(404).json({ message: 'Order not found' });
            return;
        }
        if (order.payment?.method === 'RAZORPAY' &&
            !order.isVisible) {
            res.status(403).json({ message: 'Order is not yet visible. Please wait until payment is confirmed.' });
            return;
        }
        let discountPercentage = null;
        if (order.discountCode) {
            const coupon = await prisma_1.default.couponCode.findUnique({
                where: { code: order.discountCode },
                select: { discount: true },
            });
            if (coupon) {
                discountPercentage = coupon.discount;
            }
        }
        const finalAmount = order.finalAmount ?? (order.totalAmount - (order.discountAmount || 0));
        const customerNameFromAddress = order.address?.fullName || 'Guest';
        const customerFirstName = order.user.profile?.firstName || customerNameFromAddress?.split(' ')?.[0] || 'Guest';
        const customerLastName = order.user.profile?.lastName || customerNameFromAddress?.split(' ')?.slice(1).join(' ') || '';
        const invoiceResponse = {
            message: '',
            total_pages: 1,
            current_page: 1,
            page_size: 20,
            results: [
                {
                    id: `COM-${order.id}-${customerFirstName}`,
                    purchased_item_count: order.items.length,
                    customer_info: {
                        first_name: customerFirstName,
                        last_name: customerLastName,
                        country_code_for_phone_number: null,
                        phone_number: order.address?.phone,
                        email: order.user.email,
                        billing_address: order.billingAddress,
                        delivery_address: order.shippingAddress,
                    },
                    order_info: {
                        sub_total: order.subtotal,
                        tax_type: order.taxType || '',
                        applied_tax_rate: order.appliedTaxRate || 0,
                        tax_inclusive: order.isTaxInclusive,
                        tax_amount: order.taxAmount || 0,
                        shippingRate: order.shippingRate,
                        discountPercentage,
                        discount: order.discountAmount || 0,
                        discount_coupon_code: order.discountCode || '',
                        total_before_discount: order.totalAmount,
                        final_payable_amount: order.totalAmount,
                        final_total: order.totalAmount, // fallback if finalAmount not stored
                        abandentDiscountAmount: order.abandentDiscountAmount || "",
                        order_status: order.status,
                        invoice_url: `/order/invoice?id=COM-${order.id}-${customerFirstName}`,
                        created_at_formatted: (0, dayjs_1.default)(order.createdAt).format('DD/MM/YYYY, hh:mmA'),
                        created_at: (0, dayjs_1.default)(order.createdAt).format('DD MMMM YYYY, hh:mmA'),
                    },
                    payment_info: {
                        is_payment_done: order.payment?.status === 'SUCCESS',
                        payment_transaction_id: order.payment?.transactionId || '',
                        payment_type: order.payment?.method || 'N/A',
                    },
                    items: order.items.map((item) => {
                        const productImage = item.product?.images?.[0]?.image || null;
                        const variantImage = item.variant?.images?.[0]?.url || null;
                        return {
                            id: item.id,
                            variant_id: item.variantId || null,
                            name: item.variant
                                ? `${item.variant.product?.name || 'Unnamed'} - ${item.variant.name}`
                                : item.product?.name || 'Unnamed Product',
                            SKU: `SKU-${item.variantId || item.productId || item.id}`,
                            unit_price: item.price,
                            quantity: item.quantity,
                            category: item.product?.category?.name || 'General',
                            specification: item.variant?.name || '',
                            image: variantImage || productImage || null, // ✅ Added image
                        };
                    }),
                },
            ],
        };
        res.status(200).json(invoiceResponse);
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getSingleOrder = getSingleOrder;
// PDF invoice generator endpoint
const generateInvoicePDF = async (req, res) => {
    try {
        const idStr = req.query.id;
        const orderId = Number(idStr?.split("-")[1]);
        const order = await prisma_1.default.order.findUnique({
            where: { id: orderId },
            include: {
                user: { include: { profile: true } },
                items: {
                    include: {
                        product: true,
                        variant: {
                            include: {
                                product: true,
                            }
                        }
                    },
                },
                address: true,
                payment: true,
            },
        });
        if (!order) {
            res.status(404).send("Order not found");
            return;
        }
        const subtotal = order.subtotal ?? order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const company = await prisma_1.default.companySettings.findFirst();
        if (!company) {
            res.status(500).send("Company settings not found");
            return;
        }
        const data = {
            invoiceId: `COM-${order.id}-${order.user.profile?.firstName || 'USER'}`,
            customerName: `${order.user.profile?.firstName || ''} ${order.user.profile?.lastName || ''}`,
            email: order.user.email,
            phone: order.address?.phone,
            billingAddress: order.billingAddress ?? "N/A",
            shippingAddress: order.shippingAddress ?? "N/A",
            address: `${order.address?.addressLine}, ${order.address?.city}, ${order.address?.state} - ${order.address?.pincode}`,
            items: order.items.map(item => ({
                name: item.variant?.product?.name || item.product?.name || "Unnamed Product",
                variantName: item.variant?.name || "",
                quantity: item.quantity,
                unitPrice: item.price,
            })),
            subtotal,
            discountAmount: order.discountAmount ?? 0,
            abandentDiscountAmount: order.abandentDiscountAmount ?? 0,
            taxType: order.taxType || '',
            taxAmount: order.taxAmount ?? 0,
            appliedTaxRate: order.appliedTaxRate ?? 0,
            shippingRate: order.shippingRate ?? 0,
            finalAmount: order.totalAmount,
            createdAt: new Date(order.createdAt).toLocaleString(),
            logoUrl: company.logo,
            companyName: company.description || 'Your Company',
            companyEmail: company.email,
            companyPhone: company.phone,
            companyAddress: company.address,
        };
        const html = await ejs_1.default.renderFile(path_1.default.join(__dirname, '../views/invoice.ejs'), data);
        const browser = await puppeteer_1.default.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=invoice-${order.id}.pdf`);
        res.send(pdfBuffer);
    }
    catch (err) {
        console.error('PDF generation failed:', err);
        res.status(500).send('Failed to generate invoice');
    }
};
exports.generateInvoicePDF = generateInvoicePDF;
const getOrdersForAdmin = async (req, res) => {
    const { customer, page = 1, page_size = 10, ordering = 'desc', order_status, start_date, end_date, } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';
    const userId = isAdmin && customer ? parseInt(customer) : req.user?.userId;
    if (!userId) {
        res.status(400).json({ message: "Missing or invalid user ID" });
        return;
    }
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const sortOrder = ordering === 'asc' ? 'asc' : 'desc';
    try {
        const whereConditions = { userId };
        if (order_status) {
            whereConditions.status = order_status;
        }
        if (start_date && end_date) {
            whereConditions.createdAt = {
                gte: new Date(start_date),
                lte: new Date(end_date),
            };
        }
        const totalCount = await prisma_1.default.order.count({ where: whereConditions });
        const orders = await prisma_1.default.order.findMany({
            where: whereConditions,
            include: {
                items: {
                    include: {
                        product: true,
                        variant: {
                            include: {
                                product: true,
                            }
                        },
                    },
                },
                payment: true,
                address: true,
                user: {
                    include: {
                        profile: true,
                    }
                }
            },
            orderBy: { createdAt: sortOrder },
            skip: (pageNum - 1) * pageSizeNum,
            take: pageSizeNum,
        });
        res.json({
            success: true,
            result: orders,
            pagination: {
                total: totalCount,
                current_page: pageNum,
                page_size: pageSizeNum,
                total_pages: Math.ceil(totalCount / pageSizeNum),
            },
        });
    }
    catch (error) {
        console.error('Fetch orders failed:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error });
    }
};
exports.getOrdersForAdmin = getOrdersForAdmin;
// Get orders for logged in user
const userOrderHistory = async (req, res) => {
    const { customer, page = 1, page_size = 10, ordering = 'desc', order_status, start_date, end_date, } = req.query;
    const isAdmin = req.user?.role === 'ADMIN';
    const userId = isAdmin && customer ? parseInt(customer) : req.user?.userId;
    if (!userId) {
        res.status(400).json({ message: "Missing or invalid user ID" });
        return;
    }
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(page_size);
    const sortOrder = ordering === 'asc' ? 'asc' : 'desc';
    try {
        const whereConditions = { userId };
        if (order_status) {
            whereConditions.status = order_status;
        }
        if (start_date && end_date) {
            whereConditions.createdAt = {
                gte: new Date(start_date),
                lte: new Date(end_date),
            };
        }
        const totalCount = await prisma_1.default.order.count({ where: whereConditions });
        const orders = await prisma_1.default.order.findMany({
            where: whereConditions,
            include: {
                items: {
                    include: {
                        product: true,
                        variant: {
                            include: {
                                product: true,
                            }
                        }
                    },
                },
                payment: true,
                address: true,
            },
            orderBy: { createdAt: sortOrder },
            skip: (pageNum - 1) * pageSizeNum,
            take: pageSizeNum,
        });
        res.json({
            success: true,
            result: orders,
            pagination: {
                total: totalCount,
                current_page: pageNum,
                page_size: pageSizeNum,
                total_pages: Math.ceil(totalCount / pageSizeNum),
            },
        });
    }
    catch (error) {
        console.error('Fetch orders failed:', error);
        res.status(500).json({ message: 'Failed to fetch orders', error });
    }
};
exports.userOrderHistory = userOrderHistory;
