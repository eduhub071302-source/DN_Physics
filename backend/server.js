import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRouter from "./src/routes/auth.routes.js";
// (we will adjust paths later if needed)

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);

/* =========================
   🌐 CORS CONFIG (PRODUCTION SAFE)
========================= */

const CLIENT_URL = process.env.CLIENT_URL;

app.use(
  cors({
    origin: (origin, callback) => {
      // allow Postman / mobile apps
      if (!origin) return callback(null, true);

      if (CLIENT_URL && origin === CLIENT_URL) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true
  })
);

/* =========================
   🧩 MIDDLEWARE
========================= */

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

/* =========================
   🏠 ROOT
========================= */

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "DN Physics backend is running"
  });
});

/* =========================
   🔐 ROUTES
========================= */

app.use("/api/auth", authRouter);

/* =========================
   ❌ 404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

/* =========================
   ⚠️ GLOBAL ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error("SERVER_ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

/* =========================
   🚀 START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`DN Physics backend running on port ${PORT}`);
});
