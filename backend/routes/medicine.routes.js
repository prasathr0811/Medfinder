import express from 'express';
import { 
  searchMedicines, 
  getMedicineById, 
  addMedicine, 
  updateMedicine, 
  deleteMedicine, 
  registerPharmacy 
} from '../controllers/medicine.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', searchMedicines);
router.get('/:id', getMedicineById);

// Owner routes
router.post('/', protect, restrictTo('owner'), addMedicine);
router.put('/:id', protect, restrictTo('owner'), updateMedicine);
router.delete('/:id', protect, restrictTo('owner'), deleteMedicine);
router.post('/pharmacy', protect, restrictTo('owner'), registerPharmacy);

export default router;
