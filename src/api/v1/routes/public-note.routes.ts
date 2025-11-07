import { Router } from "express";
import {
  answerQuestionByAI,
  getPublicNoteByNoteId,
  getPublicNotesByUserId,
} from "../../../controllers/note.controller.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import { userIdParamsSchema } from "../../../validators/user.validator.js";
import { answerQuestionBodySchema, getNotesQuerySchema, noteIdParamsSchema } from "../../../validators/note.validator.js";

const router = Router();

router.get(
  "/public-notes/user/:userId",
  validateRequest({ params: userIdParamsSchema, query: getNotesQuerySchema }),
  getPublicNotesByUserId
);

router.get(
  "/public-notes/:noteId",
  validateRequest({ params: noteIdParamsSchema }),
  getPublicNoteByNoteId
);

router.post(
  "/answer-question/:userId",
  validateRequest({
    params: userIdParamsSchema,
    body: answerQuestionBodySchema,
  }),
  answerQuestionByAI
);

export default router;
