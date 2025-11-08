import { beforeAll, afterAll, afterEach } from "vitest";
import {
  cleanUpCollections,
  startMongoServer,
  stopMongoServer,
} from "./mongoMemoryServer.js";

beforeAll(async () => {
  await startMongoServer();
});

afterEach(async () => {
  await cleanUpCollections();
});

afterAll(async () => {
  await stopMongoServer();
});
