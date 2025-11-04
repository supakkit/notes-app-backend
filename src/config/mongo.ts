import mongoose from "mongoose";

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
  throw new Error("Missing MongoDB URI in environment variables");
}

const connectMongo = async () => {
  try {
    // Connect to MongoDB via Mongoose
    await mongoose.connect(mongoURI);
    console.log("Connected to Mongo database ✅");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
};

export default connectMongo;
