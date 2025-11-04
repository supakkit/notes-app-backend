import { NextFunction, RequestHandler } from "express";
import { ZodType, infer as zInfer, ZodError } from "zod";
import { TypedRequest } from "../types/express.js";

// Generic middleware for validating `req.body`, `req.query`, and `req.params`
export const validateRequest =
  <
    P extends ZodType<any, any, any> | undefined = undefined,
    Q extends ZodType<any, any, any> | undefined = undefined,
    B extends ZodType<any, any, any> | undefined = undefined
  >(schemas: {
    params?: P;
    query?: Q;
    body?: B;
  }): RequestHandler =>
  async (req, res, next) => {
    try {
      // Validate params
      let validatedParams: P extends ZodType ? zInfer<P> : {} = {} as any;
      if (schemas.params) {
        const parsedParams = schemas.params?.safeParse(req.params);
        if (!parsedParams.success) throw parsedParams.error;
        validatedParams = parsedParams.data;
      }

      // Validate request body
      let validatedBody: B extends ZodType ? zInfer<B> : {} = {} as any;
      if (schemas.body) {
        const parsedBody = schemas.body.safeParse(req.body);
        if (!parsedBody.success) throw parsedBody.error;
        validatedBody = parsedBody.data;
      }

      // Validate query
      let validatedQuery: Q extends ZodType ? zInfer<Q> : {} = {} as any;
      if (schemas.query) {
        const parsedQuery = schemas.query.safeParse(req.query);
        if (!parsedQuery.success) throw parsedQuery.error;
        validatedQuery = parsedQuery.data;
      }

      // Attach validated properties
      Object.assign(req, {
        validatedParams,
        validatedQuery,
        validatedBody,
      });

      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.message || "Invalid request data";
        const error: CustomError = new Error(message);
        error.status = 400;
        return next(error);
      }

      next(err);
    }
  };

  