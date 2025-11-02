import generateEmbedding from "../../../utils/generateEmbedding.js";
import Note from "../models/note.model.js";
import User from "../models/user.model.js";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const parsePaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limitRaw = parseInt(query.limit, 10) || 10;
  const limit = Math.min(Math.max(1, limitRaw), 100);
  const q = (query.q || "").toString().trim();

  return { page, limit, q };
};

export const createNote = async (req, res, next) => {
  const {
    title,
    content,
    tags = [],
    isPinned = false,
    isPublic = false,
  } = req.body;
  const userId = req.user._id;

  // Validate client's authorization
  if (!userId) {
    const error = new Error("Unauthorized - no user ID found");
    error.status = 401;
    return next(error);
  }

  // Validate client's input
  if (!title) {
    const error = new Error("Title is required");
    error.status = 400;
    return next(error);
  }

  if (!content) {
    const error = new Error("Content is required");
    error.status = 400;
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

    const newNote = { ...note._doc };
    delete newNote.embedding;

    return res.status(201).json({
      error: false,
      message: "Note created successfully",
      note: newNote,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserNotes = async (req, res, next) => {
  const userId = req.user._id;

  // Validate client's authorization
  if (!userId) {
    const error = new Error("Unauthorized - no user ID found");
    error.status = 401;
    return next(error);
  }

  const { page, limit, q } = parsePaginationParams(req.query);

  try {
    // Filter conditions
    const filter = { userId };
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
        .select("-embedding")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    if (!notes) {
      return res.status(200).json({
        error: false,
        message: "No matching notes found",
      });
    }

    return res.status(200).json({
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
};

export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user._id;

  // Validate client's authorization
  if (!userId) {
    const error = new Error("Unauthorized - no user ID found");
    error.status = 401;
    return next(error);
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId }).select(
      "-embedding"
    );

    if (!note) {
      const error = new Error("Note not found");
      error.status = 404;
      return next(error);
    }

    return res.status(200).json({
      error: false,
      message: "Note retrieved successfully",
      note,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const userId = req.user._id;

  // Validate client's authorization
  if (!userId) {
    const error = new Error("Unauthorized - no user ID found");
    error.status = 401;
    return next(error);
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId }).select(
      "-embedding"
    );

    if (!note) {
      const error = new Error("Note not found");
      error.status = 404;
      return next(error);
    }

    await note.deleteOne();

    return res.status(204).json({
      error: false,
      message: "Note deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;
  const { title, content, tags, isPinned } = req.body;
  const userId = req.user._id;

  // Validate client's authorization
  if (!userId) {
    const error = new Error("Unauthorized - no user ID found");
    error.status = 401;
    return next(error);
  }

  if (!title && !content && !tags && isPinned === undefined) {
    const error = new Error("No changes provided");
    error.status = 400;
    return next(error);
  }

  try {
    const note = await Note.findOne({ _id: noteId, userId });

    if (!note) {
      const error = new Error("Note not found");
      error.status = 404;
      return next(error);
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (title !== undefined || content !== undefined) {
      note.embedding = await generateEmbedding(
        `TITLE: ${note.title}. CONTENT: ${note.content}`
      );
    }
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    const updatedNote = await note.save();

    const returnedNote = { ...updatedNote._doc };
    delete returnedNote.embedding;

    return res.status(200).json({
      error: false,
      message: "Note updated successfully",
      note: returnedNote,
    });
  } catch (err) {
    next(err);
  }
};

// Update note visibility (publish/unpublish)
export const togglePublicNote = async (req, res, next) => {
  const { isPublic } = req.body;
  const { noteId } = req.params;
  const userId = req.user._id;

  // Validate client's authorization
  if (!userId) {
    const error = new Error("Unauthorized - no user ID found");
    error.status = 401;
    return next(error);
  }

  try {
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { $set: { isPublic } },
      { new: true, select: "-embedding" }
    );

    if (!note) {
      const error = new Error("Note not found or unauthorized");
      error.status = 404;
      return next(error);
    }

    return res.status(200).json({
      error: false,
      message: `${note.isPublic ? "Publish" : "Unpublish"} the note already`,
      note,
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicNotesByUserId = async (req, res, next) => {
  const { userId } = req.params;

  if (!userId) {
    const error = new Error("User id not found");
    error.status = 400;
    return next(error);
  }

  const { page, limit } = parsePaginationParams(req.query);

  try {
    // Filter conditions
    const filter = { userId, isPublic: true };

    const [user, total, notes] = await Promise.all([
      User.findById(userId).select("fullName email -_id"),
      Note.countDocuments(filter),
      Note.find(filter)
        .select("-embedding")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    return res.status(200).json({
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
};

export const answerQuestionByAI = async (req, res, next) => {
  const { userId } = req.params;
  const { question } = req.body;

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

    return res.status(200).json({
      error: false,
      answer: response.choices[0].message.content.trim(),
    });
  } catch (err) {
    next(err);
  }
};
