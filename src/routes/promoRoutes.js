import express from 'express';
import {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  applyPromo
} from '../controllers/promoController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Публичные маршруты
router.post('/apply', applyPromo);

// Защищенные маршруты (требуют авторизации и прав администратора)
router.use(protect, isAdmin);
router.get('/', getAllPromos);
router.get('/:id', getPromoById);
router.post('/', createPromo);
router.put('/:id', updatePromo);
router.delete('/:id', deletePromo);

export default router; 