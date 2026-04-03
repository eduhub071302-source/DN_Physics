import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import paymentsRouter from "./routes/payments.js";
import unlockRouter from "./routes/unlock.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8787);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "dn-physics-payhere-backend" });
});

app.use("/api/payments", paymentsRouter);
app.use("/api/unlock", unlockRouter);

app.listen(port, () => {
  console.log(`DN Physics backend running on port ${port}`);
});
