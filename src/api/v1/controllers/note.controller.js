import Note from "../models/note.model.js";

export const createNote = async (req, res, next) => {
  const { title, content, tags = [] } = req.body;
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
    const note = await Note.create({ title, content, tags, userId });

    return res.status(201).json({
      error: false,
      message: "Note created successfully",
      note,
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

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limitRaw = parseInt(req.query.limit, 10) || 10;
  const limit = Math.min(Math.max(1, limitRaw), 100);
  const q = (req.query.q || "").toString().trim();

  try {
    // Filter conditions
    const filter = { userId: userId };
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
    const note = await Note.findOne({ _id: noteId, userId: userId });

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
    const note = await Note.findOne({ _id: noteId, userId: userId });

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
    const note = await Note.findOne({ _id: noteId, userId: userId });

    if (!note) {
      const error = new Error("Note not found");
      error.status = 404;
      return next(error);
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    const updatedNote = await note.save();

    return res.status(200).json({
      error: false,
      message: "Note updated successfully",
      note: updatedNote,
    });
  } catch (err) {
    next(err);
  }
};

