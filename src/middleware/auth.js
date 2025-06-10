import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения из файла .env
dotenv.config({ path: join(__dirname, '../../.env') });

// Проверяем, что JWT_SECRET настроен
console.log('JWT_SECRET настроен в middleware:', !!process.env.JWT_SECRET);

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    try {
      console.log('Верификация токена с секретным ключом');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Токен верифицирован, поиск пользователя:', decoded.userId);
      console.log('Данные из токена:', decoded);
      
      // Проверяем состояние подключения к MongoDB
      const mongoose = await import('mongoose').then(m => m.default);
      const mongooseState = mongoose.connection.readyState;
      console.log('Состояние подключения MongoDB при защите маршрута:', mongooseState);
      
      if (mongooseState !== 1) {
        console.log('MongoDB не подключен при проверке аутентификации. Текущее состояние:', mongooseState);
        console.log('Попытка переподключения...');
        try {
          await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy_lab', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 15000, // Увеличиваем таймаут до 15 секунд
            socketTimeoutMS: 20000, // Увеличиваем таймаут сокета
            family: 4
          });
          console.log('Переподключение успешно');
        } catch (connErr) {
          console.error('Не удалось переподключиться к MongoDB:', connErr);
          return res.status(503).json({ message: 'Сервер временно недоступен. Пожалуйста, попробуйте позже.' });
        }
      }
      
      // Используем maxTimeMS для ограничения времени ожидания запроса (увеличиваем до 15 секунд)
      const user = await User.findById(decoded.userId).select('-password').maxTimeMS(15000);

      if (!user) {
        console.log('Пользователь не найден');
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      // Если роль указана в токене, но не в модели пользователя, обновим модель
      if (decoded.role && decoded.role === 'admin' && user.role !== 'admin') {
        console.log('Обновляем роль пользователя из токена:', decoded.role);
        user.role = decoded.role;
      }

      console.log('Пользователь найден:', {
        id: user._id,
        email: user.email,
        role: user.role
      });

      req.user = user;
      next();
    } catch (error) {
      console.error('Ошибка верификации токена:', error);
      
      // Проверяем, связана ли ошибка с подключением к базе данных
      if (error.name === 'MongooseServerSelectionError' || 
          error.message.includes('buffering timed out') ||
          error.message.includes('failed to connect')) {
        return res.status(503).json({ message: 'Сервер базы данных временно недоступен. Пожалуйста, попробуйте позже.' });
      }
      
      return res.status(401).json({ message: 'Неверный токен' });
    }
  } catch (error) {
    console.error('Ошибка в middleware protect:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const verified = async (req, res, next) => {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({ message: 'Email не подтвержден' });
    }
    next();
  } catch (error) {
    console.error('Ошибка в middleware verified:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
    }
    next();
  } catch (error) {
    console.error('Ошибка в middleware isAdmin:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
}; 