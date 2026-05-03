import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { signAccessToken } from '../utils/jwt.js';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  homeCity: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const existing = await User.findOne({ email: input.email });

  if (existing) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    phone: input.phone,
    homeCity: input.homeCity,
    interests: [],
    languages: ['English'],
    dreamDestinations: []
  });

  res.status(201).json({
    token: signAccessToken(user._id),
    user: sanitizeUser(user)
  });
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const user = await User.findOne({ email: input.email });

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    token: signAccessToken(user._id),
    user: sanitizeUser(user)
  });
}

export function sanitizeUser(user: { toObject: () => Record<string, unknown> }) {
  const data = user.toObject();
  delete data.passwordHash;
  return data;
}
