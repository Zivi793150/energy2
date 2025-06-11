import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import promoRoutes from '../routes/promoRoutes.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Rating from '../models/Rating.js';
import Product from '../models/Product.js';
import Promo from '../models/Promo.js';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения из файла .env
dotenv.config({ path: join(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 5000;

// Настраиваем CORS
app.use(cors({
    origin: 'http://localhost:5173', // Указываем конкретный origin вместо массива
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Добавляем middleware для парсинга JSON
app.use(express.json());

// Добавляем middleware для обработки preflight запросов
app.options('*', cors());

// Устанавливаем заголовки безопасности и CORS для всех ответов
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // Указываем конкретный origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Content-Type', 'application/json; charset=utf-8');
    res.header('X-Content-Type-Options', 'nosniff');
    next();
});

// Добавляем middleware для логирования запросов
app.use((req, res, next) => {
    next();
});

// Переопределяем методы res.json и res.send для лучшего логирования

// Добавляем middleware для раздачи статических файлов
app.use('/uploads', express.static(join(__dirname, '../../uploads'), {
    setHeaders: (res, path) => {
        // Устанавливаем правильные заголовки для изображений
        if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
            res.set('Content-Type', 'image/jpeg');
        } else if (path.endsWith('.png')) {
            res.set('Content-Type', 'image/png');
        } else if (path.endsWith('.gif')) {
            res.set('Content-Type', 'image/gif');
        }
    }
}));

// Получаем URI для подключения к MongoDB
// Если вы используете MongoDB Atlas, строка подключения будет выглядеть примерно так:
// mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/energy-lab?retryWrites=true&w=majority
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy_lab';

// Экспортируем функцию для подключения, чтобы ее можно было использовать в других частях приложения
async function connectToMongoDB() {
    try {
        console.log('Попытка подключения к MongoDB...');
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // Увеличиваем таймаут до 30 секунд
            socketTimeoutMS: 45000, // Увеличиваем таймаут сокета
            connectTimeoutMS: 30000, // Увеличиваем таймаут подключения
            maxPoolSize: 10, // Максимальный размер пула соединений
            minPoolSize: 2, // Минимальный размер пула соединений
            retryWrites: true, // Повторные попытки записи
            retryReads: true, // Повторные попытки чтения
            heartbeatFrequencyMS: 10000 // Отправка heartbeat каждые 10 секунд
        });
        console.log('Успешное подключение к MongoDB.');
        return connection;
    } catch (error) {
        console.error('Ошибка подключения к MongoDB:', error.message);
        return null;
    }
}

// Функция для подключения с повторными попытками
const connectWithRetry = async (retryCount = 5, delay = 3000) => {
    try {
        console.log(`Попытка подключения к MongoDB (попытка ${6 - retryCount}/5)...`);
        const connection = await connectToMongoDB();
        if (!connection) {
            throw new Error('Не удалось подключиться к MongoDB');
        }
        
        // Проверка наличия коллекций
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Список коллекций получен.');
            
            // Проверяем наличие коллекции products
            const productsCollection = collections.find(c => c.name === 'products');
            if (productsCollection) {
                // Получаем количество документов в коллекции
                const count = await mongoose.connection.db.collection('products').countDocuments();
                console.log(`Коллекция products найдена, содержит ${count} документов.`);
            } else {
                console.log('Коллекция products не найдена.');
            }
            
            return true;
        } catch (listError) {
            console.error('Ошибка при получении списка коллекций:', listError);
            throw listError;
        }
    } catch (err) {
        console.error(`Ошибка подключения к MongoDB (попытка ${6 - retryCount}/5):`, err.message);
        if (retryCount > 0) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(connectWithRetry(retryCount - 1, delay));
                }, delay);
            });
        } else {
            console.error('Все попытки подключения к MongoDB исчерпаны. Проверьте настройки подключения.');
            return false;
        }
    }
};

// Обработка ошибок MongoDB
mongoose.connection.on('error', err => {
    console.error('MongoDB connection error:', err);
    // Пытаемся переподключиться при ошибке соединения
    setTimeout(() => {
        connectWithRetry(3);
    }, 3000);
});

