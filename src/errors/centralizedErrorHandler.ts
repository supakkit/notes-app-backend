import { ErrorRequestHandler } from "express";

const centralizedErrorHandler: ErrorRequestHandler = async (
  err,
  req,
  res,
  next
): Promise<void> => {
  const statusCode = err.status || 500;
  if (statusCode >= 500 && process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  } else {
    console.error(err.message);
  }

  res.status(statusCode).json({
    error: true,
    status: statusCode,
    message: err.message || "Internal Server Error",
  });
};

export default centralizedErrorHandler;
