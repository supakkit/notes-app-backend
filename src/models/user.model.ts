import { Schema, model, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    __v: { type: Number, select: false },
  },
  { timestamps: true }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = model<IUser>("User", userSchema);

export default User;
