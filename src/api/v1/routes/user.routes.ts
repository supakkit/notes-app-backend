import { Router } from "express";
import {
  deleteAccount,
  login,
  logout,
  signUp,
  verifyToken,
} from "../../../controllers/user.controller.js";
import { authUser } from "../../../middleware/auth.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import { createUserBodySchema, loginBodySchema } from "../../../validators/user.validator.js";

const router = Router();

router.post("/signup", validateRequest({ body: createUserBodySchema }), signUp);
router.post("/login", validateRequest({ body: loginBodySchema }), login);
router.get("/verify", verifyToken);
router.post("/logout", logout);
router.delete("/delete-account", authUser, deleteAccount);

export default router;
