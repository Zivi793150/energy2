import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения из файла .env
dotenv.config({ path: join(__dirname, '../../.env') });

// Логируем переменные окружения (без паролей)
console.log('EMAIL_USER в контроллере:', process.env.EMAIL_USER);
console.log('JWT_SECRET настроен в контроллере:', !!process.env.JWT_SECRET);

// Создаем транспортер для отправки email
let transporter;
try {
  console.log('Настройка транспортера для отправки email');
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    debug: true // Включаем отладку
  });
  
  // Проверяем соединение
  transporter.verify(function(error, success) {
    if (error) {
      console.error('Ошибка при проверке транспортера:', error);
    } else {
      console.log('Транспортер готов к отправке писем');
    }
  });
  
  console.log('Транспортер настроен успешно');
} catch (error) {
  console.error('Ошибка при настройке транспортера:', error);
}

// Получение данных пользователя
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при получении данных пользователя', error: error.message });
  }
};

// Регистрация нового пользователя
const register = async (req, res) => {
  console.log('=== НАЧАЛО ОБРАБОТКИ РЕГИСТРАЦИИ ===');
  
  try {
    console.log('Запрос на регистрацию получен:', req.body);
    
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Отсутствует email или пароль');
      return res.status(400)
        .header('Content-Type', 'application/json')
        .send(JSON.stringify({ message: 'Необходимо указать email и пароль' }));
    }

    // Проверяем, существует ли пользователь
    console.log('Проверка существующего пользователя с email:', email);
    try {
      console.log('Состояние подключения MongoDB:', mongoose.connection.readyState);
      // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
      
      // Если нет подключения, пытаемся подключиться
      if (mongoose.connection.readyState !== 1) {
        console.log('Нет подключения к MongoDB, пытаемся подключиться...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy_lab', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          family: 4
        });
        console.log('Подключение установлено, новое состояние:', mongoose.connection.readyState);
      }
      
      // Проверяем, есть ли доступ к базе данных
      if (!mongoose.connection.db) {
        console.log('Нет доступа к базе данных, возможно подключение не завершено');
        return res.status(500).json({ message: 'Ошибка подключения к базе данных' });
      }
      
      // Теперь пробуем найти пользователя через модель
      console.log('Поиск пользователя через модель Mongoose...');
      const existingUser = await User.findOne({ email });
      console.log('Результат поиска через модель:', existingUser);
      
      if (existingUser) {
        console.log('Пользователь с таким email уже существует');
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
      }
    } catch (dbError) {
      console.error('Ошибка при поиске пользователя в базе данных:', dbError);
      console.error('Стек ошибки:', dbError.stack);
      return res.status(500).json({ message: 'Ошибка при проверке пользователя', error: dbError.message });
    }

    // Создаем нового пользователя
    console.log('Создание нового пользователя');
    try {
      // Проверяем подключение еще раз перед созданием пользователя
      if (mongoose.connection.readyState !== 1) {
        console.log('Нет подключения к MongoDB перед созданием пользователя, пытаемся подключиться...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy_lab', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 5000,
          family: 4
        });
        console.log('Подключение установлено, новое состояние:', mongoose.connection.readyState);
      }

      const user = new User({ email, password });
      
      // Генерируем код верификации
      console.log('Генерация кода верификации');
      const verificationCode = user.generateVerificationCode();
      console.log('Сохранение пользователя в базу данных');
      await user.save();
      console.log('Пользователь сохранен в базе данных');
      
      // Отправляем email с кодом верификации
      console.log('Отправка email с кодом верификации');
      let emailSent = false;
      try {
        if (transporter) {
          await transporter.sendMail({
            from: process.env.EMAIL_USER || 'noreply@example.com',
            to: email,
            subject: 'Подтверждение регистрации',
            html: `
              <h1>Добро пожаловать!</h1>
              <p>Ваш код подтверждения: <strong>${verificationCode}</strong></p>
              <p>Код действителен в течение 5 минут.</p>
            `
          });
          console.log('Email отправлен успешно');
          emailSent = true;
        } else {
          console.log('Транспортер не настроен, пропускаем отправку email');
        }
      } catch (emailError) {
        console.error('Ошибка при отправке email:', emailError);
        // Продолжаем выполнение, даже если email не отправлен
      }
      
      console.log('Регистрация успешна, формирование ответа');
      // Формируем полный ответ перед отправкой
      const responseData = { 
        message: 'Регистрация успешна. Проверьте вашу почту для подтверждения.',
        emailSent: emailSent,
        userId: user._id.toString()
      };
      
      console.log('Отправка ответа клиенту:', JSON.stringify(responseData));
      
      try {
        // Упрощаем ответ до строки, чтобы избежать проблем с JSON
        return res
          .status(201)
          .header('Content-Type', 'text/plain')
          .send('Регистрация успешна');
      } catch (responseError) {
        console.error('Ошибка при отправке ответа:', responseError);
        res.status(201).end();
      }
      
      console.log('=== КОНЕЦ ОБРАБОТКИ РЕГИСТРАЦИИ ===');
      return;
    } catch (userError) {
      console.error('Ошибка при создании пользователя:', userError);
      console.error('Стек ошибки:', userError.stack);
      return res.status(500).json({ message: 'Ошибка при создании пользователя', error: userError.message });
    }
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return res.status(500).json({ message: 'Ошибка при регистрации', error: error.message });
  }
};

