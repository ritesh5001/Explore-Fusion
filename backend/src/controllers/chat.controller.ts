import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Message } from '../models/Message.js';

const messageSchema = z.object({
  body: z.string().min(1),
  type: z.enum(['text', 'photo', 'voice', 'location', 'document']).default('text')
});

export async function listMessages(req: AuthenticatedRequest, res: Response) {
  const matchId = String(req.params.matchId);
  const messages = await Message.find({ match: matchId }).sort({ createdAt: 1 }).limit(100);
  res.json({ messages });
}

export async function sendMessage(req: AuthenticatedRequest, res: Response) {
  const input = messageSchema.parse(req.body);

  if (!req.userId) {
    return res.status(401).json({ message: 'Missing user' });
  }

  const message = await Message.create({
    match: String(req.params.matchId),
    sender: req.userId,
    ...input
  });

  res.status(201).json({ message });
}
