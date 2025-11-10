import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "./setup/request.js";
import type { Request, Response, NextFunction } from "express";

const mockAuthFn = vi.hoisted(() => vi.fn());
const mockGenerateEmbedding = vi.hoisted(() => vi.fn());

vi.mock("../middleware/auth", () => ({
  authUser: mockAuthFn,
}));

vi.mock("../utils/generateEmbedding.js", () => ({
  default: mockGenerateEmbedding, // `generateEmbedding.js` use default export, then must provide mock with `default` key
}));

import app from "../app.js";
import mongoose from "mongoose";
import User, { IUser } from "../models/user.model.js";
import Note, { INote } from "../models/note.model.js";

const mockUserId = new mongoose.Types.ObjectId();
let mockUser: Readonly<IUser>;

beforeEach(async () => {
  mockUser = await User.create({
    _id: mockUserId,
    fullName: "John Doe",
    email: "john@email.com",
    password: "password",
  });

  // mock authenticated
  mockAuthFn.mockReset();
  mockAuthFn.mockImplementation(
    (req: Request, _res: Response, next: NextFunction) => {
      req.user = { _id: mockUserId };
      next();
    }
  );

  // mock embedding generator
  mockGenerateEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
});

describe("Note Routes: POST /notes", () => {
  it("should create a note successfully", async () => {
    const payload = {
      title: "Test Note",
      content: "This is a test note",
      tags: ["testing"],
      isPinned: false,
      isPublic: true,
    };

    const response = await api(app).post("/notes").send(payload);

    expect(response.status).toBe(201);
    expect(response.body.error).toBe(false);
    expect(response.body.message).toMatch(/note created successfully/i);
    expect(response.body.note.title).toBe(payload.title);
    expect(mockGenerateEmbedding).toHaveBeenCalledWith(
      expect.stringContaining(`TITLE: ${payload.title}`)
    );

    // check in database
    const note = await Note.findOne({ userId: mockUserId });
    expect(note).toBeTruthy();
    expect(note?.title).toBe(payload.title);
  });

  it("should fail with 401 error if no user authenticated", async () => {
    // override mock auth for this test
    mockAuthFn.mockImplementationOnce(
      (req: Request, _res: Response, next: NextFunction) => {
        const err: any = new Error("Access denied. No token.");
        err.status = 401;
        next(err);
      }
    );

    const payload = {
      title: "Unauthorized Note",
      content: "Should fail",
      tags: [],
      isPinned: false,
      isPublic: false,
    };

    const response = await api(app).post("/notes").send(payload);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringMatching(/access denied/i)
    );

    const nonExistentNote = await Note.findOne({ userId: mockUserId });
    expect(nonExistentNote).toBeNull();
  });

  it("should fail if title is missing", async () => {
    const payload = {
      content: "Should fail",
      tags: [],
      isPinned: false,
      isPublic: false,
    };

    const response = await api(app).post("/notes").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/title is required/i);
  });

  it("should fail if content is missing", async () => {
    const payload = {
      title: "Failed Note",
      tags: [],
      isPinned: false,
      isPublic: false,
    };

    const response = await api(app).post("/notes").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/content is required/i);
  });
});

describe("Note Routes: GET /notes", () => {
  it("should get own notes successfully", async () => {
    const mockNote = {
      userId: mockUserId,
      title: "Test Note",
      content: "This is a test note",
      tags: ["testing"],
      isPinned: false,
      isPublic: true,
      embedding: [0.1, 0.2, 0.3],
    };

    await Note.create(mockNote);

    const response = await api(app).get("/notes");

    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
    expect(response.body.message).toMatch(/notes retrieved successfully/i);
    expect(
      response.body.notes.some((note: INote) => note.title === mockNote.title)
    ).toBe(true);
  });

  it("should get own notes successfully with query params", async () => {
    const mockNote = {
      userId: mockUserId,
      title: "Test Note",
      content: "This is a test note",
      tags: ["testing"],
      isPinned: false,
      isPublic: true,
      embedding: [0.1, 0.2, 0.3],
    };

    await Note.create(mockNote);

    const response = await api(app).get("/notes?q=test");

    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
    expect(response.body.message).toMatch(/notes retrieved successfully/i);
    expect(
      response.body.notes.some(
        (note: INote) =>
          note.title.match(/test/i) ||
          note.content.match(/test/i) ||
          note.tags.join(", ").match(/test/i)
      )
    ).toBe(true);
  });

  it("should fail with 401 error if no user authenticated", async () => {
    // override mock auth for this test
    mockAuthFn.mockImplementationOnce(
      (req: Request, _res: Response, next: NextFunction) => {
        const err: any = new Error("Access denied. No token.");
        err.status = 401;
        next(err);
      }
    );

    const mockNote = {
      userId: mockUserId,
      title: "Test Note",
      content: "This is a test note",
      tags: ["testing"],
      isPinned: false,
      isPublic: true,
      embedding: [0.1, 0.2, 0.3],
    };

    await Note.create(mockNote);

    const response = await api(app).get("/notes");

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringMatching(/access denied/i)
    );
  });
});

