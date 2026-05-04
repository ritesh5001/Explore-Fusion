import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { sanitizeUser } from './auth.controller.js';

const reviewImageSchema = z.string().min(8).max(2_500_000);

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

const onboardingSchema = z.object({
  bio: z.string().min(20).max(400),
  travelStyle: z.enum(['backpacker', 'budget', 'midrange', 'luxury']),
  interests: z.array(z.string().min(2)).min(3).max(12),
  languages: z.array(z.string().min(2)).min(1).max(8),
  budgetMin: z.number().int().nonnegative(),
  budgetMax: z.number().int().nonnegative(),
  preferredDuration: z.enum(['weekend', '1-week', '2-weeks', '1-month', 'flexible']),
  companionPreference: z.enum(['solo-buddy', 'small-group', 'large-group']),
  dreamDestinations: z.array(z.string().min(2)).min(1).max(12),
  tripPlans: z
    .array(
      z.object({
        destination: z.string().min(2),
        startDate: z.coerce.date(),
        endDate: z.coerce.date()
      })
    )
    .min(1)
    .max(6),
  verificationSubmission: z.object({
    profilePhoto: reviewImageSchema,
    verificationSelfie: reviewImageSchema,
    idDocument: reviewImageSchema.optional(),
    note: z.string().max(300).optional()
  })
}).refine((input) => input.budgetMax >= input.budgetMin, {
  message: 'Budget max must be greater than or equal to budget min',
  path: ['budgetMax']
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
  const user = await User.findByIdAndUpdate(req.userId, input, { returnDocument: 'after' });

  if (!user) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  res.json(sanitizeUser(user));
}

export async function completeOnboarding(req: AuthenticatedRequest, res: Response) {
  const input = onboardingSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(
    req.userId,
    {
      ...input,
      onboardingCompleted: true,
      photos: [input.verificationSubmission.profilePhoto],
      accountStatus: 'pending',
      verificationStatus: input.verificationSubmission.idDocument ? 'pending' : 'not-submitted',
      photoVerificationStatus: 'pending',
      isVerified: false,
      verificationSubmission: {
        ...input.verificationSubmission,
        submittedAt: new Date(),
        reviewedAt: undefined,
        rejectionReason: undefined
      }
    },
    { returnDocument: 'after' }
  );

  if (!user) {
    return res.status(404).json({ message: 'Profile not found' });
  }

  res.json(sanitizeUser(user));
}
