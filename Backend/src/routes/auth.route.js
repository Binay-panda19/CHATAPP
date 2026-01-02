import { Router } from "express";
import {
  signup,
  login,
  logout,
  updateProfile,
} from "../controllers/auth.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/logout", logout);

router.put("/update", protectRoute, updateProfile);
export default router;
