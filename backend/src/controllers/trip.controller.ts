import { Response } from 'express';
import { z } from 'zod';
import { isDatabaseConnected } from '../config/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Trip } from '../models/Trip.js';
import { demoTrips } from '../services/demoData.js';

const tripSchema = z.object({
  destination: z.string().min(2),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  tripType: z.enum(['solo_buddy', 'group']).default('solo_buddy'),
  maxMembers: z.number().int().min(2).max(20).default(2)
});

export async function listTrips(_req: AuthenticatedRequest, res: Response) {
  if (!isDatabaseConnected()) {
    return res.json({ trips: demoTrips });
  }

  const trips = await Trip.find().sort({ startDate: 1 }).limit(40);
  res.json({ trips: trips.length ? trips : demoTrips });
}

export async function createTrip(req: AuthenticatedRequest, res: Response) {
  const input = tripSchema.parse(req.body);

  if (!req.userId) {
    return res.status(401).json({ message: 'Missing user' });
  }

  const trip = await Trip.create({
    ...input,
    creator: req.userId,
    members: [req.userId]
  });

  res.status(201).json({ trip });
}
