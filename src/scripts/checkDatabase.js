/**
 * Этот скрипт проверяет подключение к MongoDB и показывает все доступные базы данных и коллекции
 */

import mongoose from 'mongoose';

// Получаем MongoDB URI из аргументов командной строки или используем значение по умолчанию
const uri = process.argv[2] || 'mongodb://127.0.0.1:27017/';
console.log('Используем MongoDB URI:', uri);

async function checkDatabase() {
  try {
    // Подключаемся к базе данных
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('Подключено к MongoDB');
    
    // Получаем список всех баз данных
    const adminDb = mongoose.connection.db.admin();
    const dbInfo = await adminDb.listDatabases();
    
    console.log('\n--- ДОСТУПНЫЕ БАЗЫ ДАННЫХ ---');
    console.log(dbInfo.databases.map(db => db.name).join(', '));
    
    // Для каждой базы данных (кроме admin, local, config) показываем коллекции
    console.log('\n--- КОЛЛЕКЦИИ В БАЗАХ ДАННЫХ ---');
    
    for (const dbData of dbInfo.databases) {
      const dbName = dbData.name;
      
      // Пропускаем системные базы данных
      if (['admin', 'local', 'config'].includes(dbName)) continue;
      
      try {
        // Подключаемся к конкретной базе данных
        const db = mongoose.connection.client.db(dbName);
        const collections = await db.listCollections().toArray();
        
        if (collections.length > 0) {
          console.log(`\nБаза данных: ${dbName}`);
          collections.forEach(collection => {
            console.log(`  - ${collection.name}`);
          });
          
          // Для каждой коллекции показываем количество документов
          for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`    • ${collection.name}: ${count} документов`);
            
            // Если в коллекции есть документы, показываем пример первого документа
            if (count > 0) {
              const sample = await db.collection(collection.name).findOne();
              console.log(`    • Пример документа:`, JSON.stringify(sample, null, 2));
            }
          }
        }
      } catch (err) {
        console.error(`Ошибка при проверке базы данных ${dbName}:`, err);
      }
    }
    
  } catch (err) {
    console.error('Ошибка при подключении к MongoDB:', err);
  } finally {
    // Закрываем соединение
    await mongoose.connection.close();
    console.log('\nСоединение с MongoDB закрыто');
  }
}

// Запускаем проверку
checkDatabase(); 