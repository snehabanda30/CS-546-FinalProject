import postController from "../controllers/postController.js";
import express from "express";

const router = express.Router();

router.get("/test1", postController.demoFuncOne);

router.get("/test2", postController.demoFuncTwo);

// router.get("/", postController.getAllPosts);
export default router;
