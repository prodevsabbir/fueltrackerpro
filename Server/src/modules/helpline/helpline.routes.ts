import { Router } from 'express';
import { HelplineController } from './helpline.controller';
import { authGuard, allowRole, optionalAuth } from '../../middleware/auth.middleware';

const router = Router();

// Publicly accessible for anyone to send help requests
router.post('/create', optionalAuth as any, HelplineController.createRequest);

// Logged-in users can see their own requests
router.get('/my-requests', authGuard as any, HelplineController.getUserRequests);

// Admin only routes
router.get('/all', authGuard as any, allowRole('admin') as any, HelplineController.getAllRequests);
router.patch('/update/:id', authGuard as any, allowRole('admin') as any, HelplineController.updateRequestStatus);
router.delete('/:id', authGuard as any, allowRole('admin') as any, HelplineController.deleteRequest);

export const HelplineRoutes = router;
