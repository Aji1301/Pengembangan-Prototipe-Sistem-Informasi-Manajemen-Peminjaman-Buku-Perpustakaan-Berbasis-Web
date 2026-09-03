import { Router } from "express";
import { requestBorrow, createBorrowByAdmin, getMyBorrowings, getAllBorrowings, updateBorrowStatus } from "../controllers/borrowController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.post("/request", authenticate, requestBorrow);
router.post("/admin-create", authenticate, requireAdmin, createBorrowByAdmin);
router.get("/my", authenticate, getMyBorrowings);
router.get("/all", authenticate, requireAdmin, getAllBorrowings);
router.patch("/:id/status", authenticate, requireAdmin, updateBorrowStatus);

export default router;
