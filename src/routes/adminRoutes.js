import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import adminController from '../controllers/adminController.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// Улучшенный обработчик ошибок для асинхронных функций
const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    console.error(`Ошибка в маршруте ${req.method} ${req.url}:`, error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        message: 'Ошибка сервера', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      next(error);
    }
  }
};

// Создание аккаунта администратора
router.post('/create-admin', asyncHandler(adminController.createAdmin));

// Изменение роли пользователя
router.put('/change-role', protect, isAdmin, asyncHandler(adminController.changeUserRole));

// Получение списка пользователей
router.get('/users', protect, isAdmin, asyncHandler(adminController.getAllUsers));

// Получение статистики
router.get('/dashboard', protect, isAdmin, asyncHandler(async (req, res) => {
  try {
    // Базовое количество пользователей и продуктов
    const usersCount = await User.countDocuments();
    const productsCount = await Product.countDocuments();
    
    // Статистика по пользователям
    const newUsersCount = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // За последние 30 дней
    });
    
    const adminUsersCount = await User.countDocuments({ role: 'admin' });
    const verifiedUsersCount = await User.countDocuments({ isVerified: true });
    
    // --- Новый расчет активности пользователей ---
    const allUsers = await User.find({}, { favorites: 1, ratings: 1 });
    let onlyRatings = 0;
    let onlyFavorites = 0;
    let both = 0;
    let neither = 0;
    allUsers.forEach(u => {
      const hasRatings = Array.isArray(u.ratings) && u.ratings.length > 0;
      const hasFavorites = Array.isArray(u.favorites) && u.favorites.length > 0;
      if (hasRatings && hasFavorites) both++;
      else if (hasRatings) onlyRatings++;
      else if (hasFavorites) onlyFavorites++;
      else neither++;
    });
    // --- Конец нового расчета ---
    
    // Статистика по продуктам
    const topRatedProducts = await Product.find()
      .sort({ ratingAvg: -1 })
      .limit(5)
      .select('name firm ratingAvg ratingCount');
    
    console.log('Топовые продукты:', JSON.stringify(topRatedProducts, null, 2));
    
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name firm createdAt');
    
    console.log('Недавние продукты:', JSON.stringify(recentProducts, null, 2));
    
    const productsByFlavor = await Product.aggregate([
      { $group: { _id: '$flavor', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('Продукты по вкусам:', JSON.stringify(productsByFlavor, null, 2));
    
    // Средний рейтинг по всем продуктам
    const avgRating = await Product.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$ratingAvg' } } }
    ]);
    
    console.log('Средний рейтинг:', JSON.stringify(avgRating, null, 2));
    
    res.json({
      usersCount,
      productsCount,
      userStats: {
        newUsers: newUsersCount,
        adminUsers: adminUsersCount,
        verifiedUsers: verifiedUsersCount,
        activityGroups: {
          onlyRatings,
          onlyFavorites,
          both,
          neither
        }
      },
      productStats: {
        topRated: topRatedProducts,
        recentlyAdded: recentProducts,
        byFlavor: productsByFlavor,
        averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 0
      }
    });
  } catch (error) {
    console.error('Ошибка при получении статистики:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}));

// Получение списка всех продуктов
router.get('/products', protect, isAdmin, asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении списка продуктов:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}));

// Добавление нового продукта
router.post('/products', protect, isAdmin, asyncHandler(async (req, res) => {
  try {
    const productData = { ...req.body };
    if (productData.image) {
      productData.image = encodeURI(productData.image);
    }
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Ошибка при добавлении продукта:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}));

// Обновление продукта
router.put('/products/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  try {
    const productData = { ...req.body };
    if (productData.image) {
      productData.image = encodeURI(productData.image);
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: productData },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Ошибка при обновлении продукта:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}));

// Удаление продукта
router.delete('/products/:id', protect, isAdmin, asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Продукт не найден' });
    }
    
    res.json({ message: 'Продукт успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении продукта:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}));

export default router; 