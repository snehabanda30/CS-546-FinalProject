import postController from "../controllers/postController.js";
import express from "express";

const router = express.Router();

// routes for create post
router
  .route("/createPost")
  .get(postController.getCreatePost)
  .post(postController.createPost);

router.get("/:postId", postController.getPostDetails);

export default router;
