import { Router } from 'express';
import { completeOnboarding, getProfile, updateProfile } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const profileRouter = Router();

profileRouter.get('/me', requireAuth, getProfile);
profileRouter.put('/me', requireAuth, updateProfile);
profileRouter.put('/onboarding', requireAuth, completeOnboarding);
