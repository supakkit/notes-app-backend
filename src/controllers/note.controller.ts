import { FilterQuery } from "mongoose";
import { OpenAI } from "openai";

import generateEmbedding from "../utils/generateEmbedding.js";
import Note, { INote } from "../models/note.model.js";
import User from "../models/user.model.js";
import {
  AnswerQuestionBody,
  CreateNoteBody,
  GetNotesQuery,
  NoteIdParams,
  UpdateNoteBody,
} from "../validators/note.validator.js";
import { UserIdParams } from "../validators/user.validator.js";
import { typedRequestHandler } from "../utils/typedRequestHandler.js";

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("Missing OpenAI API key in environment variables");
}
const openai = new OpenAI({ apiKey });

export const createNote = typedRequestHandler<{}, {}, CreateNoteBody>(
  async (req, res, next): Promise<void> => {
    const { title, content, tags, isPinned, isPublic } = req.validatedBody;
    const userId = req.user?._id;

    if (!userId) {
      const error: CustomError = new Error("Unauthorized - no user ID found");
      error.status = 401;
      return next(error);
    }

    try {
      // Generate embedding for the note
      const embedding = await generateEmbedding(
        `TITLE: ${title}. CONTENT: ${content}`
      );

      // Create a new note
      const note = await Note.create({
        title,
        content,
        tags,
        isPinned,
        isPublic,
        userId,
        embedding,
      });

      const newNote = note.toObject();
      delete newNote.embedding;

      res.status(201).json({
        error: false,
        message: "Note created successfully",
        note: newNote,
      });
    } catch (err) {
      next(err);
    }
  }
);

export const getUserNotes = typedRequestHandler<{}, {}, {}, GetNotesQuery>(
  async (req, res, next): Promise<void> => {
    const userId = req.user?._id;
    const { page, limit, q } = req.validatedQuery;

    if (!userId) {
      const error: CustomError = new Error("Unauthorized - no user ID found");
      error.status = 401;
      return next(error);
    }

    try {
      // Filter conditions
      const filter: FilterQuery<INote> = { userId };
      if (q) {
        const regex = new RegExp(q, "i");
        filter.$or = [
          { title: { $regex: regex } },
          { content: { $regex: regex } },
          { tags: { $regex: regex } },
        ];
      }

      const [total, notes] = await Promise.all([
        Note.countDocuments(filter),
        Note.find(filter)
          .sort({ isPinned: -1, createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
      ]);

      res.status(200).json({
        error: false,
        message: "Notes retrieved Successfully",
        notes,
        page,
        limit,
        total,
      });
    } catch (err) {
      next(err);
    }
  }
);

export const getNoteById = typedRequestHandler<NoteIdParams>(
  async (req, res, next): Promise<void> => {
    const { noteId } = req.validatedParams;
    const userId = req.user?._id;

    if (!userId) {
      const error: CustomError = new Error("Unauthorized - no user ID found");
      error.status = 401;
      return next(error);
    }

    try {
      const note = await Note.findOne({ _id: noteId, userId });

      if (!note) {
        const error: CustomError = new Error("Note not found");
        error.status = 404;
        return next(error);
      }

      res.status(200).json({
        error: false,
        message: "Note retrieved successfully",
        note,
      });
    } catch (err) {
      next(err);
    }
  }
);

export const deleteNote = typedRequestHandler<NoteIdParams>(
  async (req, res, next): Promise<void> => {
    const { noteId } = req.validatedParams;
    const userId = req.user?._id;

    if (!userId) {
      const error: CustomError = new Error("Unauthorized - no user ID found");
      error.status = 401;
      return next(error);
    }

    try {
      const note = await Note.findOne({ _id: noteId, userId });

      if (!note) {
        const error: CustomError = new Error("Note not found");
        error.status = 404;
        return next(error);
      }

      await note.deleteOne();

      res.status(204).json({
        error: false,
        message: "Note deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
);

export const updateNote = typedRequestHandler<NoteIdParams, {}, UpdateNoteBody>(
  async (req, res, next): Promise<void> => {
    const { noteId } = req.validatedParams;
    const { title, content, tags, isPinned, isPublic } = req.validatedBody;
    const userId = req.user?._id;

    if (!userId) {
      const error: CustomError = new Error("Unauthorized - no user ID found");
      error.status = 401;
      return next(error);
    }

    if (
      !title &&
      !content &&
      !tags &&
      isPinned === undefined &&
      isPublic === undefined
    ) {
      const error: CustomError = new Error("No changes provided");
      error.status = 400;
      return next(error);
    }

    try {
      const note = await Note.findOne({ _id: noteId, userId });

      if (!note) {
        const error: CustomError = new Error("Note not found");
        error.status = 404;
        return next(error);
      }

      if (title !== undefined) note.title = title;
      if (content !== undefined) note.content = content;
      if (tags !== undefined) note.tags = tags;
      if (isPinned !== undefined) note.isPinned = isPinned;
      if (isPublic !== undefined) note.isPublic = isPublic;

      if (title !== undefined || content !== undefined) {
        note.embedding = await generateEmbedding(
          `TITLE: ${note.title}. CONTENT: ${note.content}`
        );
      }

      const updatedNote = await note.save();
      const { embedding, ...noteData } = updatedNote.toObject();

      res.status(200).json({
        error: false,
        message: "Note updated successfully",
        note: noteData,
      });
    } catch (err) {
      next(err);
    }
  }
);

export const getPublicNotesByUserId = typedRequestHandler<
  UserIdParams,
  {},
  {},
  GetNotesQuery
>(async (req, res, next): Promise<void> => {
  const { userId } = req.validatedParams;
  const { page, limit } = req.validatedQuery;

  try {
    // Filter conditions
    const filter: FilterQuery<INote> = { userId, isPublic: true };

    const [user, total, notes] = await Promise.all([
      User.findById(userId).select("fullName email -_id"),
      Note.countDocuments(filter),
      Note.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.status(200).json({
      error: false,
      message: "Public notes retrieved Successfully",
      user,
      notes,
      page,
      limit,
      total,
    });
  } catch (err) {
    next(err);
  }
});

export const answerQuestionByAI = typedRequestHandler<
  UserIdParams,
  {},
  AnswerQuestionBody
>(async (req, res, next): Promise<void> => {
  const { userId } = req.validatedParams;
  const { question } = req.validatedBody;

  try {
    // Generate an embedding for the question
    const questionEmbedding = await generateEmbedding(question);

    const topNotes = await Note.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // vector index name
          queryVector: questionEmbedding,
          path: "embedding", // embedding field name
          numCandidates: 100, // number of candidates to consider
          limit: 5, // number of results to return
          filter: { userId, isPublic: true },
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
        },
      },
    ]);

    // Create context from the notes
    const context = topNotes
      .map((note) => `TITLE: ${note.title}\nCONTENT: ${note.content}`)
      .join("\n\n");

    // Create prompt by using the context and the client's question
    const prompt = `
You are an AI assistant. Based on the noted below, answer the question.
Notes:
${context}

Question: ${question}
Answer:
`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an AI assistant." },
        { role: "user", content: prompt },
      ],
      max_completion_tokens: 300,
      temperature: 0.7,
    });

    if (!response.choices[0]?.message?.content) {
      const error: CustomError = new Error("Failed to get the answer");
      error.status = 400;
      return next(error);
    }

    res.status(200).json({
      error: false,
      answer: response.choices[0]?.message?.content?.trim(),
    });
  } catch (err) {
    next(err);
  }
});
