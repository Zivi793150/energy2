/**
 * Скрипт для диагностики подключения к MongoDB
 * Запуск: node src/scripts/checkMongoDB.js [URI]
 */

import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения из файла .env
dotenv.config({ path: join(__dirname, '../../.env') });

// Получаем URI из аргументов командной строки или из .env
const uri = process.argv[2] || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy-lab';

console.log('=== ДИАГНОСТИКА ПОДКЛЮЧЕНИЯ К MONGODB ===');
console.log(`URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

// Функция для тестирования соединения с помощью MongoClient
async function testMongoClient() {
  console.log('\n=== Тест с использованием MongoClient ===');
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4 // Используем IPv4
  });

  try {
    console.log('Попытка подключения...');
    await client.connect();
    console.log('✅ Подключение успешно установлено');

    // Получаем информацию о сервере
    const adminDb = client.db().admin();
    const serverInfo = await adminDb.serverInfo();
    console.log('Информация о сервере MongoDB:');
    console.log(`- Версия: ${serverInfo.version}`);
    console.log(`- Имя хоста: ${serverInfo.host}`);

    // Получаем список баз данных
    const dbList = await adminDb.listDatabases();
    console.log('\nДоступные базы данных:');
    dbList.databases.forEach(db => {
      console.log(`- ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });

    // Проверяем нашу базу данных
    const dbName = uri.split('/').pop().split('?')[0];
    console.log(`\nПроверка базы данных '${dbName}':`);
    const db = client.db(dbName);
    
    // Получаем список коллекций
    const collections = await db.listCollections().toArray();
    if (collections.length === 0) {
      console.log('⚠️ В базе данных нет коллекций');
    } else {
      console.log('Коллекции:');
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`- ${collection.name} (${count} документов)`);
      }
    }

    // Проверяем возможность записи
    console.log('\nПроверка возможности записи...');
    const testCollection = db.collection('connection_test');
    const result = await testCollection.insertOne({ 
      test: true, 
      timestamp: new Date(),
      message: 'Тестовый документ для проверки подключения' 
    });
    
    if (result.acknowledged) {
      console.log(`✅ Запись успешна (id: ${result.insertedId})`);
      await testCollection.deleteOne({ _id: result.insertedId });
      console.log('✅ Тестовый документ удален');
    }

  } catch (err) {
    console.error('❌ Ошибка при подключении:', err);
  } finally {
    await client.close();
    console.log('Соединение закрыто');
  }
}

// Функция для тестирования соединения с помощью Mongoose
async function testMongoose() {
  console.log('\n=== Тест с использованием Mongoose ===');
  
  try {
    // Отключаем существующее соединение, если оно есть
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    
    console.log('Попытка подключения...');
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    console.log(`✅ Подключение успешно установлено (readyState: ${mongoose.connection.readyState})`);
    
    // Проверяем ping
    await mongoose.connection.db.admin().ping();
    console.log('✅ MongoDB ping успешен');
    
    // Создаем тестовую модель
    const TestSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const Test = mongoose.model('ConnectionTest', TestSchema);
    
    // Пробуем создать документ
    console.log('\nПроверка создания документа через Mongoose...');
    const testDoc = new Test({ name: 'test_connection' });
    await testDoc.save();
    console.log(`✅ Документ создан (id: ${testDoc._id})`);
    
    // Удаляем тестовый документ
    await Test.deleteOne({ _id: testDoc._id });
    console.log('✅ Тестовый документ удален');
    
  } catch (err) {
    console.error('❌ Ошибка при подключении через Mongoose:', err);
  } finally {
    if (mongoose.connection) {
      await mongoose.connection.close();
      console.log('Соединение Mongoose закрыто');
    }
  }
}

// Проверяем сетевую доступность MongoDB
async function checkNetworkConnectivity() {
  console.log('\n=== Проверка сетевой доступности ===');
  
  try {
    // Извлекаем хост и порт из URI
    const match = uri.match(/mongodb:\/\/([^:]+):?(\d+)?/);
    if (!match) {
      console.log('❌ Не удалось извлечь хост и порт из URI');
      return;
    }
    
    const host = match[1];
    const port = match[2] || 27017;
    
    // Заменяем localhost на 127.0.0.1 для явного использования IPv4
    const ipv4Host = host === 'localhost' ? '127.0.0.1' : host;
    
    console.log(`Проверка соединения с ${ipv4Host}:${port}...`);
    
    // Используем простое подключение для проверки доступности с явным IPv4
    const client = new MongoClient(`mongodb://${ipv4Host}:${port}`, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
      family: 4 // Явно указываем использование IPv4
    });
    
    await client.connect();
    console.log(`✅ Сервер MongoDB доступен по адресу ${ipv4Host}:${port}`);
    await client.close();
    
  } catch (err) {
    console.error('❌ Ошибка при проверке сетевой доступности:', err);
  }
}

// Запускаем все тесты
async function runAllTests() {
  try {
    await checkNetworkConnectivity();
    await testMongoClient();
    await testMongoose();
    
    console.log('\n=== ИТОГИ ДИАГНОСТИКИ ===');
    console.log('✅ Проверка завершена. Проверьте результаты выше для выявления проблем.');
  } catch (err) {
    console.error('\n❌ ОШИБКА ПРИ ВЫПОЛНЕНИИ ТЕСТОВ:', err);
  } finally {
    process.exit(0);
  }
}

runAllTests(); 