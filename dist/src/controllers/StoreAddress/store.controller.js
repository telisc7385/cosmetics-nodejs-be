"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadCsvAndUpsertStores = exports.deleteStore = exports.updateStore = exports.createStore = exports.getAllStores = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const extractName_1 = require("../../utils/extractName");
const fastcsv = __importStar(require("fast-csv"));
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
const getAllStores = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;
        // Optional filters
        const is_active = req.query.is_active !== undefined
            ? req.query.is_active === 'true' || req.query.is_active === '1'
            : undefined;
        const search = req.query.search ? String(req.query.search).trim() : undefined;
        // Ordering logic
        const orderingParam = req.query.ordering || 'id';
        const sortDirection = orderingParam.startsWith('-') ? 'desc' : 'asc';
        const sortField = orderingParam.replace('-', '');
        const allowedOrderFields = [
            'id', 'name', 'city', 'state', 'zipcode', 'created_at', 'updated_at',
        ];
        const orderBy = allowedOrderFields.includes(sortField)
            ? { [sortField]: sortDirection }
            : { id: 'asc' };
        // Build the where filter object
        const where = {
            ...(is_active !== undefined && { is_active }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { city: { contains: search, mode: 'insensitive' } },
                    { state: { contains: search, mode: 'insensitive' } },
                    ...(/^\d+$/.test(search) ? [{ zipcode: Number(search) }] : []),
                ],
            }),
        };
        // Count total with filters
        const total = await prisma_1.default.store.count({ where });
        const results = await prisma_1.default.store.findMany({
            skip,
            take: pageSize,
            where,
            orderBy,
        });
        res.status(200).json({
            total_pages: Math.ceil(total / pageSize),
            current_page: page,
            page_size: pageSize,
            results: results.map((store) => ({
                ...store,
                created_at: store.created_at,
                updated_at: store.updated_at,
            })),
        });
    }
    catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};
