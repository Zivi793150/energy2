import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения из файла .env
dotenv.config({ path: join(__dirname, '../../.env') });

// Создаем интерфейс для чтения из консоли
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Подключаемся к MongoDB
async function connectToMongoDB() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy_lab';
    console.log('Подключение к MongoDB...');
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      family: 4
    });
    
    console.log('Успешное подключение к MongoDB');
    return true;
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    return false;
  }
}

// Импортируем модель пользователя
async function importUserModel() {
  try {
    const { default: User } = await import('../models/User.js');
    return User;
  } catch (error) {
    console.error('Ошибка импорта модели User:', error);
    throw error;
  }
}

// Создаем администратора
async function createAdmin(email, password) {
  try {
    const User = await importUserModel();
    
    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`Пользователь с email ${email} уже является администратором.`);
        return;
      } else {
        // Обновляем роль существующего пользователя
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`Пользователь с email ${email} повышен до роли администратора.`);
        return;
      }
    }
    
    // Создаем нового пользователя с ролью администратора
    const user = new User({
      email,
      password,
      role: 'admin',
      isVerified: true // Администратор сразу подтвержден
    });
    
    await user.save();
    console.log(`Администратор с email ${email} успешно создан.`);
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
  }
}

// Запускаем скрипт
async function run() {
  try {
    const connected = await connectToMongoDB();
    
    if (!connected) {
      console.error('Невозможно продолжить без подключения к базе данных.');
      process.exit(1);
    }
    
    // Запрашиваем email
    rl.question('Введите email администратора: ', (email) => {
      // Запрашиваем пароль
      rl.question('Введите пароль администратора: ', async (password) => {
        try {
          await createAdmin(email, password);
          rl.close();
          process.exit(0);
        } catch (error) {
          console.error('Ошибка выполнения скрипта:', error);
          rl.close();
          process.exit(1);
        }
      });
    });
  } catch (error) {
    console.error('Ошибка выполнения скрипта:', error);
    process.exit(1);
  }
}

run(); 