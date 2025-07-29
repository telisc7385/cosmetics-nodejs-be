"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubcategory = exports.updateSubCategory = exports.getSubcategoryByCategoryId = exports.createSubcategory = void 0;
const prisma_1 = __importDefault(require("../../db/prisma"));
const uploadToCloudinary_1 = require("../../utils/uploadToCloudinary");
const category_controller_1 = require("./category.controller");
const createSubcategory = async (req, res) => {
    const { name, sequence_number, isDeleted, parent_category } = req.body;
    if (!name || !parent_category || !sequence_number) {
        res.status(400).json({
            success: false,
            message: "Name, parent_category, and sequence_number are required",
        });
        return;
    }
    if (isNaN(sequence_number) || sequence_number <= 0) {
        res.status(400).json({
            success: false,
            message: "sequence_number must be a positive number",
        });
        return;
    }
    try {
        // 1. Verify that the category exists
        const existingCategory = await prisma_1.default.category.findUnique({
            where: {
                id: Number(parent_category),
            },
        });
        if (!existingCategory) {
            res.status(404).json({
                success: false,
                message: "Parent category not found",
            });
            return;
        }
        const duplicateSequence = await prisma_1.default.subcategory.findFirst({
            where: {
                categoryId: Number(parent_category),
                sequence_number: Number(sequence_number),
            },
        });
        if (duplicateSequence) {
            res.status(400).json({
                success: false,
                message: "Sequence number already exists for this parent category",
            });
            return;
        }
        let baseSlug = (0, category_controller_1.generateCategorySlug)(name);
        let slug = baseSlug;
        let count = 1;
        while (true) {
            const existingSlug = await prisma_1.default.subcategory.findFirst({
                where: { slug },
            });
            if (!existingSlug)
                break;
            slug = `${baseSlug}-${count}`;
            count++;
        }
        // 2. Upload image and banner
        let imageUrl;
        let banner;
        let publicId;
        if (req.files && "image" in req.files) {
            const imageFile = Array.isArray(req.files["image"])
                ? req.files["image"][0]
                : req.files["image"];
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(imageFile.buffer, "subcategories/image");
            imageUrl = result.secure_url;
            publicId = result.public_id;
        }
        if (req.files && "banner" in req.files) {
            const bannerFile = Array.isArray(req.files["banner"])
                ? req.files["banner"][0]
                : req.files["banner"];
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(bannerFile.buffer, "subcategories/banner");
            banner = result.secure_url;
        }
        // 3. Create subcategory
        const subcategory = await prisma_1.default.subcategory.create({
            data: {
                name,
                sequence_number: Number(sequence_number),
                categoryId: Number(parent_category),
                slug,
                imageUrl,
                banner,
                publicId,
                isDeleted: isDeleted === "true" || isDeleted === true,
            },
        });
        res.status(201).json({
            success: true,
            message: "Subcategory created",
            subcategory,
        });
        return;
    }
    catch (error) {
        console.error("Create subcategory error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error creating subcategory",
        });
        return;
    }
};
exports.createSubcategory = createSubcategory;
const getSubcategoryByCategoryId = async (req, res) => {
    const { parent_category } = req.query;
    try {
        const subcategory = await prisma_1.default.subcategory.findMany({
            where: { categoryId: Number(parent_category) },
            orderBy: {
                sequence_number: "asc",
            },
            // include: { category: true, products: true },
        });
        if (subcategory?.length === 0) {
            res.status(404).json({ message: "Subcategory not found" });
            return;
        }
        res.status(200).json({ success: true, subcategory });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSubcategoryByCategoryId = getSubcategoryByCategoryId;
// export const updateSubCategory = async (req: Request, res: Response) => {
//   const { name, sequence_number, isDeleted } = req.body;
//   const { id } = req.params;
//   if (!name || !sequence_number) {
//      res.status(400).json({
//       success: false,
//       message: "Name and sequence_number are required",
//     });
//     return
//   }
//   if (isNaN(sequence_number) || sequence_number <= 0) {
//      res.status(400).json({
//       success: false,
//       message: "sequence_number must be a positive number",
//     });
//     return;
//   }
//   try {
//     const subcategoryId = Number(id);
//     // 1. Check if subcategory exists
//     const existingSubcategory = await prisma.subcategory.findUnique({
//       where: { id: subcategoryId },
//     });
//     if (!existingSubcategory) {
//        res.status(404).json({
//         success: false,
//         message: "Subcategory not found",
//       });
//       return
//     }
//     const duplicateSequence = await prisma.subcategory.findFirst({
//       where: {
//         categoryId: existingSubcategory.categoryId,
//         sequence_number: sequence_number,
//         NOT: { id: subcategoryId },
//       },
//     });
//     if (duplicateSequence) {
//        res.status(400).json({
//         success: false,
//         message: "Sequence number already exists for this sub category",
//       });
//       return;
//     }
//     let imageUrl = existingSubcategory.imageUrl;
//     let banner = existingSubcategory.banner;
//     let publicId = existingSubcategory.publicId;
//     // 2. Handle image update
//     if (req.files && "image" in req.files) {
//       const imageFile = Array.isArray(req.files["image"])
//         ? req.files["image"][0]
//         : req.files["image"];
//       const result = await uploadToCloudinary(
//         imageFile.buffer,
//         "subcategories/image"
//       );
//       imageUrl = result.secure_url;
//       publicId = result.public_id;
//     }
//     // 3. Handle banner update
//     if (req.files && "banner" in req.files) {
//       const bannerFile = Array.isArray(req.files["banner"])
//         ? req.files["banner"][0]
//         : req.files["banner"];
//       const result = await uploadToCloudinary(
//         bannerFile.buffer,
//         "subcategories/banner"
//       );
//       banner = result.secure_url;
//     }
//     // 4. Perform update
//     const updatedSubcategory = await prisma.subcategory.update({
//       where: { id: subcategoryId },
//       data: {
//         name,
//         sequence_number: Number(sequence_number),
//         isDeleted:
//           typeof isDeleted !== "undefined"
//             ? isDeleted === "true" || isDeleted === true
//             : existingSubcategory.isDeleted,
//         imageUrl,
//         banner,
//         publicId,
//       },
//     });
//      res.status(200).json({
//       success: true,
//       message: "Subcategory updated",
//       subcategory: updatedSubcategory,
//     });
//   } catch (error: any) {
//     console.error("Update subcategory error:", error);
//      res.status(500).json({
//       success: false,
//       message: error.message || "Error updating subcategory",
//     });
//   }
// };
const updateSubCategory = async (req, res) => {
    const { name, sequence_number, isDeleted } = req.body;
    const { id } = req.params;
    const sequenceNum = Number(sequence_number);
    const subcategoryId = Number(id);
    // Validate inputs
    if (!name || !sequence_number) {
        res.status(400).json({
            success: false,
            message: "Name and sequence_number are required",
        });
        return;
    }
    if (isNaN(sequenceNum) || sequenceNum <= 0) {
        res.status(400).json({
            success: false,
            message: "sequence_number must be a positive number",
        });
        return;
    }
    try {
        // 1. Check if subcategory exists
        const existingSubcategory = await prisma_1.default.subcategory.findUnique({
            where: { id: subcategoryId },
        });
        if (!existingSubcategory) {
            res.status(404).json({
                success: false,
                message: "Subcategory not found",
            });
            return;
        }
        // 2. Check for duplicate sequence number within the same category
        const duplicateSequence = await prisma_1.default.subcategory.findFirst({
            where: {
                categoryId: existingSubcategory.categoryId,
                sequence_number: sequenceNum,
                NOT: { id: subcategoryId },
            },
        });
        if (duplicateSequence) {
            res.status(400).json({
                success: false,
                message: "Sequence number already exists for this sub category",
            });
            return;
        }
        let imageUrl = existingSubcategory.imageUrl;
        let banner = existingSubcategory.banner;
        let publicId = existingSubcategory.publicId;
        // 3. Handle image update
        if (req.files && "image" in req.files) {
            const imageFile = Array.isArray(req.files["image"])
                ? req.files["image"][0]
                : req.files["image"];
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(imageFile.buffer, "subcategories/image");
            imageUrl = result.secure_url;
            publicId = result.public_id;
        }
        // 4. Handle banner update
        if (req.files && "banner" in req.files) {
            const bannerFile = Array.isArray(req.files["banner"])
                ? req.files["banner"][0]
                : req.files["banner"];
            const result = await (0, uploadToCloudinary_1.uploadToCloudinary)(bannerFile.buffer, "subcategories/banner");
            banner = result.secure_url;
        }
        // 5. Update subcategory
        const updatedSubcategory = await prisma_1.default.subcategory.update({
            where: { id: subcategoryId },
            data: {
                name,
                sequence_number: sequenceNum,
                isDeleted: typeof isDeleted !== "undefined"
                    ? isDeleted === "true" || isDeleted === true
                    : existingSubcategory.isDeleted,
                imageUrl,
                banner,
                publicId,
            },
        });
        res.status(200).json({
            success: true,
            message: "Subcategory updated",
            subcategory: updatedSubcategory,
        });
        return;
    }
    catch (error) {
        console.error("Update subcategory error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error updating subcategory",
        });
        return;
    }
};
exports.updateSubCategory = updateSubCategory;
const deleteSubcategory = async (req, res) => {
    const { id } = req.params;
    try {
        const subcategoryId = Number(id);
        // Check if subcategory exists
        const existingSubcategory = await prisma_1.default.subcategory.findUnique({
            where: { id: subcategoryId },
        });
        if (!existingSubcategory) {
            res.status(404).json({
                success: false,
                message: "Subcategory not found",
            });
            return;
        }
        // Option 1: Soft delete (mark as deleted)
        // await prisma.subcategory.update({
        //   where: { id: subcategoryId },
        //   data: { isDeleted: true },
        // });
        // Option 2: Hard delete (remove from DB)
        await prisma_1.default.subcategory.delete({
            where: { id: subcategoryId },
        });
        res.status(200).json({
            success: true,
            message: "Subcategory deleted successfully",
        });
    }
    catch (error) {
        console.error("Delete subcategory error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error deleting subcategory",
        });
    }
};
exports.deleteSubcategory = deleteSubcategory;
