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

// Обновляем пользователя до администратора напрямую
async function updateUserToAdmin(email) {
  try {
    console.log(`Поиск пользователя с email: ${email}`);
    const db = mongoose.connection.db;
    
    // Прямой запрос к коллекции пользователей
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.error(`Пользователь с email ${email} не найден.`);
      return false;
    }
    
    console.log('Найден пользователь:', {
      id: user._id,
      email: user.email,
      role: user.role || 'user',
      isVerified: user.isVerified
    });
    
    // Обновляем роль пользователя
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount === 1) {
      console.log(`Пользователь ${email} успешно обновлен до роли администратора.`);
      
      // Проверяем обновленного пользователя
      const updatedUser = await db.collection('users').findOne({ _id: user._id });
      console.log('Обновленные данные пользователя:', {
        id: updatedUser._id,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
      });
      
      return true;
    } else {
      console.log(`Пользователь ${email} не был обновлен. Возможно, уже имеет роль администратора.`);
      return false;
    }
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    return false;
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
    rl.question('Введите email пользователя для обновления до администратора: ', async (email) => {
      try {
        const success = await updateUserToAdmin(email);
        
        if (success) {
          console.log('Операция успешно выполнена.');
        } else {
          console.log('Не удалось выполнить операцию.');
        }
        
        rl.close();
        process.exit(0);
      } catch (error) {
        console.error('Ошибка выполнения скрипта:', error);
        rl.close();
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('Ошибка выполнения скрипта:', error);
    process.exit(1);
  }
}

run(); 