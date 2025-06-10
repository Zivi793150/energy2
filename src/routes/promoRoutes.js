import express from 'express';
import {
  getAllPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
  applyPromo
} from '../controllers/promoController.js';
import { protect as authenticateToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Пользовательские маршруты
router.post('/apply', applyPromo); // Позволяет применять промокоды без аутентификации

// Маршруты для администраторов
router.get('/', authenticateToken, isAdmin, getAllPromos);
router.get('/:id', authenticateToken, isAdmin, getPromoById);
router.post('/', authenticateToken, isAdmin, createPromo);
router.put('/:id', authenticateToken, isAdmin, updatePromo);
router.delete('/:id', authenticateToken, isAdmin, deletePromo);

export default router; 