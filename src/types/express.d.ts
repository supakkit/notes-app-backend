import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: string;
    };
  }
}

export interface TypedRequest<P = {}, R = {}, B = {}, Q = {}> extends Request{
  validatedParams: P;
  validatedBody: B;
  validatedQuery: Q;
  user?: { _id: string };
}
