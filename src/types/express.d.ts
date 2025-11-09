import { Request } from "express";
import mongoose from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: mongoose.Types.ObjectId;
    };
  }
}

export interface TypedRequest<P = {}, R = {}, B = {}, Q = {}> extends Request{
  validatedParams: P;
  validatedBody: B;
  validatedQuery: Q;
  user?: { _id: mongoose.Types.ObjectId };
}
