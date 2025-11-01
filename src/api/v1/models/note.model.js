import { Schema, model } from "mongoose";

const noteSchema = new Schema(
  {
    title: { type: String, require: true },
    content: { type: String, require: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    // userId: { type: Schema.Types.ObjectId, ref: "User", require: true },
    userId: { type: String, require: true },
  },
  { timestamps: true }
);

const Note = model("Note", noteSchema);

export default Note;
