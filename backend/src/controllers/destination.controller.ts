import { Request, Response } from 'express';
import { indianDestinations } from '../services/destinations.js';

export function listDestinations(req: Request, res: Response) {
  const query = String(req.query.q ?? '').trim().toLowerCase();
  const destinations = query
    ? indianDestinations.filter((destination) => destination.toLowerCase().includes(query))
    : indianDestinations;

  res.json({
    destinations
  });
}
