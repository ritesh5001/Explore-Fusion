import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env.js';

export interface JwtPayload {
  userId: string;
}

export function signAccessToken(userId: Types.ObjectId | string) {
  return jwt.sign({ userId: userId.toString() }, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
