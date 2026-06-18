import express from 'express';
import { 
  createReservation, 
  getCustomerReservations, 
  getPharmacyReservations, 
  updateReservationStatus, 
  downloadReceipt 
} from '../controllers/reservation.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('customer'), createReservation);
router.get('/customer', protect, restrictTo('customer'), getCustomerReservations);
router.get('/pharmacy', protect, restrictTo('owner'), getPharmacyReservations);
router.patch('/:id/status', protect, updateReservationStatus);
router.get('/:id/receipt', protect, downloadReceipt);

export default router;
