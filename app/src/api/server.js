import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from '../routes/authRoutes.js';
import adminRoutes from '../routes/adminRoutes.js';
import promoRoutes from './routes/promoRoutes.js';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения из файла .env
dotenv.config({ path: join(__dirname, '../../.env') });

// Выводим информацию о переменных окружения
console.log('Переменные окружения загружены');
console.log('MONGODB_URI настроен:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET настроен:', !!process.env.JWT_SECRET);
console.log('EMAIL_USER настроен:', !!process.env.EMAIL_USER);
console.log('EMAIL_PASSWORD настроен:', !!process.env.EMAIL_PASSWORD);

const app = express();
const port = process.env.PORT || 3000;

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
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Переопределяем методы res.json и res.send для лучшего логирования
const originalJson = app.response.json;
app.response.json = function(body) {
  console.log(`Отправка JSON ответа:`, typeof body === 'object' ? JSON.stringify(body) : body);
  return originalJson.call(this, body);
};

const originalSend = app.response.send;
app.response.send = function(body) {
  console.log(`Отправка ответа:`, typeof body === 'object' ? JSON.stringify(body) : body);
  return originalSend.call(this, body);
};

// Получаем URI для подключения к MongoDB
// Если вы используете MongoDB Atlas, строка подключения будет выглядеть примерно так:
// mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/energy-lab?retryWrites=true&w=majority
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy_lab';
console.log("URI подключения (без пароля):", uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

// Переменная для отслеживания состояния подключения
let isConnecting = false;

// Экспортируем функцию для подключения, чтобы ее можно было использовать в других частях приложения
async function connectToMongoDB() {
    try {
        console.log('Подключение к MongoDB...');
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000, // Увеличиваем таймаут до 30 секунд
            socketTimeoutMS: 45000, // Увеличиваем таймаут сокета
            connectTimeoutMS: 30000, // Увеличиваем таймаут подключения
            maxPoolSize: 10, // Максимальный размер пула соединений
            minPoolSize: 2, // Минимальный размер пула соединений
            retryWrites: true, // Повторные попытки записи
            retryReads: true, // Повторные попытки чтения
            heartbeatFrequencyMS: 10000 // Отправка heartbeat каждые 10 секунд
        });
        console.log('Connected to MongoDB successfully');
        return connection;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        return null;
    }
}

// Функция для подключения с повторными попытками
const connectWithRetry = async (retryCount = 5, delay = 3000) => {
    try {
        const connection = await connectToMongoDB();
        if (!connection) {
            throw new Error('Failed to connect to MongoDB');
        }
        
        // Проверка наличия коллекций
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Доступные коллекции:', collections.map(c => c.name));
            
            // Проверяем наличие коллекции products
            const productsCollection = collections.find(c => c.name === 'products');
            if (productsCollection) {
                console.log('Коллекция products найдена');
                // Получаем количество документов в коллекции
                const count = await mongoose.connection.db.collection('products').countDocuments();
                console.log(`Количество продуктов в базе: ${count}`);
            } else {
                console.log('Коллекция products не найдена');
            }
            
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
        console.log('Автоматическая попытка переподключения после ошибки...');
        connectWithRetry(3);
    }, 3000);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    // Пытаемся переподключиться при разрыве соединения
    console.log('Попытка восстановить соединение с MongoDB...');
    setTimeout(() => connectWithRetry(3), 1000);
});

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
});

// Добавляем обработчик ошибок для Express
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
});

// Подключаем маршруты аутентификации
app.use('/api/auth', authRoutes);

// Подключаем маршруты администратора
app.use('/api/admin', adminRoutes);

// Подключаем маршруты промокодов
app.use('/api/promos', promoRoutes);

// Маршрут для получения топовых продуктов
app.get('/api/products/top-rated', async (req, res) => {
    try {
        console.log('Запрос к /api/products/top-rated получен');
        const limit = parseInt(req.query.limit) || 10;
        console.log(`Запрошен лимит: ${limit}`);

        // Создаем индекс для оптимизации запроса, если его еще нет
        try {
            await mongoose.connection.db.collection('products').createIndex({ popularity: -1 });
            console.log('Индекс по полю popularity создан или уже существует');
        } catch (indexError) {
            console.log('Ошибка при создании индекса:', indexError);
        }

        // Получаем топ продукты напрямую из коллекции
        const products = await mongoose.connection.db
            .collection('products')
            .find({}, {
                projection: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    images: 1,
                    ratingAvg: 1,
                    ratingCount: 1,
                    flavor: 1,
                    firm: 1
                }
            })
            .sort({ popularity: -1 })
            .limit(limit)
            .toArray();

        console.log(`Найдено ${products.length} топовых продуктов`);
        res.json({ products });
    } catch (error) {
        console.error('Ошибка при получении топовых продуктов:', error);
        res.status(500).json({ message: 'Ошибка при получении топовых продуктов' });
    }
});

