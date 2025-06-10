import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

const router = express.Router();

// Маршрут для входа
router.post('/login', async (req, res) => {
    try {
        console.log('Получен запрос на вход:', req.body);
        const { email, password } = req.body;

        // Проверяем наличие email и password
        if (!email || !password) {
            return res.status(400).json({ message: 'Email и пароль обязательны' });
        }

        // Ищем пользователя по email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Проверяем пароль
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Отправляем ответ
        const responseData = {
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified
            }
        };

        console.log('Отправка ответа:', JSON.stringify(responseData));
        res.status(200).json(responseData);
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ message: 'Ошибка сервера при входе' });
    }
});

// Маршрут для регистрации
router.post('/register', async (req, res) => {
    try {
        console.log('Получен запрос на регистрацию:', req.body);
        const { email, password, name } = req.body;

        // Проверяем наличие всех необходимых полей
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
        }

        // Проверяем, не существует ли уже пользователь с таким email
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }

        // Хешируем пароль
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Создаем нового пользователя
        const user = new User({
            email,
            password: hashedPassword,
            name,
            role: 'user' // По умолчанию роль 'user'
        });

        // Сохраняем пользователя
        await user.save();

        // Создаем JWT токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Отправляем ответ
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
});

export default router; 