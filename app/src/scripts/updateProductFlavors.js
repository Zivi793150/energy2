const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log('Скрипт обновления вкусов запущен');
console.log('Путь к .env:', path.resolve(__dirname, '../../.env'));
console.log('MONGODB_URI из .env:', process.env.MONGODB_URI);

// Используем 127.0.0.1 вместо localhost, как в основном сервере
const uri = (process.env.MONGODB_URI || 'mongodb://localhost:27017/energy-shop').replace('localhost', '127.0.0.1');
console.log('URI подключения:', uri);

// Подключаемся к базе данных с теми же опциями, что и в основном сервере
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000 // Увеличиваем таймаут
})
.then(() => console.log('MongoDB connected for flavor update'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Определяем ключевые слова для каждого типа вкуса
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

// Функция для определения наиболее вероятного вкуса на основе названия и описания продукта
function determineFlavorCategory(product) {
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

// Основная функция для обновления вкусов продуктов
async function updateProductFlavors() {
    try {
        // Получаем все продукты из коллекции
        const products = await mongoose.connection.db.collection('products').find().toArray();
        console.log(`Найдено ${products.length} продуктов для обновления`);
        
        if (products.length === 0) {
            console.log('Продукты не найдены. Проверьте название коллекции и подключение к базе данных.');
            return;
        }
        
        console.log('Пример первого продукта:', JSON.stringify(products[0], null, 2));
        
        let updateCount = 0;
        
        // Обрабатываем каждый продукт
        for (const product of products) {
            try {
                const flavor = determineFlavorCategory(product);
                console.log(`Продукт "${product.name}": определен вкус "${flavor}"`);
                
                // Обновляем продукт, добавляя поле flavor
                const result = await mongoose.connection.db.collection('products').updateOne(
                    { _id: product._id },
                    { $set: { flavor: flavor } }
                );
                
                console.log(`Результат обновления:`, result);
                
                if (result.modifiedCount > 0) {
                    updateCount++;
                    console.log(`Продукт "${product.name}" обновлен. Вкус: ${flavor}`);
                } else {
                    console.log(`Не удалось обновить продукт "${product.name}". Проверьте права доступа к базе данных.`);
                }
            } catch (productError) {
                console.error(`Ошибка при обработке продукта "${product.name}":`, productError);
            }
        }
        
        console.log(`Обновлено ${updateCount} из ${products.length} продуктов`);
    } catch (error) {
        console.error('Ошибка при обновлении вкусов продуктов:', error);
    } finally {
        // Закрываем соединение с базой данных
        await mongoose.connection.close();
        console.log('Соединение с MongoDB закрыто');
    }
}

// Запускаем скрипт
updateProductFlavors(); 