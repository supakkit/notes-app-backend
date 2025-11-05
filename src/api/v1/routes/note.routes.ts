import { Router } from "express";
import {
  createNote,
  deleteNote,
  getNoteById,
  getUserNotes,
  updateNote,
} from "../../../controllers/note.controller.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import {
  createNoteBodySchema,
  getNotesQuerySchema,
  noteIdParamsSchema,
  updateNoteBodySchema,
} from "../../../validators/note.validator.js";

const router = Router();

router.post(
  "/notes",
  validateRequest({ body: createNoteBodySchema }),
  createNote
);
router.get(
  "/notes",
  validateRequest({ query: getNotesQuerySchema }),
  getUserNotes
);
router.get(
  "/notes/:noteId",
  validateRequest({ params: noteIdParamsSchema }),
  getNoteById
);
router.delete(
  "/notes/:noteId",
  validateRequest({ params: noteIdParamsSchema }),
  deleteNote
);
router.patch(
  "/notes/:noteId",
  validateRequest({
    params: noteIdParamsSchema,
    body: updateNoteBodySchema,
  }),
  updateNote
);

export default router;
