import request from "supertest";
import type { Express } from "express";

const API_PREFIX = "/api/v1";

export const api = (app: Express) => {
  return {
    get: (path: string) => request(app).get(`${API_PREFIX}${path}`),
    post: (path: string) => request(app).post(`${API_PREFIX}${path}`),
    put: (path: string) => request(app).put(`${API_PREFIX}${path}`),
    patch: (path: string) => request(app).patch(`${API_PREFIX}${path}`),
    delete: (path: string) => request(app).delete(`${API_PREFIX}${path}`),
  };
};
