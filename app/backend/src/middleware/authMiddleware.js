import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Middleware для проверки аутентификации
export const protect = async (req, res, next) => {
  try {
    let token;

    // Проверяем наличие токена в заголовке
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Не авторизован' });
    }

    try {
      // Проверяем токен
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Находим пользователя
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Пользователь не найден' });
      }

      // Добавляем пользователя в объект запроса
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Неверный токен' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Middleware для проверки прав администратора
export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Требуются права администратора' });
  }
}; 