import userController from "../controllers/userController.js";
import express from "express";

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

router.route("/profile/:username").get(userController.getProfilePage);

router
  .route("/profile/:username/edit")
  .get(userController.getEditProfilePage)
  .put(userController.editProfile);

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
export default router;
