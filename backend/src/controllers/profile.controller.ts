import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { sanitizeUser } from './auth.controller.js';

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say']).optional(),
  homeCity: z.string().optional(),
  bio: z.string().max(400).optional(),
  photos: z.array(z.string().url()).max(6).optional(),
  travelStyle: z.enum(['backpacker', 'budget', 'midrange', 'luxury']).optional(),
  interests: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  preferredDuration: z.string().optional(),
  companionPreference: z.string().optional(),
  dreamDestinations: z.array(z.string()).optional(),
  tripPlans: z
    .array(
      z.object({
        destination: z.string(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date()
      })
    )
    .optional()
});

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const user = await User.findById(req.userId);

  if (!user) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  res.json(sanitizeUser(user));
}

export async function updateProfile(req: AuthenticatedRequest, res: Response) {
  const input = profileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.userId, input, { new: true });

  if (!user) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  res.json(sanitizeUser(user));
}
