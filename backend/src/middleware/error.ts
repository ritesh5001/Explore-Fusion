import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(error);

  if (error instanceof ZodError) {
    const firstIssue = error.issues[0];
    const path = firstIssue?.path?.join('.');
    const issueMessage = firstIssue?.message ?? 'Validation failed';
    const message = path ? `${path}: ${issueMessage}` : issueMessage;
    return res.status(400).json({ message });
  }

  const message = error instanceof Error ? error.message : 'Unexpected server error';
  res.status(500).json({ message });
}