// Подтверждение email
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email уже подтвержден' });
    }

    if (!user.verifyCode(code)) {
      return res.status(400).json({ message: 'Неверный или истекший код подтверждения' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.json({ message: 'Email успешно подтвержден' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при подтверждении email', error: error.message });
  }
};

// Повторная отправка кода подтверждения
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email уже подтвержден' });
    }

    const verificationCode = user.generateVerificationCode();
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Подтверждение регистрации',
      html: `
        <h1>Подтверждение регистрации</h1>
        <p>Ваш новый код подтверждения: <strong>${verificationCode}</strong></p>
        <p>Код действителен в течение 5 минут.</p>
      `
    });

    res.json({ message: 'Новый код подтверждения отправлен' });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка при отправке кода', error: error.message });
  }
};

// Вход пользователя
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Проверяем состояние подключения к MongoDB
    const mongooseState = mongoose.connection.readyState;
    console.log('Состояние подключения MongoDB при логине:', mongooseState);
    
    // Если нет подключения, пытаемся подключиться
    if (mongooseState !== 1) {
      console.log('Переподключение к MongoDB...');
      try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy_lab', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 15000, // Увеличиваем таймаут до 15 секунд
          socketTimeoutMS: 20000, // Увеличиваем таймаут сокета
          family: 4
        });
        console.log('Переподключение успешно, новое состояние:', mongoose.connection.readyState);
      } catch (connErr) {
        console.error('Не удалось подключиться к MongoDB:', connErr);
        return res.status(503).json({ message: 'Проблема подключения к базе данных. Пожалуйста, повторите позже.' });
      }
    }

    // Проверяем существование пользователя с увеличенным таймаутом
    const user = await User.findOne({ email }).maxTimeMS(15000);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    // Проверяем пароль
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    // Проверяем подтверждение email (если нужно)
    if (!user.isVerified) {
      // Если в разработке разрешаем вход без подтверждения
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ 
          message: 'Email не подтвержден',
          userId: user._id.toString()
        });
      }
    }

    // Добавляем данные о роли в payload токена
    // Генерируем токен
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role // Включаем роль в токен
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Логируем данные пользователя для отладки
    console.log('Вход пользователя:', {
      id: user._id,
      email: user.email,
      role: user.role,
      isAdmin: user.role === 'admin'
    });

    // Отправляем информацию о пользователе и токен
    // Убедимся, что включаем role в ответе
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Ошибка при входе в систему:', error);
    // Проверяем характер ошибки
    if (error.message && error.message.includes('buffering timed out')) {
      res.status(503).json({ 
        message: 'Превышено время ожидания базы данных. Пожалуйста, повторите позже.', 
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        message: 'Ошибка при входе в систему', 
        error: error.message 
      });
    }
  }
};

export default {
  getMe,
  register,
  verifyEmail,
  resendVerification,
  login
}; 