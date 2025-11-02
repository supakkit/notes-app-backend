import { Router } from "express";
import {
  answerQuestionByAI,
  createNote,
  deleteNote,
  getNoteById,
  getUserNotes,
  togglePublicNote,
  updateNote,
} from "../controllers/note.controller.js";

const router = Router();

router.post("/notes", createNote);
router.get("/notes", getUserNotes);
router.get("/notes/:noteId", getNoteById);
router.delete("/notes/:noteId", deleteNote);
router.patch("/notes/:noteId", updateNote);
router.put("/notes/:noteId/visibility", togglePublicNote);
router.post("/answer-question/:userId", answerQuestionByAI);

export default router;
