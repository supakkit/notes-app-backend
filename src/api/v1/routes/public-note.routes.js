import { Router } from "express";
import { getPublicNotesByUserId } from "../controllers/note.controller.js";

const router = Router();

router.get("/public-notes/:userId", getPublicNotesByUserId);

export default router;
