import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;

export const startMongoServer = async () => {
  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  await mongoose.connect(uri);
};

export const cleanUpCollections = async () => {
  // Clean up collections after each test
  const collections = (await mongoose.connection.db?.collections()) || [];
  for (const collection of collections) {
    await collection.deleteMany({});
  }
};

export const stopMongoServer = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongo.stop();
};
