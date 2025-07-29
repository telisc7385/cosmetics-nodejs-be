"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserNotificationByAdmin = exports.getUserNotificationsByAdmin = exports.adminBroadcastNotification = exports.getAllAdmins = exports.getAllUsers = exports.deleteUserByAdmin = exports.resetUserPasswordByAdmin = exports.updateUserByAdmin = exports.createUserByAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../db/prisma"));
const cloudinary_1 = __importDefault(require("../upload/cloudinary"));
const notification_1 = require("../utils/notification");
const createUserByAdmin = async (req, res) => {
    const { email, password, role = 'USER' } = req.body;
    const { firstName, lastName } = req.body;
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Only admins can create users' });
        return;
    }
    // let profileData = typeof profile === 'string' ? JSON.parse(profile) : profile;
    try {
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        let imageUrl = null;
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.default.uploader.upload_stream({ folder: 'users' }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                }).end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
                profile: {
                    create: {
                        firstName,
                        lastName,
                        imageUrl,
                    },
                },
            },
            include: { profile: true },
        });
        res.status(201).json({ message: 'User created by admin', userId: user.id });
    }
    catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createUserByAdmin = createUserByAdmin;
const updateUserByAdmin = async (req, res) => {
    const { id } = req.params;
    const { email, firstName, lastName, is_active, role, } = req.body;
    // let profileData = typeof profile === 'string' ? JSON.parse(profile) : profile;
    try {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { id: +id },
            include: { profile: true },
        });
        if (!existingUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        let imageUrl = existingUser.profile?.imageUrl;
        if (req.file) {
            // We can't delete old image by publicId since we don't have it, so skip deletion
            const result = await new Promise((resolve, reject) => {
                cloudinary_1.default.uploader.upload_stream({ folder: 'users' }, (error, result) => {
                    if (error || !result)
                        return reject(error);
                    resolve(result);
                }).end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: +id },
            data: {
                email,
                role,
                isDeleted: is_active === 'true' || is_active === true ? false : true,
                profile: {
                    update: {
                        firstName,
                        lastName,
                        imageUrl
                    },
                },
            },
            include: { profile: true },
        });
        res.status(200).json({ message: 'User updated', user: updatedUser });
    }
    catch (err) {
        console.error('Update user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateUserByAdmin = updateUserByAdmin;
const resetUserPasswordByAdmin = async (req, res) => {
    const { userId, newPassword } = req.body;
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Forbidden: Admins only' });
        return;
    }
    try {
        const hashed = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashed },
        });
        res.status(200).json({ message: 'Password reset by admin' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.resetUserPasswordByAdmin = resetUserPasswordByAdmin;
const deleteUserByAdmin = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: +id },
        });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // ✅ Prevent deleting the seeded super admin (by email)
        if (user.email === 'admin@gmail.com') {
            res.status(403).json({ message: 'This user cannot be deleted' });
            return;
        }
        await prisma_1.default.profile.deleteMany({ where: { user: { id: +id } } });
        await prisma_1.default.user.delete({ where: { id: +id } });
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    }
    catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteUserByAdmin = deleteUserByAdmin;
