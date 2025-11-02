import jwt from "jsonwebtoken";

export const authUser = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    const error = new Error("Access denied. No token.");
    error.status = 401;
    return next(error);
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decodedToken.userId };
    next();
  } catch (err) {
    const isExpired = err.name === "TokenExpiredError";
    const error = new Error(
      isExpired ? "Token has expired, please log in again." : "Invalid token."
    );
    error.status = 401;
    next(error);
  }
};
