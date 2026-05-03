import { Router } from 'express';
import { listMessages, sendMessage } from '../controllers/chat.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const chatRouter = Router();

chatRouter.get('/:matchId/messages', requireAuth, listMessages);
chatRouter.post('/:matchId/messages', requireAuth, sendMessage);
