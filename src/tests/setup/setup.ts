import { beforeAll, afterAll, afterEach, vi } from "vitest";
import {
  cleanUpCollections,
  startMongoServer,
  stopMongoServer,
} from "./mongoMemoryServer.js";

beforeAll(async () => {
  await startMongoServer();
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(async () => {
  await cleanUpCollections();
});

afterAll(async () => {
  await stopMongoServer();
});
