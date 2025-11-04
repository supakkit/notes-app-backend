import { Request, Response } from "express";

const notFoundErrorHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  res.status(404).json({
    error: true,
    status: 404,
    message: "Resource not found",
  });
};

export default notFoundErrorHandler;
