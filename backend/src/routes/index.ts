import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { chatRouter } from './chat.routes.js';
import { matchRouter } from './match.routes.js';
import { profileRouter } from './profile.routes.js';
import { tripRouter } from './trip.routes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/profile', profileRouter);
apiRouter.use('/match', matchRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use('/trips', tripRouter);
