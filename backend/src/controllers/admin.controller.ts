import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User.js';
import { sanitizeUser } from './auth.controller.js';

const accountStatusSchema = z.enum(['pending', 'approved', 'rejected', 'suspended']);

const moderationSchema = z.object({
  accountStatus: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
  verificationStatus: z.enum(['not-submitted', 'pending', 'approved', 'rejected']).optional(),
  photoVerificationStatus: z.enum(['not-submitted', 'pending', 'approved', 'rejected']).optional(),
  rejectionReason: z.string().max(300).optional(),
  adminNote: z.string().max(300).optional()
});

export async function getAdminSummary(_req: Request, res: Response) {
  const [totalUsers, pendingAccounts, pendingPhotos, pendingVerification, approvedAccounts] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      onboardingCompleted: true,
      $or: [{ accountStatus: 'pending' }, { accountStatus: { $exists: false } }]
    }),
    User.countDocuments({ photoVerificationStatus: 'pending' }),
    User.countDocuments({ verificationStatus: 'pending' }),
    User.countDocuments({ accountStatus: 'approved' })
  ]);

  res.json({
    totalUsers,
    pendingAccounts,
    pendingPhotos,
    pendingVerification,
    approvedAccounts
  });
}

export async function listAdminUsers(req: Request, res: Response) {
  const status = accountStatusSchema.safeParse(req.query.status);
  const query = status.success ? { accountStatus: status.data } : {};
  const users = await User.find(query)
    .sort({ updatedAt: -1 })
    .limit(100);

  res.json({
    users: users.map((user) => sanitizeUser(user))
  });
}

export async function updateUserModeration(req: Request, res: Response) {
  const input = moderationSchema.parse(req.body);
  const existing = await User.findById(req.params.userId);

  if (!existing) {
    return res.status(404).json({ message: 'User not found' });
  }

  const verificationStatus = input.verificationStatus ?? existing.verificationStatus;
  const photoVerificationStatus = input.photoVerificationStatus ?? existing.photoVerificationStatus;

  existing.set({
    ...input,
    isVerified: verificationStatus === 'approved' && photoVerificationStatus === 'approved',
    verificationSubmission: {
      ...existing.verificationSubmission,
      reviewedAt: new Date(),
      rejectionReason: input.rejectionReason
    }
  });

  await existing.save();

  res.json({
    user: sanitizeUser(existing)
  });
}
