import userController from "../controllers/userController.js";
import express from "express"; 


const router = express.Router();

router.get("/test1", userController.demoFuncOne);

router.get("/test2", userController.demoFuncTwo);

router
  .route("/")
  .get(userController.getHome) 

router
  .route("/signup")
  .get(userController.getSignup)
  .post(userController.signup);

  router
  .route("/editsignup")
  .get(userController.getEdit) 
  .patch(userController.editUser); 
export default router;
