import postController from "../controllers/postController.js";
import express from "express";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = express.Router();

router
  .route("/createPost")
  .get(postController.getCreatePost)
  .post(postController.createPost);

router.get("/:postId", verifyAuth, postController.getPostDetails);

router.post("/:postID/send-info", postController.sendInfo);
router.get("/:postID/helpers", postController.getHelpers);
router.patch("/:postID/select-helper/:helperID", postController.selectHelper);

export default router;
