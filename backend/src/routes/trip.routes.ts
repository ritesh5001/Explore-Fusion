import { Router } from 'express';
import { createTrip, joinTrip, listTrips } from '../controllers/trip.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const tripRouter = Router();

tripRouter.get('/', requireAuth, listTrips);
tripRouter.post('/', requireAuth, createTrip);
tripRouter.post('/:tripId/join', requireAuth, joinTrip);
