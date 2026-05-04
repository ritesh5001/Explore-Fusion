import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Trip } from '../models/Trip.js';

const tripSchema = z.object({
  destination: z.string().min(2),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  tripType: z.enum(['solo_buddy', 'group']).default('solo_buddy'),
  maxMembers: z.number().int().min(2).max(20).default(2)
});

export async function listTrips(_req: AuthenticatedRequest, res: Response) {
  const trips = await Trip.find()
    .populate('creator', 'name photos homeCity isVerified')
    .populate('members', 'name photos homeCity isVerified')
    .sort({ startDate: 1 })
    .limit(40);
  res.json({ trips });
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

export async function joinTrip(req: AuthenticatedRequest, res: Response) {
  if (!req.userId) {
    return res.status(401).json({ message: 'Missing user' });
  }

  const trip = await Trip.findById(req.params.tripId);

  if (!trip) {
    return res.status(404).json({ message: 'Trip not found' });
  }

  if (!trip.members.some((member) => member.toString() === req.userId)) {
    if (trip.members.length >= trip.maxMembers) {
      return res.status(409).json({ message: 'Trip is full' });
    }

    trip.members.push(req.userId as never);
    await trip.save();
  }

  res.json({ trip });
}
