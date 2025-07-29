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
exports.uploadCsvAndUpsertPincodes = exports.checkAvailability = exports.deletePincode = exports.updatePincode = exports.createPincode = exports.getPaginatedPincodes = void 0;
const prisma_1 = __importDefault(require("../db/prisma"));
const fastcsv = __importStar(require("fast-csv"));
const extractName_1 = require("../utils/extractName");
const client_1 = require("@prisma/client");
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
// export const getPaginatedPincodes = async (req: Request, res: Response) => {
//   try {
//     const page = parseInt(req.query.page as string) || 1;
//     const pageSize = parseInt(req.query.page_size as string) || 10;
//     const skip = (page - 1) * pageSize;
//     const isActiveParam = req.query.is_active;
//     const isActive =
//       typeof isActiveParam === 'string'
//         ? isActiveParam.toLowerCase() === 'true'
//           ? true
//           : isActiveParam.toLowerCase() === 'false'
//           ? false
//           : undefined
//         : undefined;
//         const search = req.query.search?.toString().trim();
//           const whereClause: any = {};
//      if (isActive !== undefined) {
//       whereClause.isActive = isActive;
//     }
//    if (search) {
//   const searchInt = parseInt(search);
//   const orConditions: any[] = [
//     { city: { contains: search, mode: 'insensitive' } },
//     { state: { contains: search, mode: 'insensitive' } },
//   ];
//   if (!isNaN(searchInt)) {
//     orConditions.push({ zipcode: searchInt });
//   }
//   whereClause.OR = orConditions;
// }
//     const [totalCount, pincodes] = await Promise.all([
//       prisma.pincode.count({ where: whereClause }),
//       prisma.pincode.findMany({
//         where: whereClause,
//         skip,
//         take: pageSize,
//         orderBy: { id: 'desc' },
//       }),
//     ]);
//     const results = pincodes.map((p) => ({
//       id: p.id,
//       city: p.city,
//       state: p.state,
//       zipcode: p.zipcode,
//       estimated_delivery_days: p.estimatedDeliveryDays,
//       is_active: p.isActive,
//       created_by: p.createdBy,
//       updated_by: p.updatedBy,
//       created_at: p.createdAt,
//       updated_at: p.updatedAt,
//     }));
//     res.json({
//       total_pages: Math.ceil(totalCount / pageSize),
//       current_page: page,
//       page_size: pageSize,
//       results,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };
const getPaginatedPincodes = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const skip = (page - 1) * pageSize;
        const isActiveParam = req.query.is_active;
        const isActive = typeof isActiveParam === 'string'
            ? isActiveParam.toLowerCase() === 'true'
            : undefined;
        const search = req.query.search?.toString().trim();
        const whereClause = {};
        if (typeof isActive === 'boolean') {
            whereClause.isActive = isActive;
        }
        // Fetch all matching records (before search filter)
        const allPincodes = await prisma_1.default.pincode.findMany({
            where: whereClause,
            orderBy: { id: 'desc' },
        });
        // Manual filtering for partial search (including partial zipcode)
        const filtered = allPincodes.filter((p) => {
            const cityMatch = p.city.toLowerCase().includes(search?.toLowerCase() || '');
            const stateMatch = p.state.toLowerCase().includes(search?.toLowerCase() || '');
            const zipMatch = p.zipcode.toString().includes(search || '');
            return search ? cityMatch || stateMatch || zipMatch : true;
        });
        const paginated = filtered.slice(skip, skip + pageSize);
        const results = paginated.map((p) => ({
            id: p.id,
            city: p.city,
            state: p.state,
            zipcode: p.zipcode,
            estimated_delivery_days: p.estimatedDeliveryDays,
            is_active: p.isActive,
            created_by: p.createdBy,
            updated_by: p.updatedBy,
            created_at: p.createdAt,
            updated_at: p.updatedAt,
        }));
        res.json({
            total_pages: Math.ceil(filtered.length / pageSize),
            current_page: page,
            page_size: pageSize,
            results,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPaginatedPincodes = getPaginatedPincodes;
const createPincode = async (req, res) => {
    try {
        const { city, state, zipcode, estimated_delivery_days, is_active, } = req.body;
        const user = await (0, extractName_1.getUserNameFromToken)(req);
        const newPincode = await prisma_1.default.pincode.create({
            data: {
                city,
                state,
                zipcode,
                estimatedDeliveryDays: estimated_delivery_days,
                isActive: is_active,
                createdBy: user,
                updatedBy: user,
            },
        });
        res.status(201).json(newPincode);
        return;
    }
    catch (err) {
        console.error('Error creating pincode:', err);
        if (err instanceof client_1.Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2002' &&
            Array.isArray(err.meta?.target) &&
            err.meta.target.includes('zipcode')) {
            res.status(409).json({
                error: 'Pincode already exists',
                field: 'zipcode',
            });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
};
exports.createPincode = createPincode;
const updatePincode = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const { city, state, zipcode, estimated_delivery_days, is_active, } = req.body;
        const user = await (0, extractName_1.getUserNameFromToken)(req);
        const data = {};
        if (city)
            data.city = city;
        if (state)
            data.state = state;
        if (typeof is_active !== 'undefined')
            data.isActive = is_active;
        if (estimated_delivery_days != null)
            data.estimatedDeliveryDays = Number(estimated_delivery_days);
        if (zipcode != null) {
            const zip = Number(zipcode);
            // Check for duplicate zipcode
            const existingZip = await prisma_1.default.pincode.findFirst({
                where: {
                    zipcode: zip,
                    NOT: { id },
                },
            });
            if (existingZip) {
                res.status(400).json({
                    success: false,
                    message: 'Zipcode already exists',
                });
                return;
            }
            data.zipcode = zip;
        }
        data.updatedBy = user || 'System';
        const updated = await prisma_1.default.pincode.update({
            where: { id },
            data,
        });
        res.json({ success: true, pincode: updated });
    }
    catch (err) {
        console.error('Update pincode error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updatePincode = updatePincode;
const deletePincode = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await prisma_1.default.pincode.delete({ where: { id } });
        res.status(204).send();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.deletePincode = deletePincode;
const checkAvailability = async (req, res) => {
    const { pincode } = req.body;
    if (!pincode || isNaN(Number(pincode))) {
        res.status(400).json({ error: 'Invalid or missing pincode' });
        return;
    }
    try {
        const result = await prisma_1.default.pincode.findFirst({
            where: {
                zipcode: Number(pincode),
                isActive: true,
            },
        });
        if (!result) {
            res.json({
                available: false,
                message: 'Pincode not serviceable',
            });
            return;
        }
        res.json({
            available: true,
            pincode: result.zipcode,
            city: result.city,
            state: result.state,
            estimated_delivery_days: result.estimatedDeliveryDays,
        });
    }
    catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.checkAvailability = checkAvailability;
// export const uploadCsvAndUpsertPincodes = async (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//        res.status(400).json({ message: 'No file uploaded' });
//        return
//     }
//     const stream = fastcsv.parse({ headers: true, trim: true });
//     let count = 0;
//     stream.on('error', (error) => {
//       console.error('CSV parse error:', error);
//        res.status(400).json({ message: 'Error parsing CSV' });
//        return
//     });
//     stream.on('data', async (row) => {
//       stream.pause(); // pause to await DB write
//       try {
//         // Map CSV row to DB model
//         const data = {
//           city: row['CITY'],
//           state: row['STATE'],
//           zipcode: parseInt(row['ZIPCODE'], 10),
//           estimatedDeliveryDays: parseInt(row['ESTIMATED DELIVERY TIME (in days)'], 10),
//           isActive: true,
//           createdBy: 'ECOM Store',
//           updatedBy: 'ECOM Store',
//         };
//         // Upsert based on zipcode
//         await prisma.pincode.upsert({
//           where: { zipcode: data.zipcode },
//           update: data,
//           create: data,
//         });
//         count++;
//       } catch (err) {
//         console.error('Error processing row:', row, err);
//       } finally {
//         stream.resume(); // resume reading
//       }
//     });
//     stream.on('end', () => {
//        res.json({ message: 'Pincodes processed successfully', count });
//        return
//     });
//     // pipe uploaded file buffer into fastcsv parser
//     if (req.file.buffer) {
//       stream.write(req.file.buffer);
//       stream.end();
//     } else {
//        res.status(400).json({ message: 'File buffer is empty' });
//        return
//     }
//   } catch (err) {
//     console.error('Upload error:', err);
//      res.status(500).json({ message: 'Internal server error' });
//   }
// };
const uploadCsvAndUpsertPincodes = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }
        const ext = path_1.default.extname(req.file.originalname).toLowerCase();
        let rows = [];
        if (ext === '.csv') {
            rows = await new Promise((resolve, reject) => {
                const results = [];
                const stream = fastcsv.parse({ headers: true, trim: true });
                stream.on('error', reject);
                stream.on('data', (row) => results.push(row));
                stream.on('end', () => resolve(results));
                stream.write(req.file.buffer);
                stream.end();
            });
        }
        else if (ext === '.xls' || ext === '.xlsx') {
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(sheet);
        }
        else {
            res.status(400).json({ message: 'Unsupported file type' });
            return;
        }
        let count = 0;
        for (const row of rows) {
            try {
                const data = {
                    city: row.CITY?.toString().trim(),
                    state: row.STATE?.toString().trim(),
                    zipcode: parseInt(row.ZIPCODE.toString(), 10),
                    estimatedDeliveryDays: parseInt(row['ESTIMATED DELIVERY TIME (in days)'].toString(), 10),
                    isActive: true,
                    createdBy: 'ECOM Store',
                    updatedBy: 'ECOM Store',
                };
                if (!data.zipcode || isNaN(data.zipcode))
                    continue;
                await prisma_1.default.pincode.upsert({
                    where: { zipcode: data.zipcode },
                    update: data,
                    create: data,
                });
                count++;
            }
            catch (err) {
                console.error('Error processing row:', row, err);
            }
        }
        res.json({ message: 'Pincodes processed successfully', count });
    }
    catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.uploadCsvAndUpsertPincodes = uploadCsvAndUpsertPincodes;
