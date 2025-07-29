"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seoTagControllers_1 = require("../../controllers/BlogsController/seoTagControllers");
const seoKeywordsControllers_1 = require("../../controllers/BlogsController/seoKeywordsControllers");
const authenticate_1 = require("../../middlewares/authenticate");
const authorizaAdmin_1 = require("../../middlewares/authorizaAdmin");
const BlogCrudController_1 = require("../../controllers/BlogsController/BlogCrudController");
const multerCloudinary_1 = require("../../upload/multerCloudinary");
const singleBlogInfoController_1 = require("../../controllers/BlogsController/singleBlogInfoController");
const router = (0, express_1.Router)();
router.get("/tag", seoTagControllers_1.getAllSeoTags);
router.get("/keyword", seoKeywordsControllers_1.getAllSeoKeywords);
router.get("/", BlogCrudController_1.getBlogs);
router.get("/content/:slug", singleBlogInfoController_1.getSingleBlogInfo);
//  Only Admin Access
router.use(authenticate_1.authenticate, authorizaAdmin_1.authorizeAdmin);
const imageUpload = multerCloudinary_1.uploadMemory.fields([
    { name: 'image', maxCount: 1 },
]);
router.post("/", imageUpload, BlogCrudController_1.createblog);
router.patch("/:id", imageUpload, BlogCrudController_1.updateBlog);
router.patch("/toggle/:blogId", BlogCrudController_1.toggleBlogActiveStatus);
router.delete("/:id", BlogCrudController_1.deleteBlog);
// routes/blogs.ts
router.post('/duplicate/:id', BlogCrudController_1.duplicateBlog);
router.post("/tag", seoTagControllers_1.createSeoTag);
router.patch("/tag/:id", seoTagControllers_1.updateSeoTag);
router.delete("/tag/:id", seoTagControllers_1.deleteSeoTag);
router.post("/keyword", seoKeywordsControllers_1.createSeoKeyword);
router.patch("/keyword/:id", seoKeywordsControllers_1.updateSeoKeyword);
router.delete("/keyword/:id", seoKeywordsControllers_1.deleteSeoKeyword);
exports.default = router;
