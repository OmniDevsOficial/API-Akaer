import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { roleMiddleware } from "../middlewares/roleMiddleware";

const router = Router();
const userController = new UserController();

router.get("/", authMiddleware, roleMiddleware(["ADMIN"]), (req, res) => userController.listUsers(req, res));
router.get("/:id", authMiddleware, (req, res) => userController.getUserProfile(req, res));

export default router;
