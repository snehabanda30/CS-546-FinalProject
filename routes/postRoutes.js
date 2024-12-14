import postController from "../controllers/postController.js";
import express from "express";

const router = express.Router();

router
  .route("/createPost")
  .get(postController.getCreatePost)
  .post(postController.createPost);

router.get("/:postId", postController.getPostDetails);

// // Allow users to view all users who have sent information for a task.
router.post("/:postID/send-info", postController.sendInfo);

export default router;
