import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signUp = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    const error = new Error("All fields are required for signup");
    error.status = 400;
    return next(error);
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser && !existingUser.deleted) {
      const error = new Error("Email already in use!");
      error.status = 409;
      return next(error);
    }

    if (existingUser && existingUser.deleted) {
      existingUser.fullName = fullName;
      existingUser.password = password;
      existingUser.deleted = false;
      existingUser.deletedAt = null;

      await existingUser.save();

      const newUser = { ...existingUser._doc };
      delete newUser.password;

      return res.status(200).json({
        error: false,
        message: "Account reactivated successfully",
        user: newUser,
      });
    }

    const user = await User.create({ fullName, email, password });

    // `_doc` property helps to skip instantiating a full Mongoose document
    // and just get plain JavaScript object of data
    const newUser = { ...user._doc };
    delete newUser.password;

    return res.status(201).json({
      error: false,
      message: "Create a new user successfully",
      user: newUser,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.status = 400;
    return next(error);
  }

  try {
    const user = await User.findOne({ email, deleted: false });

    if (!user) {
      const error = new Error("Invalid credentials!");
      error.status = 401;
      return next(error);
    }

    // Validate password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      const error = new Error("Invalid credentials!");
      error.status = 401;
      return next(error);
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
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

    return res.status(200).json({
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
};

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    const error = new Error("Token is required");
    error.status = 401;
    return next(error);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return res.status(200).json({
      error: false,
      message: "Token is valid",
      userId: decoded.userId,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Clear token in cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({
      error: false,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req, res, next) => {
  const userId = req.user._id;

  // Validate client's authorization
  if (!userId) {
    const error = new Error("Unauthorized - no user ID found");
    error.status = 401;
    return next(error);
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { deleted: true, deletedAt: new Date() } },
      { new: true } // return the updated document
    );

    if (!updatedUser) {
      const error = new Error("User not found");
      error.status = 404;
      return next(error);
    }

    // Clear token in cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({
      error: false,
      message: "User soft-deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
