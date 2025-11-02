import { Router } from "express";
import {
  login,
  logout,
  signUp,
  verifyToken,
} from "../controllers/user.controller.js";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/verify", verifyToken);
router.post("/logout", logout);

export default router;
