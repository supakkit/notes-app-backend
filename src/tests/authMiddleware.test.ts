import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authUser } from "../middleware/auth.js";

describe("Auth Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockReq = { cookies: {} };
    mockRes = {};
    next = vi.fn();
  });

  it("should call next with no error if token is valid", async () => {
    mockReq.cookies = { accessToken: "validToken" };

    // Mock jwt.verify to return decoded payload
    vi.spyOn(jwt, "verify").mockReturnValue({ userId: "12345" } as any);

    await authUser(mockReq as Request, mockRes as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "validToken",
      process.env.JWT_SECRET as string
    );
    expect(mockReq.user?._id).toBe("12345");
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(); // no argument of error passed to the `next`
  });

  it("should call next with 401 error if token is missing", async () => {
    await authUser(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Access denied. No token.",
        status: 401,
      })
    );
  });

  it("should call next with 401 error if token is expired", async () => {
    mockReq.cookies = { accessToken: "expiredToken" };

    // Mock jwt throw expired token error
    const expiredError = new Error("jwt expired");
    expiredError.name = "TokenExpiredError";
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw expiredError;
    });

    await authUser(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Token has expired, please log in again.",
        status: 401,
      })
    );
  });

  it("should call next with 401 error if token verification fails", async () => {
    mockReq.cookies = { accessToken: "invalidToken" };

    // Mock jwt throw invalid token error
    const invalidError = new Error("invalid token");
    vi.spyOn(jwt, "verify").mockImplementation(() => {
      throw invalidError;
    });

    await authUser(mockReq as Request, mockRes as Response, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid token.",
        status: 401,
      })
    );
  });
});
