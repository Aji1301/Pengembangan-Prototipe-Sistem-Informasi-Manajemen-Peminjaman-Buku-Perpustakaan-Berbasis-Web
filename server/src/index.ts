import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import borrowRoutes from "./routes/borrowRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import { prisma } from "./prisma.js";

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

import { prewarmBooksCache } from "./controllers/bookController.js";

// Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "KANCIL Backend Service Running Successfully!" });
});

// Cache for stats
let cachedStats: { booksCount: number; membersCount: number; categoriesCount: number } | null = null;
let statsTimestamp = 0;

// Public Stats Endpoint for Landing Page
app.get("/api/stats", async (req, res) => {
  try {
    if (cachedStats && Date.now() - statsTimestamp < 60000) {
      res.json(cachedStats);
      return;
    }

    const [booksCount, membersCount, categoriesCount] = await Promise.all([
      prisma.book.count(),
      prisma.member.count(),
      prisma.category.count(),
    ]);

    cachedStats = { booksCount, membersCount, categoriesCount };
    statsTimestamp = Date.now();

    res.json(cachedStats);
  } catch (error: any) {
    res.status(500).json({ booksCount: 0, membersCount: 0, categoriesCount: 0 });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowings", borrowRoutes);
app.use("/api/users", userRoutes);

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Terjadi kesalahan pada server.", error: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 KANCIL Server running on http://localhost:${PORT}`);
  prewarmBooksCache();
});

