import User, { IUser } from "../models/user.model.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./setup/request.js";
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

const mockAuthFn = vi.hoisted(() =>
  vi.fn((req: Request, _res: Response, next: NextFunction) => {
    req.user = { _id: new mongoose.Types.ObjectId().toString() };
    next();
  })
);

vi.mock("../middleware/auth", () => ({
  authUser: mockAuthFn,
}));

import app from "../app.js";

describe("User Routes: POST /signup", () => {
  it("should create a new user successfully", async () => {
    const response = await api(app).post("/signup").send({
      fullName: "John Doe",
      email: "john@email.com",
      password: "password",
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty("fullName", "John Doe");
    expect(response.body.user).toHaveProperty("email", "john@email.com");

    // Check that the user exists in the database
    const user = await User.findOne({ email: "john@email.com" });
    expect(user).not.toBeNull();
    expect(user?.fullName).toBe("John Doe");
  });

  it("should fail if email already exists", async () => {
    await User.create({
      fullName: "John Doe",
      email: "john@email.com",
      password: "password",
    });

    const response = await api(app).post("/signup").send({
      fullName: "John Doe",
      email: "john@email.com",
      password: "password",
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/email already in use/i);
  });

  it("should fail if full name is missing", async () => {
    const response = await api(app).post("/signup").send({
      email: "john@email.com",
      password: "password",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/full name is required/i);
  });

  it("should fail if email is missing", async () => {
    const response = await api(app).post("/signup").send({
      fullName: "John Doe",
      password: "password",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Invalid email address./i);
  });

  it("should fail if password is missing", async () => {
    const response = await api(app).post("/signup").send({
      fullName: "John Doe",
      email: "john@email.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password is required/i);
  });
});

describe("User Routes: POST /login", () => {
  let user: Readonly<IUser>;
  beforeEach(async () => {
    user = await User.create({
      fullName: "John Doe",
      email: "john@email.com",
      password: "password",
    });
  });

  it("should login successfully with correct credentials", async () => {
    const response = await api(app).post("/login").send({
      email: "john@email.com",
      password: "password",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/login successfully/i);
    expect(response.body.user.email).toBe(user.email);
  });

  it("should fail login if email does not exist", async () => {
    const response = await api(app).post("/login").send({
      email: "nonexistent@email.com",
      password: "password",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid credentials/i);
  });

  it("should fail login if password is wrong", async () => {
    const response = await api(app).post("/login").send({
      email: "john@email.com",
      password: "wrongPassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid credentials/i);
  });

  it("should fail if email is missing", async () => {
    const response = await api(app).post("/login").send({
      password: "password",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/Invalid email address./i);
  });

  it("should fail if password is missing", async () => {
    const response = await api(app).post("/login").send({
      email: "john@email.com",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password is required/i);
  });
});

describe("User Routes: POST /logout", () => {
  it("should logout successfully and clear the accessToken cookie", async () => {
    const response = await api(app).post("/logout");

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/logged out successfully/i);

    // check the cookie
    const cookies = response.headers["set-cookie"] ?? [];
    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    expect(
      cookieArray.some((cookie) => cookie.startsWith("accessToken=;"))
    ).toBe(true);
  });
});

describe("User Routes: DELETE /delete-account (auth required)", () => {
  let createdUserId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    createdUserId = new mongoose.Types.ObjectId();
    await User.create({
      _id: createdUserId,
      fullName: "John Doe",
      email: "john@email.com",
      password: "password",
    });

    mockAuthFn.mockReset();

    mockAuthFn.mockImplementation((req, _res, next) => {
      req.user = { _id: createdUserId.toString() };
      next();
    });
  });

  it("should soft-delete account successfully when user is authenticated", async () => {
    const response = await api(app).delete("/delete-account");

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/user soft-deleted successfully/i);

    const deletedUser = await User.findById(createdUserId);
    expect(deletedUser?.isDeleted).toBe(true);
  });

  it("should fail with 401 error when user is not authenticated", async () => {
    mockAuthFn.mockImplementationOnce((req, _res, next) => {
      const err: any = new Error("Access denied. No token.");
      err.status = 401;
      next(err);
    });

    const response = await api(app).delete("/delete-account");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringMatching(/access denied/i)
    );

    const deletedUser = await User.findById(createdUserId);
    expect(deletedUser?.isDeleted).toBe(false);
  });
});

describe("User Routes: GET /profile (auth required)", async () => {
  let createdUserId: mongoose.Types.ObjectId;
  let user: Readonly<IUser>;

  beforeEach(async () => {
    createdUserId = new mongoose.Types.ObjectId();
    user = await User.create({
      _id: createdUserId,
      fullName: "John Doe",
      email: "john@email.com",
      password: "password",
    });

    mockAuthFn.mockReset();

    mockAuthFn.mockImplementation((req, _res, next) => {
      req.user = { _id: createdUserId.toString() };
      next();
    });
  });

  it("should get own user information when that user is authenticated", async () => {
    const response = await api(app).get("/profile");

    expect(response.status).toBe(200);
    expect(response.body.user.fullName).toBe(user.fullName);
    expect(response.body.user.email).toBe(user.email);
  });

  it("should fail with 401 error when user is not authenticated", async () => {
    mockAuthFn.mockImplementationOnce((req, _res, next) => {
      const err: any = new Error("Access denied. No token.");
      err.status = 401;
      next(err);
    });

    const response = await api(app).get("/profile");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringMatching(/access denied/i)
    );
  });
});
