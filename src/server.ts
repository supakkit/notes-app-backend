import app from "./app.js";
import connectMongo from "./config/mongo.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectMongo();

    app.listen(PORT, () => {
      console.log(`Notes App Server running on Port: ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
