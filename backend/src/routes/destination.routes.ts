import { Router } from 'express';
import { listDestinations } from '../controllers/destination.controller.js';

export const destinationRouter = Router();

destinationRouter.get('/', listDestinations);
