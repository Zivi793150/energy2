import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../../.env') });

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy_lab';
let isConnecting = false;

export const connectToMongoDB = async () => {
  try {
    if (isConnecting) {
      console.log('Подключение уже в процессе, ожидаем...');
      for (let i = 0; i < 50; i++) {
        if (!isConnecting) break;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      if (mongoose.connection.readyState === 1) return mongoose.connection;
    }
    
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB уже подключен');
      return mongoose.connection;
    }
    
    console.log('Подключение к MongoDB...');
    isConnecting = true;
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 60000,
      family: 4,
      autoIndex: true,
      connectTimeoutMS: 15000,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    console.log('Connected to MongoDB successfully');
    
    try {
      await mongoose.connection.db.admin().ping();
      console.log('MongoDB ping успешен');
    } catch (pingError) {
      console.error('Ошибка при проверке соединения с MongoDB:', pingError);
      throw pingError;
    } finally {
      isConnecting = false;
    }
    
    return mongoose.connection;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    isConnecting = false;
    throw err;
  }
};

// Обработчики событий подключения
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
  setTimeout(() => {
    console.log('Автоматическая попытка переподключения после ошибки...');
    connectWithRetry(3);
  }, 3000);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  console.log('Попытка восстановить соединение с MongoDB...');
  setTimeout(() => connectWithRetry(3), 1000);
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

// Функция для подключения с повторными попытками
export const connectWithRetry = async (retryCount = 5, delay = 3000) => {
  try {
    const connection = await connectToMongoDB();
    
    try {
      const collections = await connection.db.listCollections().toArray();
      console.log('Доступные коллекции:', collections.map(c => c.name));
      return true;
    } catch (listError) {
      console.error('Ошибка при получении списка коллекций:', listError);
      throw listError;
    }
  } catch (err) {
    console.error(`MongoDB connection error (attempt ${6 - retryCount}/5):`, err);
    if (retryCount > 0) {
      console.log(`Повторная попытка подключения через ${delay/1000} секунды...`);
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(connectWithRetry(retryCount - 1, delay));
        }, delay);
      });
    } else {
      console.error('Все попытки подключения к MongoDB исчерпаны');
      return false;
    }
  }
}; 