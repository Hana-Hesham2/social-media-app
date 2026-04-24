import { ZodType } from "zod";
import { AppError } from "../utils/globalErrorHandler";
import { Request, Response, NextFunction } from "express";

type reqType = "body" | "query" | "params";
type schemaType = Partial<Record<reqType, ZodType>>;

export const Validation = (schema: schemaType) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const validationError: string[] = [];

    for (const key of Object.keys(schema) as reqType[]) {
      if (!schema[key]) continue;

      const result = schema[key]!.safeParse(req[key]);

      if (!result.success) {
        validationError.push(result.error.message);
      }
    }

    if (validationError.length > 0) {
      return next(new AppError(JSON.parse(validationError as unknown as string ), 400));
    }

    next();
  };
};