mongoose.connection.on('disconnected', () => {
    // Пытаемся переподключиться при разрыве соединения
    setTimeout(() => connectWithRetry(3), 1000);
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose подключен к базе данных.');
});

// Добавляем обработчик ошибок для Express
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
});

// Маршруты для работы с рейтингами
import { protect } from '../middleware/auth.js';

// Запуск сервера
const startServer = async () => {
    console.log('Попытка подключения к базе данных...');
    const isConnected = await connectWithRetry();

    if (!isConnected) {
        console.error('Не удалось подключиться к базе данных. Сервер не будет запущен.');
        return;
    }
};

startServer();

mongoose.connection.once('open', () => {
  console.log('Mongoose подключен к базе данных. Запускаем сервер...');
  // Подключаем маршруты аутентификации
  app.use('/api/auth', authRoutes);

  // Подключаем маршруты администратора
  app.use('/api/admin', adminRoutes);

  // Подключаем маршруты промокодов
  app.use('/api/promos', promoRoutes);

  // Функция для преобразования русского названия вкуса в английский ключ
  function convertFlavorToKey(flavor) {
      const flavorMap = {
          'Классический': 'classic',
          'Тропический': 'tropic',
          'Ягодный': 'berry',
          'Цитрусовый': 'citrus',
          'Кола': 'cola',
          'Оригинальный': 'original',
          'Микс': 'mixed',
          'Экзотический': 'exotic',
          'Мятный': 'mint',
          'Вишневый': 'cherry',
          'Шоколадный': 'chocolate',
          'Другой': 'other'
      };
      
      return flavorMap[flavor] || 'other';
  }

  // Маршрут для получения топовых продуктов
  app.get('/api/products/top-rated', async (req, res) => {
      try {
          const limit = parseInt(req.query.limit) || 10;

          // Создаем индекс для оптимизации запроса, если его еще нет
          try {
              await mongoose.connection.db.collection('products').createIndex({ popularity: -1 });
          } catch (indexError) {
              console.warn('Не удалось создать индекс для популярности:', indexError.message);
          }

          // Получаем топ продукты напрямую из коллекции
          const products = await mongoose.connection.db
              .collection('products')
              .find({}, {
                  projection: {
                      _id: 1,
                      name: 1,
                      price: 1,
                      image: 1,
                      ratingAvg: 1,
                      ratingCount: 1,
                      flavor: 1,
                      firm: 1,
                      description: 1
                  }
              })
              .sort({ popularity: -1 })
              .limit(limit)
              .toArray();

          // Преобразуем путь к изображению в полный URL
          const productsWithFullImageUrls = products.map(product => ({
              ...product,
              image: product.image && typeof product.image === 'string' 
                     ? encodeURIComponent(product.image.split('\\').pop()) 
                     : null,
              flavor: product.flavor
          }));

          res.json({ products: productsWithFullImageUrls });
      } catch (error) {
          console.error('Ошибка при получении топовых продуктов:', error);
          res.status(500).json({ message: 'Ошибка при получении топовых продуктов' });
      }
  });

  app.get('/api/products', async (req, res) => {
      try {
          const limit = parseInt(req.query.limit) || 0;
          
          let query = mongoose.connection.db.collection('products')
              .find({}, {
                  projection: {
                      _id: 1,
                      name: 1,
                      price: 1,
                      image: 1,
                      ratingAvg: 1,
                      ratingCount: 1,
                      flavor: 1,
                      firm: 1,
                      description: 1
                  }
              });
          
          if (limit > 0) {
              query = query.limit(limit);
          }
          
          const products = await query.toArray();
          
          // Преобразуем пути к изображениям в полные URL
          const productsWithFullImageUrls = products.map(product => ({
              ...product,
              image: product.image && typeof product.image === 'string' 
                     ? encodeURIComponent(product.image.split('\\').pop()) 
                     : null,
              flavor: product.flavor
          }));
          
          res.json({ products: productsWithFullImageUrls });
      } catch (err) {
          console.error("Ошибка в /api/products:", err);
          res.status(500).json({ message: 'Server Error' });
      }
  });

  // Получение информации о конкретном продукте
  app.get('/api/products/:id', async (req, res) => {
      try {
          const { id } = req.params;
          const product = await mongoose.connection.db.collection('products').findOne(
              { _id: new mongoose.Types.ObjectId(id) },
              {
                  projection: {
                      _id: 1,
                      name: 1,
                      price: 1,
                      image: 1,
                      ratingAvg: 1,
                      ratingCount: 1,
                      flavor: 1,
                      firm: 1,
                      description: 1,
                      category: 1, 
                      stock: 1, 
                      isActive: 1, 
                      features: 1, 
                      specifications: 1 
                  }
              }
          );

          if (!product) {
              return res.status(404).json({ message: 'Продукт не найден' });
          }

          // Получаем средний рейтинг и распределение оценок из модели Rating
          const ratingStats = await Rating.getAverageRating(id);
          const ratingDistribution = await Rating.getRatingDistribution(id);

          // Получаем оценку текущего пользователя, если он авторизован
          let userRating = null;
          if (req.headers.authorization) {
              const token = req.headers.authorization.split(' ')[1];
              try {
                  const decoded = jwt.verify(token, process.env.JWT_SECRET);
                  const currentUserId = decoded.id; 
                  const existingUserRating = await Rating.findOne({ product: id, user: currentUserId });
                  if (existingUserRating) {
                      userRating = existingUserRating.rating;
                  }
              } catch (jwtError) {
                  console.warn('Недействительный токен при получении userRating:', jwtError.message);
              }
          }

          // Преобразуем путь к изображению в полный URL и добавляем данные о рейтинге
          const productWithFullImageUrlAndRatings = {
              ...product,
              image: product.image && typeof product.image === 'string' 
                     ? encodeURIComponent(product.image.split('\\').pop()) 
                     : null,
              flavor: product.flavor,
              averageRating: ratingStats.avgRating,
              ratingCount: ratingStats.count,
              ratingDistribution: ratingDistribution,
              userRating: userRating
          };

          res.json(productWithFullImageUrlAndRatings);
      } catch (err) {
          console.error('Ошибка при получении продукта:', err);
          res.status(500).json({ message: 'Ошибка сервера', error: err.message });
      }
  });

  // Добавим функцию для определения вкуса при создании/обновлении продукта
  function determineProductFlavor(product) {
      // Список ключевых слов для каждого типа вкуса
      const flavorKeywords = {
          'classic': ['классический', 'classic', 'original', 'оригинальный', 'стандартный'],
          'tropic': [
              'тропический', 'tropic', 'tropical', 'манго', 'mango', 'ананас', 'pineapple', 
              'кокос', 'coconut', 'банан', 'banana', 'папайя', 'papaya', 'маракуйя', 'passion fruit'
          ],
          'berry': [
              'ягодный', 'ягода', 'berry', 'berries', 'малина', 'raspberry', 'клубника', 'strawberry',
              'черника', 'blueberry', 'ежевика', 'blackberry', 'смородина', 'currant', 'вишня', 'cherry'
          ],
          'citrus': [
              'цитрус', 'цитрусовый', 'citrus', 'лимон', 'lemon', 'lime', 'лайм', 'апельсин', 'orange',
              'грейпфрут', 'grapefruit', 'мандарин', 'mandarin', 'tangerine'
          ],
          'cola': ['кола', 'cola'],
          'original': ['оригинальный', 'original', 'classic', 'классический'],
          'mixed': ['микс', 'mix', 'mixed', 'смешанный', 'ассорти', 'assorted'],
          'exotic': ['экзотический', 'exotic', 'необычный', 'unusual'],
          'mint': ['мята', 'mint', 'ментол', 'menthol', 'мятный', 'minty'],
          'cherry': ['вишня', 'cherry', 'cherries', 'вишни'],
          'chocolate': ['шоколад', 'chocolate', 'какао', 'cocoa', 'шоколадный'],
      };

      const textToSearch = `${product.name || ''} ${product.description || ''}`.toLowerCase();
      
      // Создаем объект для подсчета совпадений по каждому типу вкуса
      const flavorMatches = {};
      
      // Подсчитываем совпадения для каждого типа вкуса
      for (const [flavor, keywords] of Object.entries(flavorKeywords)) {
          flavorMatches[flavor] = 0;
          
          for (const keyword of keywords) {
              if (textToSearch.includes(keyword.toLowerCase())) {
                  flavorMatches[flavor] += 1;
              }
          }
      }
      
      // Находим вкус с максимальным количеством совпадений
      let maxMatches = 0;
      let determinedFlavor = 'other'; // По умолчанию "other"
      
      for (const [flavor, matches] of Object.entries(flavorMatches)) {
          if (matches > maxMatches) {
              maxMatches = matches;
              determinedFlavor = flavor;
          }
      }
      
      return determinedFlavor;
  }

  // Если есть эндпоинт для добавления нового продукта, добавим автоматическое определение вкуса
  app.post('/api/products', async (req, res) => {
      try {
          const productData = req.body;
          
          // Если вкус не указан явно, определяем его автоматически
          if (!productData.flavor) {
              productData.flavor = determineProductFlavor(productData);
          }
          
          const product = new Product(productData);
          await product.save();
          
          res.status(201).json(product);
      } catch (err) {
          console.error('Ошибка при создании продукта:', err);
          res.status(500).json({ message: 'Server Error', error: err.message });
      }
  });

  // Если есть эндпоинт для обновления продукта, добавим автоматическое определение вкуса
  app.put('/api/products/:id', async (req, res) => {
      try {
          const { id } = req.params;
          const productData = req.body;
          
          // Если вкус не указан явно, определяем его автоматически
          if (!productData.flavor) {
              productData.flavor = determineProductFlavor(productData);
          }
          
          const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
          
          if (!updatedProduct) {
              return res.status(404).json({ message: 'Продукт не найден' });
          }
          
          res.json(updatedProduct);
      } catch (err) {
          console.error('Ошибка при обновлении продукта:', err);
          res.status(500).json({ message: 'Server Error', error: err.message });
      }
  });

  // Эндпоинт для получения категорий
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = [
        { value: 'energy', label: 'Энергетики' },
        { value: 'protein', label: 'Протеиновые напитки' },
        { value: 'sports', label: 'Спортивное питание' },
        { value: 'vitamins', label: 'Витамины' },
        { value: 'bars', label: 'Батончики' },
        { value: 'isotonic', label: 'Изотоники' }
      ];
      
      res.json({ categories });
    } catch (err) {
      console.error("Ошибка в /api/categories:", err);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  // Получение рейтингов продукта
  app.get('/api/products/:id/ratings', async (req, res) => {
      try {
          const { id } = req.params;
          
          // Получаем средний рейтинг
          const ratingStats = await Rating.getAverageRating(id);
          
          // Получаем распределение рейтингов
          const distribution = await Rating.getRatingDistribution(id);
          
          res.json({
              productId: id,
              average: ratingStats.avgRating,
              total: ratingStats.count,
              distribution
          });
      } catch (err) {
          console.error('Ошибка при получении рейтингов:', err);
          res.status(500).json({ message: 'Ошибка сервера', error: err.message });
      }
  });

  // Получение рейтинга продукта текущим пользователем
  app.get('/api/products/:productId/my-rating', protect, async (req, res) => {
      try {
          const { productId } = req.params;
          const userId = req.user._id; // Получаем ID пользователя из req.user (из middleware protect)

          const userRating = await Rating.findOne({ product: productId, user: userId });

          if (userRating) {
              res.json({ rating: userRating.rating });
          } else {
              res.json({ rating: 0 });
          }
      } catch (error) {
          console.error(`Ошибка при получении оценки пользователя для продукта ${req.params.productId}:`, error);
          res.status(500).json({ message: 'Ошибка сервера при получении оценки пользователя', error: error.message });
      }
  });

  // Маршрут для проверки количества продуктов
  app.get('/api/products/count', async (req, res) => {
      try {
          const count = await mongoose.connection.db.collection('products').countDocuments();
          res.json({ count });
      } catch (error) {
          console.error('Ошибка при подсчете продуктов:', error);
          res.status(500).json({ message: 'Ошибка при подсчете продуктов' });
      }
  });

  app.listen(port, () => {
      console.log(`Сервер запущен на порту ${port}`);
  });
});
