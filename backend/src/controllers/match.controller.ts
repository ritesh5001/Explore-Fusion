import { Request, Response } from 'express';
import { z } from 'zod';
import { isDatabaseConnected } from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Match } from '../models/Match.js';
import { Swipe } from '../models/Swipe.js';
import { User } from '../models/User.js';
import { demoProfiles } from '../services/demoData.js';
import { calculateCompatibilityScore } from '../services/matching.service.js';

const swipeSchema = z.object({
  targetUserId: z.string(),
  action: z.enum(['left', 'right', 'super']),
  compatibilityScore: z.number().min(0).max(100).default(0)
});

export async function discover(req: Request, res: Response) {
  if (!isDatabaseConnected()) {
    return res.json({ profiles: demoProfiles });
  }

  const userId = (req as AuthenticatedRequest).userId;

  if (!userId) {
    return res.json({ profiles: demoProfiles });
  }

  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return res.json({ profiles: demoProfiles });
  }

  const swipedTargets = await Swipe.find({ swiper: userId }).distinct('target');
  const candidates = await User.find({ _id: { $nin: [userId, ...swipedTargets] } }).limit(50);
  const profiles = candidates
    .map((candidate) => ({
      id: candidate._id,
      name: candidate.name,
      homeCity: candidate.homeCity,
      bio: candidate.bio,
      travelStyle: candidate.travelStyle,
      interests: candidate.interests,
      languages: candidate.languages,
      budgetMin: candidate.budgetMin,
      budgetMax: candidate.budgetMax,
      dreamDestinations: candidate.dreamDestinations,
      isVerified: candidate.isVerified,
      trustScore: candidate.trustScore,
      compatibilityScore: calculateCompatibilityScore(currentUser, candidate)
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  res.json({ profiles });
}

export async function swipe(req: AuthenticatedRequest, res: Response) {
  const input = swipeSchema.parse(req.body);

  if (!req.userId) {
    return res.status(401).json({ message: 'Missing user' });
  }

  const swipeDoc = await Swipe.findOneAndUpdate(
    { swiper: req.userId, target: input.targetUserId },
    {
      swiper: req.userId,
      target: input.targetUserId,
      action: input.action,
      compatibilityScore: input.compatibilityScore
    },
    { upsert: true, new: true }
  );

  let match = null;
  if (input.action === 'right' || input.action === 'super') {
    const reciprocal = await Swipe.findOne({
      swiper: input.targetUserId,
      target: req.userId,
      action: { $in: ['right', 'super'] }
    });

    if (reciprocal) {
      match = await Match.findOneAndUpdate(
        { users: { $all: [req.userId, input.targetUserId] } },
        {
          users: [req.userId, input.targetUserId],
          status: 'matched',
          compatibilityScore: Math.max(input.compatibilityScore, reciprocal.compatibilityScore),
          matchedAt: new Date()
        },
        { upsert: true, new: true }
      );
    }
  }

  res.status(201).json({ swipe: swipeDoc, match });
}

export async function listMatches(req: AuthenticatedRequest, res: Response) {
  const matches = await Match.find({ users: req.userId, status: 'matched' })
    .populate('users', 'name photos homeCity travelStyle isVerified trustScore')
    .sort({ matchedAt: -1 });

  res.json({ matches });
}
