import { Router } from "express";
import {
  deleteAccount,
  login,
  logout,
  signUp,
  verifyToken,
} from "../controllers/user.controller.js";
import { authUser } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/verify", verifyToken);
router.post("/logout", logout);
router.delete("/delete-account", authUser, deleteAccount);

export default router;
