import { Request, Response, NextFunction, RequestHandler } from "express";
import { TypedRequest } from "../types/express.js";

export function typedRequestHandler<P = {}, R = {}, B = {}, Q = {}>(
  handler: (
    req: TypedRequest<P, R, B, Q>,
    res: Response,
    next: NextFunction
  ) => any
): RequestHandler {
  return (req, res, next) =>
    handler(req as TypedRequest<P, R, B, Q>, res, next);
}
