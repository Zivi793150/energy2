import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

// Получаем путь к текущему файлу и директории
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем переменные окружения из файла .env
dotenv.config({ path: join(__dirname, '../../.env') });

// URI для подключения к MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/energy_lab';

console.log('Запуск скрипта инициализации администратора...');
console.log('Подключение к MongoDB:', uri);

async function initAdmin() {
    try {
        // Подключаемся к базе данных
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
        });
        
        console.log('Подключено к MongoDB');
        
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminEmail || !adminPassword) {
            console.error('Ошибка: ADMIN_EMAIL или ADMIN_PASSWORD не указаны в .env файле');
            return;
        }
        
        // Проверяем, существует ли уже пользователь с таким email
        const existingUser = await User.findOne({ email: adminEmail });
        
        if (existingUser) {
            // Если пользователь существует, но не админ, делаем его админом
            if (!existingUser.isAdmin) {
                existingUser.isAdmin = true;
                await existingUser.save();
                console.log(`Пользователь ${adminEmail} обновлен до администратора`);
            } else {
                console.log(`Пользователь ${adminEmail} уже является администратором`);
            }
        } else {
            // Создаем нового пользователя с правами администратора
            const adminUser = new User({
                email: adminEmail,
                password: adminPassword,
                isAdmin: true,
                isVerified: true // Админ автоматически верифицирован
            });
            
            await adminUser.save();
            console.log(`Администратор ${adminEmail} успешно создан`);
        }
        
    } catch (error) {
        console.error('Ошибка при инициализации администратора:', error);
    } finally {
        // Закрываем соединение с базой данных
        await mongoose.connection.close();
        console.log('Соединение с MongoDB закрыто');
    }
}

// Запускаем функцию
initAdmin();