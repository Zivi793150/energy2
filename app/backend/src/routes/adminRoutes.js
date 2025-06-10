import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  initializeProducts
} from '../controllers/productController.js';

const router = express.Router();

// Все маршруты защищены middleware admin
router.use(protect, admin);

// Маршруты для управления продуктами
router.get('/products', getProducts);
router.get('/products/top', getTopProducts);
router.get('/products/:id', getProduct);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/initialize', initializeProducts);

export default router; 