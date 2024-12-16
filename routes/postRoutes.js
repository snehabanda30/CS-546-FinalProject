import postController from "../controllers/postController.js";
import express from "express";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = express.Router();

router
  .route("/createPost")
  .get(postController.getCreatePost)
  .post(postController.createPost);

router.get("/:postId", verifyAuth, postController.getPostDetails);

// // route for comments
// router.get("/:postId/comments", postController.getComments);
// router.post("/:postId/comments", postController.createComment);
router.route("/:postId/comments").post(postController.createComment);

// Allow users to view all users who have sent information for a task.

router.post("/:postID/send-info", postController.sendInfo);
router.get("/:postID/helpers", postController.getHelpers);
router.patch("/:postID/select-helper/:helperID", postController.selectHelper);

export default router;
