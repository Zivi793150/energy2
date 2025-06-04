import User from '../models/User.js';

// Создание админ-аккаунта
export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Проверяем, существует ли уже пользователь с таким email
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }
    
    // Создаем нового пользователя с ролью админа
    const user = new User({
      email,
      password,
      role: 'admin',
      isVerified: true // админский аккаунт сразу верифицирован
    });
    
    await user.save();
    
    res.status(201).json({ message: 'Администратор успешно создан' });
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Изменение роли пользователя
export const changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Некорректная роль' });
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json({ message: 'Роль пользователя изменена', user });
  } catch (error) {
    console.error('Ошибка при изменении роли пользователя:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

// Получение информации о всех пользователях
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Ошибка при получении списка пользователей:', error);
    res.status(500).json({ message: 'Ошибка сервера', error: error.message });
  }
};

export default {
  createAdmin,
  changeUserRole,
  getAllUsers
}; 