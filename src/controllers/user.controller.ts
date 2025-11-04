import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Response, NextFunction, RequestHandler } from "express";
import { CreateUserBody, LoginBody } from "../validators/user.validator.js";
import { CustomJwtPayload } from "../types/jwt.js";
import { TypedRequest } from "../types/express.js";
import { typedRequestHandler } from "../utils/typedRequestHandler.js";

export const signUp = typedRequestHandler<{}, {}, CreateUserBody>(
  async (req, res, next): Promise<void> => {
    const { fullName, email, password } = req.validatedBody;

    try {
      const existingUser = await User.findOne({ email });

      if (existingUser && !existingUser.isDeleted) {
        const error: CustomError = new Error("Email already in use!");
        error.status = 409;
        return next(error);
      }

      if (existingUser && existingUser.isDeleted) {
        existingUser.fullName = fullName;
        existingUser.password = password;
        existingUser.isDeleted = false;
        existingUser.deletedAt = null;

        await existingUser.save();

        const { password: _pw, ...restoredUser } = existingUser.toObject();

        res.status(200).json({
          error: false,
          message: "Account reactivated successfully",
          user: restoredUser,
        });
        return;
      }

      const user = await User.create({ fullName, email, password });

      const { password: _pw, ...newUser } = user.toObject();

      res.status(201).json({
        error: false,
        message: "Create a new user successfully",
        user: newUser,
      });
    } catch (err) {
      next(err);
    }
  }
);

export const login = typedRequestHandler<{}, {}, LoginBody>(
  async (req, res, next): Promise<void> => {
    const { email, password } = req.validatedBody;

    try {
      const user = await User.findOne(
        { email, isDeleted: false },
        { password: 1 }
      );

      if (!user) {
        const error: CustomError = new Error("Invalid credentials!");
        error.status = 401;
        return next(error);
      }

      // Validate password
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        const error: CustomError = new Error("Invalid credentials!");
        error.status = 401;
        return next(error);
      }

      // Generate token
      const secret = process.env.JWT_SECRET as jwt.Secret;
      const token = jwt.sign({ userId: user._id }, secret, {
        expiresIn: "3h",
      });

      // Set token in cookie
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // only send over HTTPS in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        maxAge: 3 * 60 * 60 * 1000, // 3 hour
      });

      res.status(200).json({
        error: false,
        message: "Login successfully",
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

export const verifyToken: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    const error: CustomError = new Error("Token is required");
    error.status = 401;
    return next(error);
  }

  try {
    // Verify token
    const secret = process.env.JWT_SECRET as jwt.Secret;
    const decoded = jwt.verify(token, secret) as CustomJwtPayload;

    res.status(200).json({
      error: false,
      message: "Token is valid",
      userId: decoded.userId,
    });
  } catch (err) {
    next(err);
  }
};

export const logout: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    // Clear token in cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      error: false,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount: RequestHandler = async (
  req,
  res,
  next
): Promise<void> => {
  const userId = req.user?._id;

  if (!userId) {
    const error: CustomError = new Error("Unauthorized - no user ID found");
    error.status = 401;
    return next(error);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true } // return the updated document
    );

    if (!updatedUser) {
      const error: CustomError = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    // Clear token in cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      error: false,
      message: "User soft-deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
