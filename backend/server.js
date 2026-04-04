import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRouter from "./src/routes/auth.routes.js";
import billingRouter from "./src/routes/billing.routes.js";
import profileRouter from "./src/routes/profile.routes.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

const clientUrl = process.env.CLIENT_URL;

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (clientUrl && origin === clientUrl) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "DN Physics backend is running"
  });
});

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/billing", billingRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.use((err, req, res, next) => {
  console.error("SERVER_ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal server error"
  });
});

app.listen(port, () => {
  console.log(`DN Physics backend running on port ${port}`);
});
