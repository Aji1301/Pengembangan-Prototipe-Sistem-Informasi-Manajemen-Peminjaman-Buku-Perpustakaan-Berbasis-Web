import { Router } from "express";
import { getBooks, getBookById, createBook, updateBook, deleteBook } from "../controllers/bookController.js";
import { authenticate, requireAdmin } from "../middlewares/auth.js";

const router = Router();

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", authenticate, requireAdmin, createBook);
router.put("/:id", authenticate, requireAdmin, updateBook);
router.delete("/:id", authenticate, requireAdmin, deleteBook);

export default router;
