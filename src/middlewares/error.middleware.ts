import type { NextFunction, Request, Response } from 'express';

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Error interno del servidor.' });
}
