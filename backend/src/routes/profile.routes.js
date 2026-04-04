import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getMyProfile,
  updateMyProfile
} from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);

export default router;
