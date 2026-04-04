import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

const allowedOrigin = process.env.FRONTEND_SITE_URL || "*";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow mobile apps / Postman

      if (allowedOrigin === "*" || origin.includes(allowedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed"));
    },
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "dn-physics-auth-backend" });
});

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);

app.listen(port, () => {
  console.log(`DN Physics auth backend running on port ${port}`);
});
