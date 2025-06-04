import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Улучшенный обработчик ошибок для асинхронных функций
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    console.log(`Начало выполнения маршрута ${req.method} ${req.url}`);
    await fn(req, res, next);
    console.log(`Завершение выполнения маршрута ${req.method} ${req.url}`);
  } catch (error) {
    console.error(`Ошибка в маршруте ${req.method} ${req.url}:`, error);
    
    // Проверяем, был ли уже отправлен ответ
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Ошибка сервера', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      console.error('Ответ уже был отправлен, не можем отправить ошибку');
      next(error);
    }
  }
};

// Получение данных пользователя
router.get('/me', protect, asyncHandler(authController.getMe));

// Регистрация
router.post('/register', asyncHandler(authController.register));

// Подтверждение email
router.post('/verify-email', asyncHandler(authController.verifyEmail));

// Повторная отправка кода подтверждения
router.post('/resend-verification', asyncHandler(authController.resendVerification));

// Добавляем маршрут для получения кода верификации (только для тестирования)
router.post('/get-code', asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email обязателен' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Пользователь уже подтвержден' });
    }
    
    if (!user.verificationCode || !user.verificationCode.code) {
      return res.status(404).json({ message: 'Код верификации не найден' });
    }
    
    // Проверяем, не истек ли срок действия кода
    if (user.verificationCode.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Срок действия кода истек' });
    }
    
    res.json({ 
      code: user.verificationCode.code,
      expiresAt: user.verificationCode.expiresAt
    });
  } catch (error) {
    console.error('Ошибка при получении кода верификации:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}));

// Вход
router.post('/login', asyncHandler(authController.login));

// Получить избранное пользователя
router.get('/favorites', protect, async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  res.json(user.favorites);
});

// Добавить товар в избранное
router.post('/favorites/:productId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.favorites.includes(req.params.productId)) {
    user.favorites.push(req.params.productId);
    await user.save();
  }
  res.json(user.favorites);
});

// Удалить товар из избранного
router.delete('/favorites/:productId', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.favorites = user.favorites.filter(
    id => id.toString() !== req.params.productId
  );
  await user.save();
  res.json(user.favorites);
});

// Обработчик ошибок
router.use((err, req, res, next) => {
  console.error('Ошибка в маршрутах auth:', err);
  
  // Проверяем, был ли уже отправлен ответ
  if (!res.headersSent) {
    res.status(500).json({ 
      message: 'Ошибка сервера', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  } else {
    console.error('Ответ уже был отправлен, передаем ошибку следующему обработчику');
    next(err);
  }
});

export default router; 