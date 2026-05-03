import { Router } from 'express';
import { discover, listMatches, swipe } from '../controllers/match.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const matchRouter = Router();

matchRouter.get('/discover', discover);
matchRouter.post('/swipe', requireAuth, swipe);
matchRouter.get('/matches', requireAuth, listMatches);
