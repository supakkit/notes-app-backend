const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  credentials: true, // allow cookies to be sent
};

export default corsOptions;