import app from "./app.js";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // await connectMongoDB();
    
    app.listen(PORT, () => {
      console.log(`Notes App Server running on Port: ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
