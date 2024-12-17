import postController from "../controllers/postController.js";
import express from "express";

const router = express.Router();

router.get("/", postController.getAllPosts);
router.get("/search", postController.postSearch);
router.get("/filterByCategory", postController.filterByCategory)
router.get("/categories", postController.getCategories);
export default router;