exports.getAllStores = getAllStores;
const createStore = async (req, res) => {
    try {
        const { name, email, phone_numbers, address, locality, city, state, country, zipcode, latitude, longitude, } = req.body;
        const created_by = await (0, extractName_1.getUserNameFromToken)(req);
        // Convert to number early
        const numericZip = Number(zipcode);
        // ✅ Now create store
        const store = await prisma_1.default.store.create({
            data: {
                name,
                email,
                phone_numbers,
                address,
                locality,
                city,
                state,
                country,
                zipcode: numericZip,
                latitude,
                longitude,
                created_by,
                updated_by: created_by,
            },
        });
        res.status(201).json({ success: true, result: store });
    }
    catch (err) {
        console.error("Create Store Error:", err);
        if (err.code === "P2002") {
            res.status(409).json({
                success: false,
                message: "Store with the same name/email/phone already exists",
                meta: err.meta,
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Failed to create store",
            error: err.message || err,
        });
    }
};
exports.createStore = createStore;
const updateStore = async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma_1.default.store.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ success: false, message: 'Store not found' });
        return;
    }
    try {
        const { name, email, phone_numbers, address, locality, city, state, country, zipcode, latitude, longitude, is_active, } = req.body;
        const updated_by = await (0, extractName_1.getUserNameFromToken)(req);
        const store = await prisma_1.default.store.update({
            where: { id },
            data: {
                name: name ?? existing.name,
                email,
                phone_numbers,
                address,
                locality,
                city,
                state,
                country,
                zipcode: Number(zipcode) || existing.zipcode,
                latitude,
                longitude,
                is_active: is_active !== undefined
                    ? is_active === 'true' || is_active === true
                    : existing.is_active,
                updated_by,
            },
        });
        res.json({ success: true, result: store });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update store' });
    }
};
exports.updateStore = updateStore;
const deleteStore = async (req, res) => {
    const id = Number(req.params.id);
    const existing = await prisma_1.default.store.findUnique({ where: { id } });
    if (!existing) {
        res.status(404).json({ success: false, message: 'Store not found' });
        return;
    }
    await prisma_1.default.store.delete({ where: { id } });
    res.json({ success: true, message: 'Store deleted' });
};
exports.deleteStore = deleteStore;
const sanitizeNumber = (input) => {
    if (!input)
        return '';
    return input.toString().replace(/[^\d]/g, '');
};
// export const uploadCsvAndUpsertStores = async (req: Request, res: Response) => {
//   try {
//     if (!req.file || !req.file.buffer) {
//        res.status(400).json({ message: 'No file uploaded or file is empty' });
//        return;
//     }
//     const stream = fastcsv.parse({ headers: true, trim: true });
//     const rows: any[] = [];
//     let count = 0;
//     stream.on('error', (error) => {
//       console.error('CSV parse error:', error);
//        res.status(400).json({ message: 'Error parsing CSV' });
//        return;
//     });
//     stream.on('data', (row) => rows.push(row));
//     stream.on('end', async () => {
//       for (const row of rows) {
//         try {
//           const name = row['NAME']?.trim();
//           const address = row['ADDRESS']?.trim();
//           const city = row['CITY']?.trim();
//           const state = row['STATE']?.trim();
//           const zipcode = parseInt(sanitizeNumber(row['ZIP']), 10);
//           if (!name || !address || !city || !state || isNaN(zipcode)) {
//             console.warn('Skipping invalid row:', row);
//             continue;
//           }
//           const phone = sanitizeNumber(row['PHONE']);
//           const mobile = sanitizeNumber(row['MOBILE']);
//           const latitude = row['LATITUDE']?.trim() || '0.0';
//           const longitude = row['LONGITUDE']?.trim() || '0.0';
//           const estimatedDeliveryDays = parseInt(row['DELIVERY_DAYS']?.trim(), 10) || 3;
//           const storeData = {
//             name,
//             address,
//             city,
//             state,
//             zipcode,
//             phone_numbers: [phone, mobile].filter(Boolean).join(', '),
//             latitude,
//             longitude,
//             country: 'India',
//             is_active: true,
//             created_by: 'CSV Import',
//             updated_by: 'CSV Import',
//           };
//           // ✅ Ensure pincode exists or create
//           const existingPincode = await prisma.pincode.findFirst({
//             where: { zipcode, city, state },
//           });
//           if (!existingPincode) {
//             await prisma.pincode.create({
//               data: {
//                 city,
//                 state,
//                 zipcode,
//                 estimatedDeliveryDays,
//                 isActive: true,
//                 createdBy: 'CSV Import',
//                 updatedBy: 'CSV Import',
//               },
//             });
//           }
//           // ✅ Upsert store by name
//           const existingStore = await prisma.store.findFirst({
//             where: { name },
//           });
//           if (existingStore) {
//             await prisma.store.update({
//               where: { id: existingStore.id },
//               data: storeData,
//             });
//           } else {
//             await prisma.store.create({ data: storeData });
//           }
//           count++;
//         } catch (err) {
//           console.error('Error processing row:', row, err);
//         }
//       }
//        res.status(200).json({
//         message: 'Store CSV processed successfully',
//         count,
//       });
//       return;
//     });
//     stream.write(req.file.buffer);
//     stream.end();
//   } catch (err) {
//     console.error('Upload error:', err);
//      res.status(500).json({ message: 'Internal server error' });
//      return;
//   }
// };
const uploadCsvAndUpsertStores = async (req, res) => {
    try {
        if (!req.file || !req.file.buffer) {
            res.status(400).json({ message: 'No file uploaded or file is empty' });
            return;
        }
        const ext = path_1.default.extname(req.file.originalname).toLowerCase();
        let rows = [];
        if (ext === '.csv') {
            rows = await new Promise((resolve, reject) => {
                const bufferRows = [];
                const stream = fastcsv.parse({ headers: true, trim: true });
                stream.on('error', reject);
                stream.on('data', (row) => bufferRows.push(row));
                stream.on('end', () => resolve(bufferRows));
                stream.write(req.file.buffer);
                stream.end();
            });
        }
        else if (ext === '.xls' || ext === '.xlsx') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        }
        else {
            res.status(400).json({
                message: 'Unsupported file type. Please upload a .csv, .xls, or .xlsx file.',
            });
            return;
        }
        let count = 0;
        for (const row of rows) {
            try {
                const name = row['NAME']?.toString().trim();
                const address = row['ADDRESS']?.toString().trim();
                const city = row['CITY']?.toString().trim();
                const state = row['STATE']?.toString().trim();
                const zipcode = parseInt(sanitizeNumber(row['ZIP']), 10);
                if (!name || !address || !city || !state || isNaN(zipcode)) {
                    console.warn('Skipping invalid row:', row);
                    continue;
                }
                const phone = sanitizeNumber(row['PHONE']);
                const mobile = sanitizeNumber(row['MOBILE']);
                const latitude = row['LATITUDE']?.toString().trim() || '0.0';
                const longitude = row['LONGITUDE']?.toString().trim() || '0.0';
                const storeData = {
                    name,
                    address,
                    city,
                    state,
                    zipcode,
                    phone_numbers: [phone, mobile].filter(Boolean).join(', '),
                    latitude,
                    longitude,
                    country: 'India',
                    is_active: true,
                    created_by: 'CSV/Excel Import',
                    updated_by: 'CSV/Excel Import',
                };
                // Ensure pincode exists
                const existingPincode = await prisma_1.default.pincode.findFirst({
                    where: { zipcode, city, state },
                });
                if (!existingPincode) {
                    await prisma_1.default.pincode.create({
                        data: {
                            city,
                            state,
                            zipcode,
                            estimatedDeliveryDays: parseInt(row['DELIVERY_DAYS']?.toString() || '3', 10),
                            isActive: true,
                            createdBy: 'CSV/Excel Import',
                            updatedBy: 'CSV/Excel Import',
                        },
                    });
                }
                const existingStore = await prisma_1.default.store.findFirst({ where: { name } });
                if (existingStore) {
                    await prisma_1.default.store.update({
                        where: { id: existingStore.id },
                        data: storeData,
                    });
                }
                else {
                    await prisma_1.default.store.create({ data: storeData });
                }
                count++;
            }
            catch (err) {
                console.error('Error processing row:', row, err);
            }
        }
        res.status(200).json({
            message: `Stores processed successfully from ${ext} upload.`,
            count,
        });
    }
    catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({
            message: 'Internal server error',
            error: err.message,
        });
    }
};
exports.uploadCsvAndUpsertStores = uploadCsvAndUpsertStores;
