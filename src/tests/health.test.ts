import app from "../app.js";
import { describe, expect, it } from "vitest";
import { api } from "./setup/request.js";

describe("GET /health", () => {
  it("should return API health status", async () => {
    const response = await api(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/api is healthy/i);
  });
});
