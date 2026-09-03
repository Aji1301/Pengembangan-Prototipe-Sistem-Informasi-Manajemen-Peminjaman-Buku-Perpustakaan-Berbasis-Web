import { Router } from "express";
import { getUsers } from "../controllers/userController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticate, requireAdmin, getUsers);

export default router;
