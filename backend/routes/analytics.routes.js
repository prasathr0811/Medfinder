import express from 'express';
import { 
  getOwnerAnalytics, 
  getAdminAnalytics, 
  getUsers, 
  toggleUserStatus, 
  getPharmacies 
} from '../controllers/analytics.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/owner', protect, restrictTo('owner'), getOwnerAnalytics);
router.get('/admin', protect, restrictTo('admin'), getAdminAnalytics);

// Admin-specific user/pharmacy administration
router.get('/admin/users', protect, restrictTo('admin'), getUsers);
router.patch('/admin/users/:id/status', protect, restrictTo('admin'), toggleUserStatus);
router.get('/admin/pharmacies', protect, restrictTo('admin'), getPharmacies);

export default router;
