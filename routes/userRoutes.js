import userController from "../controllers/userController.js";
import express from "express"

const router = express.Router()

router.get("/test1", userController.demoFuncOne)

router.get("/test2", userController.demoFuncTwo)

export default router