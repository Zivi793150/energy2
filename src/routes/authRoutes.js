import express from 'express';
import authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

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
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    if (!user) {
      console.error('Пользователь не найден при получении избранного:', req.user._id);
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    console.log('Избранные товары, отправляемые с сервера:', JSON.stringify(user.favorites, null, 2));
    res.json(user.favorites);
  } catch (error) {
    console.error('Ошибка при получении избранного:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении избранного', error: error.message });
  }
});

// Добавить товар в избранное
router.post('/favorites/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('Пользователь не найден при добавлении в избранное:', req.user._id);
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const productId = req.params.productId;
    if (!productId) {
      console.error('ID продукта не указан при добавлении в избранное');
      return res.status(400).json({ message: 'ID продукта обязателен' });
    }

    // Проверяем существование продукта
    const product = await Product.findById(productId);
    if (!product) {
      console.error('Продукт не найден при добавлении в избранное:', productId);
      return res.status(404).json({ message: 'Продукт не найден' });
    }

    // Проверяем, нет ли уже этого товара в избранном
    if (user.favorites.includes(productId)) {
      console.log('Товар уже в избранном:', productId);
      return res.json(user.favorites);
    }

    user.favorites.push(productId);
    console.log('Пользователь перед сохранением:', { 
      id: user._id, 
      email: user.email, 
      name: user.name, 
      favoritesCount: user.favorites.length 
    });
    
    await user.save();
    console.log('Товар успешно добавлен в избранное:', productId);
    res.json(user.favorites);
  } catch (error) {
    console.error(`Ошибка при добавлении товара ${req.params.productId} в избранное:`, error);
    res.status(500).json({ message: 'Ошибка сервера при добавлении в избранное', error: error.message });
  }
});

// Удалить товар из избранного
router.delete('/favorites/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('Пользователь не найден при удалении из избранного:', req.user._id);
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const productId = req.params.productId;
    if (!productId) {
      console.error('ID продукта не указан при удалении из избранного');
      return res.status(400).json({ message: 'ID продукта обязателен' });
    }

    // Проверяем, есть ли товар в избранном
    if (!user.favorites.includes(productId)) {
      console.log('Товар не найден в избранном:', productId);
      return res.json(user.favorites);
    }

    user.favorites = user.favorites.filter(id => id.toString() !== productId);
    console.log('Пользователь перед сохранением:', { 
      id: user._id, 
      email: user.email, 
      name: user.name, 
      favoritesCount: user.favorites.length 
    });
    
    await user.save();
    console.log('Товар успешно удален из избранного:', productId);
    res.json(user.favorites);
  } catch (error) {
    console.error(`Ошибка при удалении товара ${req.params.productId} из избранного:`, error);
    res.status(500).json({ message: 'Ошибка сервера при удалении из избранного', error: error.message });
  }
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