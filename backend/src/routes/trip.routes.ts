import { Router } from 'express';
import { createTrip, listTrips } from '../controllers/trip.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const tripRouter = Router();

tripRouter.get('/', listTrips);
tripRouter.post('/', requireAuth, createTrip);
