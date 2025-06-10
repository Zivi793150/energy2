import express from 'express';
import {
  getPromos,
  getPromo,
  createPromo,
  updatePromo,
  deletePromo,
  validatePromo
} from '../controllers/promoController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Публичные маршруты
router.post('/validate', validatePromo);

// Административные маршруты
router.get('/', protect, admin, getPromos);
router.get('/:code', getPromo);
router.post('/', protect, admin, createPromo);
router.put('/:id', protect, admin, updatePromo);
router.delete('/:id', protect, admin, deletePromo);

export default router; 