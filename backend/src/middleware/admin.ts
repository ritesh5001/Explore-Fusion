import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-admin-token'];

  if (!env.ADMIN_TOKEN) {
    return res.status(503).json({ message: 'Admin token is not configured' });
  }

  if (token !== env.ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Admin access required' });
  }

  return next();
}