// export const getAllUsers = async (req: CustomRequest, res: Response) => {
//   if (req.user?.role !== 'ADMIN') {
//     res.status(403).json({ message: 'Access denied: Admins only' });
//     return;
//   }
//   try {
//     const {
//       page = '1',
//       page_size = '10',
//       ordering,
//       start_date,
//       end_date,
//       search = '',
//     } = req.query;
//     const pageNumber = parseInt(page as string, 10);
//     const pageSize = parseInt(page_size as string, 10);
//     if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
//        res.status(400).json({
//         success: false,
//         message: 'Invalid page or page_size. Both must be positive integers.',
//       });
//       return;
//     }
//     const skip = (pageNumber - 1) * pageSize;
//     const orderFieldMap: Record<string, any> = {
//       email: { email: undefined },
//       created_at: { createdAt: undefined },
//       first_name: { profile: { firstName: undefined } },
//       last_name: { profile: { lastName: undefined } },
//     };
//     let orderBy: any = { createdAt: 'desc' };
//     if (ordering && typeof ordering === 'string') {
//       const isDesc = ordering.startsWith('-');
//       const rawField = isDesc ? ordering.slice(1) : ordering;
//       const mappedField = orderFieldMap[rawField];
//       if (!mappedField) {
//          res.status(400).json({ message: `Invalid ordering field: ${rawField}` });
//          return;
//       }
//       if (typeof Object.values(mappedField)[0] === 'object') {
//         const nestedKey = Object.keys(mappedField)[0];
//         const nestedField = Object.keys(mappedField[nestedKey])[0];
//         orderBy = {
//           [nestedKey]: {
//             [nestedField]: isDesc ? 'desc' : 'asc',
//           },
//         };
//       } else {
//         const key = Object.keys(mappedField)[0];
//         orderBy = { [key]: isDesc ? 'desc' : 'asc' };
//       }
//     }
//     // Build WHERE clause
//     const where: any = {
//       role: 'USER',
//     };
//     // 🔍 Search support
//     if (search && typeof search === 'string' && search.trim() !== '') {
//       where.OR = [
//         { email: { contains: search, mode: 'insensitive' } },
//         { profile: { firstName: { contains: search, mode: 'insensitive' } } },
//         { profile: { lastName: { contains: search, mode: 'insensitive' } } },
//       ];
//     }
//     // 📅 Date filtering
//     if (start_date || end_date) {
//       where.createdAt = {};
//       if (start_date) where.createdAt.gte = new Date(`${start_date}T00:00:00.000Z`);
//       if (end_date) where.createdAt.lte = new Date(`${end_date}T23:59:59.999Z`);
//     }
//     // 📦 Fetch users and total count
//     const [users, totalCount] = await Promise.all([
//       prisma.user.findMany({
//         where,
//         include: { profile: true },
//         orderBy,
//         skip,
//         take: pageSize,
//       }),
//       prisma.user.count({ where }),
//     ]);
//     const sanitized = users.map(({ password, ...u }) => u);
//     res.status(200).json({
//       success: true,
//       users: sanitized,
//       total: totalCount,
//       page: pageNumber,
//       page_size: pageSize,
//       total_pages: Math.ceil(totalCount / pageSize),
//     });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
const getAllUsers = async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Access denied: Admins only' });
        return;
    }
    try {
        const { id } = req.query;
        // 👉 Fetch single user by ID, return in same structure as paginated
        if (id) {
            const numericId = Number(id);
            if (isNaN(numericId)) {
                res.status(400).json({ message: 'Invalid user ID' });
                return;
            }
            const user = await prisma_1.default.user.findUnique({
                where: { id: numericId },
                include: { profile: true },
            });
            if (!user || user.role !== 'USER') {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const { password, ...sanitizedUser } = user;
            // 🔁 Wrap in array and mimic pagination
            res.status(200).json({
                success: true,
                users: [sanitizedUser],
                total: 1,
                page: 1,
                page_size: 1,
                total_pages: 1,
            });
            return;
        }
        // 👉 Paginated fetch
        const { page = '1', page_size = '10', ordering, start_date, end_date, search = '', } = req.query;
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(page_size, 10);
        if (isNaN(pageNumber) || isNaN(pageSize) || pageNumber < 1 || pageSize < 1) {
            res.status(400).json({
                success: false,
                message: 'Invalid page or page_size. Both must be positive integers.',
            });
            return;
        }
        const skip = (pageNumber - 1) * pageSize;
        const orderFieldMap = {
            email: { email: undefined },
            created_at: { createdAt: undefined },
            first_name: { profile: { firstName: undefined } },
            last_name: { profile: { lastName: undefined } },
        };
        let orderBy = { createdAt: 'desc' };
        if (ordering && typeof ordering === 'string') {
            const isDesc = ordering.startsWith('-');
            const rawField = isDesc ? ordering.slice(1) : ordering;
            const mappedField = orderFieldMap[rawField];
            if (!mappedField) {
                res.status(400).json({ message: `Invalid ordering field: ${rawField}` });
                return;
            }
            if (typeof Object.values(mappedField)[0] === 'object') {
                const nestedKey = Object.keys(mappedField)[0];
                const nestedField = Object.keys(mappedField[nestedKey])[0];
                orderBy = {
                    [nestedKey]: {
                        [nestedField]: isDesc ? 'desc' : 'asc',
                    },
                };
            }
            else {
                const key = Object.keys(mappedField)[0];
                orderBy = { [key]: isDesc ? 'desc' : 'asc' };
            }
        }
        const where = { role: 'USER' };
        const searchParam = Array.isArray(search) ? search[0] : search;
        const searchStr = typeof searchParam === 'string' ? searchParam.trim() : '';
        if (searchStr) {
            where.OR = [
                { email: { contains: searchStr, mode: 'insensitive' } },
                { profile: { firstName: { contains: searchStr, mode: 'insensitive' } } },
                { profile: { lastName: { contains: searchStr, mode: 'insensitive' } } },
            ];
        }
        if (start_date || end_date) {
            where.createdAt = {};
            if (start_date)
                where.createdAt.gte = new Date(`${start_date}T00:00:00.000Z`);
            if (end_date)
                where.createdAt.lte = new Date(`${end_date}T23:59:59.999Z`);
        }
        const [users, totalCount] = await Promise.all([
            prisma_1.default.user.findMany({
                where,
                include: { profile: true },
                orderBy,
                skip,
                take: pageSize,
            }),
            prisma_1.default.user.count({ where }),
        ]);
        const sanitized = users.map(({ password, ...u }) => u);
        res.status(200).json({
            success: true,
            users: sanitized,
            total: totalCount,
            page: pageNumber,
            page_size: pageSize,
            total_pages: Math.ceil(totalCount / pageSize),
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllUsers = getAllUsers;
const getAllAdmins = async (req, res) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Access denied: Admins only' });
        return;
    }
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const isActiveParam = req.query.is_active;
        let isDeletedFilter = undefined;
        const search = req.query.search;
        // Handle optional ordering param (default: -createdAt)
        const ordering = req.query.ordering || '-createdAt';
        // Extract field name and sort direction
        const field = ordering.startsWith('-') ? ordering.slice(1) : ordering;
        const direction = ordering.startsWith('-') ? 'desc' : 'asc';
        // Map allowed ordering fields to Prisma structure
        let orderBy = { createdAt: 'desc' }; // default
        if (field === 'first_name') {
            orderBy = { profile: { firstName: direction } };
        }
        else if (field === 'last_name') {
            orderBy = { profile: { lastName: direction } };
        }
        else if (['email', 'createdAt'].includes(field)) {
            orderBy = { [field]: direction };
        }
        if (isActiveParam === 'true') {
            isDeletedFilter = false;
        }
        else if (isActiveParam === 'false') {
            isDeletedFilter = true;
        }
        const whereClause = {
            role: 'ADMIN',
            ...(isDeletedFilter !== undefined && { isDeleted: isDeletedFilter }),
        };
        if (search) {
            whereClause.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                {
                    profile: {
                        is: {
                            OR: [
                                { firstName: { contains: search, mode: 'insensitive' } },
                                { lastName: { contains: search, mode: 'insensitive' } },
                            ],
                        },
                    },
                },
            ];
        }
        const [users, totalCount] = await Promise.all([
            prisma_1.default.user.findMany({
                where: whereClause,
                include: { profile: true },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy,
            }),
            prisma_1.default.user.count({
                where: whereClause,
            }),
        ]);
        const results = users.map(user => {
            const createdBy = `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim();
            return {
                id: user.id,
                username: user.email,
                first_name: user.profile?.firstName || '',
                last_name: user.profile?.lastName || '',
                phone_number: null,
                country_code_for_phone_number: '',
                email: user.email,
                profile_picture: user.profile?.imageUrl || '',
                is_active: !user.isDeleted,
                category: 1,
                last_login: '',
                date_joined: user.createdAt,
                created_by: createdBy || null,
                updated_at: user.createdAt,
                updated_by: createdBy || null,
                category_name: 'Admin',
            };
        });
        res.json({
            total_pages: Math.ceil(totalCount / pageSize),
            current_page: page,
            page_size: pageSize,
            results,
        });
    }
    catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getAllAdmins = getAllAdmins;
function formatDate(date) {
    return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(date);
}
// export const exportUsersToCsv = async (req: Request, res: Response) => {
//   try {
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         email: true,
//         role: true,
//         createdAt: true,
//         isDeleted: true,
//       },
//     });
//     if (!users || users.length === 0) {
//        res.status(404).json({ message: 'No users found' });
//        return
//     }
//     res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
//     res.setHeader('Content-Type', 'text/csv');
//     const csvStream = format({ headers: true });
//     csvStream.pipe(res);
//     users.forEach(user => {
//       csvStream.write({
//         ...user,
//         createdAt: user.createdAt.toISOString(),
//       });
//     });
//     csvStream.end();
//   } catch (error) {
//     console.error('Export CSV Error:', error);
//     res.status(500).json({ message: 'Failed to export users to CSV' });
//   }
// };
// export const exportProductsToCsv = async (req: Request, res: Response) => {
//   try {
//     const products = await prisma.product.findMany({
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         basePrice: true,
//         variants: true,
//         category: true,
//         subcategory: true,
//         slug: true,
//         createdAt: true,
//         isDeleted: true,
//       },
//     });
//     if (!products || products.length === 0) {
//        res.status(404).json({ message: 'No products found' });
//        return
//     }
//     const flatProducts = products.map((p) => ({
//       id: p.id,
//       name: p.name,
//       description: p.description,
//       basePrice: p.basePrice,
//       slug: p.slug,
//       createdAt: p.createdAt.toISOString(),
//       isDeleted: p.isDeleted,
//       variants: JSON.stringify(p.variants),
//       category: JSON.stringify(p.category),
//       subcategory: JSON.stringify(p.subcategory),
//     }));
//     res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
//     res.setHeader('Content-Type', 'text/csv');
//     const csvStream = format({ headers: true });
//     csvStream.pipe(res);
//     flatProducts.forEach(product => csvStream.write(product));
//     csvStream.end();
//   } catch (error) {
//     console.error('Export CSV Error:', error);
//     res.status(500).json({ message: 'Failed to export products to CSV' });
//   }
// };
// export const importProductsFromCSV = async (req: Request, res: Response) => {
//   const filePath = req.file?.path;
//   if (!filePath) {
//     res.status(400).json({ message: 'CSV file is required' });
//     return;
//   }
//   const results: any[] = [];
//   fs.createReadStream(path.resolve(filePath))
//     .pipe(parse({ headers: true }))
//     .on('error', (error) => {
//       console.error(error);
//       res.status(500).json({ message: 'Failed to parse CSV file' });
//     })
//     .on('data', (row) => {
//       results.push(row);
//     })
//     .on('end', async () => {
//       try {
//         for (const row of results) {
//           const { id, name, description, basePrice, variants, category, subcategory } = row;
//           if (!name || !basePrice) continue;
//           if (id) {
//             const existing = await prisma.product.findUnique({
//               where: { id: Number(id) }, 
//             });
//             if (existing) {
//               await prisma.product.update({
//                 where: { id: Number(id) },
//                 data: {
//                   name,
//                   description: description || existing.description,
//                   basePrice: parseFloat(basePrice),
//                   isDeleted: false,
//                   variants: variants ? JSON.parse(variants) : undefined,
//                   category: category ? { connect: { id: Number(category) } } : undefined,
//                   subcategory: subcategory ? { connect: { id: Number(subcategory) } } : undefined,
//                 },
//               });
//               continue;
//             }
//           }
//           await prisma.product.create({
//             data: {
//               name,
//               description: description || null,
//               basePrice: parseFloat(basePrice),
//               slug: await generateSlug(name,description),
//               isDeleted: false,
//               variants: variants ? { create: JSON.parse(variants) } : undefined,
//               category: category ? { connect: { id: Number(category) } } : undefined,
//               subcategory: subcategory ? { connect: { id: Number(subcategory) } } : undefined,
//             },
//           });
//         }
//         res.status(201).json({ message: 'Products imported', count: results.length });
//       } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Error saving products' });
//       }
//     });
// };
// export const exportVariantsToCSV = async (req: Request, res: Response) => {
//   try {
//     const variants = await prisma.productVariant.findMany({
//       where: { isDeleted: false },
//       include: { images: true },
//     });
//     const rows = [
//       ['id', 'productId', 'name', 'price', 'stock', 'images'],
//       ...variants.map(v => [
//         v.id.toString(),
//         v.productId.toString(),
//         v.name,
//         v.price.toString(),
//         v.stock.toString(),
//         v.images.map(img => img.url).join(','),
//       ]),
//     ];
//     res.setHeader('Content-Disposition', 'attachment; filename="variants.csv"');
//     res.setHeader('Content-Type', 'text/csv');
//     fastcsv.write(rows, { headers: false }).pipe(res);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error exporting variants' });
//   }
// };
// export const importVariantsFromCSV = async (req: Request, res: Response) => {
//   const filePath = req.file?.path;
//   if (!filePath) {
//     res.status(400).json({ message: 'CSV file is required' });
//     return;
//   }
//   const variantsToUpsert: any[] = [];
//   fs.createReadStream(path.resolve(filePath))
//     .pipe(fastcsv.parse({ headers: true }))
//     .on('error', (error) => {
//       console.error('CSV parse error:', error);
//       res.status(500).json({ message: 'Failed to parse CSV file' });
//     })
//     .on('data', (row) => {
//       const { variantId, productId, name, price, stock, images } = row;
//       if (!productId || !name || !price || !stock) return;
//       let imagesCreateOrUpdate = undefined;
//       if (images) {
//         const urls = images.split(',').map((url: string) => url.trim()).filter(Boolean);
//         if (urls.length) {
//           imagesCreateOrUpdate = { create: urls.map((url: string) => ({ url })) };
//         }
//       }
//       variantsToUpsert.push({
//         id: variantId ? Number(variantId) : undefined,
//         productId: Number(productId),
//         name,
//         price: parseFloat(price),
//         stock: Number(stock),
//         isDeleted: false,
//         images: imagesCreateOrUpdate,
//       });
//     })
//     .on('end', async () => {
//       try {
//         let processedCount = 0;
//         for (const variant of variantsToUpsert) {
//           const productExists = await prisma.product.findUnique({ where: { id: variant.productId } });
//           if (!productExists) continue;
//           let existingVariant = null;
//           if (variant.id) {
//             existingVariant = await prisma.productVariant.findUnique({ where: { id: variant.id } });
//           }
//           if (!existingVariant) {
//             existingVariant = await prisma.productVariant.findFirst({
//               where: {
//                 productId: variant.productId,
//                 name: variant.name,
//                 isDeleted: false,
//               },
//             });
//           }
//           if (existingVariant) {
//             await prisma.productVariant.update({
//               where: { id: existingVariant.id },
//               data: {
//                 price: variant.price,
//                 stock: variant.stock,
//                 isDeleted: false,
//                 images: variant.images
//                   ? { deleteMany: {}, create: variant.images.create }
//                   : undefined,
//               },
//             });
//           } else {
//             await prisma.productVariant.create({
//               data: {
//                 productId: variant.productId,
//                 name: variant.name,
//                 price: variant.price,
//                 stock: variant.stock,
//                 isDeleted: false,
//                 images: variant.images,
//               },
//             });
//           }
//           processedCount++;
//         }
//         res.status(201).json({ message: 'Variants imported/updated', count: processedCount });
//       } catch (error) {
//         console.error('Error saving variants:', error);
//         res.status(500).json({ message: 'Error saving variants' });
//       }
//     });
// };
const adminBroadcastNotification = async (req, res) => {
    const { message, type = 'SYSTEM' } = req.body;
    if (!message) {
        res.status(400).json({ message: 'Message is required' });
        return;
    }
    const users = await prisma_1.default.user.findMany({
        where: { isDeleted: false },
        select: { id: true },
    });
    await Promise.all(users.map(user => (0, notification_1.sendNotification)(user.id, message, type)));
    res.json({ message: 'Broadcast sent to all users' });
};
exports.adminBroadcastNotification = adminBroadcastNotification;
const getUserNotificationsByAdmin = async (req, res) => {
    const userId = Number(req.params.userId);
    if (!userId) {
        res.status(400).json({ message: 'Invalid userId' });
        return;
    }
    const notifications = await prisma_1.default.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    res.json({ notifications });
};
exports.getUserNotificationsByAdmin = getUserNotificationsByAdmin;
const deleteUserNotificationByAdmin = async (req, res) => {
    const id = Number(req.params.id);
    if (!id) {
        res.status(400).json({ message: 'Invalid notification id' });
        return;
    }
    await prisma_1.default.notification.delete({ where: { id } });
    res.json({ message: 'Notification deleted' });
};
exports.deleteUserNotificationByAdmin = deleteUserNotificationByAdmin;
