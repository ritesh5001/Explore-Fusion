import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/profile.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const profileRouter = Router();

profileRouter.get('/me', requireAuth, getProfile);
profileRouter.put('/me', requireAuth, updateProfile);
