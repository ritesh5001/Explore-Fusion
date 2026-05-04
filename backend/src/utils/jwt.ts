import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env.js';

export interface JwtPayload {
  userId: string;
}

export interface AdminJwtPayload {
  role: 'admin';
  email: string;
}

export function signAccessToken(userId: Types.ObjectId | string) {
  return jwt.sign({ userId: userId.toString() }, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function signAdminToken() {
  return jwt.sign({ role: 'admin', email: env.ADMIN_EMAIL } satisfies AdminJwtPayload, env.JWT_SECRET, {
    expiresIn: '12h'
  });
}

export function verifyAdminToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as AdminJwtPayload;
}