describe("Note Routes: GET /notes/:noteId", () => {
  it("should get own specific note by note ID successfully", async () => {
    const mockNote = {
      userId: mockUserId,
      title: "Test Note",
      content: "This is a test note",
      tags: ["testing"],
      isPinned: false,
      isPublic: true,
      embedding: [0.1, 0.2, 0.3],
    };

    const newNote = await Note.create(mockNote);

    const response = await api(app).get(`/notes/${newNote._id}`);

    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
    expect(response.body.message).toMatch(/note retrieved successfully/i);
    expect(String(response.body.note._id)).toBe(String(newNote._id));
    expect(response.body.note.title).toBe(newNote.title);
  });

  it("should fail with 401 error if no user authenticated", async () => {
    // override mock auth for this test
    mockAuthFn.mockImplementationOnce(
      (req: Request, _res: Response, next: NextFunction) => {
        const err: any = new Error("Access denied. No token.");
        err.status = 401;
        next(err);
      }
    );

    const mockNote = {
      userId: mockUserId,
      title: "Test Note",
      content: "This is a test note",
      tags: ["testing"],
      isPinned: false,
      isPublic: true,
      embedding: [0.1, 0.2, 0.3],
    };

    const newNote = await Note.create(mockNote);

    const response = await api(app).get(`/notes/${newNote._id}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringMatching(/access denied/i)
    );
  });
});

describe("Note Routes: PATCH /notes/:noteId", () => {
  const mockNote = {
    userId: mockUserId,
    title: "Test Note",
    content: "This is a test note",
    tags: ["testing"],
    isPinned: false,
    isPublic: true,
    embedding: [0.1, 0.2, 0.3],
  };
  let newNote: Readonly<INote>;

  beforeEach(async () => {
    newNote = await Note.create(mockNote);
  });

  it("should update a note successfully", async () => {
    const payload = {
      title: "Updated Note",
    };

    const response = await api(app)
      .patch(`/notes/${newNote._id}`)
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
    expect(response.body.message).toMatch(/note updated successfully/i);
    expect(response.body.note.title).toBe(payload.title);

    // check in database
    const existingNote = await Note.findOne({ userId: mockUserId });
    expect(existingNote?.title).toBe(payload.title);
  });

  it("should fail with 401 error if no user authenticated", async () => {
    // override mock auth for this test
    mockAuthFn.mockImplementationOnce(
      (req: Request, _res: Response, next: NextFunction) => {
        const err: any = new Error("Access denied. No token.");
        err.status = 401;
        next(err);
      }
    );

    const payload = {
      title: "Updated Note",
    };

    const response = await api(app)
      .patch(`/notes/${newNote._id}`)
      .send(payload);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringMatching(/access denied/i)
    );

    const existingNote = await Note.findOne({ _id: newNote._id });
    expect(existingNote?.title).not.toBe(payload.title);
  });
});

describe("Note Routes: DELETE /notes/:noteId", () => {
  const mockNote = {
    userId: mockUserId,
    title: "Test Note",
    content: "This is a test note",
    tags: ["testing"],
    isPinned: false,
    isPublic: true,
    embedding: [0.1, 0.2, 0.3],
  };
  let newNote: Readonly<INote>;

  beforeEach(async () => {
    newNote = await Note.create(mockNote);
  });

  it("should delete a note successfully", async () => {
    const response = await api(app).delete(`/notes/${newNote._id}`);

    expect(response.status).toBe(200);
    expect(response.body.error).toBe(false);
    expect(response.body.message).toMatch(/note deleted successfully/i);

    // check in database
    const existingNote = await Note.findOne({ _id: newNote._id });
    expect(existingNote).toBeNull();
  });

  it("should fail with 401 error if no user authenticated", async () => {
    // override mock auth for this test
    mockAuthFn.mockImplementationOnce(
      (req: Request, _res: Response, next: NextFunction) => {
        const err: any = new Error("Access denied. No token.");
        err.status = 401;
        next(err);
      }
    );

    const response = await api(app).delete(`/notes/${newNote._id}`);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty(
      "message",
      expect.stringMatching(/access denied/i)
    );

    const existingNote = await Note.findOne({ _id: newNote._id });
    expect(existingNote).toBeTruthy();
  });
});