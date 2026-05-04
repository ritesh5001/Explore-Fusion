import { Router } from 'express';
import { getAdminSummary, listAdminUsers, updateUserModeration } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/admin.js';

export const adminRouter = Router();

adminRouter.use(requireAdmin);
adminRouter.get('/summary', getAdminSummary);
adminRouter.get('/users', listAdminUsers);
adminRouter.patch('/users/:userId/moderation', updateUserModeration);
