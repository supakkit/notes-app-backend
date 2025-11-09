import { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

export interface CustomJwtPayload extends JwtPayload {
  userId: mongoose.Types.ObjectId;
}