// Импортируем модели для использования в обработчиках API
import User from '../models/User.js';
import Rating from '../models/Rating.js';
import Product from '../models/Product.js';
import Promo from './models/Promo.js';

app.get('/api/products', async (req, res) => {
    try {
        console.log("Запрос к /api/products получен");
        
        // Получаем параметры запроса
        const limit = parseInt(req.query.limit) || 0;
        console.log(`Запрошен лимит: ${limit}`);
        
        // Создаем запрос к базе данных с проекцией только нужных полей
        let query = mongoose.connection.db.collection('products')
            .find({}, {
                projection: {
                    _id: 1,
                    name: 1,
                    price: 1,
                    images: 1,
                    ratingAvg: 1,
                    ratingCount: 1,
                    flavor: 1,
                    firm: 1
                }
            });
        
        // Если указан лимит, применяем его
        if (limit > 0) {
            query = query.limit(limit);
        }
        
        // Выполняем запрос
        const products = await query.toArray();
        console.log(`Товары получены из базы данных: ${products.length}`);
        
        // Отправляем ответ
        res.json({ products });
    } catch (err) {
        console.error("Ошибка в /api/products:", err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Получение информации о конкретном продукте
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Запрос к /api/products/${id} получен`);
        
        // Пытаемся найти продукт напрямую в коллекции
        console.log('Поиск продукта в коллекции...');
        const product = await mongoose.connection.db.collection('products')
            .findOne(
                { _id: new mongoose.Types.ObjectId(id) },
                { projection: { _id: 1, name: 1, price: 1, images: 1, ratingAvg: 1, ratingCount: 1, flavor: 1, firm: 1, description: 1 } }
            );
        
        console.log('Результат поиска:', product);
        
        if (!product) {
            console.log(`Продукт с ID ${id} не найден`);
            return res.status(404).json({ message: 'Продукт не найден' });
        }
        
        console.log("Продукт найден:", JSON.stringify(product, null, 2));
        res.json(product);
    } catch (err) {
        console.error(`Ошибка при получении продукта ${req.params.id}:`, err);
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
});

// Добавим функцию для определения вкуса при создании/обновлении продукта
function determineProductFlavor(product) {
    // Список ключевых слов для каждого типа вкуса
    const flavorKeywords = {
        classic: ['классический', 'classic', 'original', 'оригинальный', 'стандартный'],
        tropic: [
            'тропический', 'tropic', 'tropical', 'манго', 'mango', 'ананас', 'pineapple', 
            'кокос', 'coconut', 'банан', 'banana', 'папайя', 'papaya', 'маракуйя', 'passion fruit'
        ],
        berry: [
            'ягодный', 'ягода', 'berry', 'berries', 'малина', 'raspberry', 'клубника', 'strawberry',
            'черника', 'blueberry', 'ежевика', 'blackberry', 'смородина', 'currant', 'вишня', 'cherry'
        ],
        citrus: [
            'цитрус', 'цитрусовый', 'citrus', 'лимон', 'lemon', 'lime', 'лайм', 'апельсин', 'orange',
            'грейпфрут', 'grapefruit', 'мандарин', 'mandarin', 'tangerine'
        ],
        cola: ['кола', 'cola'],
        original: ['оригинальный', 'original', 'classic', 'классический'],
        mixed: ['микс', 'mix', 'mixed', 'смешанный', 'ассорти', 'assorted'],
        exotic: ['экзотический', 'exotic', 'необычный', 'unusual'],
        mint: ['мята', 'mint', 'ментол', 'menthol', 'мятный', 'minty'],
        cherry: ['вишня', 'cherry', 'cherries', 'вишни'],
        chocolate: ['шоколад', 'chocolate', 'какао', 'cocoa', 'шоколадный'],
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

// Маршруты для работы с рейтингами
import { protect } from '../middleware/auth.js';

// Эндпоинт для получения категорий
app.get('/api/categories', async (req, res) => {
  try {
    console.log("Запрос к /api/categories получен");
    
    // Список категорий - можно заменить на загрузку из базы данных, если нужно
    const categories = [
      { value: 'energy', label: 'Энергетики' },
      { value: 'protein', label: 'Протеиновые напитки' },
      { value: 'sports', label: 'Спортивное питание' },
      { value: 'vitamins', label: 'Витамины' },
      { value: 'bars', label: 'Батончики' },
      { value: 'isotonic', label: 'Изотоники' }
    ];
    
    res.json({ categories });
    console.log("Категории отправлены в ответе");
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

// Добавление/обновление рейтинга продукта
app.post('/api/products/:id/rate', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        const userId = req.user._id;
        
        console.log(`Запрос на оценку продукта ${id} с рейтингом ${rating} от пользователя ${userId}`);
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Рейтинг должен быть от 1 до 5' });
        }
        
        // Проверяем, существует ли продукт
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: 'Продукт не найден' });
        }
        
        try {
            // Проверяем, оценивал ли пользователь этот продукт ранее
            let ratingRecord = await Rating.findOne({ product: id, user: userId });
            
            if (ratingRecord) {
                // Обновляем существующую оценку
                console.log(`Обновление существующего рейтинга для продукта ${id}`);
                ratingRecord.rating = rating;
                ratingRecord.updatedAt = new Date();
                await ratingRecord.save();
            } else {
                // Создаем новую оценку
                console.log(`Создание нового рейтинга для продукта ${id}`);
                ratingRecord = new Rating({
                    product: id,
                    user: userId,
                    rating
                });
                await ratingRecord.save();
                
                // Также добавляем рейтинг в профиль пользователя
                try {
                    await req.user.rateProduct(id, rating);
                } catch (userError) {
                    console.error('Ошибка при обновлении рейтинга в профиле пользователя:', userError);
                    // Не прерываем выполнение, если не удалось обновить профиль пользователя
                }
            }
            
            // Обновляем статистику рейтинга продукта в отдельном try-catch блоке
            try {
                await product.updateRatingStats();
                console.log(`Статистика рейтинга продукта ${id} успешно обновлена`);
            } catch (statsError) {
                console.error('Ошибка при обновлении статистики рейтинга продукта:', statsError);
                // Не прерываем выполнение, возвращаем успех с предупреждением
                return res.json({
                    message: 'Рейтинг сохранен, но статистика не обновлена',
                    productId: id,
                    rating,
                    warning: 'Статистика продукта не обновлена'
                });
            }
            
            res.json({
                message: 'Рейтинг успешно сохранен',
                productId: id,
                rating
            });
        } catch (ratingError) {
            console.error('Ошибка при сохранении рейтинга:', ratingError);
            res.status(500).json({ 
                message: 'Ошибка сервера при сохранении рейтинга', 
                error: ratingError.message 
            });
        }
    } catch (err) {
        console.error('Ошибка при добавлении рейтинга:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

// Получение рейтинга пользователя для продукта
app.get('/api/products/:id/my-rating', protect, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        
        const ratingRecord = await Rating.findOne({ product: id, user: userId });
        
        res.json({
            productId: id,
            rating: ratingRecord ? ratingRecord.rating : 0
        });
    } catch (err) {
        console.error('Ошибка при получении рейтинга пользователя:', err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

// Маршрут для проверки количества продуктов
app.get('/api/products/count', async (req, res) => {
    try {
        const count = await mongoose.connection.db.collection('products').countDocuments();
        console.log(`Всего продуктов в базе: ${count}`);
        res.json({ count });
    } catch (error) {
        console.error('Ошибка при подсчете продуктов:', error);
        res.status(500).json({ message: 'Ошибка при подсчете продуктов' });
    }
});

// Функция для запуска сервера
const startServer = async () => {
    try {
        // Подключаемся к MongoDB
        const connected = await connectWithRetry();
        if (!connected) {
            console.error('Не удалось подключиться к MongoDB. Сервер не запущен.');
            process.exit(1);
        }

        // Запускаем сервер
        app.listen(port, () => {
            console.log(`Сервер запущен на порту ${port}`);
        });
    } catch (err) {
        console.error('Ошибка при запуске сервера:', err);
        process.exit(1);
    }
};

// Запускаем сервер
startServer().catch(err => {
    console.error('Ошибка при запуске сервера:', err);
    process.exit(1);
});
