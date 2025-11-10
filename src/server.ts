import app from "./app.js";
import connectMongo from "./config/mongo.js";

const PORT = Number(process.env.PORT) || 4000;
const HOST = "0.0.0.0";

async function startServer() {
  try {
    await connectMongo();

    app.listen(PORT, HOST, () => {
      console.log(`Notes App Server running on Port: ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
