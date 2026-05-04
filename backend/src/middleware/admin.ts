import { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../utils/jwt.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Missing admin bearer token' });
  }

  try {
    const payload = verifyAdminToken(token);

    if (payload.role !== 'admin') {
      return res.status(401).json({ message: 'Admin access required' });
    }

    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired admin token' });
  }
}
