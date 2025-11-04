import { Router } from "express";
import {
  answerQuestionByAI,
  getPublicNotesByUserId,
} from "../../../controllers/note.controller.js";
import { validateRequest } from "../../../middleware/validateRequest.js";
import { userIdParamsSchema } from "../../../validators/user.validator.js";
import { answerQuestionBodySchema, getNotesQuerySchema } from "../../../validators/note.validator.js";

const router = Router();

router.get(
  "/public-notes/:userId",
  validateRequest({ params: userIdParamsSchema, query: getNotesQuerySchema }),
  getPublicNotesByUserId
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
