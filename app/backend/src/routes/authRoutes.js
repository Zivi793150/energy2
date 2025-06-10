import express from 'express';
import { register, login, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Регистрация
router.post('/register', register);

// Вход
router.post('/login', login);

// Получение информации о текущем пользователе
router.get('/me', protect, getCurrentUser);

export default router; 