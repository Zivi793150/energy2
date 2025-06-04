/**
 * Этот скрипт можно запустить 
 * node updateFlavorsEs.js mongodb://127.0.0.1:27017/your_database_name
 */

import mongoose from 'mongoose';

// Получаем MongoDB URI из аргументов командной строки или используем значение по умолчанию
const uri = process.argv[2] || 'mongodb://127.0.0.1:27017/energy_lab';
console.log('Используем MongoDB URI:', uri);

// Категории вкусов
const FLAVOR_CATEGORIES = ['classic', 'tropic', 'berry', 'citrus', 'cola', 'original', 'mixed', 'exotic', 'mint', 'cherry', 'chocolate', 'other'];

// Ключевые слова для определения вкусов
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

// Функция для определения вкуса по названию и описанию
function determineFlavorCategory(product) {
    const textToSearch = `${product.name || ''} ${product.description || ''}`.toLowerCase();
    
    // Подсчитываем совпадения для каждого типа вкуса
    const flavorMatches = {};
    
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

// Функция обновления вкусов в базе данных
async function updateProductFlavors() {
    try {
        // Подключаемся к базе данных
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
        });
        
        console.log('Подключено к MongoDB');
        
        // Определяем схему продукта (только для проверки)
        const productSchema = new mongoose.Schema({
            firm: String,
            name: String,
            description: String,
            price: Number,
            images: String,
            flavor: { type: String, enum: FLAVOR_CATEGORIES }
        });
        
        // Получаем все продукты
        const products = await mongoose.connection.db.collection('products').find().toArray();
        console.log(`Найдено ${products.length} продуктов`);
        
        if (products.length === 0) {
            console.log('Продукты не найдены в базе данных.');
            console.log('Доступные коллекции:');
            const collections = await mongoose.connection.db.listCollections().toArray();
            collections.forEach(collection => {
                console.log(`- ${collection.name}`);
            });
            return;
        }
        
        console.log('Пример первого продукта:');
        console.log(JSON.stringify(products[0], null, 2));
        
        let updateCount = 0;
        
        // Обновляем каждый продукт
        for (const product of products) {
            try {
                const flavor = determineFlavorCategory(product);
                console.log(`Продукт "${product.name}": определен вкус "${flavor}"`);
                
                // Обновляем продукт
                const result = await mongoose.connection.db.collection('products').updateOne(
                    { _id: product._id },
                    { $set: { flavor: flavor } }
                );
                
                if (result.modifiedCount > 0) {
                    updateCount++;
                    console.log(`Продукт "${product.name}" обновлен. Вкус: ${flavor}`);
                } else {
                    console.log(`Продукт "${product.name}" не изменен.`);
                }
            } catch (err) {
                console.error(`Ошибка при обработке продукта "${product.name}":`, err);
            }
        }
        
        console.log(`\nИтоги обновления: ${updateCount} из ${products.length} продуктов обновлены.`);
        
        // Проверяем результаты
        console.log('\nПроверка результатов:');
        const flavorCounts = {};
        FLAVOR_CATEGORIES.forEach(flavor => flavorCounts[flavor] = 0);
        
        const updatedProducts = await mongoose.connection.db.collection('products').find().toArray();
        updatedProducts.forEach(product => {
            if (product.flavor) {
                flavorCounts[product.flavor] = (flavorCounts[product.flavor] || 0) + 1;
            }
        });
        
        console.log('Распределение продуктов по вкусам:');
        Object.entries(flavorCounts).forEach(([flavor, count]) => {
            console.log(`- ${flavor}: ${count} продуктов`);
        });
        
    } catch (err) {
        console.error('Ошибка при обновлении продуктов:', err);
    } finally {
        // Закрываем соединение
        await mongoose.connection.close();
        console.log('Соединение с MongoDB закрыто');
    }
}

// Запускаем скрипт
updateProductFlavors(); 