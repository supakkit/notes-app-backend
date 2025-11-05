import { Schema, model, Document, Types } from "mongoose";

export interface INote extends Document {
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isPublic: boolean;
  userId: Types.ObjectId;
  embedding?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

const noteSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", require: true },
    embedding: { type: [Number], required: false, select: false },
  },
  { timestamps: true, versionKey: false }
);

const Note = model<INote>("Note", noteSchema);

export default Note;
