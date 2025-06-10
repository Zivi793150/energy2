import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  addRating,
  initializeProducts,
  getSimilarProducts,
  getFlavors
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Публичные маршруты
router.get('/', getProducts);
router.get('/top', getTopProducts);
router.get('/flavors', getFlavors);
router.get('/:id', getProduct);
router.get('/:id/similar', getSimilarProducts);

// Защищенные маршруты
router.post('/:id/rate', protect, addRating);

// Административные маршруты
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

// Маршрут для инициализации (только для разработки)
router.post('/initialize', initializeProducts);

export default router; 