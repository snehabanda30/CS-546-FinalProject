import userController from "../controllers/userController.js";
import express from "express";
import { verifyAuth } from "../middleware/verifyAuth.js";

const router = express.Router();

router
  .route("/signup")
  .get(userController.getSignup)
  .post(userController.signup);

router
  .route("/login")
  .get(userController.getLoginPage)
  .post(userController.login);

router.route("/logout").post(userController.logout);

router
  .route("/profile/:username")
  .get(verifyAuth, userController.getProfilePage);

router
  .route("/profile/:username/completed")
  .get(verifyAuth, userController.getCompletedProfilePage);

router
  .route("/profile/:username/edit")
  .get(userController.getEditProfilePage)
  .put(userController.editProfile);

router
  .route("/profile/:username/favorites")
  .get(verifyAuth, userController.getFavorites);

router.route("/favorite").post(userController.favoriteUser);

router.route("/review").post(userController.reviewUser);

router
  .route("/profile/:username/edit")
  .get(userController.getEditProfilePage)
  .put(userController.editProfile);

router.route("/review").post(userController.reviewUser);

router
  .route("/editsignup")
  .get(userController.getEdit)
  .patch(userController.editUser); 

router
  .route("/profile/taskstatus/:username/:postId")
  .get(userController.getTaskStatusTracking)
  .patch(userController.taskStatus)

export default router;
