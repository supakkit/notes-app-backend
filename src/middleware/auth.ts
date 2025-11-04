import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { CustomJwtPayload } from "../types/jwt.js";

export const authUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies?.accessToken;

  if (!token) {
    const error: CustomError = new Error("Access denied. No token.");
    error.status = 401;
    return next(error);
  }

  try {
    const secret = process.env.JWT_SECRET as jwt.Secret;
    const decodedToken = jwt.verify(token, secret) as CustomJwtPayload;
    req.user = { _id: decodedToken.userId };
    next();
  } catch (err: any) {
    const isExpired = err.name === "TokenExpiredError";
    const error: CustomError = new Error(
      isExpired ? "Token has expired, please log in again." : "Invalid token."
    );
    error.status = 401;
    next(error);
  }
};
