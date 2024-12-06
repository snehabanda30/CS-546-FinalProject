import postController from "../controllers/postController.js";
import express from "express";

const router = express.Router();

router.get("/", postController.getAllPosts);
export default router;